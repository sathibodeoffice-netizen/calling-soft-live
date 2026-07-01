const express = require('express');
const router = express.Router();
const { getMembers, addMember } = require('../controllers/memberController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getMembers)
  .post(protect, addMember);

module.exports = router;
