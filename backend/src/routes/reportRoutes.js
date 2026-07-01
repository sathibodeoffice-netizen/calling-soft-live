const express = require('express');
const router = express.Router();
const { getManualEntries, saveManualEntry } = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/manual')
  .get(protect, getManualEntries)
  .post(protect, saveManualEntry);

module.exports = router;
