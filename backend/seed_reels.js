const mongoose = require('mongoose');
const Reel = require('./models/Reel');
const User = require('./models/User');
require('dotenv').config();

const sampleVideos = [
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
];

const moods = ['PRODUCTIVE', 'LEARNING', 'CALM', 'MOTIVATIONAL', 'FUNNY'];

const seedReels = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB. Seeding reels...');

    // Clear old reels
    await Reel.deleteMany({});
    console.log('Old reels cleared.');

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
          caption: `A beautiful ${mood.toLowerCase()} moment #${i + 1}`,
          mood: mood,
          hashtags: ['#explore', `#${mood.toLowerCase()}`, '#trending'],
          aiMetadata: {
            hashtags: ['#explore', `#${mood.toLowerCase()}`, '#trending'],
            keywords: [mood.toLowerCase(), 'video', 'trending'],
            emotionCategory: mood.charAt(0) + mood.slice(1).toLowerCase() // Map back to old enum format just in case
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
