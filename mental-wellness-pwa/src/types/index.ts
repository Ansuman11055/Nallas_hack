// Core Types for Mental Wellness PWA

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

export interface SensorSnapshot {
  id?: number;
  timestamp: Date;
  anonymizedFeaturesHash: string;
  vector: number[];
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

export interface BaselineData {
  rollingMean: number;
  rollingStd: number;
  zScore: number;
  changePointDetected: boolean;
}

export interface BehaviorMetrics {
  typingLatencyMean: number;
  burstCount: number;
  sessionCount: number;
  screenTime: number;
  anomalyScore: number;
}

export interface InterventionRecommendation {
  interventionId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  estimatedDuration: number; // in minutes
}

export interface ConsentSettings {
  moodDataConsent: boolean;
  behavioralDataConsent: boolean;
  analyticsConsent: boolean;
  crashReportingConsent: boolean;
  localStorageOnly: boolean;
  dataRetentionDays: number;
}

export interface CrisisResource {
  name: string;
  phone?: string;
  text?: string;
  email?: string;
  url?: string;
  available24h: boolean;
  countryCode: string;
}

export interface VRScene {
  id: string;
  name: string;
  description: string;
  skyColor: string;
  ambientAudio?: string;
  elements: VRElement[];
  duration: number; // in seconds
}

export interface VRElement {
  type: 'box' | 'sphere' | 'cylinder' | 'plane' | 'sky' | 'sound';
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  src?: string;
  animation?: {
    property: string;
    to: string;
    dur: number;
    repeat: 'indefinite' | number;
  };
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  intent?: string;
  suggestedIntervention?: string;
}

export interface ChatPattern {
  pattern: RegExp;
  responses: string[];
  intent: string;
  suggestedIntervention?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface EncryptionError extends Error {
  name: 'EncryptionError';
}

export interface KeystrokeEvent {
  timestamp: number;
  latency: number;
  keyCode?: string;
}

export interface SessionEvent {
  startTime: Date;
  endTime: Date;
  duration: number;
  featuresUsed: string[];
}

export interface MoodOption {
  value: number;
  label: string;
  emoji: string;
  color: string;
}

export interface InterventionModule {
  id: string;
  name: string;
  description: string;
  type: 'breathing' | 'grounding' | 'affirmation' | 'mindful' | 'vr';
  duration: number;
  instructions: string[];
  audioGuide?: string;
  visualGuide?: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  moodReminders: boolean;
  interventionSuggestions: boolean;
  dailyCheckin: boolean;
  crisisAlerts: boolean;
  reminderTimes: string[]; // HH:MM format
}

export interface ExportData {
  version: string;
  exportDate: Date;
  userId: string;
  moodEntries: MoodEntry[];
  interventions: InterventionRun[];
  settings: ConsentSettings & NotificationSettings;
  baseline: Baseline[];
}

export interface AppState {
  isOnline: boolean;
  isLoading: boolean;
  currentUser: User | null;
  consentGiven: boolean;
  encryptionKey: CryptoKey | null;
  language: string;
  theme: 'light' | 'dark' | 'auto';
}
