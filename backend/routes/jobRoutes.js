const express = require('express');
const router = express.Router();
const FreelanceOpportunity = require('../models/Job');
const User = require('../models/User');
const auth = require('../middleware/auth');
const FreelanceApplication = require('../models/JobApplication');

// Test route to verify database connection
router.get('/test', async (req, res) => {
    try {
        const opportunityCount = await FreelanceOpportunity.countDocuments();
        console.log('Database connection test - Freelance opportunity count:', opportunityCount);
        res.json({
            status: 'success',
            opportunityCount,
            message: 'Database connection successful'
        });
    } catch (error) {
        console.error('Database connection test failed:', error);
        res.status(500).json({
            status: 'error',
            message: 'Database connection failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// POST a new freelance opportunity
router.post('/', auth, async (req, res) => {
    try {
        console.log('Creating new freelance opportunity - Request details:', {
            body: req.body,
            user: req.user,
            headers: req.headers
        });
        
        // Get the user data
        const user = await User.findById(req.user.userId);
        if (!user) {
            console.log('User not found:', req.user.userId);
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate required fields
        const requiredFields = [
            'projectTitle',
            'projectDescription',
            'requiredSkills',
            'experienceLevel',
            'deliverables',
            'startDate',
            'deadline',
            'budget',
            'paymentType',
            'applicationDeadline'
        ];

        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            console.log('Missing required fields:', missingFields);
            return res.status(400).json({ 
                message: 'Missing required fields',
                missingFields 
            });
        }

        // Format the data
        const formattedData = {
            ...req.body,
            requiredSkills: Array.isArray(req.body.requiredSkills) 
                ? req.body.requiredSkills 
                : [req.body.requiredSkills],
            postedBy: req.user.userId,
            contactName: user.name,
            contactEmail: user.email,
            applicants: []
        };

        console.log('Formatted data:', formattedData);

        const opportunity = new FreelanceOpportunity(formattedData);
        await opportunity.save();
        
        console.log('Freelance opportunity created successfully:', opportunity._id);
        res.status(201).json(opportunity);
    } catch (error) {
        console.error('Error posting freelance opportunity:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(400).json({ 
            message: 'Error creating freelance opportunity',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET all freelance opportunities
router.get('/', async (req, res) => {
    try {
        console.log('Fetching all freelance opportunities - Request details:', {
            headers: req.headers,
            query: req.query,
            url: req.url
        });

        const opportunities = await FreelanceOpportunity.find()
            .sort({ createdAt: -1 })
            .populate('postedBy', 'name email')
            .populate('applicants', 'name email');

        console.log('Freelance opportunities found:', {
            count: opportunities.length,
            opportunities: opportunities.map(opportunity => ({
                id: opportunity._id,
                projectTitle: opportunity.projectTitle,
                category: opportunity.category
            }))
        });

        res.json(opportunities);
    } catch (error) {
        console.error('Error fetching freelance opportunities:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({ 
            message: 'Error fetching freelance opportunities',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Apply for a freelance opportunity
router.post('/:opportunityId/apply', auth, async (req, res) => {
    try {
        const opportunity = await FreelanceOpportunity.findById(req.params.opportunityId);
        if (!opportunity) {
            return res.status(404).json({ message: 'Freelance opportunity not found' });
        }

        // Check if user has already applied
        if (opportunity.applicants.includes(req.user.userId)) {
            return res.status(400).json({ message: 'You have already applied for this opportunity' });
        }

        // Add user to applicants
        opportunity.applicants.push(req.user.userId);
        await opportunity.save();

        res.json({ message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Error applying for freelance opportunity:', error);
        res.status(500).json({ 
            message: 'Error applying for freelance opportunity',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET freelance opportunities posted by an alumni
router.get('/alumni', auth, async (req, res) => {
    try {
        console.log('Fetching alumni opportunities - Request details:', {
            user: req.user,
            headers: req.headers
        });

        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (req.user.role !== 'alumni') {
            return res.status(403).json({ message: 'Only alumni can view their posted opportunities' });
        }

        const opportunities = await FreelanceOpportunity.find({ postedBy: req.user.userId })
            .sort({ createdAt: -1 })
            .populate('postedBy', 'name email')
            .populate({
                path: 'applicants',
                select: 'name email profile',
                model: 'User'
            });

        // Log the opportunities data for debugging
        console.log('Alumni opportunities found:', {
            count: opportunities.length,
            opportunitiesWithApplicants: opportunities.map(opportunity => ({
                id: opportunity._id,
                projectTitle: opportunity.projectTitle,
                applicantsCount: opportunity.applicants.length,
                applicants: opportunity.applicants.map(applicant => ({
                    id: applicant._id,
                    name: applicant.name
                }))
            }))
        });

        res.json(opportunities);
    } catch (error) {
        console.error('Error fetching alumni opportunities:', error);
        res.status(500).json({ 
            message: 'Error fetching opportunities',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router; 