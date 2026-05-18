const express = require('express');
const { getNotifications, markAsRead, markAllAsRead, deleteNotification } = require('../../controllers/notifications/notificationController');
const auth = require('../../middleware/auth');

const router = express.Router();

// Get notifications
router.get('/', auth, getNotifications);

// Mark as read
router.put('/:id/read', auth, markAsRead);

// Mark all as read
router.put('/read-all', auth, markAllAsRead);

// Delete notification
router.delete('/:id', auth, deleteNotification);

module.exports = router;