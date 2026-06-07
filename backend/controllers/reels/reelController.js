const Reel = require('../../models/Reel');
const Notification = require('../../models/Notification');
const cloudinary = require('../../config/cloudinary');
const fs = require('fs');

// Create reel
const createReel = async (req, res) => {
  try {
    console.log('Creating reel - body:', req.body);
    console.log('Creating reel - file:', req.file);
    console.log('Creating reel - user:', req.user?.id);
    
    const { caption } = req.body;
    
    if (!req.file) {
      console.log('No video file provided');
      return res.status(400).json({ message: 'Video is required' });
    }

    if (!req.user || !req.user.id) {
      console.log('No user found in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Upload to Cloudinary
    let videoUrl = '';
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'video',
        folder: 'social_media/reels',
      });
      videoUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    } catch (uploadError) {
      console.error('Cloudinary video upload error:', uploadError);
      return res.status(500).json({ message: 'Failed to upload video to cloud' });
    }
    
    // AI Analysis
    const AIService = require('../../services/AIService');
    const moodAnalysis = await AIService.analyzeMood(caption || '');
    const suggestions = await AIService.generateCaptionSuggestions(moodAnalysis.mood);
    
    console.log('Video URL:', videoUrl);

    const reel = await Reel.create({
      user: req.user.id,
      video: videoUrl,
      caption: caption || '',
      aiMetadata: {
        hashtags: suggestions.hashtags,
        keywords: suggestions.keywords,
        emotionCategory: moodAnalysis.mood
      }
    });

    await reel.populate('user', 'username fullName avatar');
    console.log('Reel created successfully:', reel._id);

    res.status(201).json({ success: true, reel });
  } catch (error) {
    console.error('Error creating reel:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get reels with smart feed logic
const getReels = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const moodFilter = req.query.mood;
    const viewedIds = req.query.viewed ? req.query.viewed.split(',') : [];

    console.log(`Backend: Fetching reels - Limit: ${limit}, Mood: ${moodFilter}, Viewed: ${viewedIds.length}`);

    let query = { video: { $exists: true, $ne: null } };
    if (moodFilter && moodFilter !== 'None' && moodFilter !== 'GENERAL') {
      query.mood = moodFilter.toUpperCase();
    }

    // Attempt 1: Fetch unseen reels matching mood
    let reels = await Reel.find({ ...query, _id: { $nin: viewedIds } })
      .populate('user', 'username fullName avatar')
      .populate('likes.user', 'username fullName avatar')
      .populate('comments.user', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Fallback 1: If absolutely no reels exist for this mood (even seen ones), fallback to General
    if (reels.length === 0 && viewedIds.length === 0 && moodFilter && moodFilter !== 'None') {
      const moodCount = await Reel.countDocuments(query);
      if (moodCount === 0) {
        console.log(`No reels found for ${moodFilter}. Falling back to general pool.`);
        query = { video: { $exists: true, $ne: null } }; // General pool
        reels = await Reel.find({ _id: { $nin: viewedIds } })
          .populate('user', 'username fullName avatar')
          .populate('likes.user', 'username fullName avatar')
          .populate('comments.user', 'username fullName avatar')
          .sort({ createdAt: -1 })
          .limit(limit);
      }
    }

    // Fallback 2: If user has seen all matching reels, shuffle and repeat!
    if (reels.length === 0 && viewedIds.length > 0) {
      console.log(`All reels viewed for query. Shuffling!`);
      // Ignore viewedIds and just sample randomly
      let sampleQuery = Object.keys(query).length > 0 ? query : {};
      
      reels = await Reel.aggregate([
        { $match: sampleQuery },
        { $sample: { size: limit } }
      ]);
      
      // If still empty (e.g. mood filter exists but 0 matches), drop filter and sample
      if (reels.length === 0) {
        reels = await Reel.aggregate([{ $sample: { size: limit } }]);
      }

      reels = await Reel.populate(reels, [
        { path: 'user', select: 'username fullName avatar' },
        { path: 'likes.user', select: 'username fullName avatar' },
        { path: 'comments.user', select: 'username fullName avatar' }
      ]);
    }

    // Log the first reel URL explicitly as requested for Network Validation debugging
    if (reels.length > 0) {
      console.log(`First reel URL being returned: ${reels[0].video}`);
    }
    console.log("Reels Returned:", reels.length);

    res.json({ 
      success: true, 
      reels, 
      hasMore: true // Endless feed
    });
  } catch (error) {
    console.error('getReels Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Like/Unlike reel
const toggleLike = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    const likeIndex = reel.likes.findIndex(like => like.user.toString() === req.user.id);

    if (likeIndex > -1) {
      reel.likes.splice(likeIndex, 1);
    } else {
      reel.likes.push({ user: req.user.id });
      
      // Create notification
      if (reel.user.toString() !== req.user.id) {
        const notification = await Notification.create({
          recipient: reel.user,
          sender: req.user.id,
          type: 'like',
          message: `${req.user.username} liked your reel`,
          reelId: reel._id
        });

        await notification.populate('sender', 'username fullName avatar');
        req.io.to(reel.user.toString()).emit('newNotification', notification);
      }
    }

    await reel.save();
    await reel.populate('likes.user', 'username fullName avatar');

    res.json({ success: true, likes: reel.likes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add comment to reel
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const reel = await Reel.findById(req.params.id);
    
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    // AI Toxicity Check
    const AIService = require('../../services/AIService');
    const toxicityResult = await AIService.analyzeToxicity(text);

    if (toxicityResult.isToxic) {
      return res.status(403).json({ 
        success: false, 
        isToxic: true,
        type: 'MODERATION_BLOCK',
        message: toxicityResult.recommendation,
        toxicityScore: toxicityResult.score,
        suggestions: toxicityResult.suggestions,
        violations: toxicityResult.violations
      });
    }

    const comment = {
      user: req.user.id,
      text,
      moderation: {
        toxicityScore: toxicityResult.score,
        violations: toxicityResult.violations
      }
    };

    reel.comments.push(comment);
    await reel.save();
    await reel.populate('comments.user', 'username fullName avatar');

    // Create notification
    if (reel.user.toString() !== req.user.id) {
      const notification = await Notification.create({
        recipient: reel.user,
        sender: req.user.id,
        type: 'comment',
        message: `${req.user.username} commented on your reel`,
        reelId: reel._id
      });

      await notification.populate('sender', 'username fullName avatar');
      req.io.to(reel.user.toString()).emit('newNotification', notification);
    }

    res.json({ success: true, comments: reel.comments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Increment view count
const incrementView = async (req, res) => {
  try {
    const reel = await Reel.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    res.json({ success: true, views: reel.views });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createReel, getReels, toggleLike, addComment, incrementView };