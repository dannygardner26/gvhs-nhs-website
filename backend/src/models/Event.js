const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: false
  },
  location: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['meeting', 'volunteer', 'tutoring', 'social', 'service'],
    default: 'meeting'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  maxAttendees: {
    type: Number,
    default: null
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for querying events by date
eventSchema.index({ date: 1 });
eventSchema.index({ type: 1 });

module.exports = mongoose.model('Event', eventSchema);