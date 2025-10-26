import React, { useState } from 'react';
import './Auth.css';
import logo from './assets/logo_nego.png';

function Login({ onLogin, onBackClick }) {
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
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://negokart-backend.onrender.com';
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
      console.error('Login error:', err);
      console.error('API_BASE:', import.meta.env.VITE_API_BASE || 'https://negokart-backend.onrender.com');
      setError(`Network error: ${err.message}`);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src={logo} alt="NegoKart" className="auth-logo" />
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your NegoKart account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              name="username" 
              value={form.username} 
              onChange={handleChange} 
              required 
              className="form-input"
              placeholder="Enter your username"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              name="password" 
              type="password" 
              value={form.password} 
              onChange={handleChange} 
              required 
              className="form-input"
              placeholder="Enter your password"
            />
          </div>
          
          <button type="submit" className="auth-button">
            Sign In
          </button>
        </form>
        
        {message && <div className="auth-message success">{message}</div>}
        {error && <div className="auth-message error">{error}</div>}
        
        <div className="auth-footer">
          <p>Don't have an account? <button onClick={onBackClick} className="auth-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Sign up here</button></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
