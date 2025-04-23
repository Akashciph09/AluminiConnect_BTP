const express = require('express');
const router = express.Router();
const FreelanceApplication = require('../models/JobApplication');
const auth = require('../middleware/auth');
const FreelanceOpportunity = require('../models/Job');
const Notification = require('../models/Notification');

// Apply for a freelance opportunity
router.post('/:opportunityId/apply', auth, async (req, res) => {
    try {
        console.log('Received freelance application request:', {
            opportunityId: req.params.opportunityId,
            studentId: req.user.userId,
            role: req.user.role
        });

        // Check if user is a student
        if (req.user.role !== 'student') {
            console.log('User is not a student:', req.user.role);
            return res.status(403).json({ message: 'Only students can apply for freelance opportunities' });
        }

        const opportunityId = req.params.opportunityId;
        const studentId = req.user.userId;

        // Check if already applied
        const existingApplication = await FreelanceApplication.findOne({ opportunityId, studentId });
        if (existingApplication) {
            console.log('User has already applied for this opportunity');
            return res.status(400).json({ message: 'You have already applied for this opportunity' });
        }

        // Create new application
        const application = new FreelanceApplication({
            opportunityId,
            studentId
        });

        // Update the opportunity's applicants array
        const opportunity = await FreelanceOpportunity.findById(opportunityId);
        if (!opportunity) {
            return res.status(404).json({ message: 'Freelance opportunity not found' });
        }

        // Add student to opportunity's applicants array if not already there
        if (!opportunity.applicants.includes(studentId)) {
            opportunity.applicants.push(studentId);
            await opportunity.save();
        }

        console.log('Creating new application:', application);
        await application.save();
        console.log('Application saved successfully:', application._id);
        
        res.status(201).json(application);
    } catch (error) {
        console.error('Error applying for freelance opportunity:', error);
        res.status(500).json({ 
            message: 'Error applying for freelance opportunity',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get all applications for a student
router.get('/my-applications', auth, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const applications = await FreelanceApplication.find({ studentId: req.user.userId })
            .populate('opportunityId')
            .sort({ appliedAt: -1 });

        res.json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ message: 'Error fetching applications' });
    }
});

// Check if student has applied for a specific opportunity
router.get('/:opportunityId/check-application', auth, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const application = await FreelanceApplication.findOne({
            opportunityId: req.params.opportunityId,
            studentId: req.user.userId
        });

        res.json({ hasApplied: !!application, application });
    } catch (error) {
        console.error('Error checking application:', error);
        res.status(500).json({ message: 'Error checking application status' });
    }
});

// Get applications for opportunities posted by an alumni
router.get('/alumni/applications', auth, async (req, res) => {
    try {
        if (req.user.role !== 'alumni') {
            return res.status(403).json({ message: 'Only alumni can view applications' });
        }

        console.log('User requesting applications:', req.user);

        // Find all opportunities posted by this alumni
        const opportunities = await FreelanceOpportunity.find({ postedBy: req.user.userId });
        const opportunityIds = opportunities.map(opportunity => opportunity._id);

        console.log('Found opportunities:', opportunityIds);

        // Find all applications for these opportunities (not just pending ones)
        const applications = await FreelanceApplication.find({ 
            opportunityId: { $in: opportunityIds }
        })
            .populate('opportunityId', 'projectTitle category')
            .populate('studentId', 'name email profile')
            .sort({ appliedAt: -1 });

        console.log(`Found ${applications.length} applications for alumni ${req.user.userId}`);
        res.json(applications);
    } catch (error) {
        console.error('Error fetching alumni applications:', error);
        res.status(500).json({ 
            message: 'Error fetching applications',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Update application status (accept/reject)
router.put('/:applicationId/status', auth, async (req, res) => {
    try {
        if (req.user.role !== 'alumni') {
            return res.status(403).json({ message: 'Only alumni can update application status' });
        }

        const { status } = req.body;
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const application = await FreelanceApplication.findById(req.params.applicationId)
            .populate('opportunityId', 'postedBy');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check if the alumni owns this opportunity
        if (application.opportunityId.postedBy.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to update this application' });
        }

        application.status = status;
        await application.save();

        res.json(application);
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ 
            message: 'Error updating application status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Update application status using opportunityId and studentId
router.put('/update-status', auth, async (req, res) => {
    try {
        const { opportunityId, studentId, status } = req.body;
        
        console.log('Received status update request:', { opportunityId, studentId, status });

        // Validate status
        if (!['accepted', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        
        // Check if the user is an alumni
        if (req.user.role !== 'alumni') {
            return res.status(403).json({ message: 'Only alumni can update application status' });
        }
        
        // Find the opportunity to verify ownership
        const opportunity = await FreelanceOpportunity.findById(opportunityId);
        if (!opportunity) {
            return res.status(404).json({ message: 'Opportunity not found' });
        }
        
        // Verify the alumni owns this opportunity
        if (opportunity.postedBy.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to update applications for this opportunity' });
        }

        // Find and update the application without the pending status constraint
        const application = await FreelanceApplication.findOneAndUpdate(
            { 
                opportunityId,
                studentId
            },
            { status },
            { new: true }
        ).populate('opportunityId', 'projectTitle');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }
        
        console.log('Updated application:', application);

        // Create notification for the student
        const notification = new Notification({
            recipientId: studentId,
            type: 'job_application',
            title: 'Application Status Update',
            message: `Your application for "${application.opportunityId.projectTitle}" has been ${status}`,
            relatedId: application._id
        });

        await notification.save();

        res.json(application);
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ 
            message: 'Error updating application status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router; 