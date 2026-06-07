const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  video: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    maxlength: 2200
  },
  mood: {
    type: String,
    default: ''
  },
  hashtags: {
    type: [String],
    default: []
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    moderation: {
      toxicityScore: { type: Number, default: 0 },
      violations: [String],
      isRewritten: { type: Boolean, default: false },
      originalText: String
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  aiMetadata: {
    hashtags: [String],
    keywords: [String],
    emotionCategory: { type: String, enum: ['Motivational', 'Productive', 'Funny', 'Calm', 'Learning', 'None'], default: 'None' }
  }
}, {
  timestamps: true
});

reelSchema.pre('save', function(next) {
  if (!this.mood || this.mood === 'None' || this.mood === '') {
    if (this.aiMetadata && this.aiMetadata.emotionCategory && this.aiMetadata.emotionCategory !== 'None') {
      this.mood = this.aiMetadata.emotionCategory.toUpperCase();
    } else {
      const text = `${this.caption} ${this.hashtags?.join(' ')} ${this.aiMetadata?.hashtags?.join(' ')}`.toLowerCase();
      if (text.includes('productive') || text.includes('work') || text.includes('focus')) this.mood = 'PRODUCTIVE';
      else if (text.includes('calm') || text.includes('peace') || text.includes('relax')) this.mood = 'CALM';
      else if (text.includes('learning') || text.includes('study') || text.includes('code')) this.mood = 'LEARNING';
      else if (text.includes('motivational') || text.includes('inspire') || text.includes('success')) this.mood = 'MOTIVATIONAL';
      else if (text.includes('funny') || text.includes('laugh') || text.includes('joke')) this.mood = 'FUNNY';
      else this.mood = 'GENERAL';
    }
  } else {
    this.mood = this.mood.toUpperCase();
  }
  
  if (!this.hashtags || this.hashtags.length === 0) {
    if (this.aiMetadata && this.aiMetadata.hashtags) {
      this.hashtags = this.aiMetadata.hashtags;
    }
  }

  next();
});

module.exports = mongoose.model('Reel', reelSchema);