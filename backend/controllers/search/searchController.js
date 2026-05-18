const Post = require('../../models/Post');
const Reel = require('../../models/Reel');
const Story = require('../../models/Story');
const User = require('../../models/User');

/**
 * Global Intelligent Search
 * Searches across posts, reels, stories, and users using AI metadata.
 */
const globalSearch = async (req, res) => {
  try {
    const { q, mood } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const regex = new RegExp(q, 'i');
    
    // Base queries
    let postQuery = {
      $or: [
        { caption: regex },
        { 'aiMetadata.hashtags': { $in: [regex] } },
        { 'aiMetadata.keywords': { $in: [regex] } }
      ]
    };
    let reelQuery = {
      $or: [
        { caption: regex },
        { 'aiMetadata.hashtags': { $in: [regex] } },
        { 'aiMetadata.keywords': { $in: [regex] } }
      ]
    };
    let storyQuery = {
      $or: [
        { 'aiMetadata.hashtags': { $in: [regex] } },
        { 'aiMetadata.keywords': { $in: [regex] } }
      ],
      expiresAt: { $gt: new Date() }
    };

    // Apply Mood Prioritization if selected
    if (mood && mood !== 'None') {
      postQuery['aiMetadata.emotionCategory'] = mood;
      reelQuery['aiMetadata.emotionCategory'] = mood;
      storyQuery['aiMetadata.emotionCategory'] = mood;
    }

    // Perform parallel searches for performance
    const [posts, reels, stories, users] = await Promise.all([
      Post.find(postQuery).populate('user', 'username fullName avatar').limit(15).sort({ createdAt: -1 }),
      Reel.find(reelQuery).populate('user', 'username fullName avatar').limit(15).sort({ createdAt: -1 }),
      Story.find(storyQuery).populate('user', 'username fullName avatar').limit(15),
      User.find({
        $or: [
          { username: regex },
          { fullName: regex },
          { bio: regex },
          { 'professionalProfile.skills': { $in: [regex] } },
          { interests: { $in: [regex] } }
        ]
      })
      .select('username fullName avatar bio followers verified moodAnalytics')
      .limit(10)
    ]);

    res.json({
      success: true,
      results: { posts, reels, stories, users }
    });
  } catch (error) {
    res.status(500).json({ message: 'Global search failed', error: error.message });
  }
};

const getTrendingHashtags = async (req, res) => {
  try {
    const { mood } = req.query;
    let query = { 'aiMetadata.hashtags': { $exists: true, $ne: [] } };
    
    if (mood && mood !== 'None') {
      query['aiMetadata.emotionCategory'] = mood;
    }

    const posts = await Post.find(query)
      .select('aiMetadata.hashtags')
      .limit(100);

    const hashtagCounts = {};
    posts.forEach(post => {
      post.aiMetadata.hashtags.forEach(tag => {
        hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
      });
    });

    const trending = Object.entries(hashtagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({ success: true, trending });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch trending hashtags', error: error.message });
  }
};

module.exports = { globalSearch, getTrendingHashtags };
