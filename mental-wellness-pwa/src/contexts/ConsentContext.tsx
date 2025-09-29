// Consent Context for managing user privacy preferences

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ConsentSettings } from '../types';
import { databaseService } from '../utils/database';

interface ConsentContextType {
  consentSettings: ConsentSettings | null;
  hasGivenConsent: boolean;
  updateConsentSettings: (settings: ConsentSettings) => Promise<void>;
  revokeAllConsent: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

interface ConsentProviderProps {
  children: ReactNode;
}

const defaultConsentSettings: ConsentSettings = {
  moodDataConsent: false,
  behavioralDataConsent: false,
  analyticsConsent: false,
  crashReportingConsent: false,
  localStorageOnly: true,
  dataRetentionDays: 365
};

export const ConsentProvider: React.FC<ConsentProviderProps> = ({ children }) => {
  const [consentSettings, setConsentSettings] = useState<ConsentSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load consent settings on mount
  useEffect(() => {
    loadConsentSettings();
  }, []);

  const loadConsentSettings = async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('mindwell_user_id');
      
      if (userId) {
        const settings = await databaseService.getConsentSettings(userId);
        setConsentSettings(settings || defaultConsentSettings);
      } else {
        setConsentSettings(defaultConsentSettings);
      }
    } catch (err) {
      console.error('Error loading consent settings:', err);
      setError('Failed to load privacy settings');
      setConsentSettings(defaultConsentSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConsentSettings = async (settings: ConsentSettings): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const userId = localStorage.getItem('mindwell_user_id');
      if (!userId) {
        throw new Error('User ID not found');
      }

      await databaseService.saveConsentSettings(userId, settings);
      setConsentSettings(settings);

      // Store consent timestamp
      localStorage.setItem('mindwell_consent_timestamp', new Date().toISOString());
      
      // If user revokes local storage consent, we need to handle data migration
      if (!settings.localStorageOnly && consentSettings?.localStorageOnly) {
        // TODO: Implement cloud sync setup
        console.log('User opted into cloud sync');
      }

      // If user changes data retention period, clean up old data
      if (settings.dataRetentionDays !== consentSettings?.dataRetentionDays) {
        await cleanupOldData(settings.dataRetentionDays);
      }

    } catch (err) {
      console.error('Error updating consent settings:', err);
      setError('Failed to update privacy settings');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const revokeAllConsent = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const revokedSettings: ConsentSettings = {
        moodDataConsent: false,
        behavioralDataConsent: false,
        analyticsConsent: false,
        crashReportingConsent: false,
        localStorageOnly: true,
        dataRetentionDays: 0 // Immediate deletion
      };

      await updateConsentSettings(revokedSettings);

      // Clear all stored data
      const userId = localStorage.getItem('mindwell_user_id');
      if (userId) {
        await databaseService.secureDeleteAllData(userId);
      }

      // Clear localStorage
      localStorage.removeItem('mindwell_user_id');
      localStorage.removeItem('mindwell_salt');
      localStorage.removeItem('mindwell_key_info');
      localStorage.removeItem('mindwell_consent_timestamp');

      setConsentSettings(null);

    } catch (err) {
      console.error('Error revoking consent:', err);
      setError('Failed to revoke consent and delete data');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cleanupOldData = async (retentionDays: number): Promise<void> => {
    if (retentionDays === 0) {
      // Delete all data
      const userId = localStorage.getItem('mindwell_user_id');
      if (userId) {
        await databaseService.secureDeleteAllData(userId);
      }
      return;
    }

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // TODO: Implement selective data cleanup based on retention period
    // This would involve querying and deleting mood entries, interventions, etc.
    // that are older than the cutoff date
    console.log(`Cleaning up data older than ${cutoffDate.toISOString()}`);
  };

  const hasGivenConsent = consentSettings !== null && (
    consentSettings.moodDataConsent ||
    consentSettings.behavioralDataConsent ||
    consentSettings.analyticsConsent ||
    consentSettings.crashReportingConsent
  );

  const value: ConsentContextType = {
    consentSettings,
    hasGivenConsent,
    updateConsentSettings,
    revokeAllConsent,
    isLoading,
    error
  };

  return (
    <ConsentContext.Provider value={value}>
      {children}
    </ConsentContext.Provider>
  );
};

export const useConsent = (): ConsentContextType => {
  const context = useContext(ConsentContext);
  if (context === undefined) {
    throw new Error('useConsent must be used within a ConsentProvider');
  }
  return context;
};

// Hook for checking specific consent types
export const useConsentCheck = () => {
  const { consentSettings } = useConsent();

  const checkConsent = (type: keyof ConsentSettings): boolean => {
    if (!consentSettings) return false;
    return consentSettings[type] as boolean;
  };

  return {
    canCollectMoodData: checkConsent('moodDataConsent'),
    canCollectBehavioralData: checkConsent('behavioralDataConsent'),
    canUseAnalytics: checkConsent('analyticsConsent'),
    canReportCrashes: checkConsent('crashReportingConsent'),
    isLocalStorageOnly: checkConsent('localStorageOnly')
  };
};
