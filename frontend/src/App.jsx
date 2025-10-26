import React, { useState } from 'react';
import Register from './Register';
import Login from './Login';
import RetailerDashboard from './RetailerDashboard';
import WholesalerDashboard from './WholesalerDashboard';
import Landing from './Landing';
import Navbar from './Navbar';

function getRoleFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch {
    return null;
  }
}

function App() {
  const [view, setView] = useState('landing'); 
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setView('landing');
  };

  if (token) {
    const role = getRoleFromToken(token);
    return (
      <div style={{ background: '#ffffff', minHeight: '100vh' }}>
        <Navbar isAuthenticated={true} role={role} onLogoutClick={handleLogout} />
        {role === 'retailer' ? <RetailerDashboard token={token} /> : null}
        {role === 'wholesaler' ? <WholesalerDashboard token={token} /> : null}
      </div>
    );
  }

  if (view === 'landing') {
    return <Landing onLoginClick={() => setView('login')} onRegisterClick={() => setView('register')} />;
  }

  if (view === 'login') {
    return <Login onLogin={setToken} onBackClick={() => setView('landing')} />;
  }

  return <Register onBackClick={() => setView('landing')} />;
}

export default App;
