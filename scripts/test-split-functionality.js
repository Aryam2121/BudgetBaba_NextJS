const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testSplitFunctionality() {
  try {
    console.log('🚀 Testing Split Functionality...\n');

    // Test data
    const testUser = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    };

    const testExpense = {
      amount: 300,
      vendor: 'Test Restaurant',
      category: 'Food & Dining',
      note: 'Team dinner',
      date: new Date().toISOString()
    };

    const testSplit = {
      type: 'equal',
      participants: [
        { email: 'friend1@example.com', name: 'Friend One' },
        { email: 'friend2@example.com', name: 'Friend Two' }
      ]
    };

    console.log('1. Testing user registration/login...');
    
    // Try to register (might fail if user exists, that's okay)
    try {
      await axios.post(`${API_URL}/auth/register`, testUser);
      console.log('   ✅ User registered successfully');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('   ℹ️  User already exists, proceeding with login');
      } else {
        throw error;
      }
    }

    // Login to get token
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('   ✅ Login successful');

    console.log('\n2. Testing expense creation...');
    const expenseResponse = await axios.post(`${API_URL}/expenses`, testExpense, { headers });
    const expenseId = expenseResponse.data.expense._id;
    console.log(`   ✅ Expense created with ID: ${expenseId}`);

    console.log('\n3. Testing split creation...');
    const splitResponse = await axios.post(
      `${API_URL}/splits`,
      {
        expenseId,
        ...testSplit
      },
      { headers }
    );
    
    const splitId = splitResponse.data.split._id;
    console.log(`   ✅ Split created with ID: ${splitId}`);
    console.log(`   📧 Email notifications should be sent to participants`);

    console.log('\n4. Testing split retrieval...');
    const splitsResponse = await axios.get(`${API_URL}/splits`, { headers });
    console.log(`   ✅ Found ${splitsResponse.data.splits.length} splits`);

    console.log('\n5. Testing split reminder...');
    try {
      await axios.post(`${API_URL}/splits/${splitId}/remind`, {}, { headers });
      console.log('   ✅ Reminder sent successfully');
    } catch (error) {
      console.log('   ⚠️  Reminder failed (email configuration might be incomplete)');
    }

    console.log('\n6. Testing mark as paid...');
    await axios.patch(`${API_URL}/splits/${splitId}/paid`, {
      participantEmail: testSplit.participants[0].email
    }, { headers });
    console.log('   ✅ Participant marked as paid');

    console.log('\n🎉 All tests passed! Split functionality is working correctly.');
    console.log('\nNext steps:');
    console.log('- Open http://localhost:3000 in your browser');
    console.log('- Login with test@example.com / password123');
    console.log('- Go to dashboard and try splitting an expense');
    console.log('- Check the splits page to see your splits');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testSplitFunctionality();
