const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const Reel = require('./models/Reel');

async function verify() {
  try {
    console.log('Connecting to:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    
    const count = await Reel.countDocuments();
    console.log('Total Reels in DB:', count);

    const sample = await Reel.find().sort({ createdAt: -1 }).limit(10);
    sample.forEach((r, i) => {
      console.log(`[${i}] ${r.video} - ${r.aiMetadata?.emotionCategory}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

verify();
