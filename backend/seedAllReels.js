const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const Reel = require('./models/Reel');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

const moods = ['Motivational', 'Calm', 'Productive', 'Learning', 'Funny'];

// Using ultra-stable sample videos for reliable demos
const videos = [
  'https://v1.pichau.com.br/video/pex-1.mp4', // Fallback pattern
  'https://static.videezy.com/system/resources/previews/000/044/479/original/slow_motion_coding.mp4',
  'https://static.videezy.com/system/resources/previews/000/033/834/original/Pexels_Videos_2670.mp4',
  'https://static.videezy.com/system/resources/previews/000/005/030/original/Night_Coding.mp4'
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find();
    if (users.length === 0) return process.exit(1);

    await Reel.deleteMany({}); 
    
    const reels = [];
    for (let i = 0; i < 30; i++) {
      const mood = moods[i % moods.length];
      const user = users[Math.floor(Math.random() * users.length)];

      // Rotating through stable sources
      const videoUrl = videos[i % videos.length];

      reels.push({
        user: user._id,
        video: videoUrl,
        caption: `Neural Sync: ${mood} state active. 🧠✨ #Sentient #Future`,
        emotionCategory: mood,
        views: Math.floor(Math.random() * 5000) + 1000
      });
    }

    await Reel.insertMany(reels);
    console.log('30 STABLE Mood-Synchronized reels seeded! 🚀');
    mongoose.connection.close();
  } catch (error) {
    console.error(error);
  }
};

seed();
