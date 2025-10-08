const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  grade: {
    type: Number,
    required: true,
    min: 9,
    max: 12
  },
  subjects: [{
    type: String,
    required: true,
    trim: true
  }],
  availability: {
    monday: { type: Boolean, default: false },
    tuesday: { type: Boolean, default: false },
    wednesday: { type: Boolean, default: false },
    thursday: { type: Boolean, default: false },
    friday: { type: Boolean, default: false },
    saturday: { type: Boolean, default: false },
    sunday: { type: Boolean, default: false }
  },
  timeSlots: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startTime: String,
    endTime: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  contactMethod: {
    type: String,
    enum: ['email', 'phone', 'both'],
    default: 'email'
  },
  phone: {
    type: String,
    trim: true
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for searching tutors
tutorSchema.index({ subjects: 1 });
tutorSchema.index({ grade: 1 });
tutorSchema.index({ isActive: 1, isApproved: 1 });

module.exports = mongoose.model('Tutor', tutorSchema);