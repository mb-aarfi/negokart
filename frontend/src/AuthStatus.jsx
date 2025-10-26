import React, { useState, useEffect } from 'react';

function AuthStatus() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [authMode, setAuthMode] = useState('unknown');

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://negokart-backend-8pt9.onrender.com';
      const response = await fetch(`${API_BASE}/health`, { timeout: 5000 });
      if (response.ok) {
        setBackendStatus('online');
        setAuthMode('backend');
      } else {
        setBackendStatus('error');
        setAuthMode('mock');
      }
    } catch (error) {
      setBackendStatus('offline');
      setAuthMode('mock');
    }
  };

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'online': return '#10b981'; // green
      case 'error': return '#f59e0b'; // yellow
      case 'offline': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  const getStatusText = () => {
    switch (backendStatus) {
      case 'online': return 'Backend Online';
      case 'error': return 'Backend Error';
      case 'offline': return 'Backend Offline';
      default: return 'Checking...';
    }
  };

  const getAuthModeText = () => {
    switch (authMode) {
      case 'backend': return 'Using Real Authentication';
      case 'mock': return 'Using Demo Mode';
      default: return 'Unknown';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '8px 12px',
      fontSize: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: getStatusColor()
      }}></div>
      <div>
        <div style={{ fontWeight: 'bold' }}>{getStatusText()}</div>
        <div style={{ color: '#6b7280' }}>{getAuthModeText()}</div>
      </div>
      <button
        onClick={checkBackendStatus}
        style={{
          background: 'none',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          padding: '2px 6px',
          fontSize: '10px',
          cursor: 'pointer'
        }}
      >
        Refresh
      </button>
    </div>
  );
}

export default AuthStatus;
