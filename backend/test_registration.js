const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to:', mongoose.connection.name);
    
    const countBefore = await User.countDocuments();
    console.log('Users before:', countBefore);

    const testUser = {
      username: 'automated_test_' + Date.now(),
      email: 'test_' + Date.now() + '@sentient.io',
      password: 'password123',
      fullName: 'Automated Test User'
    };

    console.log('Attempting to create user:', testUser.username);
    const user = await User.create(testUser);
    console.log('Created user with ID:', user._id);

    const countAfter = await User.countDocuments();
    console.log('Users after:', countAfter);

    const retrieved = await User.findById(user._id);
    console.log('Retrieved user from DB:', retrieved ? 'SUCCESS' : 'FAILURE');

    if (retrieved) {
      console.log('User details match:', retrieved.username === testUser.username);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Test Failed:', err);
  }
};

test();
