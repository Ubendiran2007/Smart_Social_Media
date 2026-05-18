const AIService = require('../services/AIService');

/**
 * Moderation Middleware
 * Intercepts comments and analyzes toxicity before allowing database entry.
 */
const moderateComment = async (req, res, next) => {
  try {
    const { text, content, comment } = req.body;
    const commentText = text || content || comment;

    if (!commentText) return next();

    const analysis = await AIService.analyzeToxicity(commentText);

    if (analysis.isToxic) {
      return res.status(403).json({
        success: false,
        isToxic: true,
        message: analysis.recommendation,
        toxicityScore: analysis.score,
        suggestions: analysis.suggestions,
        violations: analysis.violations
      });
    }

    next();
  } catch (error) {
    console.error('Moderation Sync Error:', error);
    next(); // Fallback to allow if AI service fails (safety check)
  }
};

module.exports = { moderateComment };
