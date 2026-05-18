const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');
const Reel = require('./models/Reel');
const Story = require('./models/Story');
const Notification = require('./models/Notification');

dotenv.config();

const moods = ['Productive', 'Motivational', 'Calm', 'Learning', 'Funny'];

const firstNames = ['Alex', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Ryan', 'Ashley', 'James', 'Linda', 'Robert', 'Karen', 'William', 'Nancy', 'Joseph', 'Betty', 'Thomas', 'Lisa', 'Christopher', 'Sandra', 'Daniel', 'Donna', 'Paul', 'Carol', 'Mark', 'Ruth', 'Donald', 'Sharon', 'George', 'Michelle', 'Kenneth', 'Laura', 'Steven', 'Sarah', 'Edward', 'Kimberly', 'Brian', 'Deborah', 'Ronald', 'Jessica'];
const lastNames = ['Chen', 'Garcia', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker'];

const sampleAvatars = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400&h=400&fit=crop'
];

const moodImages = {
  Productive: [
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000&q=80',
    'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=1000&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1000&q=80',
    'https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=1000&q=80'
  ],
  Motivational: [
    'https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=1000&q=80',
    'https://images.unsplash.com/photo-1472289065668-ce6a9a442c6a?w=1000&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&q=80'
  ],
  Calm: [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1000&q=80',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1000&q=80',
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1000&q=80'
  ],
  Learning: [
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1000&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1000&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&q=80',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=1000&q=80'
  ],
  Funny: [
    'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=1000&q=80',
    'https://images.unsplash.com/photo-1455134168668-40679bc297dd?w=1000&q=80',
    'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=1000&q=80',
    'https://images.unsplash.com/photo-1504006833117-8886a355efbf?w=1000&q=80'
  ]
};

const sampleVideos = [
  'https://player.vimeo.com/external/370331493.sd.mp4?s=7b23315a13346765796a5d487f3801201584c01e&profile_id=139&oauth2_token_id=57447761',
  'https://player.vimeo.com/external/517090025.sd.mp4?s=f0282496a77d17e75451e067c2d1b0696c70387b&profile_id=139&oauth2_token_id=57447761',
  'https://player.vimeo.com/external/494252666.sd.mp4?s=7220fc5936719129bc6287538f5370f171097486&profile_id=139&oauth2_token_id=57447761',
  'https://player.vimeo.com/external/363345402.sd.mp4?s=12404f69911964599723f5451a44e5531d044275&profile_id=139&oauth2_token_id=57447761',
  'https://player.vimeo.com/external/403445585.sd.mp4?s=7b949280d96d74f26b5239e39e557f92027b689f&profile_id=139&oauth2_token_id=57447761'
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for Mega Seeding');

    // 1. Clear existing data
    await User.deleteMany({ $or: [{ isSeeded: true }, { email: 'admin@sentient.io' }] });
    await Post.deleteMany({});
    await Reel.deleteMany({});
    await Story.deleteMany({});
    await Notification.deleteMany({});
    console.log('Database cleared (Seeded content only)');

    // 2. Create 50 Users
    const users = [];
    const password = await bcrypt.hash('password123', 10);
    
    const bios = [
      "MERN Stack Developer | Neural Network Enthusiast 🧠",
      "AI Researcher @ DeepTech | Scaling human intelligence.",
      "UI/UX Architect | Designing the future of digital interactions.",
      "Startup Founder | Building at the speed of thought. 🚀",
      "Productivity Creator | Optimizing the human experience.",
      "Full Stack Engineer | Coffee, Code, and Complexity.",
      "Graphic Designer | Pixel perfection in a blurred world.",
      "Fitness Coach & Techie | Strong body, stronger code.",
      "Cloud Architect | Floating in the AWS infrastructure.",
      "Data Scientist | Turning noise into neural insights."
    ];

    const allSkills = ['React', 'Node.js', 'Python', 'TypeScript', 'TensorFlow', 'Figma', 'AWS', 'MongoDB', 'Go', 'Rust', 'Docker', 'Kubernetes'];
    const allInterests = ['AI', 'Productivity', 'Design', 'Startup', 'Gaming', 'Fitness', 'Meditation', 'Web3', 'Blockchain', 'Nature'];

    for (let i = 0; i < 55; i++) {
      const fName = firstNames[i % firstNames.length];
      const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${fName} ${lName}`;
      // Guarantee uniqueness with index i
      const username = `${fName.toLowerCase()}_${i}_${Math.floor(Math.random()*99)}`;
      
      users.push({
        username,
        email: `${username}@sentient.io`,
        password,
        fullName,
        isSeeded: true,
        bio: bios[i % bios.length],
        avatar: sampleAvatars[i % sampleAvatars.length],
        interests: [allInterests[i % allInterests.length], allInterests[(i + 2) % allInterests.length]],
        professionalProfile: {
          skills: [allSkills[i % allSkills.length], allSkills[(i + 3) % allSkills.length]],
          techBadges: i % 2 === 0 ? ['Neural Pioneer'] : ['Top Sync']
        },
        moodAnalytics: {
          currentMood: moods[i % moods.length],
          burnoutIndex: Math.floor(Math.random() * 50)
        }
      });
    }

    const createdUsers = await User.insertMany(users);
    console.log(`${createdUsers.length} Users created with unique realistic names`);

    if (!createdUsers || createdUsers.length === 0) {
      throw new Error("Failed to create users");
    }

    // 3. Create Reels
    const reels = [];
    const reelCaptions = {
      Productive: ["Deep work session ⌨️", "Optimizing the backend 🛡️", "Focus mode: ON", "Building the future of AI", "Scaling systems to 1M+ users"],
      Motivational: ["Discipline > Motivation 🔥", "Small steps every day", "Don't stop until you're proud", "Consistency is the key", "Mindset is everything"],
      Calm: ["Nature walk to clear the mind 🌲", "Meditation before coding", "Lofi vibes and clear code", "Quiet mornings in the city", "Atmospheric coding environment"],
      Learning: ["React hooks are magic ⚓", "Learning Rust today!", "AI will change everything", "Mastering the MERN stack", "Exploring new digital frontiers"],
      Funny: ["Debugging for 4 hours... it was a typo 🙄", "Me explaining code to my rubber duck 🦆", "CSS finally centered the div! 😂", "When the API works on first try 😱", "Coding at 3AM like..."]
    };

    for (const mood of moods) {
      for (let j = 0; j < 22; j++) {
        const creator = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        reels.push({
          user: creator._id,
          video: sampleVideos[Math.floor(Math.random() * sampleVideos.length)],
          caption: reelCaptions[mood][j % reelCaptions[mood].length] + " #" + mood,
          emotionCategory: mood,
          likes: Array.from({ length: Math.floor(Math.random() * 20) }, () => ({ user: createdUsers[Math.floor(Math.random() * createdUsers.length)]._id })),
          views: Math.floor(Math.random() * 5000),
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 100000000))
        });
      }
    }
    await Reel.insertMany(reels);
    console.log('110 Reels created');

    // 4. Create Stories
    const stories = [];
    for (let i = 0; i < 35; i++) {
      const creator = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const mood = moods[i % moods.length];
      stories.push({
        user: creator._id,
        media: moodImages[mood][i % moodImages[mood].length],
        mediaType: 'image',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    }
    await Story.insertMany(stories);
    console.log('35 Stories created');

    // 5. Create Posts with mood-specific content
    const posts = [];
    const moodCaptions = {
      Productive: ["The grind never stops. Building the next-gen neural engine today. #code #ai", "Late night sessions are the most productive ones.", "Clean code is like poetry.", "Setting up the perfect workspace for deep work."],
      Motivational: ["Your only limit is your mind. Keep pushing forward.", "Dream big, work hard, stay focused.", "Success is not final, failure is not fatal.", "Consistency over everything."],
      Calm: ["Finding peace in the chaos of modern life. #zen #calm", "Evening reflections by the lake.", "Nature is the best healer.", "Quiet moments, clear thoughts."],
      Learning: ["Just finished mastering the new React 19 features! ⚓", "Lifelong learning is the only way to stay relevant.", "Knowledge is power.", "New tech stack, who dis?"],
      Funny: ["Is it a bug or a feature? Depends on who's asking. 😂", "My code works! I don't know why, but it works!", "Expectation vs Reality: Web Development edition.", "Coffee. Code. Sleep. Repeat."]
    };

    for (let i = 0; i < 50; i++) {
      const creator = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const mood = moods[i % moods.length];
      posts.push({
        user: creator._id,
        image: moodImages[mood][i % moodImages[mood].length],
        caption: moodCaptions[mood][i % moodCaptions[mood].length],
        aiMetadata: {
          sentiment: 'Positive',
          moodCategory: mood,
          suggestedHashtags: [mood, 'Sentient', 'TechLife']
        }
      });
    }
    await Post.insertMany(posts);
    console.log('50 Posts created with mood-matched content');

    const finalUsers = await User.countDocuments();
    const finalPosts = await Post.countDocuments();
    const finalReels = await Reel.countDocuments();
    const finalStories = await Story.countDocuments();

    console.log('--- Final Stats ---');
    console.log('Users:', finalUsers);
    console.log('Posts:', finalPosts);
    console.log('Reels:', finalReels);
    console.log('Stories:', finalStories);
    console.log('-------------------');

    console.log('Mega Seeding Complete! 🚀 Ecosystem is now fully populated.');
    process.exit(0);
  } catch (error) {
    console.error('Mega Seeding Failed:', error);
    process.exit(1);
  }
};

seedData();
