const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const Post = require('./models/Post');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

const moods = ['Motivational', 'Calm', 'Productive', 'Learning', 'Funny'];

const contentData = {
  Motivational: [
    { caption: "Don't stop until you're proud. 🚀", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f" },
    { caption: "Consistency is the key to mastery. 🔑", img: "https://images.unsplash.com/photo-1499750310107-5fef28a66643" }
  ],
  Calm: [
    { caption: "Inner peace is the new success. 🧘‍♂️", img: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d" },
    { caption: "Nature's rhythm. 🌲", img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05" }
  ],
  Productive: [
    { caption: "Deep work session in progress. 💻", img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085" },
    { caption: "Clean code, clean mind. ✨", img: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6" }
  ],
  Learning: [
    { caption: "Exploring Neural Architectures. 🧠", img: "https://images.unsplash.com/photo-1507413245164-6160d8298b31" },
    { caption: "Knowledge is power. 📖", img: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8" }
  ],
  Funny: [
    { caption: "Me when the code works on the first try 😂", img: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3" },
    { caption: "Debugging my life like... 🛠️", img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97" }
  ]
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find();
    if (users.length === 0) return process.exit(1);

    await Post.deleteMany({}); // Clear old posts for fresh demo
    
    const posts = [];
    for (let i = 0; i < 50; i++) {
      const mood = moods[i % moods.length];
      const sample = contentData[mood][i % 2];
      const user = users[Math.floor(Math.random() * users.length)];

      posts.push({
        user: user._id,
        image: sample.img + `?sig=${i}`,
        caption: sample.caption,
        aiMetadata: {
          sentiment: 'Positive',
          moodCategory: mood,
          suggestedHashtags: [mood, 'Sentient', 'Neural']
        }
      });
    }

    await Post.insertMany(posts);
    console.log('50 Mood-Synchronized posts seeded! 🚀');
    mongoose.connection.close();
  } catch (error) {
    console.error(error);
  }
};

seed();
