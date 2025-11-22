const mongoose = require('mongoose');

const freelanceEntrySchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  shortSummary: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  role: {
    type: String,
    required: true,
    enum: ['Developer', 'Designer', 'PM', 'Other'],
    default: 'Developer'
  },
  technologies: [{
    type: String,
    trim: true
  }],
  problemSolved: {
    type: String,
    required: true,
    trim: true
  },
  implementationDetails: {
    type: String,
    required: true,
    trim: true
  },
  // Optional fields
  githubLink: {
    type: String,
    trim: true,
    default: ''
  },
  demoLink: {
    type: String,
    trim: true,
    default: ''
  },
  figmaLink: {
    type: String,
    trim: true,
    default: ''
  },
  attachments: [{
    type: String, // URLs or file paths
    trim: true
  }],
  isAnonymous: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
freelanceEntrySchema.index({ studentId: 1, createdAt: -1 });
freelanceEntrySchema.index({ role: 1 });
freelanceEntrySchema.index({ technologies: 1 });

const FreelanceEntry = mongoose.model('FreelanceEntry', freelanceEntrySchema);

module.exports = FreelanceEntry;

