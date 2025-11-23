const express = require('express');
const router = express.Router();
const Workshop = require('../models/Workshop');
const WorkshopRSVP = require('../models/WorkshopRSVP');
const User = require('../models/User');
const auth = require('../middleware/auth');
const crypto = require('crypto');
const { sendWorkshopEmail } = require('../utils/emailService');

// Get all workshops
router.get('/', auth, async (req, res) => {
  try {
    const workshops = await Workshop.find()
      .populate('organizer', 'name email')
      .populate('registrations.user', 'name email profilePicture')
      .sort({ date: -1 });
    
    // Get registration counts from WorkshopRSVP for each workshop
    const workshopsWithCounts = await Promise.all(
      workshops.map(async (workshop) => {
        const registrationCount = await WorkshopRSVP.countDocuments({
          workshopId: workshop._id,
          status: { $ne: 'cancelled' }
        });
        
        // Convert to plain object and add registrationCount
        const workshopObj = workshop.toObject();
        workshopObj.registrationCount = registrationCount;
        return workshopObj;
      })
    );
    
    res.json(workshopsWithCounts);
  } catch (error) {
    console.error('Error fetching workshops:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get workshops by alumni
router.get('/alumni/:alumniId', async (req, res) => {
  try {
    const workshops = await Workshop.find({ organizer: req.params.alumniId })
      .populate('registrations.user', 'name email profilePicture')
      .sort({ date: -1 });
    res.json(workshops);
  } catch (error) {
    console.error('Error fetching alumni workshops:', error);
    res.status(500).json({ message: 'Error fetching alumni workshops' });
  }
});

// Create a new workshop
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating workshop with data:', req.body);
    console.log('Authenticated user:', req.user);

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { title, description, date, mode, location, targetAudience, duration, meetingLink, registrationMode } = req.body;
    
    // Validate required fields
    if (!title || !description || !date || !mode || !targetAudience || !duration) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate mode
    if (!['online', 'offline'].includes(mode)) {
      return res.status(400).json({ message: 'Mode must be either "online" or "offline"' });
    }

    // Validate meetingLink for online workshops
    if (mode === 'online') {
      if (!meetingLink || meetingLink.trim() === '') {
        return res.status(400).json({ error: 'meetingLink is required for online workshops' });
      }
      // Validate URL format
      try {
        new URL(meetingLink);
      } catch (e) {
        return res.status(400).json({ error: 'meetingLink must be a valid URL' });
      }
    }

    // Validate location for offline workshops
    if (mode === 'offline' && !location) {
      return res.status(400).json({ message: 'Location is required for offline workshops' });
    }

    const workshop = new Workshop({
      title,
      description,
      date,
      mode,
      meetingLink: mode === 'online' ? meetingLink.trim() : undefined,
      location: mode === 'offline' ? location : undefined,
      targetAudience,
      duration,
      registrationMode: registrationMode || 'email-only',
      organizer: req.user._id
    });

    await workshop.save();
    console.log('Workshop created successfully:', workshop);

    // Populate organizer before sending response
    await workshop.populate('organizer', 'name email');
    res.status(201).json(workshop);
  } catch (error) {
    console.error('Error creating workshop:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get workshop by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id)
      .populate('organizer', 'name email');
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }
    res.json(workshop);
  } catch (error) {
    console.error('Error fetching workshop:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a workshop
router.put('/:id', auth, async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    if (workshop.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this workshop' });
    }

    const { title, description, date, mode, location, targetAudience, duration, meetingLink, registrationMode } = req.body;
    
    workshop.title = title || workshop.title;
    workshop.description = description || workshop.description;
    workshop.date = date || workshop.date;
    
    if (mode) {
      if (!['online', 'offline'].includes(mode)) {
        return res.status(400).json({ message: 'Mode must be either "online" or "offline"' });
      }
      workshop.mode = mode;
      
      // Validate meetingLink for online workshops
      if (mode === 'online') {
        if (!meetingLink || meetingLink.trim() === '') {
          return res.status(400).json({ error: 'meetingLink is required for online workshops' });
        }
        try {
          new URL(meetingLink);
        } catch (e) {
          return res.status(400).json({ error: 'meetingLink must be a valid URL' });
        }
        workshop.meetingLink = meetingLink.trim();
        workshop.location = undefined;
      } else {
        if (!location) {
          return res.status(400).json({ message: 'Location is required for offline workshops' });
        }
        workshop.location = location;
        workshop.meetingLink = undefined;
      }
    }
    
    workshop.targetAudience = targetAudience || workshop.targetAudience;
    workshop.duration = duration || workshop.duration;
    if (registrationMode) {
      workshop.registrationMode = registrationMode;
    }

    await workshop.save();
    await workshop.populate('organizer', 'name email');
    res.json(workshop);
  } catch (error) {
    console.error('Error updating workshop:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a workshop
router.delete('/:id', auth, async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    if (workshop.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this workshop' });
    }

    await workshop.remove();
    res.json({ message: 'Workshop deleted successfully' });
  } catch (error) {
    console.error('Error deleting workshop:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register for a workshop
router.post('/:id/register', auth, async (req, res) => {
  try {
    console.log('Registration attempt:', {
      workshopId: req.params.id,
      userId: req.user._id || req.user.userId,
      userRole: req.user.role
    });

    // Check if user is a student
    if (req.user.role !== 'student') {
      console.log('Registration denied: User is not a student', { role: req.user.role });
      return res.status(403).json({ message: 'Only students can register for workshops' });
    }

    // Accept both 'email' and 'registeredEmail' for backward compatibility
    const { email, registeredEmail } = req.body;
    const emailValue = registeredEmail || email;
    const userId = req.user._id || req.user.userId;

    // Validate email
    if (!emailValue || !emailValue.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue.trim())) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const workshop = await Workshop.findById(req.params.id);
    
    if (!workshop) {
      console.log('Workshop not found:', req.params.id);
      return res.status(404).json({ message: 'Workshop not found' });
    }

    // Only allow registration for online workshops
    if (workshop.mode !== 'online') {
      return res.status(400).json({ message: 'Registration is only available for online workshops' });
    }

    if (workshop.status !== 'upcoming') {
      console.log('Workshop not available for registration:', workshop.status);
      return res.status(400).json({ message: 'Cannot register for this workshop' });
    }

    // Check if already registered
    const existingRSVP = await WorkshopRSVP.findOne({
      workshopId: workshop._id,
      userId: userId
    });

    if (existingRSVP && existingRSVP.status !== 'cancelled') {
      console.log('User already registered:', userId);
      return res.status(409).json({ message: 'Already registered for this workshop' });
    }

    // Handle different registration modes
    const registrationMode = workshop.registrationMode || 'email-only';

    if (registrationMode === 'external-form') {
      // Redirect to external form
      return res.json({ 
        redirect: workshop.meetingLink 
      });
    }

    if (registrationMode === 'public-link') {
      // Save RSVP and return direct meeting link
      if (existingRSVP) {
        existingRSVP.status = 'registered';
        existingRSVP.registeredEmail = emailValue.trim().toLowerCase();
        // Clear token for public-link mode
        existingRSVP.token = undefined;
        existingRSVP.tokenExpiresAt = undefined;
        await existingRSVP.save();
      } else {
        const rsvp = new WorkshopRSVP({
          workshopId: workshop._id,
          userId: userId,
          registeredEmail: emailValue.trim().toLowerCase()
          // token and tokenExpiresAt not needed for public-link mode
        });
        await rsvp.save();
      }

      // Get user name for email
      const user = await User.findById(userId);
      const studentName = user?.name || 'Student';

      // Send email with meeting link
      const emailResult = await sendWorkshopEmail(
        emailValue.trim().toLowerCase(),
        studentName,
        workshop.title,
        workshop.date,
        workshop.meetingLink,
        'public-link'
      );

      if (!emailResult.success) {
        console.error('Failed to send email:', emailResult.error);
        // Still return success but log the error
        // Registration is successful even if email fails
      }

      return res.json({ 
        link: workshop.meetingLink,
        message: 'Registration successful. Meeting link sent to your email.'
      });
    }

    // email-only mode: Generate secure token and save RSVP
    let rsvp;
    if (existingRSVP) {
      // Update existing RSVP
      existingRSVP.status = 'registered';
      existingRSVP.registeredEmail = emailValue.trim().toLowerCase();
      // Generate new token
      existingRSVP.token = crypto.randomBytes(24).toString('hex');
      existingRSVP.tokenExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
      await existingRSVP.save();
      rsvp = existingRSVP;
    } else {
      // Create new RSVP - token will be generated by pre-save hook
      rsvp = new WorkshopRSVP({
        workshopId: workshop._id,
        userId: userId,
        registeredEmail: emailValue.trim().toLowerCase()
        // token and tokenExpiresAt will be generated by pre-save hook
      });
      await rsvp.save();
    }

    // Get the RSVP to retrieve the generated token (refresh to ensure we have it)
    rsvp = await WorkshopRSVP.findById(rsvp._id);

    const joinUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/workshops/join/${rsvp.token}`;

    // Get user name for email
    const user = await User.findById(userId);
    const studentName = user?.name || 'Student';

    // Send email with tokenized link
    const emailResult = await sendWorkshopEmail(
      emailValue.trim().toLowerCase(),
      studentName,
      workshop.title,
      workshop.date,
      joinUrl,
      'email-only'
    );

    if (!emailResult.success) {
      console.error('Failed to send email:', emailResult.error);
      console.error('Email details:', {
        to: emailValue.trim().toLowerCase(),
        workshop: workshop.title,
        joinUrl: joinUrl
      });
      // Still return success but log the error
      // Registration is successful even if email fails
    } else {
      console.log('Email sent successfully:', emailResult.messageId);
    }

    console.log('Registration successful:', {
      workshopId: workshop._id,
      userId: userId,
      registrationMode: registrationMode,
      emailSent: emailResult.success
    });

    return res.json({ 
      status: 'ok',
      message: 'Link sent to provided email.'
    });
  } catch (error) {
    console.error('Error registering for workshop:', {
      error: error.message,
      stack: error.stack,
      workshopId: req.params.id,
      userId: req.user?._id || req.user?.userId
    });
    
    // Handle duplicate key error (already registered)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Already registered for this workshop' });
    }
    
    res.status(500).json({ message: 'Error registering for workshop' });
  }
});

// Token join endpoint - GET /workshops/join/:token
router.get('/join/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token || token.trim() === '') {
      return res.status(400).json({ error: 'Invalid or expired link' });
    }

    // Find RSVP by token
    const rsvp = await WorkshopRSVP.findOne({ token: token.trim() })
      .populate('workshopId')
      .populate('userId', 'name email');

    if (!rsvp) {
      return res.status(400).json({ error: 'Invalid or expired link' });
    }

    // Check if token is expired
    if (rsvp.tokenExpiresAt && new Date() > rsvp.tokenExpiresAt) {
      return res.status(400).json({ error: 'Invalid or expired link' });
    }

    // Check if RSVP status is valid
    if (rsvp.status === 'cancelled') {
      return res.status(400).json({ error: 'Invalid or expired link' });
    }

    // Verify workshop exists
    if (!rsvp.workshopId) {
      return res.status(404).json({ error: 'Workshop not found' });
    }

    const workshop = rsvp.workshopId;

    // Check if workshop is still available
    if (workshop.status === 'cancelled') {
      return res.status(400).json({ error: 'This workshop has been cancelled' });
    }

    // Only allow joining online workshops
    if (workshop.mode !== 'online') {
      return res.status(400).json({ error: 'This workshop is not available for online joining' });
    }

    // Check if meeting link exists
    if (!workshop.meetingLink) {
      return res.status(400).json({ error: 'Meeting link not available for this workshop' });
    }

    // Mark token as used (optional - you might want to allow multiple uses)
    // rsvp.status = 'used';
    // await rsvp.save();

    // Check if request wants JSON (from frontend) or direct redirect (from email link)
    const acceptsJson = req.headers.accept && req.headers.accept.includes('application/json');
    const wantsJson = req.query.format === 'json' || acceptsJson;

    if (wantsJson) {
      // Return JSON for frontend to handle redirect
      return res.json({ meetingLink: workshop.meetingLink });
    } else {
      // Direct redirect for email links
      res.redirect(workshop.meetingLink);
    }
  } catch (error) {
    console.error('Error validating token:', error);
    res.status(500).json({ error: 'Invalid or expired link' });
  }
});

// Get student registrations
router.get('/student/:studentId/registrations', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Verify the studentId matches the authenticated user
    if (req.user._id.toString() !== studentId && req.user.userId?.toString() !== studentId) {
      return res.status(403).json({ message: 'Not authorized to view these registrations' });
    }

    const registrations = await WorkshopRSVP.find({ 
      userId: studentId,
      status: { $ne: 'cancelled' }
    })
      .populate('workshopId', 'title description date mode meetingLink location status')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    console.error('Error fetching student registrations:', error);
    res.status(500).json({ message: 'Error fetching registrations' });
  }
});

// Cancel registration
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    const registrationIndex = workshop.registrations.findIndex(
      reg => reg.user.toString() === req.user._id.toString()
    );

    if (registrationIndex === -1) {
      return res.status(400).json({ message: 'Not registered for this workshop' });
    }

    workshop.registrations.splice(registrationIndex, 1);
    await workshop.save();
    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    res.status(500).json({ message: 'Error cancelling registration' });
  }
});

module.exports = router; 