const mongoose = require('mongoose');

const workshopRegistrationSchema = new mongoose.Schema({
  workshopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workshop',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['registered', 'cancelled'],
    default: 'registered'
  }
}, {
  timestamps: true
});

// Create a compound index to ensure a student can only register once for a workshop
workshopRegistrationSchema.index({ workshopId: 1, studentId: 1 }, { unique: true });

const WorkshopRegistration = mongoose.model('WorkshopRegistration', workshopRegistrationSchema);

module.exports = WorkshopRegistration; 