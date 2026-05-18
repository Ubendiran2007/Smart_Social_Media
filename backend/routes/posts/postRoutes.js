const express = require('express');
const { body } = require('express-validator');
const { createPost, getFeedPosts, getUserPosts, toggleLike, addComment, deletePost } = require('../../controllers/posts/postController');
const auth = require('../../middleware/auth');
const upload = require('../../middleware/upload');
const moderateContent = require('../../middleware/moderation');

const router = express.Router();

// Create post
router.post('/', auth, upload.single('image'), moderateContent, createPost);

// Get feed posts
router.get('/feed', auth, getFeedPosts);

// Like/Unlike post
router.put('/:id/like', auth, toggleLike);

// Add comment
router.post('/:id/comment', auth, moderateContent, [
  body('text').notEmpty().withMessage('Comment text is required')
], addComment);

// Get user posts
router.get('/user/:userId', auth, getUserPosts);

// Delete post
router.delete('/:id', auth, deletePost);

module.exports = router;