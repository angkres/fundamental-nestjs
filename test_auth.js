const http = require('http');

const request = (path, method, data) => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: JSON.parse(body || '{}')
        });
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

async function runTests() {
  try {
    const timestamp = Date.now();
    const username = `testuser_${timestamp}`;
    const email = `test_${timestamp}@example.com`;
    const password = 'password123';

    console.log('--- Register ---');
    const regRes = await request('/auth/register', 'POST', { username, email, password });
    console.log(regRes.statusCode, regRes.body);

    console.log('\n--- Login ---');
    const loginRes = await request('/auth/login', 'POST', { email, password });
    console.log(loginRes.statusCode, loginRes.body);

    const { access_token, refresh_token, user } = loginRes.body;
    if (!refresh_token) {
      throw new Error('No refresh token received');
    }

    console.log('\n--- Refresh Token ---');
    const refRes = await request('/auth/refresh', 'POST', { refresh_token });
    console.log(refRes.statusCode, refRes.body);

    console.log('\n--- Logout ---');
    const logoutRes = await request('/auth/logout', 'POST', { userId: user.id });
    console.log(logoutRes.statusCode, logoutRes.body);

    console.log('\n--- Refresh After Logout (Should fail) ---');
    const refFailRes = await request('/auth/refresh', 'POST', { refresh_token });
    console.log(refFailRes.statusCode, refFailRes.body);

  } catch (error) {
    console.error('Test Failed:', error);
  }
}

runTests();
