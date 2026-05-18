const axios = require('axios');

const testApi = async () => {
  const payload = {
    username: 'api_test_' + Date.now(),
    email: 'api_' + Date.now() + '@sentient.io',
    password: 'password123',
    fullName: 'API Test User'
  };

  try {
    console.log('Sending POST to /api/auth/register...');
    const res = await axios.post('http://localhost:5000/api/auth/register', payload);
    console.log('Response Status:', res.status);
    console.log('Response Data:', JSON.stringify(res.data, null, 2));
    
    if (res.data.success) {
        console.log('API Registration SUCCESS');
    }
  } catch (err) {
    console.error('API Registration FAILED');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Error:', err.message);
    }
  }
};

testApi();
