const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const User = require('./models/User');
const Post = require('./models/Post');
const Reel = require('./models/Reel');
const Story = require('./models/Story');

dotenv.config({ path: path.join(__dirname, '.env') });

const MOODS = ['Productive', 'Motivational', 'Calm', 'Learning', 'Funny'];

const contentData = {
  Productive: {
    captions: [
      "Late-night MERN debugging 💻", "Optimizing my Docker containers today.", "The grind never stops. #Productivity", 
      "Deep work session starting now.", "Clean code is happy code.", "Building the future, one line at a time.",
      "MERN stack architect at work.", "System design session with the team.", "Refactoring the legacy codebase.",
      "Morning coffee and Jira tickets.", "Finally solved that tricky race condition.", "Writing unit tests because I care.",
      "Deployment day! Neural sync established.", "Kubernetes orchestration feels like magic.", "Frontend performance optimization.",
      "Backend scalability deep dive.", "Cloud infrastructure as code.", "Developer productivity hacks.",
      "100 days of code - Day 45.", "Mastering the terminal shortcuts."
    ],
    hashtags: ["#Coding", "#Developer", "#Productive", "#Build", "#MERN"],
    images: ["https://images.unsplash.com/photo-1498050108023-c5249f4df085", "https://images.unsplash.com/photo-1461749280684-dccba630e2f6", "https://images.unsplash.com/photo-1517694712202-14dd9538aa97"],
    videos: ["https://www.w3schools.com/html/mov_bbb.mp4"] // Placeholder stable videos
  },
  Motivational: {
    captions: [
      "Keep pushing your limits. 🚀", "Success is a journey, not a destination.", "Consistency is the key to greatness.",
      "Wake up with determination.", "Don't stop until you're proud.", "Your only limit is your mind.",
      "Hustle in silence, let success be your noise.", "Dream big. Work hard. Stay focused.", "Every expert was once a beginner.",
      "Believe in yourself and you're halfway there.", "Transform your dreams into reality.", "Discipline will take you where motivation can't.",
      "Choose to be extraordinary.", "The best way to predict the future is to create it.", "Small steps every day lead to big results.",
      "Strength grows in the struggle.", "Embrace the challenge.", "Mindset is everything.",
      "Success requires sacrifice.", "Unleash your inner potential."
    ],
    hashtags: ["#Hustle", "#Mindset", "#Success", "#Grind", "#Growth"],
    images: ["https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438", "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5"],
    videos: ["https://www.w3schools.com/html/horse.mp4"]
  },
  Calm: {
    captions: [
      "Finding peace in the chaos. 🌿", "Just breathe. Zen mode engaged.", "The beauty of a quiet morning.",
      "Mindfulness is the path to clarity.", "Let your soul rest.", "Aesthetic vibes and calm minds.",
      "Slow down and appreciate the moment.", "Inner peace is the new success.", "Nature's therapy is the best therapy.",
      "Calm is a superpower.", "Meditation session complete.", "The world is quiet for a second.",
      "Soft light and gentle thoughts.", "Disconnect to reconnect.", "Serenity in the small things.",
      "Gentle breeze and golden hour.", "Finding balance in life.", "Quiet growth is still growth.",
      "Peaceful evening at home.", "Mindful living, mindful coding."
    ],
    hashtags: ["#Zen", "#Peace", "#Calm", "#Mindful", "#Balance"],
    images: ["https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5", "https://images.unsplash.com/photo-1445510861639-5651173bc5d5", "https://images.unsplash.com/photo-1473081556163-2a17de81fc97"],
    videos: ["https://www.w3schools.com/html/mov_bbb.mp4"]
  },
  Learning: {
    captions: [
      "New AI tutorial dropping soon! 🧠", "Mastering React hooks in 2024.", "Learning something new every single day.",
      "Database indexing explained simply.", "How to build a scalable API.", "The art of prompt engineering.",
      "Neural networks from scratch.", "Why you should learn Rust.", "Mastering CSS grid and flexbox.",
      "Algorithms and data structures practice.", "Clean architecture patterns.", "The future of web development.",
      "Learning from my mistakes is my superpower.", "Deep dive into TypeScript.", "GraphQL vs Rest API.",
      "The power of serverless functions.", "Cybersecurity basics for devs.", "Web3 development roadmap.",
      "AI in the workspace.", "Continuous learning is the way."
    ],
    hashtags: ["#Learn", "#Tutorial", "#AI", "#Coding", "#Education"],
    images: ["https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8", "https://images.unsplash.com/photo-1503676260728-1c00da094a0b", "https://images.unsplash.com/photo-1434030216411-0b793f4b4173"],
    videos: ["https://www.w3schools.com/html/horse.mp4"]
  },
  Funny: {
    captions: [
      "When the code finally works on Friday at 5 PM 😂", "It worked on my machine.", "Senior dev watching a junior dev deploy.",
      "My code doesn't have bugs, it has unexpected features.", "Me explaining my code to the rubber duck.", "The real reason the server is down.",
      "Frontend vs Backend developers.", "When you forget the semicolon.", "The joy of a green test suite.",
      "Stack Overflow is my co-pilot.", "Code review be like...", "I don't always test my code, but when I do, I do it in production.",
      "CSS is hard, okay?", "The 7 stages of debugging.", "How users actually use your app.",
      "That one friend who says 'It's just a simple fix'.", "Merging 500 files with 0 conflicts.", "The life of a software engineer.",
      "Meme of the day for devs.", "Why dark mode is superior."
    ],
    hashtags: ["#Meme", "#Funny", "#Developer", "#Vibes", "#Humor"],
    images: ["https://images.unsplash.com/photo-1531259683007-016a7b628fc3", "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2", "https://images.unsplash.com/photo-1522071820081-009f0129c71c"],
    videos: ["https://www.w3schools.com/html/mov_bbb.mp4"]
  }
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find().limit(20);
    if (users.length === 0) {
      console.log('No users found. Seed users first.');
      process.exit(1);
    }

    // Clear existing content to avoid noise for demo
    await Post.deleteMany({});
    await Reel.deleteMany({});
    await Story.deleteMany({});
    console.log('Cleared old mood content.');

    const posts = [];
    const reels = [];
    const stories = [];

    for (const mood of MOODS) {
      const data = contentData[mood];
      console.log(`Seeding ${mood} frequency...`);

      for (let i = 0; i < 20; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        
        // Post
        posts.push({
          user: user._id,
          caption: data.captions[i % data.captions.length],
          image: data.images[i % data.images.length] + `?sig=${mood}-${i}`,
          aiMetadata: {
            hashtags: data.hashtags,
            keywords: data.hashtags.map(h => h.replace('#', '')),
            emotionCategory: mood,
            sentiment: mood === 'Funny' ? 'Positive' : 'Neutral'
          }
        });

        // Reel
        reels.push({
          user: user._id,
          video: i % 2 === 0 ? "https://www.w3schools.com/html/mov_bbb.mp4" : "https://www.w3schools.com/html/horse.mp4",
          caption: data.captions[i % data.captions.length],
          aiMetadata: {
            hashtags: data.hashtags,
            keywords: data.hashtags.map(h => h.replace('#', '')),
            emotionCategory: mood
          }
        });

        // Story
        stories.push({
          user: user._id,
          media: data.images[i % data.images.length] + `?sig=story-${mood}-${i}`,
          mediaType: 'image',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          aiMetadata: {
            hashtags: data.hashtags,
            keywords: data.hashtags.map(h => h.replace('#', '')),
            emotionCategory: mood
          }
        });
      }
    }

    await Post.insertMany(posts);
    await Reel.insertMany(reels);
    await Story.insertMany(stories);

    console.log(`Successfully seeded:`);
    console.log(`- ${posts.length} Mood-based Posts`);
    console.log(`- ${reels.length} Mood-based Reels`);
    console.log(`- ${stories.length} Mood-based Stories`);

    mongoose.connection.close();
  } catch (error) {
    console.error(error);
  }
};

seed();
