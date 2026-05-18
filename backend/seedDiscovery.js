const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

const syntheticIdentities = [
  {
    username: "neural_pioneer",
    fullName: "Alex Rivera",
    email: "alex@sentient.ai",
    password: "password123",
    bio: "Building the next generation of neural interfaces. MERN Stack & AI enthusiast.",
    professionalProfile: { skills: ["React", "Node.js", "AI", "Machine Learning", "MongoDB"] },
    interests: ["Artificial Intelligence", "Startups", "Coding"],
    verified: true
  },
  {
    username: "silicon_sage",
    fullName: "Elena Chen",
    email: "elena@sentient.ai",
    password: "password123",
    bio: "UI/UX Designer | Focused on glassmorphic aesthetics and futuristic interactions.",
    professionalProfile: { skills: ["Figma", "TailwindCSS", "Motion Design", "Frontend"] },
    interests: ["Design", "Future", "Aesthetics"],
    verified: true
  },
  {
    username: "growth_hacker",
    fullName: "Marcus Thorne",
    email: "marcus@sentient.ai",
    password: "password123",
    bio: "Startup Founder | Scaling Sentient to 1M users. Productivity & Growth.",
    professionalProfile: { skills: ["Growth", "Marketing", "Business", "Scaling"] },
    interests: ["Productivity", "Entrepreneurship"],
    verified: false
  },
  {
    username: "code_ninja",
    fullName: "Satoshi Nakamoto",
    email: "satoshi@sentient.ai",
    password: "password123",
    bio: "Blockchain developer and MERN architect. Security first.",
    professionalProfile: { skills: ["Solidity", "React", "Node.js", "Express"] },
    interests: ["Web3", "Cryptography", "Finance"],
    verified: true
  },
  {
    username: "zen_dev",
    fullName: "Sarah Calm",
    email: "sarah@sentient.ai",
    password: "password123",
    bio: "Tech wellness advocate. Helping devs avoid burnout with meditation.",
    professionalProfile: { skills: ["Mental Health", "Public Speaking", "Writing"] },
    interests: ["Wellness", "Mental Health", "Yoga"],
    verified: true
  },
  {
    username: "fitness_neural",
    fullName: "Jordan Flex",
    email: "jordan@sentient.ai",
    password: "password123",
    bio: "Transforming the physical layer. Bodybuilding meets high-tech data tracking.",
    professionalProfile: { skills: ["Fitness", "Coaching", "Data Analytics"] },
    interests: ["Health", "Gym", "Nutrition"],
    verified: false
  }
];

const seedDiscovery = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create identities
    for (const identity of syntheticIdentities) {
      const exists = await User.findOne({ username: identity.username });
      if (!exists) {
        await User.create(identity);
        console.log(`Neural Identity Established: ${identity.username}`);
      }
    }

    console.log('Neural Discovery Database Populated! 🚀');
    mongoose.connection.close();
  } catch (error) {
    console.error(error);
  }
};

seedDiscovery();
