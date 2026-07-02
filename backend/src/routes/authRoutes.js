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
    const bcrypt = require('bcryptjs');
    const existingUser = await User.findOne({ email: 'arsathib24@gmail.com' });
    if (existingUser) return res.json({ message: 'Admin already exists', email: 'arsathib24@gmail.com', password: '123456' });
    
    const hashedPassword = await bcrypt.hash('123456', 10);
    const user = new User({
      name: 'Admin',
      email: 'arsathib24@gmail.com',
      password: hashedPassword,
      role: 'admin'
    });
    await user.save();
    res.json({ message: 'Admin user created successfully!', email: 'arsathib24@gmail.com', password: '123456' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', loginUser);

module.exports = router;
