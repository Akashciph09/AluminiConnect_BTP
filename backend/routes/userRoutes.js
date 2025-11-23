const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        console.log('Fetching user data for:', req.user._id);
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            console.log('User not found:', req.user._id);
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('User found:', { id: user._id, role: user.role });
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile: user.profile
        });
    } catch (error) {
        console.error('Error fetching user:', {
            message: error.message,
            stack: error.stack,
            userId: req.user._id
        });
        res.status(500).json({ 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
    try {
        console.log('Fetching profile for user:', req.user._id);
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            console.log('User not found:', req.user._id);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Profile found:', { id: user._id, role: user.role });
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile: user.profile || {}
        });
    } catch (error) {
        console.error('Error fetching profile:', {
            message: error.message,
            stack: error.stack,
            userId: req.user._id
        });
        res.status(500).json({ 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Upload profile picture
router.post('/profile/picture', auth, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete old profile picture if exists (check common fields for backward compatibility)
        const oldPaths = [user.profile?.profileImage, user.profile?.profilePicture, user.profilePicture];
        for (const p of oldPaths) {
            if (p) {
                const oldImagePath = path.join(__dirname, '..', p);
                if (fs.existsSync(oldImagePath)) {
                    try { fs.unlinkSync(oldImagePath); } catch (err) { console.error('Failed to delete old image', err); }
                }
            }
        }

        // Build a full URL to the uploaded image so frontends can load it directly
        const backendBase = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3002}`;
        const normalizedPath = req.file.path.replace(/\\/g, '/');
        const fullUrl = `${backendBase}/${normalizedPath}`;

        // Update profile with new image path and keep backward-compatible fields
        user.profile = user.profile || {};
        user.profile.profileImage = fullUrl;
        user.profile.profilePicture = fullUrl; // legacy field
        user.profilePicture = fullUrl; // legacy top-level field used in some frontend components
        await user.save();

        res.json({
            message: 'Profile picture uploaded successfully',
            profileImage: fullUrl,
            profilePicture: fullUrl
        });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ 
            message: 'Error uploading profile picture',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        console.log('Updating profile for user:', req.user._id);
        console.log('Update data:', req.body);

        const user = await User.findById(req.user._id);
        if (!user) {
            console.log('User not found:', req.user._id);
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, email, profile } = req.body;

        // Validate email if provided
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            user.email = email;
        }

        // Update name if provided
        if (name) {
            user.name = name;
        }

        // Update profile if provided
        if (profile) {
            user.profile = {
                ...user.profile,
                ...profile
            };
        }

        console.log('Saving updated user:', {
            id: user._id,
            name: user.name,
            email: user.email,
            profile: user.profile
        });

        await user.save();

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile: user.profile
        });
    } catch (error) {
        console.error('Error updating profile:', {
            message: error.message,
            stack: error.stack,
            userId: req.user._id,
            updateData: req.body
        });
        res.status(500).json({ 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get all alumni users
router.get('/alumni', auth, async (req, res) => {
  try {
    const alumni = await User.find({ role: 'alumni' })
      .select('name email profile')
      .populate('profile');
    
    res.json(alumni);
  } catch (error) {
    console.error('Error fetching alumni:', error);
    res.status(500).json({ 
      message: 'Error fetching alumni',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 