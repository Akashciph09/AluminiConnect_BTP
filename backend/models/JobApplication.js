const mongoose = require('mongoose');

const freelanceApplicationSchema = new mongoose.Schema({
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FreelanceOpportunity',
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
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure a student can only apply once to an opportunity
freelanceApplicationSchema.index({ opportunityId: 1, studentId: 1 }, { unique: true });

const FreelanceApplication = mongoose.model('FreelanceApplication', freelanceApplicationSchema);

module.exports = FreelanceApplication; 