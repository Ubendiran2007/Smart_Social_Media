const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Reel = require('./models/Reel');
const User = require('./models/User');

dotenv.config();

const sampleVideos = [
  'https://assets.mixkit.co/videos/preview/mixkit-working-at-a-coffee-shop-with-a-laptop-4690-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-at-home-4752-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-woman-working-on-laptop-at-home-4750-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-young-man-typing-on-his-laptop-keyboard-4702-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-man-typing-on-a-laptop-keyboard-4701-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-man-in-the-gym-lifting-weights-23136-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-man-lifting-weights-in-a-gym-23133-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-meditation-in-a-park-on-a-sunny-day-23214-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-water-flowing-down-a-river-in-slow-motion-23226-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-man-drinking-coffee-and-working-on-his-laptop-4708-large.mp4'
];

const reelData = [
  { caption: "Building my startup at 2AM 🚀", category: "Productive" },
  { caption: "MERN stack grind never stops 💻", category: "Learning" },
  { caption: "Discipline > Motivation", category: "Motivational" },
  { caption: "AI will change everything 🤖", category: "Learning" },
  { caption: "Day 45 of coding challenge 🔥", category: "Productive" },
  { caption: "POV: Debugging for 4 hours", category: "Funny" },
  { caption: "Gym + Coding = Best combo", category: "Motivational" },
  { caption: "Late night productivity mode ⚡", category: "Productive" },
  { caption: "Morning flow: Coffee and Code ☕", category: "Productive" },
  { caption: "Just pushed my first feature to production! 🎉", category: "Productive" },
  { caption: "Deep work session. No distractions. 📵", category: "Calm" },
  { caption: "React hooks are a game changer ⚓", category: "Learning" },
  { caption: "Stretching after 8 hours of sitting 🧘‍♂️", category: "Calm" },
  { caption: "When the CSS finally centers the div 😂", category: "Funny" },
  { caption: "Focus on the process, not the outcome.", category: "Motivational" },
  { caption: "Learning Next.js today! 🚀", category: "Learning" },
  { caption: "My desk setup for 2026 🖥️", category: "Productive" },
  { caption: "Startup life: Highs and Lows", category: "Motivational" },
  { caption: "Meditation before coding session 🧠", category: "Calm" },
  { caption: "The bug was a typo. Always is. 🙄", category: "Funny" },
  { caption: "consistency is the key to mastery 🔑", category: "Motivational" },
  { caption: "Building Sentient step by step 🧠", category: "Productive" },
  { caption: "Why I love TypeScript 🛡️", category: "Learning" },
  { caption: "Quiet mornings in the city 🏙️", category: "Calm" },
  { caption: "How to stay motivated while solo coding", category: "Motivational" },
  { caption: "My coding playlist is 10 hours long 🎶", category: "Funny" },
  { caption: "Don't stop until you're proud.", category: "Motivational" },
  { caption: "VS Code themes that I use 🎨", category: "Learning" },
  { caption: "Power nap for productivity 😴", category: "Productive" },
  { caption: "Nature walk to clear the mind 🌲", category: "Calm" },
  { caption: "Building an AI assistant from scratch 🤖", category: "Learning" },
  { caption: "The feeling of a clean codebase ✨", category: "Productive" },
  { caption: "Coding with a view 🌊", category: "Calm" },
  { caption: "Me explaining code to my rubber duck 🦆", category: "Funny" },
  { caption: "Small wins every day.", category: "Motivational" },
  { caption: "Dockerizing everything! 🐳", category: "Learning" },
  { caption: "Pomodoro technique in action ⏲️", category: "Productive" },
  { caption: "Rainy days are for coding 🌧️", category: "Calm" },
  { caption: "Success is a series of small steps.", category: "Motivational" },
  { caption: "When the API works on the first try 😱", category: "Funny" },
  { caption: "Optimizing MongoDB queries today 📊", category: "Learning" },
  { caption: "Sunday morning study session 📖", category: "Learning" },
  { caption: "Stay hungry, stay foolish. 🍎", category: "Motivational" },
  { caption: "Backend logic is art 🎭", category: "Productive" },
  { caption: "Sunset vibes and chill lo-fi 🌅", category: "Calm" },
  { caption: "Debugging my life like a senior dev 🛠️", category: "Funny" },
  { caption: "Never stop learning. 🎓", category: "Motivational" },
  { caption: "Scaling to 1M users architecture 📈", category: "Learning" },
  { caption: "Keyboard sounds for focus ⌨️", category: "Calm" },
  { caption: "Coffee. Code. Sleep. Repeat. 🔁", category: "Funny" }
];

const seedReels = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find();
    if (users.length === 0) {
      console.log('No users found. Please seed users first.');
      process.exit(1);
    }

    // Clear existing reels (optional)
    // await Reel.deleteMany({});
    // console.log('Existing reels cleared');

    const reels = [];

    for (let i = 0; i < 50; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomVideo = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];
      const data = reelData[i % reelData.length];

      // Random Likes
      const likesCount = Math.floor(Math.random() * 500);
      const likes = [];
      for (let j = 0; j < likesCount; j++) {
        likes.push({ user: users[Math.floor(Math.random() * users.length)]._id });
      }

      // Random Comments
      const commentsCount = Math.floor(Math.random() * 50);
      const comments = [];
      for (let j = 0; j < commentsCount; j++) {
        comments.push({
          user: users[Math.floor(Math.random() * users.length)]._id,
          text: `Awesome reel! ${['🔥', '🚀', '🙌', '💯', '👏'][Math.floor(Math.random() * 5)]}`,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000))
        });
      }

      reels.push({
        user: randomUser._id,
        video: randomVideo,
        caption: data.caption,
        emotionCategory: data.category,
        likes,
        comments,
        views: Math.floor(Math.random() * 5000) + 100,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000))
      });
    }

    await Reel.insertMany(reels);
    console.log('50 Reels successfully seeded! 🚀');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding reels:', error);
    process.exit(1);
  }
};

seedReels();
