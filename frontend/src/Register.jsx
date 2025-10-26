import React, { useState } from 'react';
import './Auth.css';
import logo from './assets/logo_nego.png';
import { mockRegister, isBackendWorking } from './mockAuth';

function Register({ onBackClick }) {
  const [form, setForm] = useState({ username: '', password: '', role: 'retailer' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (role) => {
    setForm({ ...form, role });
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
      console.log('Backend not available, trying mock registration...');
      
      // Try mock registration as fallback
      const mockResult = mockRegister(form.username, form.password, form.role);
      if (mockResult.success) {
        setMessage(mockResult.message + ' (Demo mode)');
        setForm({ username: '', password: '', role: 'retailer' });
        return;
      } else {
        setError(mockResult.error || 'Registration failed');
        return;
      }
    }
    
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://negokart-backend-8pt9.onrender.com'; 
      
      console.log('Attempting registration with:', { username: form.username, role: form.role, API_BASE });
      
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(form),
      });
      
      console.log('Registration response status:', res.status);
      console.log('Registration response headers:', Object.fromEntries(res.headers.entries()));
      
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
      
      console.log('Registration response data:', data);
      
      if (res.ok) {
        setMessage(data.message);
        setForm({ username: '', password: '', role: 'retailer' });
      } else {
        setError(data.detail || `Registration failed (${res.status})`);
      }
    } catch (err) {
      console.error('Registration error:', err);
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
          <h1 className="auth-title">Join NegoKart</h1>
          <p className="auth-subtitle">Create your account and start negotiating</p>
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
              placeholder="Choose a username"
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
              placeholder="Create a strong password"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Account Type</label>
            <div className="role-selector">
              <div 
                className={`role-option ${form.role === 'retailer' ? 'selected' : ''}`}
                onClick={() => handleRoleChange('retailer')}
              >
                <input 
                  type="radio" 
                  name="role" 
                  value="retailer" 
                  checked={form.role === 'retailer'}
                  onChange={() => handleRoleChange('retailer')}
                />
                <label>🛍️ Retailer</label>
                <p style={{ fontSize: '12px', margin: '4px 0 0', color: '#64748b' }}>
                  Buy products from wholesalers
                </p>
              </div>
              
              <div 
                className={`role-option ${form.role === 'wholesaler' ? 'selected' : ''}`}
                onClick={() => handleRoleChange('wholesaler')}
              >
                <input 
                  type="radio" 
                  name="role" 
                  value="wholesaler" 
                  checked={form.role === 'wholesaler'}
                  onChange={() => handleRoleChange('wholesaler')}
                />
                <label>🏭 Wholesaler</label>
                <p style={{ fontSize: '12px', margin: '4px 0 0', color: '#64748b' }}>
                  Sell products to retailers
                </p>
              </div>
            </div>
          </div>
          
          <button type="submit" className="auth-button">
            Create Account
          </button>
        </form>
        
        {message && <div className="auth-message success">{message}</div>}
        {error && <div className="auth-message error">{error}</div>}
        
        <div className="auth-footer">
          <p>Already have an account? <button onClick={onBackClick} className="auth-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Sign in here</button></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
