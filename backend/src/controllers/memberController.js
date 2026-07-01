const TeamMember = require('../models/TeamMember');

// Get all members for logged in user
const getMembers = async (req, res) => {
  try {
    const members = await TeamMember.find({ userId: req.user._id }).sort({ name: 1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new member
const addMember = async (req, res) => {
  try {
    const { name, color } = req.body;
    
    // Check if member already exists
    const existing = await TeamMember.findOne({ userId: req.user._id, name });
    if (existing) {
      existing.color = color || existing.color;
      await existing.save();
      return res.json(existing);
    }

    const member = new TeamMember({
      userId: req.user._id,
      name,
      color: color || '#ffffff'
    });
    
    const createdMember = await member.save();
    res.status(201).json(createdMember);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMembers, addMember };
