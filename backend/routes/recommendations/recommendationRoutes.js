const express = require('express');
const router  = express.Router();
const auth    = require('../../middleware/auth');
const {
  getPersonalizedFeed,
  getPersonalizedReels,
  getCreatorRecommendations,
  getHashtagRecommendations,
  getRoomRecommendations,
  recordBehavior,
  getForYouPanel
} = require('../../controllers/recommendations/recommendationController');

// ─── Personalization Endpoints ─────────────────────────────────────────────
router.get('/feed',     auth, getPersonalizedFeed);
router.get('/reels',    auth, getPersonalizedReels);
router.get('/creators', auth, getCreatorRecommendations);
router.get('/hashtags', auth, getHashtagRecommendations);
router.get('/rooms',    auth, getRoomRecommendations);
router.get('/for-you',  auth, getForYouPanel);

// ─── Behavior Tracking ─────────────────────────────────────────────────────
router.post('/behavior', auth, recordBehavior);

module.exports = router;
