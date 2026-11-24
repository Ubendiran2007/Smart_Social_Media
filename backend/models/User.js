const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    maxlength: 150,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  moodAnalytics: {
    currentMood: { 
      type: String, 
      enum: ['Motivational', 'Calm', 'Productive', 'Learning', 'Funny', 'None'],
      default: 'None'
    },
    moodHistory: [{ 
      mood: String, 
      date: { type: Date, default: Date.now } 
    }],
    burnoutIndex: { type: Number, default: 0 }
  },
  professionalProfile: {
    skills: [String],
    portfolioUrl: String,
    githubUrl: String,
    resumeUrl: String,
    achievements: [{ 
      title: String, 
      date: Date 
    }],
    techBadges: [String]
  },
  productivity: {
    focusMode: { type: Boolean, default: false },
    pomodoroSessions: { type: Number, default: 0 },
    studyTime: { type: Number, default: 0 }
  },
  toxicityScore: { type: Number, default: 100 },
  interests: [String],
  verified: { type: Boolean, default: false },
  isSeeded: { type: Boolean, default: false },
  lastActive: { type: Date, default: Date.now },

  // ─── Behavior Tracking (Recommendation Engine signals) ──────────────────────
  behaviorProfile: {
    likedHashtags:    { type: [String], default: [] },   // from post likes
    watchedMoods:     { type: [String], default: [] },   // moods of reels watched
    searchHistory:    { type: [String], default: [] },   // last 20 search queries
    roomHistory:      { type: [String], default: [] },   // room IDs visited
    engagedCreators:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // liked/commented
    contentWeights: {
      Productive:   { type: Number, default: 0 },
      Learning:     { type: Number, default: 0 },
      Motivational: { type: Number, default: 0 },
      Calm:         { type: Number, default: 0 },
      Funny:        { type: Number, default: 0 }
    }
  },
  gamification: {
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streaks: {
      learning: { type: Number, default: 0 },
      focus: { type: Number, default: 0 },
      lastLearningDate: { type: Date },
      lastFocusDate: { type: Date }
    },
    achievements: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      icon: { type: String, required: true },
      description: { type: String, required: true },
      unlockedAt: { type: Date, default: Date.now }
    }],
    badges: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      icon: { type: String, required: true },
      category: { type: String, enum: ['Wellness', 'Collaboration', 'Activity', 'Learning', 'Productivity'], required: true },
      description: { type: String, required: true },
      unlockedAt: { type: Date, default: Date.now }
    }],
    stats: {
      postsCreated: { type: Number, default: 0 },
      focusSessionsCompleted: { type: Number, default: 0 },
      roomsJoined: { type: Number, default: 0 },
      positiveCommentsCount: { type: Number, default: 0 },
      educationalReelsWatched: { type: Number, default: 0 }
    }
  }
}, {
  timestamps: true
});


userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);