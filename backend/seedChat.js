const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const User = require('./models/User');
const Message = require('./models/Message');

dotenv.config({ path: path.join(__dirname, '.env') });

const seededUsers = [
  { username: 'codewitharya', fullName: 'Arya Sharma', bio: 'MERN stack architect & coffee addict ☕', mood: 'Productive', skills: ['React', 'Node.js', 'MongoDB'] },
  { username: 'ai_builder', fullName: 'Ethan Hunt', bio: 'Building the next generation of neural nets 🧠', mood: 'Learning', skills: ['Python', 'TensorFlow', 'AI'] },
  { username: 'startup_nexus', fullName: 'Sarah Jenkins', bio: 'Helping founders scale from 0 to 1 🚀', mood: 'Motivational', skills: ['Business', 'Product', 'Venture'] },
  { username: 'mern_master', fullName: 'Alex Rivera', bio: 'Full-stack developer at tech giant 💻', mood: 'Productive', skills: ['MERN', 'Redis', 'Docker'] },
  { username: 'pixelmind', fullName: 'Leo V', bio: 'Digital artist creating worlds 🎨', mood: 'Calm', skills: ['UI/UX', 'Figma', 'Blender'] },
  { username: 'fitcreator', fullName: 'Marcus Strong', bio: 'Fitness & Mindset coach 🏋️‍♂️', mood: 'Motivational', skills: ['Health', 'Discipline'] },
  { username: 'nightcoder', fullName: 'Zero One', bio: 'I code while you sleep 🌙', mood: 'Productive', skills: ['C++', 'Security', 'Rust'] },
  { username: 'devgrind', fullName: 'David G', bio: '100 Days of Code challenge! Join me.', mood: 'Learning', skills: ['JS', 'HTML', 'CSS'] },
  { username: 'neuralqueen', fullName: 'Maya R', bio: 'Data Science enthusiast 📊', mood: 'Productive', skills: ['Python', 'SQL', 'Tableau'] },
  { username: 'designloop', fullName: 'Chloe D', bio: 'Simplicity is the ultimate sophistication.', mood: 'Calm', skills: ['Graphic Design', 'Typography'] },
  { username: 'techpulse', fullName: 'Ryan T', bio: 'Daily tech news and deep dives.', mood: 'Funny', skills: ['Tech News', 'Reviewing'] },
  { username: 'cryptoguru', fullName: 'Sam W', bio: 'Decentralizing the future ⛓️', mood: 'Motivational', skills: ['Solidity', 'Web3'] },
  { username: 'cyberguard', fullName: 'Alice P', bio: 'Protecting the neural network.', mood: 'Productive', skills: ['Security', 'Ethical Hacking'] },
  { username: 'growthhacker', fullName: 'Nick S', bio: 'Marketing & Data combined 📈', mood: 'Productive', skills: ['Growth', 'SEO'] },
  { username: 'logiclover', fullName: 'Ian M', bio: 'Math and logic are my languages.', mood: 'Learning', skills: ['Algorithms', 'Math'] },
  { username: 'zenmode', fullName: 'Sienna B', bio: 'Peace over everything. Yoga & Code.', mood: 'Calm', skills: ['Meditation', 'Frontend'] },
  { username: 'codehumor', fullName: 'Ben J', bio: 'Life is better with a console.log 😂', mood: 'Funny', skills: ['Debugging', 'Jokes'] },
  { username: 'futurelab', fullName: 'Dr. Orion', bio: 'Theoretical physics & AI.', mood: 'Learning', skills: ['Physics', 'Quantum'] },
  { username: 'socialtech', fullName: 'Lily K', bio: 'Humanizing the digital space.', mood: 'Motivational', skills: ['Social Media', 'Community'] },
  { username: 'mern_ninja', fullName: 'Jin H', bio: 'Shadow coding in the MERN shadows.', mood: 'Productive', skills: ['React', 'Express'] }
];

const sampleMessages = [
  "Bro finally fixed the Socket.IO issue 🔥",
  "Working on an AI social app right now. How's your project going?",
  "Try optimistic UI updates for that component. It'll feel way faster.",
  "MongoDB aggregation is killing me 💀 Need to rethink the pipeline.",
  "Late-night coding session again 🚀 The grind never stops.",
  "Need help with JWT auth? I've got a clean implementation.",
  "Just pushed to production! Neural sync established.",
  "The CSS grid layout is finally looking clean. Simple is better.",
  "Anyone up for a virtual coworking session?",
  "Found a crazy performance leak in the notification system.",
  "The collective is growing fast! Welcome to Sentient.",
  "Optimizing the neural link latency. Almost at 10ms.",
  "Deploying the new AI caption generator today. Fingers crossed!",
  "Coffee is the only dependency I really need. ☕",
  "The UI/UX on your profile looks futuristic. Great job!",
  "Is the MERN stack still king in 2024? What do you think?",
  "Debugging is like being a detective in a crime movie where you are the murderer.",
  "Growth mindset is everything. Keep building!",
  "The neural pulse is strong today. Lots of activity.",
  "Sentient is the future of human-AI connection. Glad to be here."
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Create or Update Seeded Users
    const users = [];
    for (const u of seededUsers) {
      let user = await User.findOne({ username: u.username });
      if (!user) {
        user = await User.create({
          username: u.username,
          fullName: u.fullName,
          email: `${u.username}@sentient.ai`,
          password: 'Password123!', // Standard password for seeded users
          bio: u.bio,
          avatar: `https://ui-avatars.com/api/?name=${u.fullName}&background=random&color=fff&size=256`,
          moodAnalytics: { currentMood: u.mood },
          isPro: Math.random() > 0.7,
          isOnline: Math.random() > 0.5
        });
      }
      users.push(user);
    }
    console.log(`Synced ${users.length} neural creators.`);

    // 2. Generate Conversations between them
    // We want every user to have at least 1-2 conversations
    await Message.deleteMany({ 
      $or: [
        { sender: { $in: users.map(u => u._id) } },
        { receiver: { $in: users.map(u => u._id) } }
      ]
    });
    console.log('Cleared old seeded messages.');

    const messages = [];
    for (let i = 0; i < users.length; i++) {
      const sender = users[i];
      const receiver = users[(i + 1) % users.length]; // Simple loop for seed
      
      const numMsgs = Math.floor(Math.random() * 5) + 3;
      for (let j = 0; j < numMsgs; j++) {
        messages.push({
          sender: j % 2 === 0 ? sender._id : receiver._id,
          receiver: j % 2 === 0 ? receiver._id : sender._id,
          message: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
          createdAt: new Date(Date.now() - (numMsgs - j) * 3600000), // Spaced by hours
          isRead: true
        });
      }
    }

    await Message.insertMany(messages);
    console.log(`Seeded ${messages.length} messages across ${users.length} creators.`);

    mongoose.connection.close();
  } catch (error) {
    console.error(error);
  }
};

seed();
