import React, { useState } from 'react';

function Register() {
  const [form, setForm] = useState({ username: '', password: '', role: 'retailer' });
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
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'; 
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setForm({ username: '', password: '', role: 'retailer' });
      } else {
        setError(data.detail || 'Registration failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label><br />
          <input name="username" value={form.username} onChange={handleChange} required />
        </div>
        <div>
          <label>Password:</label><br />
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </div>
        <div>
          <label>Role:</label><br />
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="retailer">Retailer</option>
            <option value="wholesaler">Wholesaler</option>
          </select>
        </div>
        <button type="submit" style={{ marginTop: 12 }}>Register</button>
      </form>
      {message && <div style={{ color: 'green', marginTop: 10 }}>{message}</div>}
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
    </div>
  );
}

export default Register;
