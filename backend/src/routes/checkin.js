const express = require('express');
const router = express.Router();
const CheckIn = require('../models/CheckIn');

// Get current count of checked-in users
router.get('/count', async (req, res) => {
  try {
    const count = await CheckIn.countDocuments({ isCheckedIn: true });
    res.json({ count });
  } catch (error) {
    console.error('Error getting checkin count:', error);
    res.status(500).json({ error: 'Failed to get checkin count' });
  }
});

// Get user status
router.get('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const checkIn = await CheckIn.findOne({ userId });

    res.json({
      isCheckedIn: checkIn ? checkIn.isCheckedIn : false,
      checkedInAt: checkIn ? checkIn.checkedInAt : null
    });
  } catch (error) {
    console.error('Error getting user status:', error);
    res.status(500).json({ error: 'Failed to get user status' });
  }
});

// Check in user
router.post('/', async (req, res) => {
  try {
    const { userId, username } = req.body;

    if (!userId || !username) {
      return res.status(400).json({ error: 'User ID and username are required' });
    }

    // Check if user already exists
    let checkIn = await CheckIn.findOne({ userId });

    if (checkIn) {
      if (checkIn.isCheckedIn) {
        return res.status(400).json({ message: 'User is already checked in' });
      }
      // Update existing record
      checkIn.isCheckedIn = true;
      checkIn.checkedInAt = new Date();
      checkIn.username = username; // Update username in case it changed
      await checkIn.save();
    } else {
      // Create new record
      checkIn = new CheckIn({
        userId,
        username,
        isCheckedIn: true,
        checkedInAt: new Date()
      });
      await checkIn.save();
    }

    res.json({
      message: 'Successfully checked in',
      userId,
      checkedInAt: checkIn.checkedInAt
    });
  } catch (error) {
    console.error('Error checking in user:', error);
    if (error.code === 11000) { // Duplicate key error
      res.status(400).json({ error: 'User ID already exists' });
    } else {
      res.status(500).json({ error: 'Failed to check in user' });
    }
  }
});

// Check out user
router.post('/checkout', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const checkIn = await CheckIn.findOne({ userId });

    if (!checkIn) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!checkIn.isCheckedIn) {
      return res.status(400).json({ message: 'User is not checked in' });
    }

    checkIn.isCheckedIn = false;
    await checkIn.save();

    res.json({
      message: 'Successfully checked out',
      userId
    });
  } catch (error) {
    console.error('Error checking out user:', error);
    res.status(500).json({ error: 'Failed to check out user' });
  }
});

// Get all checked-in users (for admin purposes)
router.get('/active', async (req, res) => {
  try {
    const activeUsers = await CheckIn.find({ isCheckedIn: true })
      .select('userId username checkedInAt')
      .sort({ checkedInAt: -1 });

    res.json(activeUsers);
  } catch (error) {
    console.error('Error getting active users:', error);
    res.status(500).json({ error: 'Failed to get active users' });
  }
});

// Force logout all users (for period changes)
router.post('/logout-all', async (req, res) => {
  try {
    await CheckIn.updateMany(
      { isCheckedIn: true },
      { isCheckedIn: false }
    );

    const count = await CheckIn.countDocuments({});
    res.json({
      message: 'All users logged out successfully',
      totalUsersLoggedOut: count
    });
  } catch (error) {
    console.error('Error logging out all users:', error);
    res.status(500).json({ error: 'Failed to logout all users' });
  }
});

module.exports = router;