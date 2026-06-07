const Post = require('../../models/Post');
const User = require('../../models/User');
const Notification = require('../../models/Notification');
const cloudinary = require('../../config/cloudinary');
const HashtagIntelligenceService = require('../../services/HashtagIntelligenceService');
const fs = require('fs');

// Create post with Real Hashtag Intelligence
const createPost = async (req, res) => {
  try {
    const { caption } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // NLP-based analysis — derives hashtags, keywords, and mood from actual caption text
    const AIService = require('../../services/AIService');
    const [moodAnalysis, toxicity, nlpAnalysis] = await Promise.all([
      AIService.analyzeMood(caption || ''),
      AIService.analyzeToxicity(caption || ''),
      Promise.resolve(HashtagIntelligenceService.analyzeCaption(caption || ''))
    ]);

    // Merge mood from both analyzers — prefer nlpAnalysis when they agree
    const finalMood = nlpAnalysis.emotionCategory !== 'None' 
      ? nlpAnalysis.emotionCategory 
      : moodAnalysis.mood;

    // Upload to Cloudinary
    let imageUrl = '';
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'social_media/posts',
      });
      imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return res.status(500).json({ message: 'Failed to upload image to cloud' });
    }

    const post = await Post.create({
      user: req.user.id,
      caption: caption || '',
      image: imageUrl,
      aiMetadata: {
        sentiment: moodAnalysis.sentiment || 'Neutral',
        toxicityScore: toxicity.score,
        hashtags: nlpAnalysis.hashtags,      // Real NLP-extracted hashtags
        keywords: nlpAnalysis.keywords,      // Real NLP-extracted keywords
        emotionCategory: finalMood           // Real mood detection
      }
    });

    await post.populate('user', 'username fullName avatar');
    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Get feed posts with AI Mood Filtering & Smart Ranking
const getFeedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const moodFilter = req.query.mood;
    const isProductivity = req.query.isProductivity === 'true';

    const RecommendationService = require('../../services/RecommendationService');
    const { posts, totalPosts, hasMore } = await RecommendationService.getRankedFeed(
      req.user.id,
      moodFilter,
      page,
      limit,
      isProductivity
    );

    res.json({ 
      success: true, 
      posts, 
      page, 
      totalPages: Math.ceil(totalPosts / limit),
      hasMore
    });
  } catch (error) {
    res.status(500).json({ message: 'Smart ranking failed', error: error.message });
  }
};



// Like/Unlike post
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.findIndex(like => like.user.toString() === req.user.id);

    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push({ user: req.user.id });
      
      // Create notification
      if (post.user.toString() !== req.user.id) {
        const notification = await Notification.create({
          recipient: post.user,
          sender: req.user.id,
          type: 'like',
          message: `${req.user.username} liked your post`,
          postId: post._id
        });
        
        await notification.populate('sender', 'username fullName avatar');
        req.io.to(post.user.toString()).emit('newNotification', notification);
      }
    }

    await post.save();
    await post.populate('likes.user', 'username fullName avatar');

    res.json({ success: true, likes: post.likes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add comment
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
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

    post.comments.push(comment);
    await post.save();
    await post.populate('comments.user', 'username fullName avatar');

    // Create notification
    if (post.user.toString() !== req.user.id) {
      const notification = await Notification.create({
        recipient: post.user,
        sender: req.user.id,
        type: 'comment',
        message: `${req.user.username} commented on your post`,
        postId: post._id
      });

      await notification.populate('sender', 'username fullName avatar');
      req.io.to(post.user.toString()).emit('newNotification', notification);
    }

    res.json({ success: true, comments: post.comments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user posts
const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate('user', 'username fullName avatar')
      .populate('likes.user', 'username fullName avatar')
      .populate('comments.user', 'username fullName avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createPost, getFeedPosts, getUserPosts, toggleLike, addComment, deletePost };