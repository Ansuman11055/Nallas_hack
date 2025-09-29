// Database Context for managing app data operations

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  MoodEntry, 
  Baseline, 
  InterventionRun, 
  BehaviorMetrics,
  BaselineData 
} from '../types';
import { databaseService } from '../utils/database';
import { calculateBaseline, analyzeBehaviorMetrics } from '../utils/algorithms';
import { useEncryption } from './EncryptionContext';

interface DatabaseContextType {
  // Mood entries
  moodEntries: Array<MoodEntry & { note: string }>;
  saveMoodEntry: (entry: Omit<MoodEntry, 'id' | 'noteEncrypted'> & { note: string }) => Promise<void>;
  getMoodEntries: (limit?: number) => Promise<void>;
  deleteMoodEntry: (id: number) => Promise<void>;
  
  // Baseline data
  currentBaseline: BaselineData | null;
  updateBaseline: () => Promise<void>;
  
  // Interventions
  interventions: InterventionRun[];
  saveIntervention: (intervention: Omit<InterventionRun, 'id'>) => Promise<void>;
  updateIntervention: (id: number, updates: Partial<InterventionRun>) => Promise<void>;
  
  // Statistics
  stats: {
    totalMoodEntries: number;
    totalInterventions: number;
    averageMood: number;
    streakDays: number;
  };
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Data operations
  exportData: () => Promise<string>;
  clearAllData: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

interface DatabaseProviderProps {
  children: ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  const { isUnlocked, encryptionKey } = useEncryption();
  const [moodEntries, setMoodEntries] = useState<Array<MoodEntry & { note: string }>>([]);
  const [currentBaseline, setCurrentBaseline] = useState<BaselineData | null>(null);
  const [interventions, setInterventions] = useState<InterventionRun[]>([]);
  const [stats, setStats] = useState({
    totalMoodEntries: 0,
    totalInterventions: 0,
    averageMood: 3.0,
    streakDays: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data when encryption is unlocked
  useEffect(() => {
    if (isUnlocked && encryptionKey) {
      loadAllData();
    }
  }, [isUnlocked, encryptionKey]);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await Promise.all([
        getMoodEntries(50), // Load recent 50 entries
        loadInterventions(),
        updateBaseline(),
        updateStats()
      ]);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load app data');
    } finally {
      setIsLoading(false);
    }
  };

  const saveMoodEntry = async (entry: Omit<MoodEntry, 'id' | 'noteEncrypted'> & { note: string }): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const id = await databaseService.saveMoodEntry(entry);
      
      // Add to local state
      const newEntry = { ...entry, id, noteEncrypted: '' }; // noteEncrypted will be set by service
      setMoodEntries(prev => [newEntry, ...prev]);
      
      // Update baseline and stats
      await updateBaseline();
      await updateStats();
      
    } catch (err) {
      console.error('Error saving mood entry:', err);
      setError('Failed to save mood entry');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getMoodEntries = async (limit?: number): Promise<void> => {
    try {
      const entries = await databaseService.getMoodEntries(limit);
      setMoodEntries(entries);
    } catch (err) {
      console.error('Error loading mood entries:', err);
      setError('Failed to load mood entries');
      throw err;
    }
  };

  const deleteMoodEntry = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      await databaseService.deleteMoodEntry(id);
      
      // Remove from local state
      setMoodEntries(prev => prev.filter(entry => entry.id !== id));
      
      // Update baseline and stats
      await updateBaseline();
      await updateStats();
      
    } catch (err) {
      console.error('Error deleting mood entry:', err);
      setError('Failed to delete mood entry');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBaseline = async (): Promise<void> => {
    try {
      const entries = await databaseService.getMoodEntries(30); // Last 30 entries for baseline
      const moodScores = entries.map(entry => entry.intensity);
      
      if (moodScores.length > 0) {
        const baseline = calculateBaseline(moodScores);
        setCurrentBaseline(baseline);
        
        // Save baseline to database
        await databaseService.saveBaseline({
          rollingMean: baseline.rollingMean,
          rollingStd: baseline.rollingStd,
          lastUpdated: new Date(),
          baselineWindowDays: 21,
          zScore: baseline.zScore,
          changePointDetected: baseline.changePointDetected
        });
      }
    } catch (err) {
      console.error('Error updating baseline:', err);
      // Don't throw here as this is a background operation
    }
  };

  const loadInterventions = async (): Promise<void> => {
    try {
      const interventionData = await databaseService.getInterventionRuns(20);
      setInterventions(interventionData);
    } catch (err) {
      console.error('Error loading interventions:', err);
      setError('Failed to load interventions');
    }
  };

  const saveIntervention = async (intervention: Omit<InterventionRun, 'id'>): Promise<void> => {
    try {
      const id = await databaseService.saveInterventionRun(intervention);
      
      // Add to local state
      setInterventions(prev => [{ ...intervention, id }, ...prev]);
      
      await updateStats();
      
    } catch (err) {
      console.error('Error saving intervention:', err);
      setError('Failed to save intervention');
      throw err;
    }
  };

  const updateIntervention = async (id: number, updates: Partial<InterventionRun>): Promise<void> => {
    try {
      await databaseService.updateInterventionRun(id, updates);
      
      // Update local state
      setInterventions(prev => 
        prev.map(intervention => 
          intervention.id === id ? { ...intervention, ...updates } : intervention
        )
      );
      
    } catch (err) {
      console.error('Error updating intervention:', err);
      setError('Failed to update intervention');
      throw err;
    }
  };

  const updateStats = async (): Promise<void> => {
    try {
      const dbStats = await databaseService.getDatabaseStats();
      const entries = await databaseService.getMoodEntries(100);
      
      // Calculate average mood
      const averageMood = entries.length > 0 
        ? entries.reduce((sum, entry) => sum + entry.intensity, 0) / entries.length
        : 3.0;
      
      // Calculate streak (consecutive days with mood entries)
      const streakDays = calculateStreakDays(entries);
      
      setStats({
        totalMoodEntries: dbStats.moodEntries,
        totalInterventions: dbStats.interventions,
        averageMood: Math.round(averageMood * 10) / 10,
        streakDays
      });
      
    } catch (err) {
      console.error('Error updating stats:', err);
      // Don't throw here as this is a background operation
    }
  };

  const calculateStreakDays = (entries: Array<MoodEntry & { note: string }>): number => {
    if (entries.length === 0) return 0;
    
    // Sort entries by date (most recent first)
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.timestamp);
      entryDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (daysDiff > streak) {
        break;
      }
    }
    
    return streak;
  };

  const exportData = async (): Promise<string> => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('mindwell_user_id');
      
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      const exportData = await databaseService.exportAllData(userId);
      return JSON.stringify(exportData, null, 2);
      
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('Failed to export data');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('mindwell_user_id');
      
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      await databaseService.secureDeleteAllData(userId);
      
      // Clear local state
      setMoodEntries([]);
      setCurrentBaseline(null);
      setInterventions([]);
      setStats({
        totalMoodEntries: 0,
        totalInterventions: 0,
        averageMood: 3.0,
        streakDays: 0
      });
      
    } catch (err) {
      console.error('Error clearing data:', err);
      setError('Failed to clear data');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: DatabaseContextType = {
    moodEntries,
    saveMoodEntry,
    getMoodEntries,
    deleteMoodEntry,
    currentBaseline,
    updateBaseline,
    interventions,
    saveIntervention,
    updateIntervention,
    stats,
    isLoading,
    error,
    exportData,
    clearAllData
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
