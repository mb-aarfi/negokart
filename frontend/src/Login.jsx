import React, { useState } from 'react';
import './Auth.css';
import logo from './assets/logo_nego.png';
import { mockLogin, isBackendWorking } from './mockAuth';

function Login({ onLogin, onBackClick }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const testConnection = async () => {
    const API_BASE = import.meta.env.VITE_API_BASE || 'https://negokart-backend-8pt9.onrender.com';
    try {
      console.log('Testing connection to:', API_BASE);
      const response = await fetch(`${API_BASE}/health`);
      const data = await response.json();
      console.log('Health check response:', data);
      return true;
    } catch (err) {
      console.error('Connection test failed:', err);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    // Test connection first
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.log('Backend not available, trying mock authentication...');
      
      // Try mock authentication as fallback
      const mockResult = mockLogin(form.username, form.password);
      if (mockResult.success) {
        setMessage('Login successful! (Using demo mode)');
        localStorage.setItem('token', mockResult.token);
        if (onLogin) onLogin(mockResult.token);
        return;
      } else {
        setError(mockResult.error || 'Invalid username or password');
        return;
      }
    }
    
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://negokart-backend-8pt9.onrender.com';
      const params = new URLSearchParams();
      params.append('username', form.username);
      params.append('password', form.password);
      
      console.log('Attempting login with:', { username: form.username, API_BASE });
      
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: params.toString(),
      });
      
      console.log('Login response status:', res.status);
      console.log('Login response headers:', Object.fromEntries(res.headers.entries()));
      
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error('JSON parse error:', jsonErr);
        const textResponse = await res.text();
        console.error('Raw response:', textResponse);
        setError(`Server error: ${res.status} - ${textResponse}`);
        return;
      }
      
      console.log('Login response data:', data);
      
      if (res.ok) {
        setMessage('Login successful!');
        localStorage.setItem('token', data.access_token);
        if (onLogin) onLogin(data.access_token);
      } else {
        setError(data.detail || `Login failed (${res.status})`);
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('API_BASE:', import.meta.env.VITE_API_BASE || 'https://negokart-backend-8pt9.onrender.com');
      console.error('Error type:', err.constructor.name);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setError(`Cannot connect to backend server. Please check if the server is running at ${import.meta.env.VITE_API_BASE || 'https://negokart-backend-8pt9.onrender.com'}`);
      } else {
        setError(`Network error: ${err.message}`);
      }
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
