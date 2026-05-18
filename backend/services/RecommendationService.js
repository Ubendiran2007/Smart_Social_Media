const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const AIService = require('./AIService');

/**
 * Recommendation Service
 * Handles smart feed ranking and user discovery based on interests and mood.
 */
class RecommendationService {
  /**
   * Generates a ranked feed for a user.
   * Priority: Interests -> Mood Matching -> Engagement -> Recency
   */
  async getRankedFeed(userId, moodFilter = 'None', page = 1, limit = 10, isProductivity = false) {
    const user = await User.findById(userId);
    const followingIds = [
      ...(user?.following || []), 
      new mongoose.Types.ObjectId(userId)
    ];
    const interests = user?.interests || [];

    let query = { user: { $in: followingIds } };
    
    // If user is new and not following anyone, or to ensure demo richness, 
    // we can fallback to global posts if following feed is small.
    try {
      const followingCount = await Post.countDocuments(query);
      console.log(`Recommendation: Following feed count for ${userId}: ${followingCount}`);
      
      if (followingCount < 5) {
        console.log('Recommendation: Low feed density, falling back to global discovery...');
        query = {}; // Global Feed Fallback
      }
    } catch (e) {
      console.error('Recommendation: Fallback error', e);
      query = {};
    }

    if (isProductivity) {
      query['aiMetadata.emotionCategory'] = { $in: ['Productive', 'Learning'] };
    } else if (moodFilter && moodFilter !== 'None') {
      query['aiMetadata.emotionCategory'] = moodFilter;
    }

    console.log('Recommendation: Final Query:', JSON.stringify(query));

    const now = new Date();

    // Advanced Ranking Aggregation
    const posts = await Post.aggregate([
      { $match: query },
      {
        $addFields: {
          interestScore: {
            $size: { 
              $setIntersection: [
                { $ifNull: ["$aiMetadata.hashtags", []] }, 
                interests.length > 0 ? interests : ["__placeholder__"]
              ] 
            }
          },
          timeDiff: { $subtract: [now, "$createdAt"] }
        }
      },
      {
        $addFields: {
          recencyScore: {
            $divide: [1, { $add: ["$timeDiff", 1] }]
          }
        }
      },
      {
        $addFields: {
          finalScore: {
            $add: [
              { $multiply: ["$interestScore", 100] },
              { $multiply: ["$recencyScore", 10000000000] },
              { $multiply: [{ $size: { $ifNull: ["$likes", []] } }, 10] },
              { $size: { $ifNull: ["$comments", []] } }
            ]
          }
        }
      },
      { $sort: { finalScore: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          'user.password': 0,
          'user.email': 0,
          'user.moodHistory': 0
        }
      }
    ]);

    const totalPosts = await Post.countDocuments(query);
    console.log(`Recommendation: Aggregation complete. Found ${posts.length} posts out of ${totalPosts} total matches.`);

    return {
      posts,
      totalPosts,
      hasMore: (page * limit) < totalPosts
    };
  }

  /**
   * Suggests users to follow based on skill matching.
   */
  async suggestConnections(userId) {
    const user = await User.findById(userId);
    const skills = user.professionalProfile?.skills || [];

    return await User.find({
      _id: { $ne: userId, $nin: user.following },
      'professionalProfile.skills': { $in: skills }
    })
    .limit(5)
    .select('username fullName avatar professionalProfile.skills');
  }
}

module.exports = new RecommendationService();
