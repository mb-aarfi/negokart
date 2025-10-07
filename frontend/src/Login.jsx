import React, { useState } from 'react';

function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://negokart-1.onrender.com';
      const params = new URLSearchParams();
      params.append('username', form.username);
      params.append('password', form.password);
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Login successful!');
        localStorage.setItem('token', data.access_token);
        if (onLogin) onLogin(data.access_token);
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label><br />
          <input name="username" value={form.username} onChange={handleChange} required />
        </div>
        <div>
          <label>Password:</label><br />
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </div>
        <button type="submit" style={{ marginTop: 12 }}>Login</button>
      </form>
      {message && <div style={{ color: 'green', marginTop: 10 }}>{message}</div>}
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
    </div>
  );
}

export default Login;
