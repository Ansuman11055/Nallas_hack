// WebCrypto-based encryption utilities for mental wellness PWA

export class EncryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EncryptionError';
  }
}

/**
 * Derive a cryptographic key from a password using PBKDF2
 * @param password - User password
 * @param salt - Random salt (16 bytes)
 * @param iterations - Number of PBKDF2 iterations (default: 100,000)
 * @returns Promise<CryptoKey> - Derived AES-GCM key
 */
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

    return crypto.subtle.deriveKey(
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

/**
 * Generate a cryptographically secure random salt
 * @returns Uint8Array - 16-byte random salt
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Generate a cryptographically secure random IV for AES-GCM
 * @returns Uint8Array - 12-byte random IV
 */
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12));
}

/**
 * Encrypt data using AES-GCM with a random IV
 * @param data - Plain text data to encrypt
 * @param key - AES-GCM encryption key
 * @returns Promise<string> - Base64-encoded encrypted data (IV + ciphertext)
 */
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

/**
 * Decrypt data using AES-GCM
 * @param encryptedData - Base64-encoded encrypted data (IV + ciphertext)
 * @param key - AES-GCM decryption key
 * @returns Promise<string> - Decrypted plain text data
 */
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

/**
 * Export a CryptoKey to raw format for storage
 * @param key - CryptoKey to export
 * @returns Promise<string> - Base64-encoded key data
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  try {
    const exported = await crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  } catch (error) {
    throw new EncryptionError(`Key export failed: ${error}`);
  }
}

/**
 * Import a raw key from storage
 * @param keyData - Base64-encoded key data
 * @returns Promise<CryptoKey> - Imported AES-GCM key
 */
export async function importKey(keyData: string): Promise<CryptoKey> {
  try {
    const rawKey = new Uint8Array(
      atob(keyData).split('').map(char => char.charCodeAt(0))
    );
    
    return crypto.subtle.importKey(
      'raw',
      rawKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  } catch (error) {
    throw new EncryptionError(`Key import failed: ${error}`);
  }
}

/**
 * Generate a secure hash of data using SHA-256
 * @param data - Data to hash
 * @returns Promise<string> - Hex-encoded hash
 */
export async function hashData(data: string): Promise<string> {
  try {
    const enc = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(data));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    throw new EncryptionError(`Hashing failed: ${error}`);
  }
}

/**
 * Securely wipe sensitive data from memory (best effort)
 * @param data - Uint8Array to wipe
 */
export function secureWipe(data: Uint8Array): void {
  if (data && data.fill) {
    data.fill(0);
  }
}

/**
 * Validate encryption key strength
 * @param password - Password to validate
 * @returns ValidationResult - Validation result with errors
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate a random password
 * @param length - Password length (default: 16)
 * @returns string - Generated password
 */
export function generatePassword(length: number = 16): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  return Array.from(array, byte => charset[byte % charset.length]).join('');
}
