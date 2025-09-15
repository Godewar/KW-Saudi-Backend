import axios from 'axios';

const BASE_URL = 'https://kw-saudi-backend-4.onrender.com/api';

// Test registration
async function testRegistration() {
  try {
    console.log('Testing registration...');
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'Test',
      lastName: 'Admin',
      email: 'test@admin.com',
      phoneNumber: '1234567890',
      password: 'password123'
    });
    
    console.log('Registration successful:', response.data);
    return response.data.Token;
  } catch (error) {
    console.error('Registration failed:', error.response?.data || error.message);
    return null;
  }
}

// Test login
async function testLogin() {
  try {
    console.log('Testing login...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      phoneNumber: '1234567890',
      password: 'password123'
    });
    
    console.log('Login successful:', response.data);
    return response.data.Token;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    return null;
  }
}

// Test profile with token
async function testProfile(token) {
  try {
    console.log('Testing profile...');
    const response = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Profile successful:', response.data);
  } catch (error) {
    console.error('Profile failed:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  console.log('Starting authentication tests...\n');
  
  // Test registration
  const token = await testRegistration();
  
  if (token) {
    console.log('\n---\n');
    // Test profile with registration token
    await testProfile(token);
  }
  
  console.log('\n---\n');
  // Test login
  const loginToken = await testLogin();
  
  if (loginToken) {
    console.log('\n---\n');
    // Test profile with login token
    await testProfile(loginToken);
  }
  
  console.log('\nTests completed!');
}

runTests();
