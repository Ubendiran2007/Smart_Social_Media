const mongoose = require('mongoose');
const User    = require('../models/User');
const Post    = require('../models/Post');
const Reel    = require('../models/Reel');

/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  Sentient AI Recommendation & Personalization Engine
 *  ─────────────────────────────────────────────────────────────────────────────
 *  Signals used (in order of weight):
 *    1. Mood (current + weighted history)          → content emotion matching
 *    2. Behavior weights (liked content categories) → preference vector
 *    3. Liked hashtags                             → hashtag affinity
 *    4. Engaged creators                           → social graph boost
 *    5. Wellness (burnout score)                   → content type gating
 *    6. Recency                                    → freshness
 *    7. Engagement (likes + comments)              → social proof
 * ══════════════════════════════════════════════════════════════════════════════
 */
class RecommendationService {

  // ─── Mood → emotion category mapping ──────────────────────────────────────
  MOOD_CATEGORIES = {
    Productive:   ['Productive', 'Learning'],
    Learning:     ['Learning', 'Productive'],
    Motivational: ['Motivational', 'Productive'],
    Calm:         ['Calm'],
    Funny:        ['Funny', 'Calm'],
    None:         ['Productive', 'Learning', 'Motivational', 'Calm', 'Funny']
  };

  // ─── Wellness gate: high burnout → suppress entertainment ─────────────────
  _applyWellnessGate(moodCategories, burnoutIndex) {
    if (burnoutIndex >= 70) {
      // Strip entertainment, push wellness content
      return moodCategories.filter(m => ['Learning', 'Calm', 'Productive'].includes(m));
    }
    return moodCategories;
  }

  // ─── Build the score for a single post ────────────────────────────────────
  _buildPostScoreFields(user, mood, now) {
    const interests    = user?.interests || [];
    const likedHashtags = user?.behaviorProfile?.likedHashtags || [];
    const weights      = user?.behaviorProfile?.contentWeights || {};
    const moodCats     = this.MOOD_CATEGORIES[mood] || this.MOOD_CATEGORIES.None;
    const burnout      = user?.moodAnalytics?.burnoutIndex || 0;
    const allowedCats  = this._applyWellnessGate(moodCats, burnout);

    return [
      // Stage 1: score fields
      {
        $addFields: {
          interestScore: {
            $size: {
              $setIntersection: [
                { $ifNull: ['$aiMetadata.hashtags', []] },
                interests.length > 0 ? interests : ['__none__']
              ]
            }
          },
          hashtagAffinityScore: {
            $size: {
              $setIntersection: [
                { $ifNull: ['$aiMetadata.hashtags', []] },
                likedHashtags.length > 0 ? likedHashtags : ['__none__']
              ]
            }
          },
          moodMatchScore: {
            $cond: [
              { $in: ['$aiMetadata.emotionCategory', allowedCats] },
              // Primary mood gets highest score
              { $cond: [{ $eq: ['$aiMetadata.emotionCategory', allowedCats[0]] }, 80, 40] },
              0
            ]
          },
          timeDiff: { $subtract: [now, '$createdAt'] }
        }
      },
      // Stage 2: derived scores
      {
        $addFields: {
          recencyScore: {
            $divide: [1, { $add: ['$timeDiff', 1] }]
          },
          engagementScore: {
            $add: [
              { $multiply: [{ $size: { $ifNull: ['$likes', []] } }, 10] },
              { $size: { $ifNull: ['$comments', []] } }
            ]
          }
        }
      },
      // Stage 3: final composite score
      {
        $addFields: {
          finalScore: {
            $add: [
              { $multiply: ['$moodMatchScore', 1.5] },
              { $multiply: ['$interestScore', 60] },
              { $multiply: ['$hashtagAffinityScore', 80] },
              { $multiply: ['$recencyScore', 8_000_000_000] },
              '$engagementScore'
            ]
          }
        }
      }
    ];
  }

  // ─── Shared post aggregation pipeline ─────────────────────────────────────
  async _runPostAggregation(query, scoreStages, page, limit) {
    return Post.aggregate([
      { $match: query },
      ...scoreStages,
      { $sort: { finalScore: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { 'user.password': 0, 'user.email': 0, 'user.moodHistory': 0 } }
    ]);
  }

  /**
   * getRankedFeed
   * Personalized post feed — the main home-feed engine.
   */
  async getRankedFeed(userId, mood = 'None', page = 1, limit = 10, isFocusMode = false) {
    const user = await User.findById(userId);
    const followingIds = [
      ...(user?.following || []),
      new mongoose.Types.ObjectId(userId)
    ];

    let query = { user: { $in: followingIds } };

    // Sparse network fallback → global discovery
    const followCount = await Post.countDocuments(query);
    if (followCount < 5) query = {};

    // Focus mode → only productive/learning content
    if (isFocusMode) {
      query['aiMetadata.emotionCategory'] = { $in: ['Productive', 'Learning'] };
    }

    const now = new Date();
    const scoreStages = this._buildPostScoreFields(user, mood, now);
    let posts = await this._runPostAggregation(query, scoreStages, page, limit);

    // Mood fallback — never show empty feed
    if (posts.length === 0 && mood !== 'None') {
      const fallbackQuery = { ...query };
      delete fallbackQuery['aiMetadata.emotionCategory'];
      posts = await this._runPostAggregation(fallbackQuery, scoreStages, page, limit);
    }

    const totalPosts = await Post.countDocuments(query);
    return { posts, totalPosts, hasMore: page * limit < totalPosts };
  }

  /**
   * getForYouReels
   * Personalized reels based on watched mood history and behavior weights.
   */
  async getForYouReels(userId, currentMood = 'None', limit = 10, excludeIds = []) {
    const user = await User.findById(userId);
    const burnout = user?.moodAnalytics?.burnoutIndex || 0;
    const weights = user?.behaviorProfile?.contentWeights || {};
    const watchedMoods = user?.behaviorProfile?.watchedMoods || [];
    const moodCats = this.MOOD_CATEGORIES[currentMood] || this.MOOD_CATEGORIES.None;
    const allowedCats = this._applyWellnessGate(moodCats, burnout);

    // Build mood preference from watch history
    const moodFreq = {};
    watchedMoods.forEach(m => { moodFreq[m] = (moodFreq[m] || 0) + 1; });

    const query = {
      _id: { $nin: excludeIds.map(id => { try { return new mongoose.Types.ObjectId(id); } catch { return null; } }).filter(Boolean) }
    };

    // Prefer allowedCats but fall back gracefully
    const reels = await Reel.aggregate([
      { $match: query },
      {
        $addFields: {
          moodScore: {
            $cond: [
              { $in: ['$aiMetadata.emotionCategory', allowedCats] },
              { $cond: [{ $eq: ['$aiMetadata.emotionCategory', allowedCats[0]] }, 100, 60] },
              0
            ]
          },
          watchHistoryScore: {
            $cond: [
              { $in: ['$aiMetadata.emotionCategory', Object.keys(moodFreq)] },
              30,
              0
            ]
          },
          recencyScore: {
            $divide: [1, { $add: [{ $subtract: [new Date(), '$createdAt'] }, 1] }]
          },
          engagementScore: {
            $add: [
              { $multiply: [{ $size: { $ifNull: ['$likes', []] } }, 5] },
              '$views'
            ]
          }
        }
      },
      {
        $addFields: {
          finalScore: {
            $add: ['$moodScore', '$watchHistoryScore', { $multiply: ['$recencyScore', 5_000_000_000] }, '$engagementScore']
          }
        }
      },
      { $sort: { finalScore: -1 } },
      { $limit: limit },
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { 'user.password': 0, 'user.email': 0 } }
    ]);

    return { reels, hasMore: reels.length === limit };
  }

  /**
   * getCreatorRecommendations
   * Suggest creators based on skill overlap, mood, and engagement network.
   */
  async getCreatorRecommendations(userId, mood = 'None', limit = 6) {
    const user = await User.findById(userId);
    const alreadyFollowing = [...(user?.following || []), new mongoose.Types.ObjectId(userId)];
    const skills = user?.professionalProfile?.skills || [];
    const engagedCreators = user?.behaviorProfile?.engagedCreators || [];

    // Mood → creator type mapping
    const moodCreatorTypes = {
      Productive:   ['developer', 'startup', 'engineer', 'coder'],
      Learning:     ['educator', 'student', 'tutorial', 'teacher'],
      Motivational: ['founder', 'entrepreneur', 'coach', 'athlete'],
      Calm:         ['artist', 'designer', 'wellness', 'nature'],
      Funny:        ['comedian', 'content', 'entertainment'],
      None:         []
    };
    const preferredSkills = moodCreatorTypes[mood] || [];
    const combinedSkills  = [...skills, ...preferredSkills];

    const candidates = await User.find({
      _id: { $nin: alreadyFollowing },
      $or: [
        { 'professionalProfile.skills': { $in: combinedSkills.length ? combinedSkills : ['__none__'] } },
        { 'professionalProfile.techBadges': { $in: skills.length ? skills : ['__none__'] } },
        { _id: { $in: engagedCreators } }
      ]
    })
    .select('username fullName avatar professionalProfile interests moodAnalytics followers verified')
    .limit(limit * 2);

    // Score and sort
    const scored = candidates.map(c => {
      let score = 0;
      const cSkills = [...(c.professionalProfile?.skills || []), ...(c.professionalProfile?.techBadges || [])];
      score += cSkills.filter(s => combinedSkills.includes(s)).length * 20;
      score += (c.followers?.length || 0) * 0.1;
      if (c.verified) score += 30;
      if (engagedCreators.some(e => e.toString() === c._id.toString())) score += 50;
      return { ...c.toObject(), _score: score };
    });

    scored.sort((a, b) => b._score - a._score);
    return scored.slice(0, limit);
  }

  /**
   * getHashtagRecommendations
   * Return trending + personalized hashtags based on user's liked tags and mood.
   */
  async getHashtagRecommendations(userId, mood = 'None') {
    const user = await User.findById(userId);
    const likedHashtags = user?.behaviorProfile?.likedHashtags || [];

    const moodHashtags = {
      Productive:   ['#coding', '#startup', '#productivity', '#developer', '#buildinpublic'],
      Learning:     ['#learning', '#tutorial', '#education', '#study', '#growth'],
      Motivational: ['#motivation', '#success', '#discipline', '#fitness', '#mindset'],
      Calm:         ['#wellness', '#nature', '#mindfulness', '#peace', '#aesthetic'],
      Funny:        ['#memes', '#humor', '#relatable', '#comedy', '#lol'],
      None:         ['#sentient', '#creators', '#tech', '#ai', '#buildinpublic']
    };

    // Trending: aggregate most-used hashtags from recent posts
    const trendingAgg = await Post.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $unwind: '$aiMetadata.hashtags' },
      { $group: { _id: '$aiMetadata.hashtags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    const trending = trendingAgg.map(t => t._id);

    const moodTags = moodHashtags[mood] || moodHashtags.None;
    const personal = likedHashtags.slice(0, 5);

    // Deduplicated merge: personal → mood → trending
    const merged = [...new Set([...personal, ...moodTags, ...trending])].slice(0, 15);
    return { hashtags: merged, trending: trending.slice(0, 5) };
  }

  /**
   * getRoomRecommendations
   * Suggest rooms based on current mood, room history, and burnout.
   */
  getRoomRecommendations(mood = 'None', roomHistory = [], burnoutScore = 0) {
    const ALL_ROOMS = [
      { id: 'room-coding',   name: 'Coding Room',      icon: '💻', mood: 'Productive',   badge: 'Tech',      desc: 'Live coding, code snippets, GitHub' },
      { id: 'room-startup',  name: 'Startup Room',     icon: '🚀', mood: 'Motivational', badge: 'Business',  desc: 'Ideas, founders, pitching' },
      { id: 'room-study',    name: 'Study Room',       icon: '📚', mood: 'Learning',     badge: 'Edu',       desc: 'Goals, resources, progress' },
      { id: 'room-pomodoro', name: 'Focus Room',       icon: '⏳', mood: 'Productive',   badge: 'Focus',     desc: 'Synced global Pomodoro timer' },
      { id: 'room-ai',       name: 'AI Builder Room',  icon: '🤖', mood: 'Learning',     badge: 'AI',        desc: 'AI resources, prompt engineering' },
      { id: 'room-design',   name: 'Design Room',      icon: '🎨', mood: 'Calm',         badge: 'Creative',  desc: 'UI/UX critiques, inspiration' },
      { id: 'room-wellness', name: 'Wellness Lounge',  icon: '🌿', mood: 'Calm',         badge: 'Wellness',  desc: 'Mindfulness, digital balance' },
      { id: 'room-general',  name: 'General Lounge',   icon: '✨', mood: 'None',         badge: 'Social',    desc: 'Chill, talk about anything' }
    ];

    // High burnout → push wellness + focus rooms
    const effectiveMood = burnoutScore >= 70 ? 'Calm' : mood;

    const scored = ALL_ROOMS.map(room => {
      let score = 0;
      if (room.mood === effectiveMood) score += 100;
      if (room.mood === mood) score += 60;
      if (roomHistory.includes(room.id)) score += 40; // recently visited
      if (burnoutScore >= 70 && ['room-wellness', 'room-pomodoro'].includes(room.id)) score += 80;
      return { ...room, score, recommended: room.mood === effectiveMood };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored;
  }

  /**
   * recordBehavior — update the user's behavior profile after an action
   * action: { type: 'like'|'watch'|'search'|'room'|'comment', payload }
   */
  async recordBehavior(userId, action) {
    const update = {};

    switch (action.type) {
      case 'like':
        // Add hashtags from liked post
        if (action.hashtags?.length) {
          update['$addToSet'] = { 'behaviorProfile.likedHashtags': { $each: action.hashtags.slice(0, 5) } };
        }
        if (action.creatorId) {
          update['$addToSet'] = {
            ...(update['$addToSet'] || {}),
            'behaviorProfile.engagedCreators': action.creatorId
          };
        }
        if (action.mood) {
          const weightKey = `behaviorProfile.contentWeights.${action.mood}`;
          update['$inc'] = { [weightKey]: 1 };
        }
        break;

      case 'watch':
        if (action.mood) {
          update['$push'] = {
            'behaviorProfile.watchedMoods': {
              $each: [action.mood],
              $slice: -50 // keep last 50
            }
          };
          const weightKey = `behaviorProfile.contentWeights.${action.mood}`;
          update['$inc'] = { [weightKey]: 2 };
        }
        break;

      case 'search':
        if (action.query) {
          update['$push'] = {
            'behaviorProfile.searchHistory': {
              $each: [action.query],
              $slice: -20
            }
          };
        }
        break;

      case 'room':
        if (action.roomId) {
          update['$addToSet'] = { 'behaviorProfile.roomHistory': action.roomId };
        }
        break;

      case 'focus':
        if (action.state === 'started') {
          update['$inc'] = {
            'behaviorProfile.contentWeights.Productive': 3,
            'behaviorProfile.contentWeights.Learning': 3
          };
        }
        break;

      case 'comment':
        if (action.creatorId) {
          update['$addToSet'] = { 'behaviorProfile.engagedCreators': action.creatorId };
        }
        break;
    }

    if (Object.keys(update).length > 0) {
      await User.findByIdAndUpdate(userId, update, { new: false });
    }
  }
}

module.exports = new RecommendationService();
