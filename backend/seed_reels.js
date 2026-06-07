require('dotenv').config();
const mongoose = require('mongoose');
const Reel = require('./models/Reel');
const User = require('./models/User');
const cloudinary = require('./config/cloudinary');
const https = require('https');
const http = require('http');

const rawUrls = [
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4',
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://media.w3.org/2010/05/bunny/trailer.mp4',
  'https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4'
];

const moods = ['PRODUCTIVE', 'CALM', 'FUNNY', 'LEARNING', 'MOTIVATIONAL'];

// Strict Validation
const validateUrl = (url) => {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    lib.request(url, { method: 'HEAD' }, (res) => {
      if (res.statusCode === 200 && res.headers['content-type'] && res.headers['content-type'].startsWith('video/')) {
        resolve(true);
      } else {
        console.warn(`URL rejected during HEAD request: ${url} (Status: ${res.statusCode})`);
        resolve(false);
      }
    }).on('error', (e) => {
      console.warn(`URL error: ${url} (${e.message})`);
      resolve(false);
    }).end();
  });
};

const seedReels = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB. Starting Cloudinary seed...');

    await Reel.deleteMany({});
    console.log('Cleared existing reels.');

    const user = await User.findOne();
    if (!user) throw new Error('No user found in DB to assign reels to!');

    // Phase 1: Validate URLs
    const validRawUrls = [];
    for (const url of rawUrls) {
      if (await validateUrl(url)) {
        validRawUrls.push(url);
      }
    }
    console.log(`Validated ${validRawUrls.length} public MP4 URLs successfully.`);

    if (validRawUrls.length === 0) {
      throw new Error('All raw URLs failed validation. Cannot proceed.');
    }

    // Phase 2: Upload & Seed
    for (const mood of moods) {
      console.log(`\n--- Processing Mood: ${mood} ---`);
      const folderName = `reels/${mood.toLowerCase()}`;
      
      const cloudinaryUrls = [];
      for (let i = 0; i < validRawUrls.length; i++) {
        try {
          console.log(`Uploading video ${i+1}/${validRawUrls.length} to Cloudinary folder [${folderName}]...`);
          const result = await cloudinary.uploader.upload(validRawUrls[i], {
            resource_type: 'video',
            folder: folderName
          });
          
          if (!result.secure_url) throw new Error('No secure_url returned');
          
          cloudinaryUrls.push(result.secure_url);
          console.log(`✅ Success: ${result.secure_url}`);
        } catch (uploadErr) {
          console.error(`❌ Upload failed, falling back to raw URL:`, uploadErr.message);
          cloudinaryUrls.push(validRawUrls[i]); // Fallback safely to original valid URL
        }
      }

      // Phase 3: DB Insertion
      const newReels = [];
      for (let i = 0; i < 20; i++) {
        const finalUrl = cloudinaryUrls[Math.floor(Math.random() * cloudinaryUrls.length)];
        newReels.push({
          user: user._id,
          video: finalUrl,
          caption: `${mood} lifestyle moment #${i + 1} 🚀`,
          mood: mood,
          hashtags: ['#explore', `#${mood.toLowerCase()}`, '#trending'],
          likes: [],
          comments: [],
          views: Math.floor(Math.random() * 500)
        });
      }
      
      await Reel.insertMany(newReels);
      console.log(`Inserted 20 secure reels into DB for ${mood}.`);
    }

    console.log('\n✅ Full seed complete! All reels are live and secure.');
    process.exit(0);
  } catch (error) {
    console.error('Fatal Seed Error:', error);
    process.exit(1);
  }
};

seedReels();
