const ManualReportEntry = require('../models/ManualReportEntry');
const CallingData = require('../models/CallingData');

// Get manual report entries for the user
const getManualEntries = async (req, res) => {
  try {
    const entries = await ManualReportEntry.find({ userId: req.user._id });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update or create a manual report entry
const saveManualEntry = async (req, res) => {
  try {
    const { dateStr, employee, field, value } = req.body;
    
    // Find if it already exists
    let entry = await ManualReportEntry.findOne({
      userId: req.user._id,
      dateStr,
      employee,
      field
    });

    if (entry) {
      // Update
      entry.value = value;
      await entry.save();
    } else {
      // Create
      entry = new ManualReportEntry({
        userId: req.user._id,
        dateStr,
        employee,
        field,
        value
      });
      await entry.save();
    }

    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getManualEntries, saveManualEntry };
