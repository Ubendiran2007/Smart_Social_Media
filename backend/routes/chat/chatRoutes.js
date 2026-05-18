const express = require('express');
const { body } = require('express-validator');
const { sendMessage, getConversation, getConversations, markAsRead } = require('../../controllers/chat/chatController');
const auth = require('../../middleware/auth');
const moderateContent = require('../../middleware/moderation');

const router = express.Router();

// Send message
router.post('/send', auth, moderateContent, [
  body('receiverId').notEmpty().withMessage('Receiver ID is required'),
  body('message').notEmpty().withMessage('Message is required')
], sendMessage);

// Get conversation
router.get('/conversation/:userId', auth, getConversation);

// Get all conversations
router.get('/conversations', auth, getConversations);

// Mark as read
router.put('/read/:userId', auth, markAsRead);

// Discovery / Suggested Users
router.get('/discovery', auth, require('../../controllers/chat/chatController').getDiscoveryUsers);

module.exports = router;