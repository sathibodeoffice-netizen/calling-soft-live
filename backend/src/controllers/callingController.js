const CallingData = require('../models/CallingData');

// Create new calling data
const createCallingData = async (req, res) => {
  try {
    const { 
      email, name, mobileNo, relation, errorCode, remarks, 
      status, review, edit, call, callingOT, editOT, reviewOT, editOverview, 
      remarksFromCalling, remarksFromReview, 
      reviewTime, editTime, callTime, sheetDate 
    } = req.body;
    
    const callingData = new CallingData({
      userId: req.user._id,
      email, name, mobileNo, relation, errorCode, remarks, 
      status, review, edit, call, callingOT, editOT, reviewOT, editOverview, 
      remarksFromCalling, remarksFromReview, 
      reviewTime, editTime, callTime, sheetDate: sheetDate || '10 Feb 26'
    });
    const createdData = await callingData.save();
    res.status(201).json(createdData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all calling data for logged in user
const getCallingData = async (req, res) => {
  try {
    const filter = { userId: req.user._id };
    if (req.query.sheetDate) {
      filter.sheetDate = req.query.sheetDate;
    }
    const data = await CallingData.find(filter).sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update calling data
const updateCallingData = async (req, res) => {
  try {
    const updates = req.body;
    const data = await CallingData.findById(req.params.id);

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }
    
    if (data.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    Object.assign(data, updates);

    const updatedData = await data.save();
    res.json(updatedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete calling data
const deleteCallingData = async (req, res) => {
  try {
    const data = await CallingData.findById(req.params.id);
    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }

    if (data.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await data.deleteOne();
    res.json({ message: 'Data removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get distinct sheets for the user
const getSheets = async (req, res) => {
  try {
    const sheets = await CallingData.distinct('sheetDate', { userId: req.user._id });
    
    // Sort sheets chronologically (newest first)
    sheets.sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      if (!isNaN(dateA) && !isNaN(dateB)) {
        return dateB - dateA;
      }
      return 0;
    });

    res.json(sheets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createCallingData, getCallingData, updateCallingData, deleteCallingData, getSheets };
