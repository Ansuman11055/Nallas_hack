import React, { useState, useEffect } from 'react';
import { useEncryption } from '../../contexts/EncryptionContext';

const UnlockScreen: React.FC = () => {
  const { unlockApp, isUnlocking, unlockError } = useEncryption();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    // Lock for 30 seconds after 3 failed attempts
    if (attempts >= 3) {
      setIsLocked(true);
      const timer = setTimeout(() => {
        setIsLocked(false);
        setAttempts(0);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [attempts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked || !password.trim()) return;

    try {
      await unlockApp(password);
      setPassword('');
      setAttempts(0);
    } catch (error) {
      setAttempts(prev => prev + 1);
      setPassword('');
    }
  };

  const handleForgotPassword = () => {
    const confirmed = window.confirm(
      'Forgot your password? This will permanently delete all your data and reset the app. This action cannot be undone. Continue?'
    );
    
    if (confirmed) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="unlock-screen">
      <div className="unlock-container">
        {/* App Branding */}
        <div className="unlock-header">
          <div className="app-icon">🧠</div>
          <h1>MindWell</h1>
          <p>Your Mental Wellness Companion</p>
        </div>

        {/* Security Badge */}
        <div className="security-badge">
          <div className="security-icon">🔒</div>
          <div className="security-text">
            <h3>Protected by Encryption</h3>
            <p>Your data is secured with AES-256 encryption</p>
          </div>
        </div>

        {/* Unlock Form */}
        <form onSubmit={handleSubmit} className="unlock-form">
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Master Password
            </label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`form-input ${unlockError ? 'error' : ''}`}
                placeholder="Enter your master password"
                disabled={isUnlocking || isLocked}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                disabled={isUnlocking || isLocked}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {unlockError && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>Incorrect password. Please try again.</span>
            </div>
          )}

          {/* Attempts Warning */}
          {attempts > 0 && attempts < 3 && (
            <div className="warning-message">
              <span className="warning-icon">⚠️</span>
              <span>
                {3 - attempts} attempt{3 - attempts !== 1 ? 's' : ''} remaining before temporary lockout
              </span>
            </div>
          )}

          {/* Lockout Message */}
          {isLocked && (
            <div className="lockout-message">
              <span className="lockout-icon">🔒</span>
              <span>
                Too many failed attempts. Please wait 30 seconds before trying again.
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="unlock-btn"
            disabled={isUnlocking || isLocked || !password.trim()}
          >
            {isUnlocking ? (
              <>
                <span className="spinner"></span>
                Unlocking...
              </>
            ) : isLocked ? (
              'Locked'
            ) : (
              'Unlock MindWell'
            )}
          </button>
        </form>

        {/* Help Section */}
        <div className="unlock-help">
          <button
            onClick={handleForgotPassword}
            className="forgot-password-btn"
            disabled={isUnlocking}
          >
            Forgot Password?
          </button>
          
          <div className="help-text">
            <p>
              <strong>Security Notice:</strong> Your password cannot be recovered. 
              If you forget it, you'll need to reset the app and lose all data.
            </p>
          </div>
        </div>

        {/* Privacy Features */}
        <div className="privacy-features">
          <div className="feature">
            <span className="feature-icon">🔐</span>
            <span>End-to-end encryption</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🏠</span>
            <span>Local storage only</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🚫</span>
            <span>No cloud sync</span>
          </div>
          <div className="feature">
            <span className="feature-icon">👁️‍🗨️</span>
            <span>Zero knowledge</span>
          </div>
        </div>

        {/* Version Info */}
        <div className="version-info">
          <span>MindWell v1.0.0 • Privacy-First Mental Wellness</span>
        </div>
      </div>
    </div>
  );
};

export default UnlockScreen;
