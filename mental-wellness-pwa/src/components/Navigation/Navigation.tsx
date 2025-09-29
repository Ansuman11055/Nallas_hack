import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDatabase } from '../../contexts/DatabaseContext';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { stats } = useDatabase();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    {
      path: '/',
      icon: '📊',
      label: 'Dashboard',
      description: 'Overview & insights'
    },
    {
      path: '/mood',
      icon: '😊',
      label: 'Mood',
      description: 'Track your feelings'
    },
    {
      path: '/interventions',
      icon: '🧘',
      label: 'Wellness',
      description: 'Guided exercises'
    },
    {
      path: '/vr',
      icon: '🥽',
      label: 'VR',
      description: 'Immersive relaxation'
    },
    {
      path: '/chat',
      icon: '💬',
      label: 'Chat',
      description: 'AI support'
    },
    {
      path: '/privacy',
      icon: '🔒',
      label: 'Privacy',
      description: 'Data & security'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Navigation */}
      <nav className={`navigation ${isMenuOpen ? 'mobile-open' : ''}`}>
        {/* App Header */}
        <div className="nav-header">
          <div className="app-logo">
            <div className="logo-icon">🧠</div>
            <div className="logo-text">
              <h1>MindWell</h1>
              <p>Mental Wellness Companion</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="nav-stats">
          <div className="stat-item">
            <span className="stat-icon">📝</span>
            <div className="stat-info">
              <span className="stat-number">{stats.totalMoodEntries}</span>
              <span className="stat-label">Entries</span>
            </div>
          </div>
          
          <div className="stat-item">
            <span className="stat-icon">🎯</span>
            <div className="stat-info">
              <span className="stat-number">{stats.totalInterventions}</span>
              <span className="stat-label">Sessions</span>
            </div>
          </div>
          
          <div className="stat-item">
            <span className="stat-icon">📈</span>
            <div className="stat-info">
              <span className="stat-number">{stats.streakDays}</span>
              <span className="stat-label">Day Streak</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="nav-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="nav-icon">{item.icon}</div>
              <div className="nav-content">
                <span className="nav-label">{item.label}</span>
                <span className="nav-description">{item.description}</span>
              </div>
              {isActive(item.path) && <div className="nav-indicator"></div>}
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="nav-actions">
          <Link
            to="/mood/quick"
            className="quick-action primary"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="action-icon">⚡</span>
            <span className="action-text">Quick Mood</span>
          </Link>
          
          <Link
            to="/interventions"
            className="quick-action secondary"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="action-icon">🧘</span>
            <span className="action-text">Breathe</span>
          </Link>
        </div>

        {/* App Status */}
        <div className="nav-status">
          <div className="status-item">
            <div className="status-indicator online"></div>
            <span className="status-text">Offline Ready</span>
          </div>
          
          <div className="status-item">
            <div className="status-indicator secure"></div>
            <span className="status-text">Encrypted</span>
          </div>
        </div>

        {/* Footer */}
        <div className="nav-footer">
          <div className="app-version">
            <span>MindWell v1.0.0</span>
          </div>
          <div className="privacy-note">
            <span>🔒 Your data stays on your device</span>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Navigation;
