const mongoose = require('mongoose');
const Reel = require('./models/Reel');
const User = require('./models/User');
require('dotenv').config();

const sampleVideos = [
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
];

const moods = ['Motivational', 'Calm', 'Productive', 'Learning', 'Funny'];

const seedReels = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB. Seeding reels...');

    const user = await User.findOne();
    if (!user) {
      console.log('No user found to assign reels to!');
      process.exit(1);
    }

    for (const mood of moods) {
      console.log(`Seeding 20 reels for mood: ${mood}`);
      const newReels = [];
      for (let i = 0; i < 20; i++) {
        const randomVideo = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];
        newReels.push({
          user: user._id,
          video: randomVideo,
          caption: `A beautiful ${mood} moment #${i + 1}`,
          aiMetadata: {
            hashtags: ['#explore', `#${mood.toLowerCase()}`, '#trending'],
            keywords: [mood.toLowerCase(), 'video', 'trending'],
            emotionCategory: mood
          },
          likes: [],
          comments: [],
          views: Math.floor(Math.random() * 1000)
        });
      }
      await Reel.insertMany(newReels);
    }

    console.log('Reels seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding reels:', error);
    process.exit(1);
  }
};

seedReels();
