const AIService = require('../services/AIService');

/**
 * Moderation Middleware
 * Intercepts requests to analyze content for toxicity before processing.
 */
const moderateContent = async (req, res, next) => {
  try {
    const textToAnalyze = req.body.caption || req.body.text || req.body.message;

    if (!textToAnalyze) {
      return next();
    }

    const toxicityResult = await AIService.analyzeToxicity(textToAnalyze);

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

    // Add analysis to request for optional downstream use
    req.toxicityAnalysis = toxicityResult;
    next();
  } catch (error) {
    console.error('Moderation Middleware Error:', error);
    next(); // Fail-safe: allow request if AI fails
  }
};

module.exports = moderateContent;
