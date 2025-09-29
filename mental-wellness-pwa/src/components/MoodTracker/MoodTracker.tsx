import React, { useState, useRef } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useConsentCheck } from '../../contexts/ConsentContext';
import { MoodOption } from '../../types';
import QuickEntry from './QuickEntry';

const MoodTracker: React.FC = () => {
  const { saveMoodEntry, isLoading } = useDatabase();
  const { canCollectMoodData } = useConsentCheck();
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [note, setNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const moodOptions: MoodOption[] = [
    { value: 1, label: 'Very Sad', emoji: '😢', color: '#F44336' },
    { value: 2, label: 'Sad', emoji: '😞', color: '#FF9800' },
    { value: 3, label: 'Neutral', emoji: '😐', color: '#FFC107' },
    { value: 4, label: 'Happy', emoji: '🙂', color: '#4CAF50' },
    { value: 5, label: 'Very Happy', emoji: '😄', color: '#8BC34A' }
  ];

  const availableTags = [
    'work', 'family', 'health', 'sleep', 'exercise', 'social',
    'stress', 'anxiety', 'relaxation', 'achievement', 'creativity',
    'relationships', 'finances', 'weather', 'food', 'travel'
  ];

  const handleMoodSelect = (mood: MoodOption) => {
    setSelectedMood(mood);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Auto-stop after 5 seconds
      recordingTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, 5000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }
    }
  };

  const clearAudioRecording = () => {
    setAudioBlob(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMood) {
      alert('Please select a mood level');
      return;
    }

    if (!canCollectMoodData) {
      alert('Mood data collection is not enabled. Please check your privacy settings.');
      return;
    }

    try {
      await saveMoodEntry({
        timestamp: new Date(),
        moodLabel: selectedMood.label,
        intensity: selectedMood.value,
        note: note.trim(),
        tags: selectedTags,
        voiceNoteBlob: audioBlob || undefined
      });

      // Reset form
      setSelectedMood(null);
      setNote('');
      setSelectedTags([]);
      setAudioBlob(null);
      
      // Show success message or redirect
      alert('Mood entry saved successfully!');
      
    } catch (error) {
      console.error('Error saving mood entry:', error);
      alert('Failed to save mood entry. Please try again.');
    }
  };

  const characterCount = note.length;
  const maxCharacters = 500;

  if (showQuickEntry) {
    return (
      <QuickEntry 
        onClose={() => setShowQuickEntry(false)}
        onSave={async (moodData) => {
          await saveMoodEntry(moodData);
          setShowQuickEntry(false);
        }}
      />
    );
  }

  return (
    <div className="mood-tracker">
      <div className="container container-sm">
        <div className="mood-tracker-header">
          <h1>How are you feeling?</h1>
          <p>Take a moment to reflect on your current emotional state</p>
          
          <div className="entry-mode-toggle">
            <button 
              className="btn btn-secondary btn-small"
              onClick={() => setShowQuickEntry(true)}
            >
              Quick Entry
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mood-entry-form">
          {/* Mood Selection */}
          <div className="form-section">
            <h3>Select your mood level</h3>
            <div className="mood-selector">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => handleMoodSelect(mood)}
                  className={`mood-button ${selectedMood?.value === mood.value ? 'selected' : ''}`}
                  aria-label={`Select mood: ${mood.label}`}
                  aria-pressed={selectedMood?.value === mood.value}
                >
                  <span className="mood-emoji" aria-hidden="true">
                    {mood.emoji}
                  </span>
                  <span className="mood-label">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Note */}
          <div className="form-section">
            <h3>Add a note (optional)</h3>
            <div className="form-group">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="form-input form-textarea"
                placeholder="What's on your mind? Describe your feelings, what happened today, or anything else you'd like to remember..."
                maxLength={maxCharacters}
                rows={4}
              />
              <div className="character-count">
                <span className={characterCount > maxCharacters * 0.9 ? 'warning' : ''}>
                  {characterCount}/{maxCharacters}
                </span>
              </div>
            </div>
          </div>

          {/* Voice Note */}
          <div className="form-section">
            <h3>Voice note (optional)</h3>
            <div className="voice-note-section">
              {!audioBlob ? (
                <div className="voice-recording">
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`voice-record-btn ${isRecording ? 'recording' : ''}`}
                    disabled={isLoading}
                  >
                    <span className="record-icon">
                      {isRecording ? '⏹️' : '🎤'}
                    </span>
                    <span className="record-text">
                      {isRecording ? 'Stop Recording' : 'Record 5-sec Note'}
                    </span>
                  </button>
                  {isRecording && (
                    <div className="recording-indicator">
                      <div className="recording-animation"></div>
                      <span>Recording... (max 5 seconds)</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="voice-playback">
                  <audio controls src={URL.createObjectURL(audioBlob)}>
                    Your browser does not support audio playback.
                  </audio>
                  <button
                    type="button"
                    onClick={clearAudioRecording}
                    className="btn btn-secondary btn-small"
                  >
                    Clear Recording
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="form-section">
            <h3>Add tags (optional)</h3>
            <p className="section-description">
              Tag your mood entry to help identify patterns and triggers
            </p>
            <div className="tags-grid">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`tag-button ${selectedTags.includes(tag) ? 'selected' : ''}`}
                  aria-pressed={selectedTags.includes(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <div className="selected-tags">
                <span className="selected-tags-label">Selected tags:</span>
                {selectedTags.map((tag) => (
                  <span key={tag} className="selected-tag">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className="remove-tag"
                      aria-label={`Remove ${tag} tag`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={!selectedMood || isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-small"></span>
                  Saving...
                </>
              ) : (
                'Save Mood Entry'
              )}
            </button>
          </div>
        </form>

        {/* Privacy Notice */}
        <div className="privacy-notice">
          <p>
            🔒 Your mood data is encrypted and stored securely on your device. 
            Only you can access this information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
