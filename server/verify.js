// Using global fetch

async function testAPI() {
  console.log('--- Starting Programmatic API Verification ---');
  
  try {
    // 1. Test health check
    const healthRes = await fetch('http://localhost:5001/health');
    const healthData = await healthRes.json();
    console.log('✔ Health Check:', healthData.status);

    // 2. Test Login
    const loginRes = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'faculty123',
        password: 'faculty123',
        role: 'faculty'
      })
    });
    
    if (!loginRes.ok) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }
    
    const loginData = await loginRes.json();
    console.log('✔ Authentication Successful!');
    console.log(`  Token received: ${loginData.token.substring(0, 20)}...`);
    console.log(`  User role: ${loginData.role}`);
    console.log(`  Name: ${loginData.name}`);

    // 3. Test Retrieve Profile
    const profileRes = await fetch('http://localhost:5001/api/faculty/personal', {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    
    if (!profileRes.ok) {
      throw new Error(`Profile fetch failed with status ${profileRes.status}`);
    }

    const profileData = await profileRes.json();
    console.log('✔ Personal Profile Retrieved!');
    console.log(`  Name: ${profileData[0].staff_name}`);
    console.log(`  Mobile: ${profileData[0].mobile}`);
    console.log(`  Email: ${profileData[0].email}`);

    console.log('--- All Programmatic API Checks Passed! ---');
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification Failed:', err.message);
    process.exit(1);
  }
}

testAPI();
