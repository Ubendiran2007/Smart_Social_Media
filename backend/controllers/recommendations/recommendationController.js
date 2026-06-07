const RecommendationService = require('../../services/RecommendationService');
const User = require('../../models/User');

/**
 * GET /api/recommendations/feed
 * Personalized ranked post feed.
 */
const getPersonalizedFeed = async (req, res) => {
  try {
    const { mood = 'None', page = 1, limit = 10, focusMode = false } = req.query;
    const result = await RecommendationService.getRankedFeed(
      req.user._id,
      mood,
      parseInt(page),
      parseInt(limit),
      focusMode === 'true'
    );
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Rec: feed error', err);
    res.status(500).json({ message: 'Feed recommendation failed', error: err.message });
  }
};

/**
 * GET /api/recommendations/reels
 * Personalized reels queue.
 */
const getPersonalizedReels = async (req, res) => {
  try {
    const { mood = 'None', limit = 10, excludeIds = '' } = req.query;
    const exclude = excludeIds ? excludeIds.split(',') : [];
    const result = await RecommendationService.getForYouReels(
      req.user._id,
      mood,
      parseInt(limit),
      exclude
    );
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Rec: reels error', err);
    res.status(500).json({ message: 'Reel recommendation failed', error: err.message });
  }
};

/**
 * GET /api/recommendations/creators
 * Personalized creator suggestions.
 */
const getCreatorRecommendations = async (req, res) => {
  try {
    const { mood = 'None', limit = 6 } = req.query;
    const creators = await RecommendationService.getCreatorRecommendations(
      req.user._id,
      mood,
      parseInt(limit)
    );
    res.json({ success: true, creators });
  } catch (err) {
    console.error('Rec: creators error', err);
    res.status(500).json({ message: 'Creator recommendation failed', error: err.message });
  }
};

/**
 * GET /api/recommendations/hashtags
 * Personalized + trending hashtags.
 */
const getHashtagRecommendations = async (req, res) => {
  try {
    const { mood = 'None' } = req.query;
    const result = await RecommendationService.getHashtagRecommendations(req.user._id, mood);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Rec: hashtag error', err);
    res.status(500).json({ message: 'Hashtag recommendation failed', error: err.message });
  }
};

/**
 * GET /api/recommendations/rooms
 * Mood-aware room recommendations.
 */
const getRoomRecommendations = async (req, res) => {
  try {
    const { mood = 'None' } = req.query;
    const user = await User.findById(req.user._id).select('behaviorProfile moodAnalytics');
    const roomHistory = user?.behaviorProfile?.roomHistory || [];
    const burnoutScore = user?.moodAnalytics?.burnoutIndex || 0;

    const rooms = RecommendationService.getRoomRecommendations(mood, roomHistory, burnoutScore);
    res.json({ success: true, rooms });
  } catch (err) {
    console.error('Rec: rooms error', err);
    res.status(500).json({ message: 'Room recommendation failed', error: err.message });
  }
};

/**
 * POST /api/recommendations/behavior
 * Record a user behavior event to update their profile.
 * Body: { type: 'like'|'watch'|'search'|'room'|'comment', ...payload }
 */
const recordBehavior = async (req, res) => {
  try {
    const { type, ...payload } = req.body;
    if (!type) return res.status(400).json({ message: 'Behavior type is required' });
    await RecommendationService.recordBehavior(req.user._id, { type, ...payload });
    res.json({ success: true });
  } catch (err) {
    console.error('Rec: behavior error', err);
    res.status(500).json({ message: 'Behavior recording failed', error: err.message });
  }
};

/**
 * GET /api/recommendations/for-you
 * Aggregated "For You" panel: creators + hashtags + rooms in one call.
 */
const getForYouPanel = async (req, res) => {
  try {
    const { mood = 'None' } = req.query;
    const user = await User.findById(req.user._id).select('behaviorProfile moodAnalytics');
    const burnoutScore = user?.moodAnalytics?.burnoutIndex || 0;
    const roomHistory  = user?.behaviorProfile?.roomHistory || [];

    const [creators, hashtagsData, rooms] = await Promise.all([
      RecommendationService.getCreatorRecommendations(req.user._id, mood, 4),
      RecommendationService.getHashtagRecommendations(req.user._id, mood),
      Promise.resolve(RecommendationService.getRoomRecommendations(mood, roomHistory, burnoutScore))
    ]);

    // Build "AI Discovery" label reasons
    const reasons = {
      Productive:   'Because you\'re in Productive mode',
      Learning:     'Because you love learning',
      Motivational: 'To fuel your motivation',
      Calm:         'For a calmer experience',
      Funny:        'Because you need a laugh',
      None:         'Trending on Sentient'
    };

    res.json({
      success: true,
      reason: reasons[mood] || reasons.None,
      creators: creators.slice(0, 4),
      hashtags: hashtagsData.hashtags.slice(0, 8),
      trendingHashtags: hashtagsData.trending,
      rooms: rooms.slice(0, 3),
      recommendedRoom: rooms[0] || null
    });
  } catch (err) {
    console.error('Rec: for-you error', err);
    res.status(500).json({ message: 'For You panel failed', error: err.message });
  }
};

module.exports = {
  getPersonalizedFeed,
  getPersonalizedReels,
  getCreatorRecommendations,
  getHashtagRecommendations,
  getRoomRecommendations,
  recordBehavior,
  getForYouPanel
};
