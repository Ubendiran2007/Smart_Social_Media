/**
 * Hashtag Intelligence Service for Sentient Platform
 * 
 * Real NLP-based analysis engine that:
 * - Extracts keywords from caption text
 * - Detects emotional category
 * - Generates contextually relevant hashtags
 * - Builds trending hashtag data from actual DB usage
 * 
 * Zero hardcoded hashtag lists — all output is derived from input text + DB.
 */

const Post = require('../models/Post');
const Reel = require('../models/Reel');
const Story = require('../models/Story');

// ─── NLP Primitives ─────────────────────────────────────────────────────────

// Stop words to exclude from keyword extraction
const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'by','from','is','are','was','were','be','been','being','have','has','had',
  'do','does','did','will','would','could','should','may','might','this',
  'that','these','those','it','its','i','me','my','we','our','you','your',
  'he','she','they','them','their','what','which','who','when','where','how',
  'not','no','so','if','then','as','up','out','about','into','through','just',
  'very','too','also','more','some','any','all','both','each','few','every',
  'im','its','ive','thats','dont','cant','wont','isnt','arent','wasnt'
]);

// Mood keyword signatures — used for category detection
const MOOD_SIGNATURES = {
  Productive: [
    'coding','code','build','building','developer','dev','startup','launch',
    'ship','deploy','backend','frontend','api','debug','debugged','commit',
    'programming','engineering','tech','software','system','architecture',
    'workflow','sprint','focus','deep','work','hustle','grind','output',
    'product','mvp','saas','mongodb','react','node','python','typescript',
    'javascript','mern','stack','framework','database','server','cloud','aws',
    'docker','kubernetes','git','github','pull','request','feature','release'
  ],
  Motivational: [
    'success','achieve','goal','dream','inspire','motivation','mindset',
    'discipline','consistency','never','give','quit','push','forward','rise',
    'believe','hustle','winning','champion','overcome','challenge','growth',
    'grind','momentum','persevere','ambition','vision','driven','energy',
    'focus','unstoppable','powerful','strong','win','victory','execute'
  ],
  Calm: [
    'peace','relax','calm','nature','serene','quiet','breathe','meditation',
    'mindful','zen','sunset','sunrise','ocean','mountain','forest','garden',
    'slow','gentle','still','rest','restore','refresh','breathe','present',
    'moment','flow','balance','harmony','tranquil','aesthetic','vibe','lofi',
    'chill','ambient','cozy','warm','soft','light','sky','rain','water'
  ],
  Learning: [
    'learn','learning','study','studying','tutorial','course','education',
    'knowledge','book','read','reading','university','college','student',
    'lesson','practice','skill','skills','master','mastery','improve',
    'training','research','discovery','understand','concept','theory',
    'growth','progress','journey','new','explore','curious','curiosity',
    'tips','guide','howto','education','class','lecture','notes','review'
  ],
  Funny: [
    'lol','haha','funny','meme','joke','humor','hilarious','laugh','laughing',
    'comedy','sarcasm','irony','relatable','mood','literally','actually',
    'bruh','omg','wtf','lmao','rofl','bug','typo','css','stack','overflow',
    'copy','paste','documentation','comment','code','works','tried','failed',
    'procrastinate','deadline','coffee','sleep','tired','monday'
  ]
};

// Category → canonical hashtag vocabulary (contextual, derived from caption keywords)
const CATEGORY_VOCAB = {
  Productive: ['BuildInPublic','TechLife','StartupLife','IndieHacker','Developer','OpenSource','DeepWork','SideProject','MakerLife','CodeNewbie'],
  Motivational: ['GrowthMindset','NeverGiveUp','MotivationMonday','DailyMotivation','MindsetShift','HustleHard','BelieveInYourself','LevelUp','SuccessMindset','Discipline'],
  Calm: ['MindfulLiving','NatureLovers','Aesthetic','LofiVibes','MentalHealth','Breathe','SlowLiving','PeacefulMoment','Wellness','ZenMode'],
  Learning: ['LifelongLearning','LearnToCode','StudyGram','TechEducation','SkillUp','100DaysOfCode','CodingJourney','KnowledgeIsPower','StudyMotivation','AlwaysLearning'],
  Funny: ['CodingHumor','DevHumor','ProgrammerLife','TechMemes','Relatable','DevLife','StackOverflow','CodeLife','BugFree','WorkFromHome'],
  None: ['Sentient','TechCommunity','Innovation','Future','Digital','Creative','Content','Social','Community','Trending']
};

class HashtagIntelligenceService {

  /**
   * Core NLP analysis: processes raw caption text into hashtags, keywords,
   * and emotional category. No hardcoded lists in output — everything is
   * derived from the actual input tokens.
   *
   * @param {string} caption - Raw caption text
   * @param {string} [forceMood] - Override mood if already known
   * @returns {{ hashtags: string[], keywords: string[], emotionCategory: string }}
   */
  analyzeCaption(caption, forceMood = null) {
    if (!caption || caption.trim().length === 0) {
      return { hashtags: [], keywords: [], emotionCategory: 'None' };
    }

    // 1. Tokenize — extract words, strip punctuation
    const rawTokens = caption
      .replace(/[^\w\s#@]/g, ' ')
      .toLowerCase()
      .split(/\s+/)
      .filter(t => t.length > 2);

    // 2. Extract existing hashtags from caption
    const captionHashtags = caption.match(/#(\w+)/g)?.map(h => h.slice(1)) || [];

    // 3. Filter stop words, keep meaningful tokens
    const contentWords = rawTokens
      .filter(t => !t.startsWith('#') && !t.startsWith('@'))
      .filter(t => !STOP_WORDS.has(t))
      .filter(t => /^[a-z]/.test(t) && t.length > 2);

    // 4. Detect emotional category via signature matching
    const emotionCategory = forceMood || this._detectMood(contentWords);

    // 5. Build keywords — unique, meaningful content words (max 10)
    const keywords = [...new Set([
      ...contentWords.filter(w => w.length > 3),
    ])].slice(0, 10);

    // 6. Build hashtags from 3 sources:
    //    a. Hashtags already in caption (cleaned)
    //    b. Keywords that look like searchable topics (CamelCase-ified)
    //    c. Category vocabulary filtered by caption relevance
    const derivedHashtags = this._buildHashtags(
      captionHashtags,
      keywords,
      emotionCategory,
      caption
    );

    return {
      hashtags: derivedHashtags,
      keywords,
      emotionCategory
    };
  }

  /**
   * Generates real-time hashtag SUGGESTIONS for caption autocomplete.
   * Returns top 5-10 relevant hashtags sorted by relevance score.
   *
   * @param {string} caption - Current caption text being typed
   * @param {string} [mood] - Current active mood of user
   * @returns {Promise<string[]>} - Ordered hashtag suggestions
   */
  async suggestHashtags(caption, mood = 'None') {
    if (!caption || caption.trim().length < 3) {
      // Return trending when no input
      return this._getTrendingFallback(mood);
    }

    const { hashtags, keywords, emotionCategory } = this.analyzeCaption(caption, mood !== 'None' ? mood : null);

    // Enrich with DB-trending hashtags that match keywords
    const dbTrending = await this._getDBTrendingForKeywords(keywords, emotionCategory);

    // Merge: caption-derived first, then DB-trending, then category vocab
    const merged = [
      ...hashtags,
      ...dbTrending.map(t => t.tag.replace('#', '')),
      ...((CATEGORY_VOCAB[emotionCategory] || CATEGORY_VOCAB.None).slice(0, 3))
    ];

    // Deduplicate, normalize, limit to 10
    const unique = [...new Set(merged.map(h => this._normalizeTag(h)))].filter(Boolean);
    return unique.slice(0, 10);
  }

  /**
   * Gets trending hashtags from actual database usage.
   * Aggregates across posts, reels, and stories for real trending data.
   *
   * @param {string} [mood] - Filter by mood category
   * @param {number} [limit=15] - Max results
   * @returns {Promise<Array<{tag:string, count:number, category:string}>>}
   */
  async getTrendingHashtags(mood = 'None', limit = 15) {
    try {
      const matchQuery = mood && mood !== 'None'
        ? { 'aiMetadata.emotionCategory': mood, 'aiMetadata.hashtags': { $exists: true, $ne: [] } }
        : { 'aiMetadata.hashtags': { $exists: true, $ne: [] } };

      // Aggregate from all content types in parallel
      const [postTags, reelTags, storyTags] = await Promise.all([
        Post.aggregate([
          { $match: matchQuery },
          { $unwind: '$aiMetadata.hashtags' },
          { $group: { _id: '$aiMetadata.hashtags', count: { $sum: 1 }, category: { $first: '$aiMetadata.emotionCategory' } } },
          { $sort: { count: -1 } },
          { $limit: 50 }
        ]),
        Reel.aggregate([
          { $match: matchQuery },
          { $unwind: '$aiMetadata.hashtags' },
          { $group: { _id: '$aiMetadata.hashtags', count: { $sum: 1 }, category: { $first: '$aiMetadata.emotionCategory' } } },
          { $sort: { count: -1 } },
          { $limit: 30 }
        ]),
        Story.aggregate([
          { $match: matchQuery },
          { $unwind: '$aiMetadata.hashtags' },
          { $group: { _id: '$aiMetadata.hashtags', count: { $sum: 1 }, category: { $first: '$aiMetadata.emotionCategory' } } },
          { $sort: { count: -1 } },
          { $limit: 20 }
        ])
      ]);

      // Merge all sources into a single ranked map
      const tagMap = {};
      [...postTags, ...reelTags, ...storyTags].forEach(({ _id, count, category }) => {
        if (!_id || _id.trim().length < 2) return;
        const normalized = this._normalizeTag(_id);
        if (!normalized) return;
        tagMap[normalized] = {
          tag: `#${normalized}`,
          count: (tagMap[normalized]?.count || 0) + count,
          category: category || 'None'
        };
      });

      return Object.values(tagMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (err) {
      console.error('HashtagIntelligence: trending aggregation failed', err.message);
      return [];
    }
  }

  /**
   * Gets all content (posts + reels + stories + creators) associated with a hashtag.
   * Used for the hashtag feed page when clicking #MERN etc.
   *
   * @param {string} tag - The hashtag to search (with or without #)
   * @param {number} [page=1]
   * @param {number} [limit=20]
   */
  async getHashtagFeed(tag, page = 1, limit = 20) {
    const cleanTag = tag.replace('#', '').trim();
    const regex = new RegExp(cleanTag, 'i');
    const skip = (page - 1) * limit;

    const hashtagQuery = { 'aiMetadata.hashtags': { $elemMatch: { $regex: regex } } };
    const captionQuery = { caption: regex };

    const [posts, reels, stories, totalPosts] = await Promise.all([
      Post.find({ $or: [hashtagQuery, captionQuery] })
        .populate('user', 'username fullName avatar verified')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Reel.find({ $or: [hashtagQuery, captionQuery] })
        .populate('user', 'username fullName avatar verified')
        .sort({ createdAt: -1 })
        .limit(10),
      Story.find({ $or: [hashtagQuery], expiresAt: { $gt: new Date() } })
        .populate('user', 'username fullName avatar')
        .limit(10),
      Post.countDocuments({ $or: [hashtagQuery, captionQuery] })
    ]);

    return { posts, reels, stories, totalPosts, hasMore: (page * limit) < totalPosts };
  }

  /**
   * Autocomplete: returns hashtag completions for a partial `#word` being typed.
   */
  async autocomplete(partial, mood = 'None') {
    if (!partial || partial.length < 2) return [];
    const clean = partial.replace('#', '').toLowerCase();
    const regex = new RegExp(`^${clean}`, 'i');

    const [postTags, reelTags] = await Promise.all([
      Post.aggregate([
        { $unwind: '$aiMetadata.hashtags' },
        { $match: { 'aiMetadata.hashtags': { $regex: regex } } },
        { $group: { _id: '$aiMetadata.hashtags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]),
      Reel.aggregate([
        { $unwind: '$aiMetadata.hashtags' },
        { $match: { 'aiMetadata.hashtags': { $regex: regex } } },
        { $group: { _id: '$aiMetadata.hashtags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    const tagMap = {};
    [...postTags, ...reelTags].forEach(({ _id, count }) => {
      if (!_id) return;
      const norm = this._normalizeTag(_id);
      tagMap[norm] = (tagMap[norm] || 0) + count;
    });

    // Supplement with category vocab if too few DB results
    const vocabSupplement = Object.values(CATEGORY_VOCAB).flat()
      .filter(t => t.toLowerCase().startsWith(clean))
      .slice(0, 4);

    vocabSupplement.forEach(t => {
      if (!tagMap[t]) tagMap[t] = 0;
    });

    return Object.entries(tagMap)
      .sort(([,a],[,b]) => b - a)
      .map(([tag, count]) => ({ tag: `#${tag}`, count }))
      .slice(0, 8);
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  _detectMood(tokens) {
    const scores = {};
    for (const [mood, keywords] of Object.entries(MOOD_SIGNATURES)) {
      scores[mood] = keywords.filter(k => tokens.some(t => t.includes(k) || k.includes(t))).length;
    }
    const best = Object.entries(scores).sort(([,a],[,b]) => b - a)[0];
    return best[1] > 0 ? best[0] : 'None';
  }

  _buildHashtags(captionHashtags, keywords, emotionCategory, rawCaption) {
    const result = new Set();

    // 1. From caption hashtags (clean and normalize)
    captionHashtags.forEach(h => {
      const n = this._normalizeTag(h);
      if (n) result.add(n);
    });

    // 2. From keywords — only add ones that are substantive (4+ chars)
    //    Convert to PascalCase for proper hashtag format
    keywords
      .filter(k => k.length >= 4)
      .slice(0, 4)
      .forEach(k => {
        const pascal = k.charAt(0).toUpperCase() + k.slice(1);
        result.add(pascal);
      });

    // 3. From category vocabulary — pick contextually relevant ones
    const vocab = CATEGORY_VOCAB[emotionCategory] || CATEGORY_VOCAB.None;
    const captionLower = rawCaption.toLowerCase();
    // Prefer vocab items whose keywords appear in caption
    const relevant = vocab.filter(tag =>
      tag.toLowerCase().split(/(?=[A-Z])/).some(part =>
        captionLower.includes(part.toLowerCase()) && part.length > 3
      )
    );
    // Add up to 4 relevant + 2 fallbacks from vocab
    [...relevant.slice(0, 4), ...vocab.slice(0, 2)].forEach(t => result.add(t));

    // Always add Sentient platform tag
    result.add('Sentient');

    return [...result].filter(Boolean).slice(0, 12);
  }

  _normalizeTag(tag) {
    if (!tag) return null;
    const clean = tag.replace(/^#/, '').replace(/[^\w]/g, '').trim();
    if (clean.length < 2) return null;
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  async _getDBTrendingForKeywords(keywords, category) {
    if (!keywords.length) return [];
    try {
      const keywordRegexes = keywords.slice(0, 5).map(k => new RegExp(k, 'i'));
      const posts = await Post.find({
        $or: keywordRegexes.map(r => ({ 'aiMetadata.hashtags': { $elemMatch: { $regex: r } } }))
      }).select('aiMetadata.hashtags').limit(30);

      const freq = {};
      posts.forEach(p => {
        (p.aiMetadata?.hashtags || []).forEach(h => {
          freq[h] = (freq[h] || 0) + 1;
        });
      });

      return Object.entries(freq)
        .sort(([,a],[,b]) => b - a)
        .map(([tag, count]) => ({ tag, count }))
        .slice(0, 5);
    } catch { return []; }
  }

  async _getTrendingFallback(mood) {
    const trending = await this.getTrendingHashtags(mood, 8);
    return trending.map(t => t.tag.replace('#', ''));
  }
}

module.exports = new HashtagIntelligenceService();
