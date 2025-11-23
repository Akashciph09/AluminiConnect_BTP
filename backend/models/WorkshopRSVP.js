const mongoose = require('mongoose');
const crypto = require('crypto');

const workshopRSVPSchema = new mongoose.Schema({
  workshopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workshop',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  registeredEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  token: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
    index: true
  },
  tokenExpiresAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['registered', 'used', 'cancelled'],
    default: 'registered',
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate registrations
workshopRSVPSchema.index({ workshopId: 1, userId: 1 }, { unique: true });

// Generate secure token before saving (only for email-only mode)
workshopRSVPSchema.pre('save', function(next) {
  // Only generate token if it doesn't exist and we're creating a new document
  // Token is only needed for email-only registration mode
  if (this.isNew && !this.token && this.tokenExpiresAt === undefined) {
    // Generate a secure random token
    this.token = crypto.randomBytes(24).toString('hex');
    // Token expires in 72 hours
    this.tokenExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
  }
  next();
});

const WorkshopRSVP = mongoose.model('WorkshopRSVP', workshopRSVPSchema);

module.exports = WorkshopRSVP;

