const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {
  suggestHashtags,
  getTrending,
  getHashtagFeed,
  autocompleteHashtag,
  analyzeCaption
} = require('../../controllers/hashtag/hashtagController');

// Real-time suggestions while typing
router.post('/suggest', auth, suggestHashtags);

// Trending hashtags from DB
router.get('/trending', auth, getTrending);

// Hashtag feed (all content for a given #tag)
router.get('/feed/:tag', auth, getHashtagFeed);

// Autocomplete partial #word input
router.get('/autocomplete', auth, autocompleteHashtag);

// Full caption analysis (before submit)
router.post('/analyze', auth, analyzeCaption);

module.exports = router;
