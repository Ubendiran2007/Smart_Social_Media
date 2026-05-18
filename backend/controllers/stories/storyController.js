const Story = require('../../models/Story');
const User = require('../../models/User');
const cloudinary = require('../../config/cloudinary');
const fs = require('fs');

// Create story
const createStory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Media file is required' });
    }

    const mediaType = req.file.mimetype.startsWith('image') ? 'image' : 'video';
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `social_media/stories`,
      resource_type: mediaType === 'video' ? 'video' : 'image'
    });

    // Delete local file
    fs.unlinkSync(req.file.path);

    // AI Analysis (Stories usually have subtle moods)
    const AIService = require('../../services/AIService');
    const moodAnalysis = await AIService.analyzeMood(req.body.caption || 'None');
    const suggestions = await AIService.generateCaptionSuggestions(moodAnalysis.mood === 'None' ? 'Productive' : moodAnalysis.mood);

    const story = await Story.create({
      user: req.user.id,
      media: result.secure_url,
      mediaType,
      aiMetadata: {
        hashtags: suggestions.hashtags,
        keywords: suggestions.keywords,
        emotionCategory: moodAnalysis.mood
      }
    });

    await story.populate('user', 'username fullName avatar');

    res.status(201).json({ success: true, story });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get stories from following users
const getStories = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const followingIds = [...(user?.following || []), req.user.id];

    let query = { 
      user: { $in: followingIds },
      expiresAt: { $gt: new Date() }
    };

    // Fallback to global discovery if following list is small
    const count = await Story.countDocuments(query);
    if (count < 3) {
      query = { expiresAt: { $gt: new Date() } };
    }

    const mood = req.query.mood;
    if (mood && mood !== 'None') {
      query['aiMetadata.emotionCategory'] = mood;
    }

    const stories = await Story.find(query)
    .populate('user', 'username fullName avatar')
    .populate('views.user', 'username fullName avatar')
    console.log(`Backend: Found ${stories.length} stories for query:`, query);

    // Group stories by user safely
    const groupedStories = stories.reduce((acc, story) => {
      if (!story.user) return acc;
      const userId = story.user._id.toString();
      if (!acc[userId]) {
        acc[userId] = {
          user: story.user,
          stories: []
        };
      }
      acc[userId].stories.push(story);
      return acc;
    }, {});

    const finalResult = Object.values(groupedStories);
    console.log(`Backend: Grouped into ${finalResult.length} user story channels`);

    res.json({ success: true, stories: finalResult });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// View story
const viewStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Check if user already viewed
    const hasViewed = story.views.some(view => view.user.toString() === req.user.id);
    
    if (!hasViewed) {
      story.views.push({ user: req.user.id });
      await story.save();
    }

    await story.populate('views.user', 'username fullName avatar');

    res.json({ success: true, views: story.views });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete story
const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (story.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Story.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createStory, getStories, viewStory, deleteStory };