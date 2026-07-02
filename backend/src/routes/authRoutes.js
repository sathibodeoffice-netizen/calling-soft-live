const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register new user (Admin only in production, but open for initial setup)
// @access  Public (for now)
router.post('/register', registerUser);

// Temporary route to seed admin user via browser
router.get('/seed', async (req, res) => {
  try {
    const User = require('../models/User');
    
    // Fix double-hashed user if it exists
    await User.deleteOne({ email: 'arsathib24@gmail.com' });
    
    const user = new User({
      name: 'Admin',
      email: 'arsathib24@gmail.com',
      password: '123456', // Will be hashed automatically by pre-save hook
      role: 'admin'
    });
    await user.save();
    res.json({ message: 'Admin user created successfully (Fixed)!', email: 'arsathib24@gmail.com', password: '123456' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', loginUser);

module.exports = router;
