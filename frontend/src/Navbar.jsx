import React from 'react';
import logo from './assets/logo_nego.png';

function Navbar({ isAuthenticated, role, onLoginClick, onRegisterClick, onLogoutClick }) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      padding: '14px 24px',
      borderBottom: '1px solid #1f2937',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'rgba(11,18,32,0.92)',
      backdropFilter: 'saturate(140%) blur(6px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src={logo} alt="NegoKart" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'contain' }} />
        <span style={{ fontWeight: 700, letterSpacing: 0.4 }}>NegoKart - An AI Negotiator</span>
      </div>
      {!isAuthenticated ? (
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onLoginClick} style={{ background: 'transparent', color: '#e5e7eb', border: '1px solid #334155', borderRadius: 6, padding: '8px 14px', cursor: 'pointer' }}>Login</button>
          <button onClick={onRegisterClick} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, padding: '8px 14px', cursor: 'pointer' }}>Get Started</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {role && <span style={{ color: '#94a3b8', fontSize: 13, border: '1px solid #334155', padding: '4px 8px', borderRadius: 999 }}>{role}</span>}
          <button onClick={onLogoutClick} style={{ color: 'white', background: '#d9534f', border: 'none', borderRadius: 6, padding: '8px 14px', cursor: 'pointer' }}>Logout</button>
        </div>
      )}
    </header>
  );
}

export default Navbar;
