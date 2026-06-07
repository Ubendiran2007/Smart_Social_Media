/**
 * Backfill Script: Seeds real hashtag intelligence into existing DB content.
 * Run after megaSeed.js to ensure all posts/reels/stories have
 * NLP-derived hashtags, keywords, and emotionCategory.
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Post = require('./models/Post');
const Reel = require('./models/Reel');
const Story = require('./models/Story');
const HashtagIntelligenceService = require('./services/HashtagIntelligenceService');

dotenv.config();

const MOOD_TO_CAPTION = {
  Productive: 'coding startup build developer deep work backend frontend react nodejs typescript',
  Motivational: 'success achieve goal dream inspire discipline consistency never give up hustle',
  Calm: 'peace relax calm nature serene quiet breathe meditation mindful zen sunset',
  Learning: 'learn study tutorial education knowledge skill improve training research curious growth',
  Funny: 'lol funny meme joke humor hilarious laugh comedy relatable css bug typo'
};

const backfill = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected — starting hashtag backfill...');

  // ── Posts ────────────────────────────────────────────────────────────────
  const posts = await Post.find({});
  let postUpdated = 0;
  for (const post of posts) {
    const caption = post.caption || MOOD_TO_CAPTION[post.aiMetadata?.emotionCategory] || '';
    const { hashtags, keywords, emotionCategory } = HashtagIntelligenceService.analyzeCaption(
      caption,
      post.aiMetadata?.emotionCategory !== 'None' ? post.aiMetadata?.emotionCategory : null
    );
    await Post.updateOne(
      { _id: post._id },
      { $set: { 'aiMetadata.hashtags': hashtags, 'aiMetadata.keywords': keywords, 'aiMetadata.emotionCategory': emotionCategory } }
    );
    postUpdated++;
  }
  console.log(`Posts backfilled: ${postUpdated}`);

  // ── Reels ────────────────────────────────────────────────────────────────
  const reels = await Reel.find({});
  let reelUpdated = 0;
  for (const reel of reels) {
    const caption = reel.caption || MOOD_TO_CAPTION[reel.emotionCategory] || '';
    const { hashtags, keywords, emotionCategory } = HashtagIntelligenceService.analyzeCaption(
      caption,
      reel.emotionCategory !== 'None' ? reel.emotionCategory : null
    );
    await Reel.updateOne(
      { _id: reel._id },
      { $set: { 'aiMetadata.hashtags': hashtags, 'aiMetadata.keywords': keywords, 'aiMetadata.emotionCategory': emotionCategory } }
    );
    reelUpdated++;
  }
  console.log(`Reels backfilled: ${reelUpdated}`);

  // ── Stories ──────────────────────────────────────────────────────────────
  const stories = await Story.find({});
  let storyUpdated = 0;
  const moodList = ['Productive', 'Motivational', 'Calm', 'Learning', 'Funny'];
  for (let i = 0; i < stories.length; i++) {
    const story = stories[i];
    const mood = moodList[i % moodList.length];
    const caption = MOOD_TO_CAPTION[mood];
    const { hashtags, keywords, emotionCategory } = HashtagIntelligenceService.analyzeCaption(caption, mood);
    await Story.updateOne(
      { _id: story._id },
      { $set: { 'aiMetadata.hashtags': hashtags, 'aiMetadata.keywords': keywords, 'aiMetadata.emotionCategory': emotionCategory } }
    );
    storyUpdated++;
  }
  console.log(`Stories backfilled: ${storyUpdated}`);

  console.log('✅ Hashtag backfill complete!');
  process.exit(0);
};

backfill().catch(err => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
