const mongoose = require('mongoose');

const mentorshipRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    trim: true,
    default: ''
  },
  requestedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add compound index to prevent duplicate requests
mentorshipRequestSchema.index({ studentId: 1, mentorId: 1 }, { unique: true });

// Add index for faster queries
mentorshipRequestSchema.index({ status: 1 });
mentorshipRequestSchema.index({ createdAt: -1 });

const MentorshipRequest = mongoose.model('MentorshipRequest', mentorshipRequestSchema);

module.exports = MentorshipRequest;