const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const randomizeFollows = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find();
    
    for (const user of users) {
      // Each user follows 2-3 other random users
      const others = users.filter(u => u._id.toString() !== user._id.toString());
      const toFollow = others.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 2);
      
      user.following = toFollow.map(u => u._id);
      await user.save();
      
      for (const target of toFollow) {
        if (!target.followers.includes(user._id)) {
          target.followers.push(user._id);
          await target.save();
        }
      }
      console.log(`Updated follows for ${user.username}`);
    }

    console.log('Social graph randomized! 🕸️');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error randomizing follows:', error);
    process.exit(1);
  }
};

randomizeFollows();
