const express = require('express');
const router = express.Router();

// Use global storage
const getStorage = () => {
  if (!global.checkedInUsers) {
    global.checkedInUsers = new Map();
  }
  return global.checkedInUsers;
};

// Get current count of checked-in users
router.get('/count', (req, res) => {
  try {
    const storage = getStorage();
    const count = Array.from(storage.values()).filter(user => user.isCheckedIn).length;
    console.log(`Current count: ${count}`);
    res.json({ count });
  } catch (error) {
    console.error('Error getting checkin count:', error);
    res.status(500).json({ error: 'Failed to get checkin count' });
  }
});

// Get user status
router.get('/status/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const storage = getStorage();
    const user = storage.get(userId);

    res.json({
      isCheckedIn: user ? user.isCheckedIn : false,
      checkedInAt: user ? user.checkedInAt : null
    });
  } catch (error) {
    console.error('Error getting user status:', error);
    res.status(500).json({ error: 'Failed to get user status' });
  }
});

// Check in user
router.post('/', (req, res) => {
  try {
    const { userId, username } = req.body;

    if (!userId || !username) {
      return res.status(400).json({ error: 'User ID and username are required' });
    }

    const storage = getStorage();
    const existingUser = storage.get(userId);

    if (existingUser && existingUser.isCheckedIn) {
      return res.status(400).json({ message: 'User is already checked in' });
    }

    // Set or update user
    const checkedInAt = new Date();
    storage.set(userId, {
      username,
      checkedInAt,
      isCheckedIn: true
    });

    console.log(`User ${username} (${userId}) checked in at ${checkedInAt}`);
    res.json({
      message: 'Successfully checked in',
      userId,
      checkedInAt
    });
  } catch (error) {
    console.error('Error checking in user:', error);
    res.status(500).json({ error: 'Failed to check in user' });
  }
});

// Check out user
router.post('/checkout', (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const storage = getStorage();
    const user = storage.get(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isCheckedIn) {
      return res.status(400).json({ message: 'User is not checked in' });
    }

    user.isCheckedIn = false;
    storage.set(userId, user);

    console.log(`User ${user.username} (${userId}) checked out`);
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
router.get('/active', (req, res) => {
  try {
    const storage = getStorage();
    const activeUsers = Array.from(storage.entries())
      .filter(([, user]) => user.isCheckedIn)
      .map(([userId, user]) => ({
        userId,
        username: user.username,
        checkedInAt: user.checkedInAt
      }))
      .sort((a, b) => new Date(b.checkedInAt) - new Date(a.checkedInAt));

    res.json(activeUsers);
  } catch (error) {
    console.error('Error getting active users:', error);
    res.status(500).json({ error: 'Failed to get active users' });
  }
});

// Force logout all users (for period changes)
router.post('/logout-all', (req, res) => {
  try {
    const storage = getStorage();
    let count = 0;
    for (const [userId, user] of storage.entries()) {
      if (user.isCheckedIn) {
        user.isCheckedIn = false;
        storage.set(userId, user);
        count++;
      }
    }

    console.log(`Logged out ${count} users`);
    res.json({
      message: 'All users logged out successfully',
      totalUsersLoggedOut: count
    });
  } catch (error) {
    console.error('Error logging out all users:', error);
    res.status(500).json({ error: 'Failed to logout all users' });
  }
});

// Verify existing user ID and check them in
router.post('/verify-and-checkin', (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const storage = getStorage();
    const existingUser = storage.get(userId);

    if (!existingUser) {
      return res.status(404).json({ message: 'User ID not found. Please check your ID or register as a new user.' });
    }

    if (existingUser.isCheckedIn) {
      return res.status(400).json({ message: 'User is already checked in' });
    }

    // Check in the existing user
    existingUser.isCheckedIn = true;
    existingUser.checkedInAt = new Date();
    storage.set(userId, existingUser);

    console.log(`User ${existingUser.username} (${userId}) checked in at ${existingUser.checkedInAt}`);
    res.json({
      message: 'Successfully checked in',
      userId,
      username: existingUser.username,
      checkedInAt: existingUser.checkedInAt
    });
  } catch (error) {
    console.error('Error verifying and checking in user:', error);
    res.status(500).json({ error: 'Failed to verify and check in user' });
  }
});

// Register new user and check them in
router.post('/register-and-checkin', (req, res) => {
  try {
    const { firstName, lastName, customUserId } = req.body;

    if (!firstName || !lastName || !customUserId) {
      return res.status(400).json({ error: 'First name, last name, and user ID are required' });
    }

    const storage = getStorage();
    const fullName = `${firstName} ${lastName}`;

    // Check if user with this name already exists
    const existingUserWithName = Array.from(storage.values()).find(user =>
      user.username.toLowerCase() === fullName.toLowerCase()
    );

    if (existingUserWithName) {
      return res.status(400).json({
        message: `A user with the name "${fullName}" already exists. Please use a different name or contact an administrator.`
      });
    }

    // Check if the custom user ID is already taken
    if (storage.has(customUserId)) {
      return res.status(400).json({
        message: `User ID "${customUserId}" is already taken. Please choose a different ID.`
      });
    }

    // Create and check in the new user
    const checkedInAt = new Date();
    const newUser = {
      username: fullName,
      checkedInAt,
      isCheckedIn: true
    };

    storage.set(customUserId, newUser);

    console.log(`New user ${fullName} (${customUserId}) registered and checked in at ${checkedInAt}`);
    res.json({
      message: 'Successfully registered and checked in',
      userId: customUserId,
      username: fullName,
      checkedInAt
    });
  } catch (error) {
    console.error('Error registering and checking in user:', error);
    res.status(500).json({ error: 'Failed to register and check in user' });
  }
});

module.exports = router;