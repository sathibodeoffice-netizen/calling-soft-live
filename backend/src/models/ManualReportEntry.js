const mongoose = require('mongoose');

const manualReportEntrySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  dateStr: { type: String, required: true }, // e.g., "10 Feb 26" or "10 Feb 26 (8:00 AM - 9:00 AM)"
  employee: { type: String, required: true }, // e.g., "Nayem"
  field: { type: String, required: true }, // e.g., "InCall", "OT", "Edit"
  value: { type: Number, required: true }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('ManualReportEntry', manualReportEntrySchema);
