const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['Coding', 'Studying', 'Brainstorming', 'Music', 'Gaming'],
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  activeUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  settings: {
    isPrivate: { type: Boolean, default: false },
    maxMembers: { type: Number, default: 50 },
    allowGuest: { type: Boolean, default: true }
  },
  productivityTools: {
    pomodoroActive: { type: Boolean, default: false },
    pomodoroEndTime: Date,
    sharedCanvasUrl: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);
