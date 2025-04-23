const express = require('express');
const router = express.Router();
const Workshop = require('../models/Workshop');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all workshops
router.get('/', auth, async (req, res) => {
  try {
    const workshops = await Workshop.find()
      .populate('organizer', 'name email')
      .populate('registrations.user', 'name email profilePicture')
      .sort({ date: -1 });
    res.json(workshops);
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

    const { title, description, date, mode, location, targetAudience } = req.body;
    
    // Validate required fields
    if (!title || !description || !date || !mode || !targetAudience) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate location for offline/hybrid workshops
    if (mode !== 'online' && !location) {
      return res.status(400).json({ message: 'Location is required for offline/hybrid workshops' });
    }

    const workshop = new Workshop({
      title,
      description,
      date,
      mode,
      location: mode === 'online' ? undefined : location,
      targetAudience,
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

    const { title, description, date, mode, location, targetAudience } = req.body;
    
    workshop.title = title || workshop.title;
    workshop.description = description || workshop.description;
    workshop.date = date || workshop.date;
    workshop.mode = mode || workshop.mode;
    workshop.location = mode === 'online' ? undefined : (location || workshop.location);
    workshop.targetAudience = targetAudience || workshop.targetAudience;

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
      userId: req.user._id,
      userRole: req.user.role
    });

    // Check if user is a student
    if (req.user.role !== 'student') {
      console.log('Registration denied: User is not a student', { role: req.user.role });
      return res.status(403).json({ message: 'Only students can register for workshops' });
    }

    const workshop = await Workshop.findById(req.params.id);
    
    if (!workshop) {
      console.log('Workshop not found:', req.params.id);
      return res.status(404).json({ message: 'Workshop not found' });
    }

    if (workshop.status !== 'upcoming') {
      console.log('Workshop not available for registration:', workshop.status);
      return res.status(400).json({ message: 'Cannot register for this workshop' });
    }

    const alreadyRegistered = workshop.registrations.some(
      reg => reg.user.toString() === req.user._id.toString()
    );

    if (alreadyRegistered) {
      console.log('User already registered:', req.user._id);
      return res.status(400).json({ message: 'Already registered for this workshop' });
    }

    workshop.registrations.push({
      user: req.user._id,
      registeredAt: new Date()
    });

    await workshop.save();
    console.log('Registration successful:', {
      workshopId: workshop._id,
      userId: req.user._id
    });
    
    res.json({ message: 'Successfully registered for the workshop' });
  } catch (error) {
    console.error('Error registering for workshop:', {
      error: error.message,
      stack: error.stack,
      workshopId: req.params.id,
      userId: req.user?._id
    });
    res.status(500).json({ message: 'Error registering for workshop' });
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