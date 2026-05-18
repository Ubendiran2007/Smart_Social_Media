const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const dummyUsers = [
  {
    username: 'alex_neuro',
    email: 'alex@sentient.io',
    password: 'password123',
    fullName: 'Alex Neuro',
    bio: 'Neural Architect | Building the collective consciousness.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop',
    interests: ['AI', 'Architecture', 'Neural Networks'],
    professionalProfile: {
      skills: ['React', 'Python', 'ML'],
      techBadges: ['Neural Pioneer', 'Top Sync']
    },
    moodAnalytics: {
      currentMood: 'Productive'
    }
  },
  {
    username: 'sarah_sync',
    email: 'sarah@sentient.io',
    password: 'password123',
    fullName: 'Sarah Sync',
    bio: 'Product Designer at the intersection of mind and machine.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop',
    interests: ['Design', 'UI/UX', 'Futurism'],
    professionalProfile: {
      skills: ['Figma', 'Motion', 'Canvas'],
      techBadges: ['Design Master']
    },
    moodAnalytics: {
      currentMood: 'Calm'
    }
  },
  {
    username: 'crypto_monk',
    email: 'monk@sentient.io',
    password: 'password123',
    fullName: 'Zen Master',
    bio: 'Meditating on the blockchain. Find your inner sync.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&auto=format&fit=crop',
    interests: ['Blockchain', 'Meditation', 'Philosophy'],
    professionalProfile: {
      skills: ['Solidity', 'Rust', 'Yoga'],
      techBadges: ['Ethereal']
    },
    moodAnalytics: {
      currentMood: 'Learning'
    }
  },
  {
    username: 'nova_tech',
    email: 'nova@sentient.io',
    password: 'password123',
    fullName: 'Nova Skyline',
    bio: 'Full-stack explorer of digital frontiers.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&auto=format&fit=crop',
    interests: ['Web3', 'TypeScript', 'Gaming'],
    professionalProfile: {
      skills: ['Node.js', 'Next.js', 'Go'],
      techBadges: ['Full Stack']
    },
    moodAnalytics: {
      currentMood: 'Motivational'
    }
  },
  {
    username: 'pixel_drifter',
    email: 'pixel@sentient.io',
    password: 'password123',
    fullName: 'Leo Drift',
    bio: 'Vibe engineering and pixel perfection.',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256&h=256&auto=format&fit=crop',
    interests: ['Graphics', 'Vibe', 'Music'],
    professionalProfile: {
      skills: ['Three.js', 'WebGL', 'Shaders'],
      techBadges: ['Vibe Coder']
    },
    moodAnalytics: {
      currentMood: 'Funny'
    }
  }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users? No, let's just add if they don't exist
    for (const u of dummyUsers) {
      const exists = await User.findOne({ username: u.username });
      if (!exists) {
        await User.create(u);
        console.log(`User ${u.username} created.`);
      } else {
        console.log(`User ${u.username} already exists.`);
      }
    }

    console.log('Dummy users seeded successfully! 🚀');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
