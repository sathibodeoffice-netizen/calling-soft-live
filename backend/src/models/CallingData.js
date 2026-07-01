const mongoose = require('mongoose');

const callingDataSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  email: { type: String, default: '' },
  name: { type: String, default: '' },
  mobileNo: { type: String, default: '' },
  relation: { type: String, default: '' },
  errorCode: { type: String, default: '' },
  remarks: { type: String, default: '' },
  status: { 
    type: String, 
    default: ''
  },
  sheetDate: { type: String, default: '10 Feb 26' }, // For tab management
  review: { type: String, default: '' },
  edit: { type: String, default: '' },
  call: { type: String, default: '' },
  callingOT: { type: String, default: '' },
  editOT: { type: String, default: '' },
  reviewOT: { type: String, default: '' },
  editOverview: { type: String, default: '' },
  remarksFromCalling: { type: String, default: '' },
  remarksFromReview: { type: String, default: '' },
  reviewTime: { type: String, default: '' },
  editTime: { type: String, default: '' },
  callTime: { type: String, default: '' },
  styles: { type: mongoose.Schema.Types.Mixed, default: {} },

}, { 
  timestamps: true 
});

module.exports = mongoose.model('CallingData', callingDataSchema);
