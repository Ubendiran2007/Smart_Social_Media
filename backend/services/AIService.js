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
    if (!text) return { 
      isToxic: false, 
      toxicityScore: 0, 
      positivityScores: { kindness: 50, constructiveness: 50, empathy: 50 },
      status: 'Healthy',
      rewrites: [],
      coachMessage: null
    };

    const textLower = text.toLowerCase();
    
    // Aggression/Toxicity Patterns
    const toxicPatterns = [
      { pattern: /useless|worthless|loser|pathetic|idiot|stupid|dumb|moron|clown/i, weight: 60, category: 'insult' },
      { pattern: /hate|kill|die|murder|attack|suicide|punch|kick/i, weight: 90, category: 'violence_hate' },
      { pattern: /trash|garbage|shit|fuck|bitch|asshole|piss/i, weight: 50, category: 'profanity' },
      { pattern: /ugly|fat|disgusting|horrible|shut up|get out|leave/i, weight: 45, category: 'harassment' }
    ];

    // Positivity/Constructiveness Patterns
    const positivePatterns = [
      { pattern: /great|awesome|excellent|amazing|brilliant/i, impact: { kindness: 20, constructiveness: 10, empathy: 10 } },
      { pattern: /could be improved|i think|maybe we could|consider/i, impact: { kindness: 10, constructiveness: 30, empathy: 10 } },
      { pattern: /understand|feel|sorry|appreciate|hear you/i, impact: { kindness: 15, constructiveness: 10, empathy: 30 } }
    ];

    const rewriteMap = {
      "useless": "I think this could be improved",
      "idiot": "I have a different perspective",
      "stupid": "This needs more thought",
      "hate": "I'm not a fan of this",
      "trash": "This isn't my preference",
      "pathetic": "I was expecting more",
      "shut up": "Let's pause the discussion",
      "garbage": "There's room for improvement here"
    };

    let toxicityScore = 0;
    let violations = [];
    let matchedWords = [];

    // Calculate Toxicity
    toxicPatterns.forEach(item => {
      if (item.pattern.test(text)) {
        toxicityScore += item.weight;
        violations.push(item.category);
        const matches = text.match(new RegExp(item.pattern, 'gi'));
        if (matches) matchedWords.push(...matches);
      }
    });

    // Determine Status
    let status = 'Healthy';
    if (toxicityScore > 20 && toxicityScore <= 50) status = 'Warning';
    if (toxicityScore > 50) status = 'Blocked';
    if (toxicityScore > 100) toxicityScore = 100;

    // Calculate Positivity
    let positivity = { kindness: 50, constructiveness: 50, empathy: 50 };
    if (toxicityScore > 20) {
      positivity.kindness -= Math.floor(toxicityScore / 2);
      positivity.empathy -= Math.floor(toxicityScore / 2);
      positivity.constructiveness -= Math.floor(toxicityScore / 3);
    }
    
    positivePatterns.forEach(item => {
      if (item.pattern.test(text)) {
        positivity.kindness = Math.min(100, positivity.kindness + item.impact.kindness);
        positivity.constructiveness = Math.min(100, positivity.constructiveness + item.impact.constructiveness);
        positivity.empathy = Math.min(100, positivity.empathy + item.impact.empathy);
      }
    });

    // Generate Smart Rewrites and Coach Message
    let rewrites = [];
    let coachMessage = null;

    if (toxicityScore > 20) {
      let rewritten = text;
      matchedWords.forEach(word => {
        const replacement = rewriteMap[word.toLowerCase()];
        if (replacement) rewritten = rewritten.replace(new RegExp(word, 'gi'), replacement);
      });
      
      if (rewritten !== text) {
        rewrites.push(rewritten);
      }
      
      if (violations.includes('insult') || violations.includes('harassment')) {
        coachMessage = "Try focusing on the idea instead of the person. Constructive feedback is more effective.";
        rewrites.push("Can you explain your approach?");
        rewrites.push("I have a different opinion.");
      } else if (violations.includes('profanity')) {
        coachMessage = "Professional language leads to better technical discussions.";
      } else if (violations.includes('violence_hate')) {
        coachMessage = "Take a deep breath. Let's maintain a supportive environment.";
      }
    } else if (toxicityScore === 0 && text.length > 10) {
      coachMessage = "Great communication! Your input adds value to the community.";
    }

    return {
      isToxic: toxicityScore > 50,
      toxicityScore,
      positivityScores: positivity,
      status,
      violations: [...new Set(violations)],
      coachMessage,
      rewrites: [...new Set(rewrites)].slice(0, 3)
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
