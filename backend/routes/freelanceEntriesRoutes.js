const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const FreelanceEntry = require('../models/FreelanceEntry');
const auth = require('../middleware/auth');

// Middleware to check if user is a student
const studentOnly = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ 
      message: 'Access denied. This feature is only available to students.' 
    });
  }
  next();
};

// POST /api/student-entries - Create a new freelance entry
router.post('/', auth, studentOnly, async (req, res) => {
  try {
    const {
      title,
      shortSummary,
      role,
      technologies,
      problemSolved,
      implementationDetails,
      githubLink,
      demoLink,
      figmaLink,
      attachments,
      isAnonymous
    } = req.body;

    // Validate required fields
    if (!title || !shortSummary || !role || !problemSolved || !implementationDetails) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, shortSummary, role, problemSolved, implementationDetails' 
      });
    }

    // Validate shortSummary length
    if (shortSummary.length > 200) {
      return res.status(400).json({ 
        message: 'Short summary must be 200 characters or less' 
      });
    }

    // Validate role
    const validRoles = ['Developer', 'Designer', 'PM', 'Other'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role. Must be one of: Developer, Designer, PM, Other' 
      });
    }

    // Create new entry
    const entry = new FreelanceEntry({
      studentId: req.user._id || req.user.userId,
      title: title.trim(),
      shortSummary: shortSummary.trim(),
      role,
      technologies: Array.isArray(technologies) ? technologies.filter(t => t && t.trim()) : [],
      problemSolved: problemSolved.trim(),
      implementationDetails: implementationDetails.trim(),
      githubLink: githubLink ? githubLink.trim() : '',
      demoLink: demoLink ? demoLink.trim() : '',
      figmaLink: figmaLink ? figmaLink.trim() : '',
      attachments: Array.isArray(attachments) ? attachments.filter(a => a && a.trim()) : [],
      isAnonymous: isAnonymous === true
    });

    await entry.save();

    // Populate student info for response (only if not anonymous)
    const populatedEntry = await FreelanceEntry.findById(entry._id)
      .populate({
        path: 'studentId',
        select: 'name email',
        match: { role: 'student' }
      })
      .lean();

    res.status(201).json({
      message: 'Freelance entry created successfully',
      entry: populatedEntry
    });
  } catch (error) {
    console.error('Error creating freelance entry:', error);
    console.error('Error stack:', error.stack);
    console.error('Request body:', req.body);
    console.error('User:', req.user);
    res.status(500).json({ 
      message: 'Error creating freelance entry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/student-entries - Get all freelance entries (student-only access)
router.get('/', auth, studentOnly, async (req, res) => {
  try {
    const entries = await FreelanceEntry.find({})
      .populate({
        path: 'studentId',
        select: 'name email',
        match: { role: 'student' }
      })
      .sort({ createdAt: -1 })
      .lean();

    // Format response - show "Anonymous" if isAnonymous is true
    const formattedEntries = entries.map(entry => {
      const entryObj = {
        _id: entry._id,
        title: entry.title,
        shortSummary: entry.shortSummary,
        role: entry.role,
        technologies: entry.technologies,
        problemSolved: entry.problemSolved,
        implementationDetails: entry.implementationDetails,
        githubLink: entry.githubLink,
        demoLink: entry.demoLink,
        figmaLink: entry.figmaLink,
        attachments: entry.attachments,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
        student: entry.isAnonymous 
          ? { name: 'Anonymous', email: '' }
          : (entry.studentId ? {
              name: entry.studentId.name || 'Unknown Student',
              email: entry.studentId.email || ''
            } : { name: 'Unknown Student', email: '' })
      };
      return entryObj;
    });

    res.json({
      count: formattedEntries.length,
      entries: formattedEntries
    });
  } catch (error) {
    console.error('Error fetching freelance entries:', error);
    res.status(500).json({ 
      message: 'Error fetching freelance entries',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/student-entries/:id - Get a single freelance entry
router.get('/:id', auth, studentOnly, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid entry ID' });
    }

    const entry = await FreelanceEntry.findById(id)
      .populate({
        path: 'studentId',
        select: 'name email',
        match: { role: 'student' }
      })
      .lean();

    if (!entry) {
      return res.status(404).json({ message: 'Freelance entry not found' });
    }

    // Format response
    const formattedEntry = {
      _id: entry._id,
      title: entry.title,
      shortSummary: entry.shortSummary,
      role: entry.role,
      technologies: entry.technologies,
      problemSolved: entry.problemSolved,
      implementationDetails: entry.implementationDetails,
      githubLink: entry.githubLink,
      demoLink: entry.demoLink,
      figmaLink: entry.figmaLink,
      attachments: entry.attachments,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      student: entry.isAnonymous 
        ? { name: 'Anonymous', email: '' }
        : (entry.studentId ? {
            name: entry.studentId.name || 'Unknown Student',
            email: entry.studentId.email || ''
          } : { name: 'Unknown Student', email: '' })
    };

    res.json(formattedEntry);
  } catch (error) {
    console.error('Error fetching freelance entry:', error);
    res.status(500).json({ 
      message: 'Error fetching freelance entry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/student-entries/:id - Update a freelance entry (only by owner)
router.put('/:id', auth, studentOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid entry ID' });
    }

    const entry = await FreelanceEntry.findById(id);

    if (!entry) {
      return res.status(404).json({ message: 'Freelance entry not found' });
    }

    // Check if user owns this entry
    const userId = req.user._id || req.user.userId;
    if (entry.studentId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only update your own entries' });
    }

    // Validate shortSummary length if provided
    if (updates.shortSummary && updates.shortSummary.length > 200) {
      return res.status(400).json({ 
        message: 'Short summary must be 200 characters or less' 
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'title', 'shortSummary', 'role', 'technologies', 'problemSolved',
      'implementationDetails', 'githubLink', 'demoLink', 'figmaLink',
      'attachments', 'isAnonymous'
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'technologies' || field === 'attachments') {
          entry[field] = Array.isArray(updates[field]) 
            ? updates[field].filter(item => item.trim()) 
            : [];
        } else if (typeof updates[field] === 'string') {
          entry[field] = updates[field].trim();
        } else {
          entry[field] = updates[field];
        }
      }
    });

    entry.updatedAt = Date.now();
    await entry.save();

    const populatedEntry = await FreelanceEntry.findById(entry._id)
      .populate({
        path: 'studentId',
        select: 'name email',
        match: { role: 'student' }
      })
      .lean();

    res.json({
      message: 'Freelance entry updated successfully',
      entry: populatedEntry
    });
  } catch (error) {
    console.error('Error updating freelance entry:', error);
    res.status(500).json({ 
      message: 'Error updating freelance entry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/student-entries/:id - Delete a freelance entry (only by owner)
router.delete('/:id', auth, studentOnly, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid entry ID' });
    }

    const entry = await FreelanceEntry.findById(id);

    if (!entry) {
      return res.status(404).json({ message: 'Freelance entry not found' });
    }

    // Check if user owns this entry
    const userId = req.user._id || req.user.userId;
    if (entry.studentId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only delete your own entries' });
    }

    await FreelanceEntry.findByIdAndDelete(id);

    res.json({ message: 'Freelance entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting freelance entry:', error);
    res.status(500).json({ 
      message: 'Error deleting freelance entry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

