const AIService = require('../../services/AIService');

/**
 * AI Controller for Sentiment, Toxicity, and Suggestions
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
      data: {
        toxicity,
        mood
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'AI Analysis failed', error: error.message });
  }
};

const getSuggestions = async (req, res) => {
  try {
    const { mood } = req.body;
    const suggestions = await AIService.generateCaptionSuggestions(mood);
    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate suggestions', error: error.message });
  }
};

module.exports = { analyzeText, getSuggestions };
