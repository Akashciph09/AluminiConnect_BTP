const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema({
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure a student can only request once per mentor
mentorshipSchema.index({ mentorId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Mentorship', mentorshipSchema); 