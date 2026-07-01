const express = require('express');
const router = express.Router();
const { createCallingData, getCallingData, updateCallingData, deleteCallingData, getSheets } = require('../controllers/callingController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/sheets', protect, getSheets);

router.route('/')
  .post(protect, createCallingData)
  .get(protect, getCallingData);

router.route('/:id')
  .put(protect, updateCallingData)
  .delete(protect, deleteCallingData);

module.exports = router;
