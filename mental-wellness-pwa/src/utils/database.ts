// IndexedDB Database with Dexie.js for MindWell PWA
import Dexie, { Table } from 'dexie';
import { encryptData, decryptData } from './encryption';

// Database Interfaces
export interface User {
  id?: number;
  userId: string;
  createdAt: Date;
  salt: string;
  encryptedKeyInfo: string;
}

export interface MoodEntry {
  id?: number;
  timestamp: Date;
  moodLabel: string;
  intensity: number; // 1-5 scale
  noteEncrypted: string;
  tags: string[];
  voiceNoteBlob?: Blob;
}

export interface Baseline {
  id?: number;
  rollingMean: number;
  rollingStd: number;
  lastUpdated: Date;
  baselineWindowDays: number;
  zScore?: number;
  changePointDetected?: boolean;
}

export interface InterventionRun {
  id?: number;
  interventionId: string;
  startTime: Date;
  endTime?: Date;
  outcome?: string;
  effectiveness?: number; // 1-5 scale
}

export interface ConsentSettings {
  id?: number;
  userId: string;
  moodDataConsent: boolean;
  behavioralDataConsent: boolean;
  analyticsConsent: boolean;
  localStorageOnly: boolean;
  dataRetentionDays: number;
  lastUpdated: Date;
}

// Dexie Database Class
export class MindWellDatabase extends Dexie {
  users!: Table<User>;
  moodEntries!: Table<MoodEntry>;
  baselines!: Table<Baseline>;
  interventionRuns!: Table<InterventionRun>;
  consentSettings!: Table<ConsentSettings>;

  constructor() {
    super('MindWellDB');
    
    this.version(1).stores({
      users: '++id, userId, createdAt',
      moodEntries: '++id, timestamp, intensity, moodLabel',
      baselines: '++id, lastUpdated',
      interventionRuns: '++id, interventionId, startTime',
      consentSettings: '++id, userId, lastUpdated'
    });
  }
}

// Database instance
export const db = new MindWellDatabase();

// Database Service Class
export class DatabaseService {
  private encryptionKey: CryptoKey | null = null;

  setEncryptionKey(key: CryptoKey) {
    this.encryptionKey = key;
  }

  private ensureEncryptionKey() {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not set');
    }
  }

  // User operations
  async createUser(userId: string, salt: string, encryptedKeyInfo: string): Promise<number> {
    const user: User = {
      userId,
      createdAt: new Date(),
      salt,
      encryptedKeyInfo
    };
    return await db.users.add(user) as number;
  }

  async getUser(userId: string): Promise<User | undefined> {
    return await db.users.where('userId').equals(userId).first();
  }

  // Mood entry operations
  async saveMoodEntry(entry: Omit<MoodEntry, 'id' | 'noteEncrypted'> & { note: string }): Promise<number> {
    this.ensureEncryptionKey();
    
    const encryptedNote = await encryptData(entry.note, this.encryptionKey!);
    
    const moodEntry: Omit<MoodEntry, 'id'> = {
      timestamp: entry.timestamp,
      moodLabel: entry.moodLabel,
      intensity: entry.intensity,
      noteEncrypted: encryptedNote,
      tags: entry.tags,
      voiceNoteBlob: entry.voiceNoteBlob
    };

    return await db.moodEntries.add(moodEntry) as number;
  }

  async getMoodEntries(limit?: number, offset?: number): Promise<Array<MoodEntry & { note: string }>> {
    this.ensureEncryptionKey();
    
    let query = db.moodEntries.orderBy('timestamp').reverse();
    
    if (offset) {
      query = query.offset(offset);
    }
    
    if (limit) {
      query = query.limit(limit);
    }

    const entries = await query.toArray();
    
    // Decrypt notes
    const decryptedEntries = await Promise.all(
      entries.map(async (entry) => {
        try {
          const note = await decryptData(entry.noteEncrypted, this.encryptionKey!);
          return { ...entry, note };
        } catch (error) {
          console.error('Failed to decrypt mood entry note:', error);
          return { ...entry, note: '[Decryption failed]' };
        }
      })
    );

    return decryptedEntries;
  }

  async deleteMoodEntry(id: number): Promise<void> {
    await db.moodEntries.delete(id);
  }

  // Baseline operations
  async saveBaseline(baseline: Omit<Baseline, 'id'>): Promise<number> {
    return await db.baselines.add(baseline) as number;
  }

  async getLatestBaseline(): Promise<Baseline | undefined> {
    return await db.baselines.orderBy('lastUpdated').reverse().first();
  }

  async getBaselines(limit?: number): Promise<Baseline[]> {
    let query = db.baselines.orderBy('lastUpdated').reverse();
    
    if (limit) {
      query = query.limit(limit);
    }

    return await query.toArray();
  }

  // Intervention operations
  async saveInterventionRun(intervention: Omit<InterventionRun, 'id'>): Promise<number> {
    return await db.interventionRuns.add(intervention) as number;
  }

  async getInterventionRuns(limit?: number): Promise<InterventionRun[]> {
    let query = db.interventionRuns.orderBy('startTime').reverse();
    
    if (limit) {
      query = query.limit(limit);
    }

    return await query.toArray();
  }

  async updateInterventionRun(id: number, updates: Partial<InterventionRun>): Promise<number> {
    return await db.interventionRuns.update(id, updates);
  }

  // Consent operations
  async saveConsentSettings(userId: string, settings: Omit<ConsentSettings, 'id' | 'userId' | 'lastUpdated'>): Promise<number> {
    const existing = await db.consentSettings.where('userId').equals(userId).first();
    
    if (existing) {
      await db.consentSettings.update(existing.id!, { ...settings, lastUpdated: new Date() });
      return existing.id!;
    } else {
      return await db.consentSettings.add({ 
        ...settings, 
        userId, 
        lastUpdated: new Date() 
      }) as number;
    }
  }

  async getConsentSettings(userId: string): Promise<ConsentSettings | undefined> {
    return await db.consentSettings.where('userId').equals(userId).first();
  }

  // Data export
  async exportAllData(userId: string): Promise<any> {
    const user = await this.getUser(userId);
    const moodEntries = await this.getMoodEntries();
    const baselines = await this.getBaselines();
    const interventions = await this.getInterventionRuns();
    const consent = await this.getConsentSettings(userId);

    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      userId,
      user,
      moodEntries,
      baselines,
      interventions,
      consent
    };
  }

  // Secure delete
  async secureDeleteAllData(userId: string): Promise<void> {
    await db.transaction('rw', [db.users, db.moodEntries, db.baselines, db.interventionRuns, db.consentSettings], async () => {
      await db.users.where('userId').equals(userId).delete();
      await db.moodEntries.clear(); // Clear all mood entries for privacy
      await db.baselines.clear();
      await db.interventionRuns.clear();
      await db.consentSettings.where('userId').equals(userId).delete();
    });
  }
}

// Export singleton instance
export const dbService = new DatabaseService();
