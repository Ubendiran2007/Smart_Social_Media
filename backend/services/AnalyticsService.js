const Post = require('../models/Post');
const User = require('../models/User');

/**
 * Analytics Service
 * Provides insights into user engagement, growth, and sentiment trends.
 */
class AnalyticsService {
  async getUserInsights(userId) {
    const postStats = await Post.aggregate([
      { $match: { user: require('mongoose').Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalLikes: { $sum: { $size: "$likes" } },
          totalComments: { $sum: { $size: "$comments" } },
          avgToxicity: { $avg: "$aiMetadata.toxicityScore" },
          moodDistribution: { $push: "$aiMetadata.moodCategory" }
        }
      }
    ]);

    const user = await User.findById(userId);
    const growth = {
      followers: user.followers.length,
      following: user.following.length,
      burnoutIndex: user.moodAnalytics?.burnoutIndex || 0
    };

    return {
      stats: postStats[0] || { totalLikes: 0, totalComments: 0, avgToxicity: 0, moodDistribution: [] },
      growth
    };
  }

  async getPlatformTrends() {
    return await Post.aggregate([
      {
        $group: {
          _id: "$aiMetadata.moodCategory",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
  }
}

module.exports = new AnalyticsService();
