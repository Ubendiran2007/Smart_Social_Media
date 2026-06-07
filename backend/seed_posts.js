require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('./models/Post');
const User = require('./models/User');

// High-quality public images from Unsplash (no API key needed, direct links)
const moodContent = {
  Productive: {
    images: [
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800',
    ],
    captions: [
      'Deep in the zone. 4 hours of pure focus = 2 weeks of scattered work. 🔥 #coding #productivity',
      'Shipped 3 features today. The compound effect of consistent daily effort is real. 🚀',
      'Your environment shapes your output. Optimize your workspace, optimize your life. 💻',
      'From idea to deployed in 48 hours. This is what flow state feels like. ⚡',
      'Code review > ego. Ship it, iterate, improve. The cycle never stops. 🔄',
    ],
    hashtags: ['#coding', '#productivity', '#focus', '#startup', '#tech'],
    mood: 'Productive',
  },
  Learning: {
    images: [
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800',
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    ],
    captions: [
      'Just finished a 4-hour deep dive into neural networks. Mind = blown. 🧠 #AI #machinelearning',
      'Reading 30 pages a day = 12 books a year. Small habits, massive compounding. 📚',
      'TypeScript generics finally clicked. That feeling when it all makes sense. ✨',
      'Today\'s tutorial: Building a full REST API from scratch. Notes thread below. 👇',
      'Learning in public is the fastest way to grow. Sharing my journey here. 🌱',
    ],
    hashtags: ['#learning', '#education', '#AI', '#MERN', '#tutorial'],
    mood: 'Learning',
  },
  Calm: {
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800',
      'https://images.unsplash.com/photo-1540206395-68808572332f?w=800',
      'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=800',
    ],
    captions: [
      'Morning hike at 5AM. The world is quiet and everything is possible. 🌅 #nature #mindfulness',
      'Presence > productivity. Sometimes the most important thing is to just breathe. 🌿',
      'A quiet Sunday morning with coffee and no notifications. Pure luxury. ☕',
      'Nature has this way of making your biggest problems feel very small. 🏔️',
      'Slowing down isn\'t giving up. It\'s recharging so you can give more. 🧘',
    ],
    hashtags: ['#calm', '#nature', '#mindfulness', '#wellness', '#travel'],
    mood: 'Calm',
  },
  Motivational: {
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
      'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=800',
      'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    ],
    captions: [
      'The gap between who you are and who you want to be is where the work lives. Get in there. 💪',
      '365 days of 1% improvement = 37x better by year end. Consistency is the only cheat code. 🏋️',
      'Nobody who ever gave their best regretted it. Ever. Go all in today. 🔥',
      'Your future self is watching you decide right now. Make it count. 👊',
      'Winners don\'t wait for the right moment. They create it. Rise up. ⚡',
    ],
    hashtags: ['#motivation', '#fitness', '#discipline', '#success', '#mindset'],
    mood: 'Motivational',
  },
  Funny: {
    images: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      'https://images.unsplash.com/photo-1537498425277-c283d32ef9db?w=800',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
      'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=800',
    ],
    captions: [
      'Me: I\'ll fix this one bug. Also me at 3AM: why does removing a semicolon break the universe? 😭',
      'The confidence of pushing to production on a Friday. We do not make mistakes, we make features. 🚢',
      'Senior dev tip: Google is not cheating, it\'s research. Embrace the research. 🔍',
      'Documentation: We\'ll write it later. Later: *has left the chat* 😂 #devlife',
      'Stack Overflow has solved more problems than any CS degree. The receipts don\'t lie. 💅',
    ],
    hashtags: ['#funny', '#devmemes', '#coding', '#humor', '#tech'],
    mood: 'Funny',
  },
};

const seedPosts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to DB. Seeding posts...');

    await Post.deleteMany({});
    console.log('🗑  Old posts cleared.');

    const user = await User.findOne();
    if (!user) throw new Error('No user found in DB!');

    const allPosts = [];
    for (const [moodKey, data] of Object.entries(moodContent)) {
      console.log(`\n--- Seeding ${moodKey} posts ---`);
      for (let i = 0; i < 20; i++) {
        const imgIdx = i % data.images.length;
        const capIdx = i % data.captions.length;
        allPosts.push({
          user: user._id,
          image: data.images[imgIdx],
          caption: data.captions[capIdx],
          aiMetadata: {
            sentiment: 'Positive',
            toxicityScore: 0,
            hashtags: data.hashtags,
            keywords: [moodKey.toLowerCase(), 'sentient', 'ai'],
            emotionCategory: data.mood,
          },
          likes: [],
          comments: [],
          views: Math.floor(Math.random() * 800),
        });
      }
      console.log(`   ✅ Queued 20 ${moodKey} posts`);
    }

    await Post.insertMany(allPosts);
    console.log(`\n✅ Seeding complete! ${allPosts.length} posts inserted across all moods.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seedPosts();
