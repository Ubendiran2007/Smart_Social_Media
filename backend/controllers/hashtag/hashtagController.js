const HashtagIntelligenceService = require('../../services/HashtagIntelligenceService');

/**
 * POST /api/hashtags/suggest
 * Real-time hashtag suggestions while user is typing a caption.
 * Body: { caption: string, mood?: string }
 */
const suggestHashtags = async (req, res) => {
  try {
    const { caption = '', mood = 'None' } = req.body;
    const hashtags = await HashtagIntelligenceService.suggestHashtags(caption, mood);
    res.json({ success: true, hashtags });
  } catch (error) {
    console.error('Hashtag suggest error:', error.message);
    res.status(500).json({ message: 'Hashtag suggestion failed', error: error.message });
  }
};

/**
 * GET /api/hashtags/trending?mood=Productive&limit=15
 * Returns trending hashtags aggregated from actual DB usage.
 */
const getTrending = async (req, res) => {
  try {
    const { mood = 'None', limit = 15 } = req.query;
    const trending = await HashtagIntelligenceService.getTrendingHashtags(mood, parseInt(limit));
    res.json({ success: true, trending });
  } catch (error) {
    console.error('Trending hashtags error:', error.message);
    res.status(500).json({ message: 'Failed to fetch trending hashtags', error: error.message });
  }
};

/**
 * GET /api/hashtags/feed/:tag?page=1&limit=20
 * Returns all content tagged with a given hashtag (posts, reels, stories).
 */
const getHashtagFeed = async (req, res) => {
  try {
    const { tag } = req.params;
    const { page = 1, limit = 20 } = req.query;
    if (!tag) return res.status(400).json({ message: 'Tag is required' });

    const data = await HashtagIntelligenceService.getHashtagFeed(tag, parseInt(page), parseInt(limit));
    res.json({ success: true, tag: `#${tag.replace('#', '')}`, ...data });
  } catch (error) {
    console.error('Hashtag feed error:', error.message);
    res.status(500).json({ message: 'Failed to load hashtag feed', error: error.message });
  }
};

/**
 * GET /api/hashtags/autocomplete?q=mer&mood=None
 * Returns hashtag completions for typed partial text (e.g. "#mer" → "#MERN", "#Merch")
 */
const autocompleteHashtag = async (req, res) => {
  try {
    const { q = '', mood = 'None' } = req.query;
    const suggestions = await HashtagIntelligenceService.autocomplete(q, mood);
    res.json({ success: true, suggestions });
  } catch (error) {
    console.error('Hashtag autocomplete error:', error.message);
    res.status(500).json({ message: 'Autocomplete failed', error: error.message });
  }
};

/**
 * POST /api/hashtags/analyze
 * Full caption analysis: returns hashtags + keywords + emotionCategory.
 * Used when a post/reel/story is finalized before submitting.
 */
const analyzeCaption = async (req, res) => {
  try {
    const { caption = '', mood = 'None' } = req.body;
    const result = HashtagIntelligenceService.analyzeCaption(caption, mood !== 'None' ? mood : null);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Caption analyze error:', error.message);
    res.status(500).json({ message: 'Caption analysis failed', error: error.message });
  }
};

module.exports = { suggestHashtags, getTrending, getHashtagFeed, autocompleteHashtag, analyzeCaption };
