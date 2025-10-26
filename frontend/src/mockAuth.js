// Mock authentication system for development/testing
// This provides a fallback when the backend is not working properly

const MOCK_USERS = [
  { username: 'retailer', password: 'retailer123', role: 'retailer' },
  { username: 'wholesaler', password: 'wholesaler123', role: 'wholesaler' },
  { username: 'testuser', password: 'testpass', role: 'retailer' }
];

// Simple JWT-like token generation (not secure, for demo only)
function generateMockToken(user) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: user.username,
    role: user.role,
    user_id: user.username === 'retailer' ? 1 : 2,
    exp: Date.now() / 1000 + 86400 // 24 hours
  }));
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
}

function parseMockToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

export function mockLogin(username, password) {
  const user = MOCK_USERS.find(u => u.username === username && u.password === password);
  if (user) {
    const token = generateMockToken(user);
    return {
      success: true,
      token,
      user: { username: user.username, role: user.role }
    };
  }
  return { success: false, error: 'Invalid username or password' };
}

export function mockRegister(username, password, role) {
  // Check if user already exists
  if (MOCK_USERS.find(u => u.username === username)) {
    return { success: false, error: 'Username already exists' };
  }
  
  // Add new user to mock database
  const newUser = { username, password, role };
  MOCK_USERS.push(newUser);
  
  return { success: true, message: 'User registered successfully' };
}

export function mockVerifyToken(token) {
  const payload = parseMockToken(token);
  if (!payload || payload.exp < Date.now() / 1000) {
    return null;
  }
  return payload;
}

export function isBackendWorking() {
  // This could be enhanced to actually test the backend
  return false; // For now, assume backend is not working
}
