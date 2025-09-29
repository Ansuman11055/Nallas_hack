import React, { useState } from 'react';
import { useConsent } from '../../contexts/ConsentContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useEncryption } from '../../contexts/EncryptionContext';

const Privacy: React.FC = () => {
  const { consentSettings, updateConsentSettings, revokeAllConsent, isLoading } = useConsent();
  const { exportData, clearAllData, stats } = useDatabase();
  const { lockApp } = useEncryption();
  const [showDataExport, setShowDataExport] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exportedData, setExportedData] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleConsentToggle = async (key: keyof typeof consentSettings, value: boolean) => {
    if (!consentSettings) return;
    
    try {
      await updateConsentSettings({
        ...consentSettings,
        [key]: value
      });
    } catch (error) {
      console.error('Failed to update consent settings:', error);
      alert('Failed to update privacy settings. Please try again.');
    }
  };

  const handleRetentionChange = async (days: number) => {
    if (!consentSettings) return;
    
    try {
      await updateConsentSettings({
        ...consentSettings,
        dataRetentionDays: days
      });
    } catch (error) {
      console.error('Failed to update retention settings:', error);
      alert('Failed to update data retention settings. Please try again.');
    }
  };

  const handleExportData = async () => {
    try {
      const data = await exportData();
      setExportedData(data);
      setShowDataExport(true);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const downloadExportedData = () => {
    if (!exportedData) return;
    
    const blob = new Blob([exportedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindwell-data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteAllData = async () => {
    if (deleteConfirmText !== 'DELETE ALL DATA') {
      alert('Please type "DELETE ALL DATA" to confirm deletion.');
      return;
    }

    try {
      await revokeAllConsent();
      alert('All data has been permanently deleted.');
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
    } catch (error) {
      console.error('Failed to delete data:', error);
      alert('Failed to delete data. Please try again.');
    }
  };

  if (!consentSettings) {
    return (
      <div className="privacy-loading">
        <div className="spinner"></div>
        <p>Loading privacy settings...</p>
      </div>
    );
  }

  return (
    <div className="privacy-settings">
      <div className="container container-sm">
        <div className="privacy-header">
          <h1>🔒 Privacy & Data Settings</h1>
          <p>
            Manage your data privacy preferences and control how your information is stored and used.
          </p>
        </div>

        {/* Data Collection Settings */}
        <div className="settings-section">
          <h2>Data Collection Preferences</h2>
          <p className="section-description">
            Choose what types of data MindWell can collect to provide personalized insights.
          </p>

          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Mood & Emotional Data</h4>
                <p>Allow collection of mood entries, notes, and emotional patterns for baseline analysis</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={consentSettings.moodDataConsent}
                  onChange={(e) => handleConsentToggle('moodDataConsent', e.target.checked)}
                  disabled={isLoading}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Behavioral Analytics</h4>
                <p>Analyze app usage patterns to detect mood-related behavior changes (anonymized)</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={consentSettings.behavioralDataConsent}
                  onChange={(e) => handleConsentToggle('behavioralDataConsent', e.target.checked)}
                  disabled={isLoading}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Usage Analytics</h4>
                <p>Help improve MindWell by sharing anonymous usage statistics</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={consentSettings.analyticsConsent}
                  onChange={(e) => handleConsentToggle('analyticsConsent', e.target.checked)}
                  disabled={isLoading}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Crash Reporting</h4>
                <p>Automatically report app crashes to help fix bugs (no personal data included)</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={consentSettings.crashReportingConsent}
                  onChange={(e) => handleConsentToggle('crashReportingConsent', e.target.checked)}
                  disabled={isLoading}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Storage Settings */}
        <div className="settings-section">
          <h2>Data Storage</h2>
          <div className="storage-info">
            <div className="storage-status">
              <div className="storage-icon">🏠</div>
              <div className="storage-details">
                <h4>Local Device Storage</h4>
                <p>All data is encrypted and stored only on this device</p>
                <div className="storage-stats">
                  <span>Mood Entries: {stats.totalMoodEntries}</span>
                  <span>Interventions: {stats.totalInterventions}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Retention */}
        <div className="settings-section">
          <h2>Data Retention</h2>
          <p className="section-description">
            Choose how long to keep your mental wellness data.
          </p>

          <div className="retention-options">
            {[
              { days: 90, label: '3 months' },
              { days: 365, label: '1 year' },
              { days: 730, label: '2 years' },
              { days: -1, label: 'Keep forever' }
            ].map((option) => (
              <label key={option.days} className="retention-option">
                <input
                  type="radio"
                  name="retention"
                  checked={consentSettings.dataRetentionDays === option.days}
                  onChange={() => handleRetentionChange(option.days)}
                  disabled={isLoading}
                />
                <span className="retention-label">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Data Management */}
        <div className="settings-section">
          <h2>Data Management</h2>
          <p className="section-description">
            Export or delete your data at any time.
          </p>

          <div className="data-actions">
            <button
              onClick={handleExportData}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              📥 Export My Data
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn btn-error"
              disabled={isLoading}
            >
              🗑️ Delete All Data
            </button>

            <button
              onClick={lockApp}
              className="btn btn-secondary"
            >
              🔒 Lock App
            </button>
          </div>
        </div>

        {/* Security Information */}
        <div className="settings-section">
          <h2>Security & Encryption</h2>
          <div className="security-info">
            <div className="security-feature">
              <div className="security-icon">🔐</div>
              <div className="security-details">
                <h4>AES-256 Encryption</h4>
                <p>Your data is encrypted with military-grade encryption</p>
              </div>
            </div>
            
            <div className="security-feature">
              <div className="security-icon">🔑</div>
              <div className="security-details">
                <h4>Password Protection</h4>
                <p>Only you can access your data with your master password</p>
              </div>
            </div>
            
            <div className="security-feature">
              <div className="security-icon">🏠</div>
              <div className="security-details">
                <h4>Local Storage</h4>
                <p>Data never leaves your device unless you export it</p>
              </div>
            </div>
            
            <div className="security-feature">
              <div className="security-icon">🛡️</div>
              <div className="security-details">
                <h4>Zero Knowledge</h4>
                <p>We cannot read your personal information</p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Commitment */}
        <div className="privacy-commitment">
          <h3>Our Privacy Commitment</h3>
          <ul>
            <li>✅ Your data is always encrypted with your password</li>
            <li>✅ We cannot read your personal mental health information</li>
            <li>✅ No third-party tracking or advertising</li>
            <li>✅ You can export or delete all data anytime</li>
            <li>✅ Open source code for transparency</li>
            <li>✅ GDPR and CCPA compliant</li>
          </ul>
        </div>
      </div>

      {/* Data Export Modal */}
      {showDataExport && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>📥 Data Export</h3>
              <button
                onClick={() => setShowDataExport(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p>
                Your data has been exported as an encrypted JSON file. This includes all your mood entries, 
                interventions, and settings.
              </p>
              
              <div className="export-info">
                <div className="export-stat">
                  <span>Export Date:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="export-stat">
                  <span>File Size:</span>
                  <span>{Math.round((exportedData?.length || 0) / 1024)} KB</span>
                </div>
              </div>
              
              <div className="export-actions">
                <button
                  onClick={downloadExportedData}
                  className="btn btn-primary"
                >
                  Download File
                </button>
                <button
                  onClick={() => setShowDataExport(false)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>⚠️ Delete All Data</h3>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="delete-warning">
                <p>
                  <strong>This action cannot be undone!</strong>
                </p>
                <p>
                  This will permanently delete all your mood entries, interventions, settings, 
                  and revoke all data collection consent. Your encryption keys will also be destroyed.
                </p>
              </div>
              
              <div className="delete-confirmation">
                <label htmlFor="delete-confirm">
                  Type "DELETE ALL DATA" to confirm:
                </label>
                <input
                  id="delete-confirm"
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="form-input"
                  placeholder="DELETE ALL DATA"
                />
              </div>
              
              <div className="delete-actions">
                <button
                  onClick={handleDeleteAllData}
                  className="btn btn-error"
                  disabled={deleteConfirmText !== 'DELETE ALL DATA' || isLoading}
                >
                  {isLoading ? 'Deleting...' : 'Delete All Data'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn btn-secondary"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Privacy;
