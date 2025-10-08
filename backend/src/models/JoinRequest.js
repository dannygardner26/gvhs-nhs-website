const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema({
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
    min: 10,
    max: 12
  },
  gpa: {
    type: Number,
    required: true,
    min: 0,
    max: 4.0
  },
  phone: {
    type: String,
    trim: true
  },
  leadershipExperience: {
    type: String,
    required: true,
    maxlength: 1000
  },
  serviceHours: {
    type: Number,
    required: true,
    min: 0
  },
  serviceDescription: {
    type: String,
    required: true,
    maxlength: 1000
  },
  characterReference: {
    teacherName: {
      type: String,
      required: true,
      trim: true
    },
    teacherEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    relationship: {
      type: String,
      required: true
    }
  },
  personalStatement: {
    type: String,
    required: true,
    maxlength: 1500
  },
  whyJoinNHS: {
    type: String,
    required: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'under-review', 'approved', 'rejected', 'waitlisted'],
    default: 'pending'
  },
  reviewNotes: {
    type: String,
    maxlength: 500
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  interviewScheduled: {
    type: Boolean,
    default: false
  },
  interviewDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for querying join requests
joinRequestSchema.index({ status: 1 });
joinRequestSchema.index({ grade: 1 });
joinRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('JoinRequest', joinRequestSchema);