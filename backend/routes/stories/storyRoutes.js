const express = require('express');
const { createStory, getStories, viewStory, deleteStory } = require('../../controllers/stories/storyController');
const auth = require('../../middleware/auth');
const upload = require('../../middleware/upload');

const router = express.Router();

// Create story
router.post('/', auth, upload.single('media'), createStory);

// Get stories
router.get('/', auth, getStories);

// View story
router.put('/:id/view', auth, viewStory);

// Delete story
router.delete('/:id', auth, deleteStory);

module.exports = router;