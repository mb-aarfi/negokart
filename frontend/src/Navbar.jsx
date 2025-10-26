import React, { useState } from 'react';
import logo from './assets/logo_nego.png';
import './Navbar.css';

function Navbar({ isAuthenticated, role, onLoginClick, onRegisterClick, onLogoutClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <img src="https://img.freepik.com/premium-vector/negotiation-icon_1134104-20778.jpg" alt="NegoKart" className="navbar-logo" />
          <span className="navbar-title">NegoKart - An AI Negotiator</span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="navbar-desktop">
          {!isAuthenticated ? (
            <>
              <button onClick={onLoginClick} className="navbar-btn navbar-btn-outline">Login</button>
              <button onClick={onRegisterClick} className="navbar-btn navbar-btn-primary">Get Started</button>
            </>
          ) : (
            <div className="navbar-user">
              {role && <span className="navbar-role">{role}</span>}
              <button onClick={onLogoutClick} className="navbar-btn navbar-btn-danger">Logout</button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="navbar-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="navbar-mobile">
          {!isAuthenticated ? (
            <div className="navbar-mobile-buttons">
              <button onClick={() => { setMobileMenuOpen(false); onLoginClick(); }} className="navbar-btn navbar-btn-outline mobile-full">Login</button>
              <button onClick={() => { setMobileMenuOpen(false); onRegisterClick(); }} className="navbar-btn navbar-btn-primary mobile-full">Get Started</button>
            </div>
          ) : (
            <div className="navbar-mobile-user">
              {role && <span className="navbar-role mobile-full">{role}</span>}
              <button onClick={() => { setMobileMenuOpen(false); onLogoutClick(); }} className="navbar-btn navbar-btn-danger mobile-full">Logout</button>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}

export default Navbar;
