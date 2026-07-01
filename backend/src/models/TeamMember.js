const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { type: String, required: true },
  color: { type: String, default: '#ffffff' }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('TeamMember', teamMemberSchema);
