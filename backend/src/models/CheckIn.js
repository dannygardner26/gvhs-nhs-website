const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  checkedInAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  isCheckedIn: {
    type: Boolean,
    required: true,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
checkInSchema.index({ userId: 1 });
checkInSchema.index({ isCheckedIn: 1 });
checkInSchema.index({ checkedInAt: 1 });

module.exports = mongoose.model('CheckIn', checkInSchema);