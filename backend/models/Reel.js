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


module.exports = mongoose.model('Reel', reelSchema);