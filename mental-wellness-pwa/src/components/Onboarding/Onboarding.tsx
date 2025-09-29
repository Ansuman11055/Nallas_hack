import React, { useState } from 'react';
import { useEncryption } from '../../contexts/EncryptionContext';
import { validatePassword } from '../../utils/encryption';

interface OnboardingStep {
  id: string;
  title: string;
  content: React.ReactNode;
}

const Onboarding: React.FC = () => {
  const { createNewKey, isLoading, error } = useEncryption();
  const [currentStep, setCurrentStep] = useState(0);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const validation = validatePassword(value);
    setPasswordErrors(validation.errors);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setPasswordErrors(['Passwords do not match']);
      return;
    }

    const validation = validatePassword(password);
    if (!validation.isValid) {
      setPasswordErrors(validation.errors);
      return;
    }

    const success = await createNewKey(password);
    if (success) {
      // Account created successfully, context will handle navigation
      console.log('Account created successfully');
    }
  };

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to MindWell',
      content: (
        <div className="onboarding-step">
          <div className="step-icon">🌙</div>
          <h2>Your Private Mental Wellness Space</h2>
          <p>
            MindWell is a privacy-first Progressive Web App designed to help you track your mental wellness, 
            analyze patterns, and provide personalized micro-interventions.
          </p>
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <div>
                <h4>Privacy First</h4>
                <p>All your data is encrypted and stored locally on your device</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📱</span>
              <div>
                <h4>Works Offline</h4>
                <p>Full functionality without internet connection</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🧠</span>
              <div>
                <h4>Smart Insights</h4>
                <p>AI-powered baseline analysis and personalized recommendations</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🥽</span>
              <div>
                <h4>VR Experiences</h4>
                <p>Immersive calming environments for relaxation</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'privacy',
      title: 'Your Data, Your Control',
      content: (
        <div className="onboarding-step">
          <div className="step-icon">🛡️</div>
          <h2>Complete Privacy & Security</h2>
          <p>
            MindWell uses military-grade encryption to protect your mental health data. 
            Here's how we keep your information secure:
          </p>
          <div className="security-features">
            <div className="security-item">
              <h4>🔐 AES-256 Encryption</h4>
              <p>Your data is encrypted with the same standard used by banks and governments</p>
            </div>
            <div className="security-item">
              <h4>🏠 Local Storage Only</h4>
              <p>Data never leaves your device unless you explicitly choose to export it</p>
            </div>
            <div className="security-item">
              <h4>🔑 Password Protection</h4>
              <p>Only you can access your data with your master password</p>
            </div>
            <div className="security-item">
              <h4>🗑️ Secure Deletion</h4>
              <p>Permanently delete all data at any time with cryptographic wiping</p>
            </div>
          </div>
          <div className="privacy-notice">
            <p>
              <strong>Important:</strong> If you forget your password, your data cannot be recovered. 
              Please choose a strong password you'll remember.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'password',
      title: 'Create Your Secure Account',
      content: (
        <div className="onboarding-step">
          <div className="step-icon">🔑</div>
          <h2>Set Your Master Password</h2>
          <p>
            This password will encrypt all your mental wellness data. Choose something strong 
            but memorable - you'll need it every time you open the app.
          </p>
          
          <form onSubmit={handleCreateAccount} className="password-setup-form">
            <div className="form-group">
              <label htmlFor="setup-password" className="form-label">
                Master Password
              </label>
              <div className="password-input-container">
                <input
                  id="setup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="form-input"
                  placeholder="Enter a strong password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password" className="form-label">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                placeholder="Confirm your password"
                required
              />
            </div>

            {passwordErrors.length > 0 && (
              <div className="password-requirements">
                <h4>Password Requirements:</h4>
                <ul>
                  {passwordErrors.map((error, index) => (
                    <li key={index} className="requirement-error">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="password-strength">
              <h4>Password Requirements:</h4>
              <ul>
                <li className={password.length >= 8 ? 'requirement-met' : 'requirement-unmet'}>
                  At least 8 characters
                </li>
                <li className={/[A-Z]/.test(password) ? 'requirement-met' : 'requirement-unmet'}>
                  One uppercase letter
                </li>
                <li className={/[a-z]/.test(password) ? 'requirement-met' : 'requirement-unmet'}>
                  One lowercase letter
                </li>
                <li className={/\d/.test(password) ? 'requirement-met' : 'requirement-unmet'}>
                  One number
                </li>
                <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password) ? 'requirement-met' : 'requirement-unmet'}>
                  One special character
                </li>
              </ul>
            </div>

            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={
                isLoading || 
                passwordErrors.length > 0 || 
                !password || 
                !confirmPassword || 
                password !== confirmPassword
              }
            >
              {isLoading ? 'Creating Account...' : 'Create Secure Account'}
            </button>
          </form>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-content">
        <div className="progress-indicator">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <span className="progress-text">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        <div className="step-content">
          {steps[currentStep].content}
        </div>

        <div className="step-navigation">
          {currentStep > 0 && (
            <button 
              onClick={prevStep} 
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Back
            </button>
          )}
          
          {currentStep < steps.length - 1 && (
            <button 
              onClick={nextStep} 
              className="btn btn-primary"
              disabled={isLoading}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
