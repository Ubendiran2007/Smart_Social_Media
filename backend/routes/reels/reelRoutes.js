const express = require('express');
const { body } = require('express-validator');
const { createReel, getReels, toggleLike, addComment, incrementView } = require('../../controllers/reels/reelController');
const auth = require('../../middleware/auth');
const upload = require('../../middleware/upload');

const router = express.Router();

// Create reel
router.post('/', auth, upload.single('video'), createReel);

// Get reels
router.get('/', auth, getReels);

// Like/Unlike reel
router.put('/:id/like', auth, toggleLike);

// Add comment
router.post('/:id/comment', auth, [
  body('text').notEmpty().withMessage('Comment text is required')
], addComment);

// Increment view
router.put('/:id/view', auth, incrementView);

module.exports = router;