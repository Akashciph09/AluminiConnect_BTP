const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  graduationYear: {
    type: Number,
    required: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  currentPosition: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  skills: [{
    type: String
  }],
  experience: [{
    title: String,
    company: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  education: [{
    degree: String,
    institution: String,
    startDate: Date,
    endDate: Date
  }],
  socialLinks: {
    linkedin: String,
    github: String,
    twitter: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema); 