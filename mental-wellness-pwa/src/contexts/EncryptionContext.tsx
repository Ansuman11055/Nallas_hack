// Encryption Context for managing user encryption keys

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  deriveKeyFromPassword, 
  generateSalt, 
  exportKey, 
  importKey,
  EncryptionError 
} from '../utils/encryption';
import { databaseService } from '../utils/database';

interface EncryptionContextType {
  isUnlocked: boolean;
  hasStoredKey: boolean;
  unlockWithPassword: (password: string) => Promise<boolean>;
  createNewKey: (password: string) => Promise<boolean>;
  lockApp: () => void;
  encryptionKey: CryptoKey | null;
  isLoading: boolean;
  error: string | null;
}

const EncryptionContext = createContext<EncryptionContextType | undefined>(undefined);

interface EncryptionProviderProps {
  children: ReactNode;
}

export const EncryptionProvider: React.FC<EncryptionProviderProps> = ({ children }) => {
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user has stored encryption key on mount
  useEffect(() => {
    checkStoredKey();
  }, []);

  const checkStoredKey = async () => {
    try {
      setIsLoading(true);
      const storedSalt = localStorage.getItem('mindwell_salt');
      const storedKeyInfo = localStorage.getItem('mindwell_key_info');
      
      setHasStoredKey(!!storedSalt && !!storedKeyInfo);
    } catch (err) {
      console.error('Error checking stored key:', err);
      setError('Failed to check stored encryption key');
    } finally {
      setIsLoading(false);
    }
  };

  const unlockWithPassword = async (password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const storedSalt = localStorage.getItem('mindwell_salt');
      const storedKeyInfo = localStorage.getItem('mindwell_key_info');

      if (!storedSalt || !storedKeyInfo) {
        throw new EncryptionError('No stored encryption key found');
      }

      // Convert salt from base64
      const salt = new Uint8Array(
        atob(storedSalt).split('').map(char => char.charCodeAt(0))
      );

      // Derive key from password
      const key = await deriveKeyFromPassword(password, salt);
      
      // Verify key by attempting to import stored key info
      try {
        await importKey(storedKeyInfo);
      } catch (verifyError) {
        throw new EncryptionError('Invalid password');
      }

      setEncryptionKey(key);
      setIsUnlocked(true);
      
      // Set key in database service
      databaseService.setEncryptionKey(key);

      return true;
    } catch (err) {
      console.error('Unlock error:', err);
      setError(err instanceof EncryptionError ? err.message : 'Failed to unlock app');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createNewKey = async (password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // Generate new salt
      const salt = generateSalt();
      
      // Derive key from password
      const key = await deriveKeyFromPassword(password, salt);
      
      // Export key for verification storage
      const keyInfo = await exportKey(key);

      // Store salt and key info in localStorage
      localStorage.setItem('mindwell_salt', btoa(String.fromCharCode(...salt)));
      localStorage.setItem('mindwell_key_info', keyInfo);

      setEncryptionKey(key);
      setIsUnlocked(true);
      setHasStoredKey(true);
      
      // Set key in database service
      databaseService.setEncryptionKey(key);

      // Create user record in database
      const userId = crypto.randomUUID();
      await databaseService.createUser(
        userId, 
        btoa(String.fromCharCode(...salt)), 
        keyInfo
      );
      
      // Store user ID
      localStorage.setItem('mindwell_user_id', userId);

      return true;
    } catch (err) {
      console.error('Key creation error:', err);
      setError(err instanceof EncryptionError ? err.message : 'Failed to create encryption key');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const lockApp = () => {
    setEncryptionKey(null);
    setIsUnlocked(false);
    setError(null);
    
    // Clear key from database service
    databaseService.setEncryptionKey(null as any);
  };

  const value: EncryptionContextType = {
    isUnlocked,
    hasStoredKey,
    unlockWithPassword,
    createNewKey,
    lockApp,
    encryptionKey,
    isLoading,
    error
  };

  return (
    <EncryptionContext.Provider value={value}>
      {children}
    </EncryptionContext.Provider>
  );
};

export const useEncryption = (): EncryptionContextType => {
  const context = useContext(EncryptionContext);
  if (context === undefined) {
    throw new Error('useEncryption must be used within an EncryptionProvider');
  }
  return context;
};
