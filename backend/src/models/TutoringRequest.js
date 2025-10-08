const mongoose = require('mongoose');

const tutoringRequestSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  studentEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  studentGrade: {
    type: Number,
    required: true,
    min: 9,
    max: 12
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  specificTopic: {
    type: String,
    trim: true
  },
  preferredTime: {
    type: String,
    required: true
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  message: {
    type: String,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'matched', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  assignedTutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor'
  },
  sessionDetails: {
    scheduledDate: Date,
    scheduledTime: String,
    location: String,
    notes: String
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  }
}, {
  timestamps: true
});

// Index for querying requests
tutoringRequestSchema.index({ status: 1 });
tutoringRequestSchema.index({ subject: 1 });
tutoringRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('TutoringRequest', tutoringRequestSchema);