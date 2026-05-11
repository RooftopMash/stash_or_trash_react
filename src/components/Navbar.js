import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ currentPage, setCurrentPage, user }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <div className="navbar-logo">
          <div className="logo-icon">🎯</div>
          <h1>Stash or Trash™</h1>
        </div>

        {/* Navigation Links */}
        <ul className="nav-menu">
          <li>
            <button
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentPage('home')}
            >
              <span className="nav-icon">🏠</span>
              Home
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === 'barometer' ? 'active' : ''}`}
              onClick={() => setCurrentPage('barometer')}
            >
              <span className="nav-icon">📊</span>
              Creative Barometer
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentPage('dashboard')}
            >
              <span className="nav-icon">👤</span>
              Dashboard
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === 'pulse' ? 'active' : ''}`}
              onClick={() => setCurrentPage('pulse')}
            >
              <span className="nav-icon">📈</span>
              PR Pulse
            </button>
          </li>
        </ul>

        {/* User Profile */}
        {user && (
          <div className="navbar-user">
            <div className="user-avatar">{user.email?.charAt(0).toUpperCase() || 'U'}</div>
            <span className="user-name">Profile</span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
