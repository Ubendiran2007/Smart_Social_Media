const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const User = require('./models/User');
const Notification = require('./models/Notification');
const Post = require('./models/Post');
const Reel = require('./models/Reel');

dotenv.config({ path: path.join(__dirname, '.env') });

const socialMessages = [
  { type: 'like', message: 'liked your reel 🔥' },
  { type: 'comment', message: 'commented on your post: "This is pure fire!"' },
  { type: 'follow', message: 'started following you' },
  { type: 'mention', message: 'mentioned you in a comment' },
  { type: 'like', message: 'liked your story' },
  { type: 'comment', message: 'replied to your comment: "Exactly what I thought!"' }
];

const aiMessages = [
  { type: 'ai_insight', message: 'Your productive streak increased by 12% 🚀' },
  { type: 'ai_insight', message: 'AI recommends following DevGrind based on your interests' },
  { type: 'ai_insight', message: 'Your motivational content is trending in the #MERN spectrum' },
  { type: 'ai_insight', message: 'Your reel reached 1.2K views! Engagement is up 40%.' },
  { type: 'ai_insight', message: '3 people reacted to your story' },
  { type: 'ai_insight', message: 'Your hashtag #AI is trending globally.' }
];

const productivityMessages = [
  { type: 'productivity', message: 'Take a short break and hydrate 💧' },
  { type: 'productivity', message: 'Deep work session detected. Keep it up!' },
  { type: 'productivity', message: 'Your focus score hit 95 today! 🧠' },
  { type: 'productivity', message: 'Time to review your daily goals.' },
  { type: 'productivity', message: 'Neural sync completed. All systems optimal.' }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find();
    if (users.length < 5) {
      console.log('Not enough users. Run seedChat.js first.');
      process.exit(1);
    }

    const posts = await Post.find().limit(10);
    const reels = await Reel.find().limit(10);

    await Notification.deleteMany({});
    console.log('Cleared old notifications.');

    const notifications = [];

    for (const recipient of users) {
      // Seed ~15 random notifications per user to reach 50+ total quickly
      const numNotifs = Math.floor(Math.random() * 20) + 15;
      
      for (let i = 0; i < numNotifs; i++) {
        const sender = users[Math.floor(Math.random() * users.length)];
        if (sender._id.equals(recipient._id)) continue;

        const category = Math.random();
        let notifData;

        if (category < 0.6) {
          notifData = socialMessages[Math.floor(Math.random() * socialMessages.length)];
        } else if (category < 0.85) {
          notifData = aiMessages[Math.floor(Math.random() * aiMessages.length)];
        } else {
          notifData = productivityMessages[Math.floor(Math.random() * productivityMessages.length)];
        }

        notifications.push({
          recipient: recipient._id,
          sender: sender._id,
          type: notifData.type,
          message: notifData.message,
          postId: posts.length > 0 ? posts[Math.floor(Math.random() * posts.length)]._id : null,
          reelId: reels.length > 0 ? reels[Math.floor(Math.random() * reels.length)]._id : null,
          isRead: Math.random() > 0.7,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)) // Last 7 days
        });
      }
    }

    await Notification.insertMany(notifications);
    console.log(`Seeded ${notifications.length} notifications across ${users.length} users.`);

    mongoose.connection.close();
  } catch (error) {
    console.error(error);
  }
};

seed();
