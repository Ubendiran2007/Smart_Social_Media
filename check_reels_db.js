const mongoose = require('mongoose');
require('dotenv').config();

const Reel = require('./backend/models/Reel');

async function checkReels() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const count = await Reel.countDocuments();
    console.log('Total Reels:', count);

    const reels = await Reel.find().limit(5);
    console.log('Sample Reels:', JSON.stringify(reels, null, 2));

    const moodCounts = await Reel.aggregate([
      { $group: { _id: '$aiMetadata.emotionCategory', count: { $sum: 1 } } }
    ]);
    console.log('Mood Counts:', moodCounts);

    const oldMoodCounts = await Reel.aggregate([
      { $group: { _id: '$emotionCategory', count: { $sum: 1 } } }
    ]);
    console.log('Old Field Mood Counts:', oldMoodCounts);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkReels();
