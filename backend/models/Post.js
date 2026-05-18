const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  caption: {
    type: String,
    maxlength: 2200
  },
  image: {
    type: String,
    required: true
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
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  emotionReactions: {
    inspired: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    funny: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    deep: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    motivating: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    creative: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  aiMetadata: {
    sentiment: { type: String, enum: ['Positive', 'Neutral', 'Negative', 'Unknown'], default: 'Unknown' },
    toxicityScore: { type: Number, default: 0 },
    hashtags: [String],
    keywords: [String],
    emotionCategory: { type: String, enum: ['Motivational', 'Calm', 'Productive', 'Learning', 'Funny', 'None'], default: 'None' }
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('Post', postSchema);