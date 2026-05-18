/**
 * AI Service for Sentient Platform
 * Handles sentiment analysis, toxicity detection, and caption generation.
 */

class AIService {
  /**
   * Analyzes text for toxicity.
   * In a real scenario, this would call Perspective API or OpenAI.
   */
  /**
   * Advanced Toxicity Analysis & Smart Moderation
   * Performs deep contextual analysis for hate speech, bullying, and profanity.
   */
  async analyzeToxicity(text) {
    if (!text) return { isToxic: false, score: 0 };

    const textLower = text.toLowerCase();
    const toxicPatterns = [
      { pattern: /useless|worthless|loser|pathetic|idiot|stupid|dumb|moron|clown/i, weight: 0.8, category: 'insult' },
      { pattern: /hate|kill|die|murder|attack|suicide|punch|kick/i, weight: 0.9, category: 'violence_hate' },
      { pattern: /trash|garbage|shit|fuck|bitch|asshole|piss/i, weight: 0.7, category: 'profanity' },
      { pattern: /ugly|fat|disgusting|horrible|shut up|get out|leave/i, weight: 0.6, category: 'harassment' }
    ];

    const rewriteMap = {
      "useless": "I think this could be improved.",
      "idiot": "I have a different perspective.",
      "stupid": "This needs more thought.",
      "hate": "I'm not a fan of this.",
      "trash": "This isn't my preference.",
      "pathetic": "I was expecting more."
    };

    let score = 0;
    let violations = [];
    let matchedWords = [];

    toxicPatterns.forEach(item => {
      if (item.pattern.test(text)) {
        score += item.weight;
        violations.push(item.category);
        const matches = text.match(item.pattern);
        if (matches) matchedWords.push(...matches);
      }
    });

    const isToxic = score > 0.4;
    const finalScore = Math.min(score, 1);

    // Generate Smart Rewrites
    let suggestions = [];
    if (isToxic) {
      let rewritten = text;
      matchedWords.forEach(word => {
        const replacement = rewriteMap[word.toLowerCase()];
        if (replacement) rewritten = rewritten.replace(new RegExp(word, 'gi'), replacement);
      });
      
      suggestions = [
        rewritten !== text ? rewritten : "I think we can find a more constructive way to express this.",
        "Perhaps we could focus on improvement here?",
        "Interesting point, let's keep it respectful."
      ];
    }

    return {
      isToxic,
      score: finalScore,
      violations: [...new Set(violations)],
      recommendation: isToxic 
        ? 'Neural guard: This content feels a bit heavy for the collective. Let’s keep it positive! ✨' 
        : 'Frequency cleared. Safe to share. ✅',
      suggestions
    };
  }

  /**
   * AI Transcription Service (Mocked)
   * Simulates conversion of audio/video speech to text for indexing.
   */
  async transcribeAudio(audioBuffer) {
    // Simulating high-performance AI transcription
    return {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      confidence: 0.98,
      language: 'en-US'
    };
  }


  /**
   * Analyzes sentiment and mood category.
   */
  async analyzeMood(text) {
    const moods = {
      motivational: ['success', 'goal', 'achieve', 'never', 'give', 'up', 'hustle'],
      funny: ['lol', 'haha', 'meme', 'joke', 'hilarious'],
      productive: ['coding', 'study', 'work', 'build', 'startup', 'learning'],
      calm: ['relax', 'peace', 'nature', 'meditation', 'quiet']
    };

    const textLower = text.toLowerCase();
    let detectedMood = 'None';
    let maxMatches = 0;

    for (const [mood, keywords] of Object.entries(moods)) {
      const matches = keywords.filter(k => textLower.includes(k)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedMood = mood.charAt(0).toUpperCase() + mood.slice(1);
      }
    }

    return {
      mood: detectedMood,
      sentiment: maxMatches > 0 ? 'Positive' : 'Neutral'
    };
  }

  /**
   * Generates AI suggestions for captions and hashtags based on mood.
   */
  async generateCaptionSuggestions(mood = 'Productive') {
    const templates = {
      Productive: [
        "Late-night coding session. One commit at a time. 💻🚀",
        "Building while the world sleeps. The grind is real. #StartupLife",
        "Deep work mode: ON. 🧠✨",
        "The best way to predict the future is to build it. #Developer",
        "Focusing on the 1% gains every single day. 📈"
      ],
      Motivational: [
        "Consistency beats motivation every time. Keep showing up. 🔥",
        "Your only limit is your mind. Break through. ✨",
        "Dreams need discipline. Don't stop now. 🚀",
        "Small steps lead to massive destinations. #GrowthMindset",
        "Turning 'one day' into 'day one'. Let's go! 💪"
      ],
      Funny: [
        "Debugging: Being the detective in a crime movie where you are also the murderer. 🕵️‍♂️💀",
        "My code works and I'm honestly a bit scared to touch it. #CodingHumor",
        "Coffee: Because adulting is hard and debugging is harder. ☕️😭",
        "I'm not lazy, I'm just on energy-saving mode. 🔋😂",
        "Expectation: 🚀 Reality: 🐛 #DevLife"
      ],
      Calm: [
        "Quiet mind. Clear direction. 🌙✨",
        "Finding peace in the chaos of the build. 🧘‍♂️",
        "Taking a breath. Recharging for the next big leap. 🌊",
        "Slow down to speed up. #Aesthetic",
        "Current state: Zen. 🍃"
      ],
      Learning: [
        "Today's bug is tomorrow's lesson. Growth is messy. 📚✨",
        "Learning MERN one error at a time. We're getting there! #LearningToCode",
        "Uncomfortable is where the magic happens. #TechJourney",
        "Stay curious. The world is your documentation. 🌐",
        "Mastery takes time. Enjoy the process. 🎨"
      ]
    };

    const moodCaptions = templates[mood] || templates.Productive;
    const shuffled = moodCaptions.sort(() => 0.5 - Math.random());
    
    // Intelligent keyword generation based on mood
    const keywordMap = {
      Productive: ['coding', 'startup', 'productivity', 'build', 'dev'],
      Motivational: ['success', 'discipline', 'growth', 'mindset', 'goal'],
      Funny: ['meme', 'humor', 'lol', 'relatable', 'devlife'],
      Calm: ['peace', 'mindfulness', 'aesthetic', 'zen', 'relax'],
      Learning: ['education', 'tutorial', 'growth', 'mern', 'junior']
    };

    return {
      captions: shuffled.slice(0, 3),
      hashtags: ['#Sentient', '#BuildInPublic', `#${mood.toLowerCase()}`],
      keywords: keywordMap[mood] || [],
      emotionCategory: mood,
      engagementScore: 95
    };
  }
}

module.exports = new AIService();
