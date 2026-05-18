const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  media: {
    type: String,
    required: true
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    index: { expireAfterSeconds: 0 }
  },
  aiMetadata: {
    hashtags: [String],
    keywords: [String],
    emotionCategory: { type: String, enum: ['Motivational', 'Productive', 'Funny', 'Calm', 'Learning', 'None'], default: 'None' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Story', storySchema);