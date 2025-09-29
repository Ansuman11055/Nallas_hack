import React, { useState } from 'react';
import { useConsent } from '../../contexts/ConsentContext';
import { ConsentSettings } from '../../types';

const ConsentFlow: React.FC = () => {
  const { updateConsentSettings, isLoading, error } = useConsent();
  const [currentStep, setCurrentStep] = useState(0);
  const [consentData, setConsentData] = useState<ConsentSettings>({
    moodDataConsent: false,
    behavioralDataConsent: false,
    analyticsConsent: false,
    crashReportingConsent: false,
    localStorageOnly: true,
    dataRetentionDays: 365
  });

  const handleConsentChange = (key: keyof ConsentSettings, value: boolean | number) => {
    setConsentData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmitConsent = async () => {
    try {
      await updateConsentSettings(consentData);
    } catch (err) {
      console.error('Failed to save consent settings:', err);
    }
  };

  const consentSteps = [
    {
      id: 'data-collection',
      title: 'Data Collection Preferences',
      content: (
        <div className="consent-step">
          <h2>What data can MindWell collect?</h2>
          <p>
            Choose what information you're comfortable sharing. You can change these settings anytime.
          </p>
          
          <div className="consent-options">
            <div className="consent-option">
              <div className="consent-header">
                <input
                  type="checkbox"
                  id="mood-data"
                  checked={consentData.moodDataConsent}
                  onChange={(e) => handleConsentChange('moodDataConsent', e.target.checked)}
                />
                <label htmlFor="mood-data" className="consent-label">
                  <h4>Mood & Emotional Data</h4>
                  <span className="consent-badge recommended">Recommended</span>
                </label>
              </div>
              <p className="consent-description">
                Allow collection of mood entries, notes, and emotional patterns. 
                This enables personalized insights and baseline analysis.
              </p>
              <div className="consent-details">
                <strong>Includes:</strong> Mood ratings, text notes, voice recordings, tags
              </div>
            </div>

            <div className="consent-option">
              <div className="consent-header">
                <input
                  type="checkbox"
                  id="behavioral-data"
                  checked={consentData.behavioralDataConsent}
                  onChange={(e) => handleConsentChange('behavioralDataConsent', e.target.checked)}
                />
                <label htmlFor="behavioral-data" className="consent-label">
                  <h4>Behavioral Analytics</h4>
                  <span className="consent-badge optional">Optional</span>
                </label>
              </div>
              <p className="consent-description">
                Analyze app usage patterns to detect changes in behavior that might indicate mood shifts.
                No personal content is stored, only anonymized interaction patterns.
              </p>
              <div className="consent-details">
                <strong>Includes:</strong> App usage frequency, session duration, feature usage patterns
              </div>
            </div>

            <div className="consent-option">
              <div className="consent-header">
                <input
                  type="checkbox"
                  id="analytics"
                  checked={consentData.analyticsConsent}
                  onChange={(e) => handleConsentChange('analyticsConsent', e.target.checked)}
                />
                <label htmlFor="analytics" className="consent-label">
                  <h4>Usage Analytics</h4>
                  <span className="consent-badge optional">Optional</span>
                </label>
              </div>
              <p className="consent-description">
                Help improve MindWell by sharing anonymous usage statistics. 
                No personal or health data is included.
              </p>
              <div className="consent-details">
                <strong>Includes:</strong> Feature usage, performance metrics, error rates
              </div>
            </div>

            <div className="consent-option">
              <div className="consent-header">
                <input
                  type="checkbox"
                  id="crash-reporting"
                  checked={consentData.crashReportingConsent}
                  onChange={(e) => handleConsentChange('crashReportingConsent', e.target.checked)}
                />
                <label htmlFor="crash-reporting" className="consent-label">
                  <h4>Crash Reporting</h4>
                  <span className="consent-badge optional">Optional</span>
                </label>
              </div>
              <p className="consent-description">
                Automatically report app crashes to help us fix bugs and improve stability.
                No personal data is included in crash reports.
              </p>
              <div className="consent-details">
                <strong>Includes:</strong> Error messages, device info, app version
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'storage-preferences',
      title: 'Data Storage Preferences',
      content: (
        <div className="consent-step">
          <h2>Where should your data be stored?</h2>
          <p>
            Choose how and where your mental wellness data is stored and managed.
          </p>

          <div className="storage-options">
            <div className={`storage-option ${consentData.localStorageOnly ? 'selected' : ''}`}>
              <input
                type="radio"
                id="local-only"
                name="storage"
                checked={consentData.localStorageOnly}
                onChange={() => handleConsentChange('localStorageOnly', true)}
              />
              <label htmlFor="local-only" className="storage-label">
                <div className="storage-header">
                  <h4>🏠 Local Device Only</h4>
                  <span className="storage-badge recommended">Recommended</span>
                </div>
                <p>
                  All data stays on this device. Maximum privacy and security.
                  Data cannot be recovered if device is lost or damaged.
                </p>
                <div className="storage-features">
                  <div className="feature">✅ Maximum privacy</div>
                  <div className="feature">✅ No internet required</div>
                  <div className="feature">✅ Complete control</div>
                  <div className="feature">⚠️ No device backup</div>
                </div>
              </label>
            </div>

            <div className={`storage-option ${!consentData.localStorageOnly ? 'selected' : ''}`}>
              <input
                type="radio"
                id="cloud-sync"
                name="storage"
                checked={!consentData.localStorageOnly}
                onChange={() => handleConsentChange('localStorageOnly', false)}
              />
              <label htmlFor="cloud-sync" className="storage-label">
                <div className="storage-header">
                  <h4>☁️ Encrypted Cloud Sync</h4>
                  <span className="storage-badge coming-soon">Coming Soon</span>
                </div>
                <p>
                  Sync encrypted data across devices. Your data remains encrypted 
                  with your password - we cannot read it.
                </p>
                <div className="storage-features">
                  <div className="feature">✅ Multi-device access</div>
                  <div className="feature">✅ Automatic backup</div>
                  <div className="feature">✅ Still encrypted</div>
                  <div className="feature">⚠️ Requires internet</div>
                </div>
              </label>
            </div>
          </div>

          <div className="retention-settings">
            <h4>Data Retention Period</h4>
            <p>How long should we keep your data?</p>
            <div className="retention-options">
              <label className="retention-option">
                <input
                  type="radio"
                  name="retention"
                  value="90"
                  checked={consentData.dataRetentionDays === 90}
                  onChange={() => handleConsentChange('dataRetentionDays', 90)}
                />
                3 months
              </label>
              <label className="retention-option">
                <input
                  type="radio"
                  name="retention"
                  value="365"
                  checked={consentData.dataRetentionDays === 365}
                  onChange={() => handleConsentChange('dataRetentionDays', 365)}
                />
                1 year (recommended)
              </label>
              <label className="retention-option">
                <input
                  type="radio"
                  name="retention"
                  value="730"
                  checked={consentData.dataRetentionDays === 730}
                  onChange={() => handleConsentChange('dataRetentionDays', 730)}
                />
                2 years
              </label>
              <label className="retention-option">
                <input
                  type="radio"
                  name="retention"
                  value="-1"
                  checked={consentData.dataRetentionDays === -1}
                  onChange={() => handleConsentChange('dataRetentionDays', -1)}
                />
                Keep forever
              </label>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'summary',
      title: 'Privacy Summary',
      content: (
        <div className="consent-step">
          <h2>Your Privacy Choices</h2>
          <p>
            Review your privacy settings below. You can change these anytime in Settings.
          </p>

          <div className="consent-summary">
            <div className="summary-section">
              <h4>Data Collection</h4>
              <div className="summary-items">
                <div className={`summary-item ${consentData.moodDataConsent ? 'enabled' : 'disabled'}`}>
                  <span className="summary-icon">
                    {consentData.moodDataConsent ? '✅' : '❌'}
                  </span>
                  Mood & Emotional Data
                </div>
                <div className={`summary-item ${consentData.behavioralDataConsent ? 'enabled' : 'disabled'}`}>
                  <span className="summary-icon">
                    {consentData.behavioralDataConsent ? '✅' : '❌'}
                  </span>
                  Behavioral Analytics
                </div>
                <div className={`summary-item ${consentData.analyticsConsent ? 'enabled' : 'disabled'}`}>
                  <span className="summary-icon">
                    {consentData.analyticsConsent ? '✅' : '❌'}
                  </span>
                  Usage Analytics
                </div>
                <div className={`summary-item ${consentData.crashReportingConsent ? 'enabled' : 'disabled'}`}>
                  <span className="summary-icon">
                    {consentData.crashReportingConsent ? '✅' : '❌'}
                  </span>
                  Crash Reporting
                </div>
              </div>
            </div>

            <div className="summary-section">
              <h4>Storage & Retention</h4>
              <div className="summary-items">
                <div className="summary-item enabled">
                  <span className="summary-icon">🏠</span>
                  {consentData.localStorageOnly ? 'Local Device Only' : 'Encrypted Cloud Sync'}
                </div>
                <div className="summary-item enabled">
                  <span className="summary-icon">⏰</span>
                  {consentData.dataRetentionDays === -1 
                    ? 'Keep data forever' 
                    : `Delete after ${consentData.dataRetentionDays} days`
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="privacy-commitment">
            <h4>🛡️ Our Privacy Commitment</h4>
            <ul>
              <li>Your data is always encrypted with your password</li>
              <li>We cannot read your personal information</li>
              <li>You can export or delete all data anytime</li>
              <li>No third-party tracking or advertising</li>
              <li>Open source code for transparency</li>
            </ul>
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < consentSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isLastStep = currentStep === consentSteps.length - 1;

  return (
    <div className="consent-flow-container">
      <div className="consent-content">
        <div className="progress-indicator">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentStep + 1) / consentSteps.length) * 100}%` }}
            />
          </div>
          <span className="progress-text">
            Step {currentStep + 1} of {consentSteps.length}
          </span>
        </div>

        <div className="step-content">
          {consentSteps[currentStep].content}
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
          
          {!isLastStep ? (
            <button 
              onClick={nextStep} 
              className="btn btn-primary"
              disabled={isLoading}
            >
              Continue
            </button>
          ) : (
            <button 
              onClick={handleSubmitConsent} 
              className="btn btn-primary btn-large"
              disabled={isLoading}
            >
              {isLoading ? 'Saving Preferences...' : 'Start Using MindWell'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsentFlow;
