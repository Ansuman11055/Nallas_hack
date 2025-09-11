import React from 'react';

function Navigation() {
  const currentPath = window.location.pathname;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/mood', label: 'Mood', icon: '📊' },
    { path: '/chat', label: 'Chat', icon: '💬' },
    { path: '/vr', label: 'VR', icon: '🌅' }
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        <span style={styles.logoText}>🧠 MentalWell</span>
      </div>
      <div style={styles.navItems}>
        {navItems.map(item => (
          <a
            key={item.path}
            href={item.path}
            style={{
              ...styles.navItem,
              ...(currentPath === item.path ? styles.activeNavItem : {})
            }}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span style={styles.navLabel}>{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 30px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  logo: {
    display: 'flex',
    alignItems: 'center'
  },
  logoText: {
    fontSize: '1.5em',
    fontWeight: 'bold',
    color: '#333'
  },
  navItems: {
    display: 'flex',
    gap: '20px'
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textDecoration: 'none',
    color: '#666',
    padding: '8px 12px',
    borderRadius: '10px',
    transition: 'all 0.2s ease'
  },
  activeNavItem: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  },
  navIcon: {
    fontSize: '1.2em',
    marginBottom: '2px'
  },
  navLabel: {
    fontSize: '0.8em',
    fontWeight: '500'
  }
};

export default Navigation;

