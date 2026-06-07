const User = require('../models/User');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    console.log('Getting profile for user ID:', req.params.id);
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'username fullName avatar')
      .populate('following', 'username fullName avatar');

    if (!user) {
      console.log('User not found with ID:', req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Profile found:', user.username);
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Follow/Unfollow user
const toggleFollow = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(req.params.id);
      userToFollow.followers.pull(req.user.id);
    } else {
      // Follow
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.user.id);

      // Create notification
      const notification = await Notification.create({
        recipient: req.params.id,
        sender: req.user.id,
        type: 'follow',
        message: `${req.user.username} started following you`
      });

      await notification.populate('sender', 'username fullName avatar');
      req.io.to(req.params.id).emit('newNotification', notification);
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({ 
      success: true, 
      isFollowing: !isFollowing,
      followersCount: userToFollow.followers.length,
      followingCount: userToFollow.following.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { fullName, bio, username, email, skills, interests, experience, githubUrl } = req.body;
    const updateData = {};
    const errors = {};

    // Professional Profile fields
    if (skills !== undefined) {
      const skillsArray = typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(s => s) : skills;
      updateData['professionalProfile.skills'] = skillsArray;
    }

    if (interests !== undefined) {
      const interestsArray = typeof interests === 'string' ? interests.split(',').map(s => s.trim()).filter(s => s) : interests;
      updateData.interests = interestsArray;
    }

    if (experience !== undefined) {
      updateData['professionalProfile.experience'] = experience.trim();
    }

    if (githubUrl !== undefined) {
      updateData['professionalProfile.githubUrl'] = githubUrl.trim();
    }

    // Validate and update full name
    if (fullName !== undefined) {
      if (!fullName.trim()) {
        errors.fullName = 'Full name is required';
      } else if (fullName.trim().length < 2) {
        errors.fullName = 'Full name must be at least 2 characters';
      } else if (!/^[a-zA-Z\s]+$/.test(fullName.trim())) {
        errors.fullName = 'Full name can only contain letters and spaces';
      } else {
        updateData.fullName = fullName.trim();
      }
    }

    // Validate and update username
    if (username !== undefined) {
      if (!username.trim()) {
        errors.username = 'Username is required';
      } else if (username.trim().length < 3) {
        errors.username = 'Username must be at least 3 characters';
      } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
        errors.username = 'Username can only contain letters, numbers, and underscores';
      } else {
        // Check if username is already taken
        const existingUser = await User.findOne({ 
          username: username.trim(), 
          _id: { $ne: req.user.id } 
        });
        if (existingUser) {
          errors.username = 'Username already exists';
        } else {
          updateData.username = username.trim();
        }
      }
    }

    // Validate and update email
    if (email !== undefined) {
      if (!email.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.email = 'Please enter a valid email address';
      } else {
        // Check if email is already taken
        const existingUser = await User.findOne({ 
          email: email.trim(), 
          _id: { $ne: req.user.id } 
        });
        if (existingUser) {
          errors.email = 'Email already exists';
        } else {
          updateData.email = email.trim();
        }
      }
    }

    // Validate and update bio
    if (bio !== undefined) {
      if (bio.length > 150) {
        errors.bio = 'Bio must be less than 150 characters';
      } else {
        // AI Toxicity Check for Bio
        const AIService = require('../../services/AIService');
        const toxicityResult = await AIService.analyzeToxicity(bio);
        if (toxicityResult.isToxic) {
          errors.bio = 'Neural guard blocked this bio: potentially toxic content.';
        } else {
          updateData.bio = bio.trim();
        }
      }
    }

    // Return validation errors if any
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // Handle avatar upload
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'social_media/avatars',
          transformation: [
            { width: 400, height: 400, crop: 'fill' },
            { quality: 'auto' }
          ]
        });
        fs.unlinkSync(req.file.path);
        updateData.avatar = result.secure_url;
      } catch (uploadError) {
        console.error('Avatar upload error:', uploadError);
        return res.status(400).json({ message: 'Failed to upload avatar' });
      }
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Profile updated successfully for user:', user.email);
    res.json({ success: true, user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Advanced Intelligent Search & Discovery
const searchUsers = async (req, res) => {
  try {
    const q = req.query.q || req.query.query;
    const mood = req.query.mood;
    const currentUserId = req.user.id;
    const currentUser = await User.findById(currentUserId);
    
    console.log(`Backend: Search query: "${q || 'Discovery Mode'}", Mood: ${mood || 'None'}`);
    
    // CASE 1: Empty Query - Discovery Mode (Recommendations)
    if (!q) {
      // 1. Try to find neural matches (skills/interests/mood)
      let suggested = [];
      
      const neuralMatches = await User.find({
        _id: { $ne: currentUserId },
        $or: [
          { 'professionalProfile.skills': { $in: currentUser?.professionalProfile?.skills || [] } },
          { interests: { $in: currentUser?.interests || [] } },
          ...(mood && mood !== 'None' ? [{ 'moodAnalytics.currentMood': mood }] : [])
        ]
      })
      .select('username fullName avatar bio professionalProfile.skills verified followers interests moodAnalytics')
      .limit(6);

      suggested = neuralMatches;

      // 1.5. If mood specified, try to find top users in that mood
      if (mood && mood !== 'None' && suggested.length < 10) {
        const moodMatches = await User.find({
            _id: { $ne: currentUserId, $nin: suggested.map(u => u._id) },
            'moodAnalytics.currentMood': mood
        })
        .select('username fullName avatar bio professionalProfile.skills verified followers interests moodAnalytics')
        .limit(10 - suggested.length);
        
        suggested = [...suggested, ...moodMatches];
      }

      // 2. Global Fallback (Trending/Active)
      if (suggested.length < 10) {
        const fallback = await User.find({ 
          _id: { 
            $ne: currentUserId,
            $nin: suggested.map(u => u._id)
          } 
        })
        .select('username fullName avatar bio professionalProfile.skills verified followers interests moodAnalytics');
        
        // Sort by followers count descending in memory
        const sortedFallback = fallback.sort((a, b) => (b.followers?.length || 0) - (a.followers?.length || 0));
        
        suggested = [...suggested, ...sortedFallback].slice(0, 10);
      }

      // Map isFollowing
      const suggestionsWithStatus = suggested.map(u => {
        const uObj = u.toObject ? u.toObject() : u;
        return {
          ...uObj,
          isFollowing: currentUser?.following?.includes(u._id),
          followersCount: u.followers?.length || 0
        };
      });

      return res.json({ success: true, users: [], suggestions: suggestionsWithStatus, mode: 'Discovery' });
    }

    // CASE 2: Search Mode
    // Use prefix match first, then broader search
    const searchRegex = { $regex: `^${q}`, $options: 'i' };
    const broaderRegex = { $regex: q, $options: 'i' };
    
    const queryConds = [
        { username: searchRegex },
        { fullName: searchRegex }
    ];

    const matchQuery = {
      _id: { $ne: currentUserId },
      $or: queryConds
    };

    if (mood && mood !== 'None') {
       matchQuery['moodAnalytics.currentMood'] = mood;
    }

    let users = await User.find(matchQuery)
    .select('username fullName avatar bio professionalProfile.skills verified followers following moodAnalytics.currentMood')
    .limit(15);

    // If not enough prefix matches, fill with broader matches
    if (users.length < 10) {
      const broaderResults = await User.find({
        _id: { 
          $ne: currentUserId,
          $nin: users.map(u => u._id)
        },
        $or: [
          { username: broaderRegex },
          { fullName: broaderRegex },
          { 'professionalProfile.skills': broaderRegex },
          { interests: broaderRegex }
        ]
      })
      .select('username fullName avatar bio professionalProfile.skills verified followers following moodAnalytics.currentMood')
      .limit(15);
      
      users = [...users, ...broaderResults].slice(0, 20);
    }

    // Map follow status for the current user
    const results = users.map(user => ({
      ...user.toObject(),
      isFollowing: currentUser?.following?.includes(user._id),
      followersCount: user.followers?.length || 0
    }));

    console.log(`Backend: Found ${results.length} search results`);
    res.json({ success: true, users: results, mode: 'Search' });
  } catch (error) {
    console.error('Neural Search Error:', error);
    res.status(500).json({ message: 'Neural connection failed', error: error.message });
  }
};

// Update user mood
const updateMood = async (req, res) => {
  try {
    const { mood } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.moodAnalytics) {
      user.moodAnalytics = { currentMood: 'None', burnoutIndex: 0 };
    }

    user.moodAnalytics.currentMood = mood;
    await user.save();

    console.log(`Neural Sync: User ${user.username} shifted to ${mood}`);
    res.json({ success: true, mood: user.moodAnalytics.currentMood });
  } catch (error) {
    console.error('Mood update error:', error);
    res.status(500).json({ message: 'Sync failed', error: error.message });
  }
};

module.exports = { getUserProfile, toggleFollow, updateProfile, searchUsers, updateMood };