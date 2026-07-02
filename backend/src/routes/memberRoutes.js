const express = require('express');
const router = express.Router();
const { getMembers, addMember } = require('../controllers/memberController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getMembers)
  .post(protect, addMember);

// Temporary route to seed members via browser
router.get('/seed', async (req, res) => {
  try {
    const TeamMember = require('../models/TeamMember');
    const membersCount = await TeamMember.countDocuments();
    if (membersCount === 0) {
      const members = [
        { name: "Anis", color: "#FFB6C1" },
        { name: "Sraboni", color: "#ADD8E6" },
        { name: "Rifat", color: "#90EE90" },
        { name: "Limon", color: "#FFFFE0" },
        { name: "Rabbi", color: "#FFA07A" },
        { name: "Abir", color: "#20B2AA" },
        { name: "Rakib", color: "#9370DB" },
        { name: "Sayed", color: "#FFDAB9" },
        { name: "Nayem", color: "#F08080" },
        { name: "Nayeem", color: "#E6E6FA" }
      ];
      await TeamMember.insertMany(members);
      return res.json({ message: 'Members seeded successfully!' });
    }
    res.json({ message: 'Members already exist' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
