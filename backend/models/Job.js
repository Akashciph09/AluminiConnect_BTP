const mongoose = require('mongoose');

const freelanceOpportunitySchema = new mongoose.Schema({
    projectTitle: {
        type: String,
        required: true
    },
    projectDescription: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    requiredSkills: [{
        type: String,
        required: true
    }],
    experienceLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        required: true
    },
    deliverables: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    estimatedHoursPerWeek: {
        type: Number,
        required: false
    },
    budget: {
        type: String,
        required: true
    },
    paymentType: {
        type: String,
        enum: ['Fixed', 'Hourly'],
        required: true
    },
    applicationDeadline: {
        type: Date,
        required: true
    },
    contactName: {
        type: String,
        required: true
    },
    contactEmail: {
        type: String,
        required: true
    },
    contactLinkedIn: {
        type: String,
        required: false
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    applicants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('FreelanceOpportunity', freelanceOpportunitySchema); 