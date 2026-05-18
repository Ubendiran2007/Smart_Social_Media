/**
 * Toxicity & Moderation Service
 * Handles AI-powered text analysis for toxicity, sentiment, and smart rewrites.
 */
class ToxicityService {
  constructor() {
    // Neural Guard Dictionary (Expandable)
    this.toxicPatterns = [
      { pattern: /useless|worthless|loser|pathetic/i, weight: 0.8, category: 'insult' },
      { pattern: /idiot|stupid|dumb|moron|clown/i, weight: 0.6, category: 'insult' },
      { pattern: /hate|kill|die|murder|attack/i, weight: 0.9, category: 'hate_speech' },
      { pattern: /trash|garbage|shit|fuck|bitch|asshole/i, weight: 0.7, category: 'profanity' },
      { pattern: /ugly|fat|disgusting|horrible/i, weight: 0.6, category: 'harassment' },
      { pattern: /shut up|get out|leave/i, weight: 0.4, category: 'aggression' }
    ];

    this.rewriteMap = {
      "useless": "I think this could be improved with more effort.",
      "idiot": "I have a different perspective on this approach.",
      "stupid": "This seems like it needs more thought.",
      "hate": "I'm not a fan of this particular style.",
      "trash": "This isn't quite my preference, but keep going.",
      "disgusting": "This is a bit intense for my taste.",
      "pathetic": "I was expecting a bit more from this."
    };
  }

  /**
   * Analyzes text for toxicity
   * @param {string} text 
   * @returns {Object} Analysis results
   */
  async analyzeToxicity(text) {
    if (!text) return { safe: true, toxicityScore: 0 };

    let totalScore = 0;
    let detectedCategories = [];
    let matchedWords = [];

    // 1. Pattern Matching Analysis
    this.toxicPatterns.forEach(item => {
      if (item.pattern.test(text)) {
        totalScore += item.weight;
        detectedCategories.push(item.category);
        const match = text.match(item.pattern);
        if (match) matchedWords.push(match[0]);
      }
    });

    // Normalize score (0 to 1)
    const toxicityScore = Math.min(totalScore, 1);
    const safe = toxicityScore < 0.4;
    
    // 2. Generate Smart Rewrite if toxic
    let suggestions = [];
    if (!safe) {
      suggestions = this.generateRewrites(text, matchedWords);
    }

    return {
      safe,
      toxicityScore,
      categories: [...new Set(detectedCategories)],
      message: safe 
        ? "Transmission safe." 
        : "This comment may hurt others. Please rewrite it positively.",
      suggestions
    };
  }

  /**
   * Generates constructive rewrites for toxic content
   */
  generateRewrites(text, matchedWords) {
    let rewritten = text;
    
    // Simple replacement logic for demo
    matchedWords.forEach(word => {
      const replacement = this.rewriteMap[word.toLowerCase()];
      if (replacement) {
        rewritten = rewritten.replace(new RegExp(word, 'gi'), replacement);
      }
    });

    // Fallback static suggestions
    const fallbacks = [
      "I appreciate the effort, but maybe try a different angle?",
      "Interesting contribution to the collective.",
      "I'm looking forward to seeing how this evolves."
    ];

    if (rewritten === text) return fallbacks;
    return [rewritten, ...fallbacks.slice(0, 1)];
  }

  /**
   * Calculates "Kindness Quotient" for positive reinforcement
   */
  calculatePositivity(text) {
    const positiveWords = /love|great|awesome|amazing|beautiful|clean|efficient|brilliant|nice/i;
    return positiveWords.test(text) ? 0.95 : 0.5;
  }
}

module.exports = new ToxicityService();
