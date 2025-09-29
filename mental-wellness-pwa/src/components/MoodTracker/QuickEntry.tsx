import React, { useState } from 'react';
import { MoodOption } from '../../types';

interface QuickEntryProps {
  onClose: () => void;
  onSave: (moodData: {
    timestamp: Date;
    moodLabel: string;
    intensity: number;
    note: string;
    tags: string[];
  }) => Promise<void>;
}

const QuickEntry: React.FC<QuickEntryProps> = ({ onClose, onSave }) => {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const moodOptions: MoodOption[] = [
    { value: 1, label: 'Very Sad', emoji: '😢', color: '#F44336' },
    { value: 2, label: 'Sad', emoji: '😞', color: '#FF9800' },
    { value: 3, label: 'Neutral', emoji: '😐', color: '#FFC107' },
    { value: 4, label: 'Happy', emoji: '🙂', color: '#4CAF50' },
    { value: 5, label: 'Very Happy', emoji: '😄', color: '#8BC34A' }
  ];

  const handleMoodSelect = async (mood: MoodOption) => {
    setSelectedMood(mood);
    setIsLoading(true);
    
    try {
      await onSave({
        timestamp: new Date(),
        moodLabel: mood.label,
        intensity: mood.value,
        note: '',
        tags: []
      });
    } catch (error) {
      console.error('Error saving quick mood entry:', error);
      alert('Failed to save mood entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="quick-entry-overlay">
      <div className="quick-entry-modal">
        <div className="quick-entry-header">
          <h2>Quick Mood Check</h2>
          <button 
            onClick={onClose}
            className="close-btn"
            aria-label="Close quick entry"
            disabled={isLoading}
          >
            ×
          </button>
        </div>
        
        <div className="quick-entry-content">
          <p>How are you feeling right now?</p>
          
          <div className="quick-mood-selector">
            {moodOptions.map((mood) => (
              <button
                key={mood.value}
                onClick={() => handleMoodSelect(mood)}
                className={`quick-mood-button ${selectedMood?.value === mood.value ? 'selected' : ''}`}
                disabled={isLoading}
                aria-label={`Select mood: ${mood.label}`}
              >
                <span className="mood-emoji-large">
                  {mood.emoji}
                </span>
                <span className="mood-label-small">{mood.label}</span>
              </button>
            ))}
          </div>
          
          {isLoading && (
            <div className="quick-entry-loading">
              <div className="spinner"></div>
              <p>Saving your mood...</p>
            </div>
          )}
          
          <div className="quick-entry-footer">
            <button 
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Add More Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickEntry;
