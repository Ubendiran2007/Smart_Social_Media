const express = require('express');
const { getUserProfile, toggleFollow, updateProfile, searchUsers, updateMood } = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Search users
router.get('/search', auth, searchUsers);

// Update mood
router.put('/update-mood', auth, updateMood);

// Get user profile
router.get('/:id', auth, getUserProfile);

// Follow/Unfollow user
router.put('/:id/follow', auth, toggleFollow);

// Update profile
router.put('/profile', auth, upload.single('avatar'), updateProfile);

// Sync wellness metrics
router.put('/wellness/sync', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const WellnessService = require('../services/WellnessService');
    const { sessionTime, reelsWatched } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const result = await WellnessService.updateActivityMetrics(user, sessionTime, reelsWatched);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ message: 'Wellness sync failed', error: error.message });
  }
});

module.exports = router;