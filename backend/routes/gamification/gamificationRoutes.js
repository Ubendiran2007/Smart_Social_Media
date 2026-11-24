const express = require('express');
const { getGamificationProfile, getLeaderboards } = require('../../controllers/gamification/gamificationController');
const auth = require('../../middleware/auth');

const router = express.Router();

// Get user gamification profile
router.get('/profile', auth, getGamificationProfile);

// Get weekly leaderboards
router.get('/leaderboards', auth, getLeaderboards);

module.exports = router;
