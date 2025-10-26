import React from 'react';
import logo from './assets/logo_nego.png';

function Navbar({ isAuthenticated, role, onLoginClick, onRegisterClick, onLogoutClick }) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      padding: '14px 24px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: '#ffffff',
      backdropFilter: 'saturate(140%) blur(6px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="https://img.freepik.com/premium-vector/negotiation-icon_1134104-20778.jpg" alt="NegoKart" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'contain' }} />
        <span style={{ fontWeight: 700, letterSpacing: 0.4, color: '#0f172a' }}>NegoKart - An AI Negotiator</span>
      </div>
      {!isAuthenticated ? (
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onLoginClick} style={{ background: 'transparent', color: '#0f172a', border: '1px solid #94a3b8', borderRadius: 6, padding: '8px 14px', cursor: 'pointer' }}>Login</button>
          <button onClick={onRegisterClick} style={{ background: '#2563eb', color: 'white', border: '1px solid #2563eb', borderRadius: 6, padding: '8px 14px', cursor: 'pointer', boxShadow: '0 6px 16px rgba(37,99,235,0.25)' }}>Get Started</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {role && <span style={{ color: '#334155', fontSize: 13, border: '1px solid #e5e7eb', padding: '4px 8px', borderRadius: 999 }}>{role}</span>}
          <button onClick={onLogoutClick} style={{ color: 'white', background: '#ef4444', border: '1px solid #ef4444', borderRadius: 6, padding: '8px 14px', cursor: 'pointer' }}>Logout</button>
        </div>
      )}
    </header>
  );
}

export default Navbar;
