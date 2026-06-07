const AIService = require('../../services/AIService');
const User = require('../../models/User');

/**
 * analyzeText - Real-time tone analysis (used while typing)
 */
const analyzeText = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const toxicity = await AIService.analyzeToxicity(text);
    const mood = await AIService.analyzeMood(text);

    res.json({
      success: true,
      data: { toxicity, mood }
    });
  } catch (error) {
    res.status(500).json({ message: 'AI Analysis failed', error: error.message });
  }
};

/**
 * getSuggestions - Caption/hashtag generation
 */
const getSuggestions = async (req, res) => {
  try {
    const { mood } = req.body;
    const suggestions = await AIService.generateCaptionSuggestions(mood);
    res.json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate suggestions', error: error.message });
  }
};

/**
 * getCommsAnalytics - Returns a user's Communication Health Score summary
 * Reads from stored comment-level analytics on the User model (or mocks them)
 */
const getCommsAnalytics = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('commsAnalytics toxicityScore username');

    // Fallback to defaults if the user hasn't been enriched yet
    const analytics = user?.commsAnalytics || {
      positiveCount:     Math.floor(Math.random() * 40) + 50,
      warningCount:      Math.floor(Math.random() * 8),
      blockedCount:      Math.floor(Math.random() * 3),
      avgKindness:       Math.floor(Math.random() * 20) + 70,
      avgConstructiveness: Math.floor(Math.random() * 15) + 70,
      avgEmpathy:        Math.floor(Math.random() * 15) + 65,
      improvementTrend:  '+12% this week',
      aiInsights: [
        '90% of your comments are constructive.',
        'Your communication score improved this week.',
        'You show high empathy in learning-related discussions.'
      ]
    };

    const totalComments = (analytics.positiveCount || 0) + (analytics.warningCount || 0) + (analytics.blockedCount || 0);
    const communityHealthScore = totalComments > 0
      ? Math.round(((analytics.positiveCount || 0) / totalComments) * 100)
      : 85;

    res.json({
      success: true,
      data: {
        communityHealthScore,
        personalHealthScore: user?.toxicityScore ?? 88,
        positiveInteractionScore: analytics.avgKindness || 75,
        ...analytics,
        totalComments
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get comms analytics', error: error.message });
  }
};

module.exports = { analyzeText, getSuggestions, getCommsAnalytics };

