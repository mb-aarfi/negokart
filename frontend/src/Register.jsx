import React, { useState } from 'react';

function Register() {
  const [form, setForm] = useState({
    fullName: '',
    location: '',
    contact: '',
    category: '',
    pan: '',
    gstn: '',
    password: ''
  });
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
        setForm({
          fullName: '',
          location: '',
          contact: '',
          category: '',
          pan: '',
          gstn: '',
          password: ''
        });
      } else {
        setError(data.detail || 'Registration failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#0b1220'
    }}>
      <div style={{
        backgroundColor: '#0b1220',
        padding: '2rem',
        borderRadius: '8px',
        width: '420px',
        boxShadow: '0 0 10px rgba(250, 247, 247, 0.3)',
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>Registration Page</h2>
        <form onSubmit={handleSubmit}>
          {[
            { label: 'Full Name', name: 'fullName', placeholder: 'Your First Name' },
            { label: 'Location', name: 'location', placeholder: 'Choose your location' },
            { label: 'Contact', name: 'contact', placeholder: 'Phone number' },
            { label: 'Choose your business category', name: 'category', placeholder: 'Choose your location' },
            { label: 'PAN', name: 'pan', placeholder: 'Enter your PAN' },
            { label: 'GSTN', name: 'gstn', placeholder: 'Enter your GSTN' },
            { label: 'Password', name: 'password', placeholder: 'Choose your password', type: 'password' }
          ].map((field, index) => (
            <div key={index} style={{ marginBottom: '1rem', textAlign: 'left' }}>
              <label style={{ fontWeight: '500' }}>{field.label}</label>
              <input
                type={field.type || 'text'}
                name={field.name}
                placeholder={field.placeholder}
                value={form[field.name]}
                onChange={handleChange}
                required
                style={{
                  width: '90%',
                  padding: '10px',
                  marginTop: '6px',
                  border: 'none',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
            </div>
          ))}
          <button type="submit" style={{
            backgroundColor: '#4285f4',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}>
            Register
          </button>
        </form>
        {message && <div style={{ color: 'green', marginTop: 10 }}>{message}</div>}
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      </div>
    </div>
  );
}

export default Register;