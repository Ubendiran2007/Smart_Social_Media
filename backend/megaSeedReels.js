const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const Reel = require('./models/Reel');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

const moods = ['Motivational', 'Calm', 'Productive', 'Learning', 'Funny'];

const videos = [
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://www.w3schools.com/html/movie.mp4',
  'https://v1.pichau.com.br/video/pex-1.mp4',
  'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
  'https://www.w3schools.com/html/mov_bbb.mp4'
];

const captions = {
  Motivational: [
    "Discipline is the bridge between goals and accomplishment. 🚀",
    "Keep pushing, the collective is watching your growth. 🔥",
    "Success is a neural frequency you must tune into. ✨",
    "Wake up with determination. Go to bed with satisfaction.",
    "Your potential is limitless. Sync with it."
  ],
  Calm: [
    "Peace is the highest state of existence. 🌙",
    "A quiet mind is a powerful mind. Zen state active.",
    "Breathing in, breathing out. Mindfulness in the network.",
    "Disconnect to reconnect. Finding balance.",
    "The ocean of consciousness is calm today."
  ],
  Productive: [
    "MERN stack deep dive. Building the future byte by byte. 💻",
    "Late night coding sessions are where the magic happens.",
    "Startup life: 1% inspiration, 99% neural sync. ⚡",
    "Deploying to the collective. Build in public.",
    "Optimization complete. System running at 100% frequency."
  ],
  Learning: [
    "Just learned how to use Framer Motion! 🧠✨",
    "Education is the passport to the future. Growth mindset.",
    "Sharing my progress as a junior dev. Every commit counts.",
    "Neural expansion in progress. Reading documentation.",
    "Tutorial complete. Knowledge successfully integrated."
  ],
  Funny: [
    "Me: *Fixes one bug* \nCode: *Spawns 5 more* 💀",
    "CSS is my passion (and my nightmare). Lmao.",
    "Emotional damage: When the production build fails. 😂",
    "Coffee.exe is not responding. Need more beans.",
    "Neural link established... with my bed. 💤"
  ]
};

const hashtags = {
  Motivational: ["#Motivation", "#Growth", "#Discipline", "#Sentient"],
  Calm: ["#Zen", "#Peace", "#Aesthetic", "#Mindfulness"],
  Productive: ["#Coding", "#Dev", "#Startup", "#MERN"],
  Learning: ["#Education", "#JuniorDev", "#Learning", "#BuildInPublic"],
  Funny: ["#Lmao", "#DevLife", "#Meme", "#Relatable"]
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find();
    if (users.length === 0) {
      console.error('No users found. Please seed users first.');
      process.exit(1);
    }

    await Reel.deleteMany({}); 
    console.log('Cleared existing reels.');

    const reels = [];
    for (let i = 0; i < 100; i++) {
      const mood = moods[i % moods.length];
      const user = users[Math.floor(Math.random() * users.length)];
      const videoUrl = videos[i % videos.length];
      const moodCaptions = captions[mood];
      const caption = moodCaptions[Math.floor(Math.random() * moodCaptions.length)];
      const moodTags = hashtags[mood];

      reels.push({
        user: user._id,
        video: videoUrl,
        caption: `${caption} #Future #NeuralPulse`,
        aiMetadata: {
          hashtags: moodTags,
          keywords: [mood.toLowerCase(), 'video', 'content'],
          emotionCategory: mood
        },
        views: Math.floor(Math.random() * 10000) + 1000,
        likes: [],
        comments: []
      });
    }

    await Reel.insertMany(reels);
    console.log('🚀 100 MEGA-REELS SEEDED SUCCESSFULLY!');
    mongoose.connection.close();
  } catch (error) {
    console.error(error);
  }
};

seed();
