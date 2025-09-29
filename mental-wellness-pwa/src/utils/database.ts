// IndexedDB database with Dexie.js for mental wellness PWA

import Dexie, { Table } from 'dexie';
import { 
  User, 
  MoodEntry, 
  SensorSnapshot, 
  Baseline, 
  InterventionRun,
  ConsentSettings,
  NotificationSettings,
  ExportData
} from '../types';
import { encryptData, decryptData, EncryptionError } from './encryption';

export class MentalWellnessDB extends Dexie {
  users!: Table<User>;
  moodEntries!: Table<MoodEntry>;
  sensorSnapshots!: Table<SensorSnapshot>;
  baselines!: Table<Baseline>;
  interventionRuns!: Table<InterventionRun>;
  consentSettings!: Table<ConsentSettings & { id?: number; userId: string }>;
  notificationSettings!: Table<NotificationSettings & { id?: number; userId: string }>;

  constructor() {
    super('MentalWellnessDB');
    
    this.version(1).stores({
      users: '++id, userId, createdAt',
      moodEntries: '++id, timestamp, moodLabel, intensity, tags',
      sensorSnapshots: '++id, timestamp',
      baselines: '++id, lastUpdated, baselineWindowDays',
      interventionRuns: '++id, interventionId, startTime, endTime',
      consentSettings: '++id, userId',
      notificationSettings: '++id, userId'
    });

    // Add hooks for encryption/decryption
    this.moodEntries.hook('creating', (primKey, obj, trans) => {
      // Note: Actual encryption happens in the service layer
      // This hook can be used for validation or logging
      if (!obj.timestamp) {
        obj.timestamp = new Date();
      }
    });

    this.moodEntries.hook('reading', (obj) => {
      // Ensure dates are properly parsed
      if (obj.timestamp && typeof obj.timestamp === 'string') {
        obj.timestamp = new Date(obj.timestamp);
      }
      return obj;
    });
  }
}

// Singleton database instance
export const db = new MentalWellnessDB();

// Database service class with encryption
export class DatabaseService {
  private encryptionKey: CryptoKey | null = null;

  constructor(encryptionKey?: CryptoKey) {
    this.encryptionKey = encryptionKey || null;
  }

  setEncryptionKey(key: CryptoKey): void {
    this.encryptionKey = key;
  }

  private ensureEncryptionKey(): void {
    if (!this.encryptionKey) {
      throw new EncryptionError('Encryption key not set');
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
    return await db.users.add(user);
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

    return await db.moodEntries.add(moodEntry);
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

  async getMoodEntriesByDateRange(startDate: Date, endDate: Date): Promise<Array<MoodEntry & { note: string }>> {
    this.ensureEncryptionKey();
    
    const entries = await db.moodEntries
      .where('timestamp')
      .between(startDate, endDate)
      .toArray();

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
    return await db.baselines.add(baseline);
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
    return await db.interventionRuns.add(intervention);
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

  // Sensor snapshot operations
  async saveSensorSnapshot(snapshot: Omit<SensorSnapshot, 'id'>): Promise<number> {
    return await db.sensorSnapshots.add(snapshot);
  }

  async getSensorSnapshots(limit?: number): Promise<SensorSnapshot[]> {
    let query = db.sensorSnapshots.orderBy('timestamp').reverse();
    
    if (limit) {
      query = query.limit(limit);
    }

    return await query.toArray();
  }

  // Settings operations
  async saveConsentSettings(userId: string, settings: ConsentSettings): Promise<number> {
    const existing = await db.consentSettings.where('userId').equals(userId).first();
    
    if (existing) {
      await db.consentSettings.update(existing.id!, settings);
      return existing.id!;
    } else {
      return await db.consentSettings.add({ ...settings, userId });
    }
  }

  async getConsentSettings(userId: string): Promise<ConsentSettings | undefined> {
    const settings = await db.consentSettings.where('userId').equals(userId).first();
    if (settings) {
      const { id, userId: _, ...consentSettings } = settings;
      return consentSettings;
    }
    return undefined;
  }

  async saveNotificationSettings(userId: string, settings: NotificationSettings): Promise<number> {
    const existing = await db.notificationSettings.where('userId').equals(userId).first();
    
    if (existing) {
      await db.notificationSettings.update(existing.id!, settings);
      return existing.id!;
    } else {
      return await db.notificationSettings.add({ ...settings, userId });
    }
  }

  async getNotificationSettings(userId: string): Promise<NotificationSettings | undefined> {
    const settings = await db.notificationSettings.where('userId').equals(userId).first();
    if (settings) {
      const { id, userId: _, ...notificationSettings } = settings;
      return notificationSettings;
    }
    return undefined;
  }

  // Data export
  async exportAllData(userId: string): Promise<ExportData> {
    this.ensureEncryptionKey();
    
    const moodEntries = await this.getMoodEntries();
    const interventions = await this.getInterventionRuns();
    const baselines = await this.getBaselines();
    const consentSettings = await this.getConsentSettings(userId);
    const notificationSettings = await this.getNotificationSettings(userId);

    return {
      version: '1.0.0',
      exportDate: new Date(),
      userId,
      moodEntries: moodEntries.map(({ note, ...entry }) => entry), // Remove decrypted note
      interventions,
      baseline: baselines,
      settings: {
        ...consentSettings!,
        ...notificationSettings!
      }
    };
  }

  // Secure data deletion
  async secureDeleteAllData(userId: string): Promise<void> {
    await db.transaction('rw', [
      db.users,
      db.moodEntries,
      db.sensorSnapshots,
      db.baselines,
      db.interventionRuns,
      db.consentSettings,
      db.notificationSettings
    ], async () => {
      // Delete all user data
      await db.users.where('userId').equals(userId).delete();
      await db.moodEntries.clear(); // Assuming single user for now
      await db.sensorSnapshots.clear();
      await db.baselines.clear();
      await db.interventionRuns.clear();
      await db.consentSettings.where('userId').equals(userId).delete();
      await db.notificationSettings.where('userId').equals(userId).delete();
    });

    // Clear encryption key
    this.encryptionKey = null;
  }

  // Database statistics
  async getDatabaseStats(): Promise<{
    moodEntries: number;
    interventions: number;
    baselines: number;
    sensorSnapshots: number;
  }> {
    const [moodEntries, interventions, baselines, sensorSnapshots] = await Promise.all([
      db.moodEntries.count(),
      db.interventionRuns.count(),
      db.baselines.count(),
      db.sensorSnapshots.count()
    ]);

    return {
      moodEntries,
      interventions,
      baselines,
      sensorSnapshots
    };
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
