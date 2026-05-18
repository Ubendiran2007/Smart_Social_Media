const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Post = require('./models/Post');
const User = require('./models/User');

dotenv.config();

const samplePosts = [
  {
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop',
    caption: 'Deep in the neural architecture today. Scaling the collective consciousness to 1M nodes. 🧠🚀',
    aiMetadata: { sentiment: 'Positive', moodCategory: 'Productive', suggestedHashtags: ['Neural', 'Scale', 'Sentient'] }
  },
  {
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop',
    caption: 'The intersection of retro tech and futuristic neural networks. Aesthetic is everything. 🕹️✨',
    aiMetadata: { sentiment: 'Positive', moodCategory: 'Learning', suggestedHashtags: ['RetroFuturism', 'NeuralDesign'] }
  },
  {
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1000&auto=format&fit=crop',
    caption: 'Morning meditation session before diving into the codebase. Keep your sync high. 🧘‍♂️⚡',
    aiMetadata: { sentiment: 'Positive', moodCategory: 'Calm', suggestedHashtags: ['Zen', 'Focus', 'DevLife'] }
  },
  {
    image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000&auto=format&fit=crop',
    caption: 'New UI component library for Sentient is looking crisp. Glassmorphism at its peak. 💎🎨',
    aiMetadata: { sentiment: 'Positive', moodCategory: 'Productive', suggestedHashtags: ['UIUX', 'Glassmorphism', 'Design'] }
  },
  {
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop',
    caption: 'Hardware sync. The physical layer matters just as much as the digital one. 📟🔧',
    aiMetadata: { sentiment: 'Neutral', moodCategory: 'Learning', suggestedHashtags: ['Hardware', 'IoT', 'Sync'] }
  }
];

const seedPosts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find();
    if (users.length === 0) {
      console.log('No users found. Please seed users first.');
      process.exit(1);
    }

    const posts = [];
    for (let i = 0; i < 20; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const sample = samplePosts[i % samplePosts.length];
      
      posts.push({
        user: user._id,
        image: sample.image,
        caption: sample.caption,
        aiMetadata: sample.aiMetadata,
        likes: users.slice(0, Math.floor(Math.random() * users.length)).map(u => u._id),
        comments: [
          {
            user: users[Math.floor(Math.random() * users.length)]._id,
            text: 'This is absolutely stunning! 🔥'
          }
        ]
      });
    }

    await Post.insertMany(posts);
    console.log('20 Posts successfully seeded! 🚀');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding posts:', error);
    process.exit(1);
  }
};

seedPosts();
