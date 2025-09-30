// WebCrypto API Encryption Utilities for MindWell PWA

export class EncryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EncryptionError';
  }
}

// Generate cryptographically secure salt
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

// Generate random IV for AES-GCM
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12));
}

// Derive encryption key from password using PBKDF2
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array,
  iterations: number = 100000
): Promise<CryptoKey> {
  try {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  } catch (error) {
    throw new EncryptionError(`Key derivation failed: ${error}`);
  }
}

// Encrypt data using AES-GCM
export async function encryptData(data: string, key: CryptoKey): Promise<string> {
  try {
    const enc = new TextEncoder();
    const iv = generateIV();
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(data)
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    throw new EncryptionError(`Encryption failed: ${error}`);
  }
}

// Decrypt data using AES-GCM
export async function decryptData(encryptedData: string, key: CryptoKey): Promise<string> {
  try {
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );
    
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    throw new EncryptionError(`Decryption failed: ${error}`);
  }
}

// Export key for storage
export async function exportKey(key: CryptoKey): Promise<string> {
  try {
    const exported = await crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  } catch (error) {
    throw new EncryptionError(`Key export failed: ${error}`);
  }
}

// Import key from storage
export async function importKey(keyData: string): Promise<CryptoKey> {
  try {
    const keyBytes = new Uint8Array(
      atob(keyData).split('').map(char => char.charCodeAt(0))
    );
    
    return await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM' },
      true,
      ['encrypt', 'decrypt']
    );
  } catch (error) {
    throw new EncryptionError(`Key import failed: ${error}`);
  }
}

// Generate secure random password
export function generateSecurePassword(length: number = 32): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  return Array.from(array, byte => charset[byte % charset.length]).join('');
}

// Hash data for integrity checking
export async function hashData(data: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
    const hashArray = new Uint8Array(hashBuffer);
    return btoa(String.fromCharCode(...hashArray));
  } catch (error) {
    throw new EncryptionError(`Hashing failed: ${error}`);
  }
}
