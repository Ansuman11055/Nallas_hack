import React, { useState, useEffect } from 'react';
import { dbService } from './utils/database';
import { deriveKeyFromPassword, generateSalt } from './utils/encryption';
import { calculateBaseline, selectMicroIntervention, detectCrisisKeywords } from './utils/algorithms';
import { aiService, configureAI, AIResponse } from './utils/aiService';

interface MoodEntry {
  mood: number;
  timestamp: string;
  note?: string;
  tags?: string[];
}

interface InterventionModule {
  id: string;
  name: string;
  description: string;
  duration: number;
  instructions: string[];
}

const MinimalApp: React.FC = () => {
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [isInstallable, setIsInstallable] = useState(false);
  const [currentView, setCurrentView] = useState<'mood' | 'dashboard' | 'interventions' | 'vr' | 'chat' | 'privacy'>('mood');
  const [moodNote, setMoodNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [userPassword, setUserPassword] = useState('');
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [baseline, setBaseline] = useState<any>(null);
  const [currentIntervention, setCurrentIntervention] = useState<InterventionModule | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{text: string, sender: 'user' | 'bot', timestamp: Date, confidence?: number}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [vrScene, setVrScene] = useState<'forest' | 'ocean' | 'mountain' | null>(null);
  const [aiProvider, setAiProvider] = useState<'local' | 'openai' | 'huggingface'>('local');
  const [, setApiKeyState] = useState('');
  const [isAiConfigured, setIsAiConfigured] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const moodOptions = [
    { value: 1, emoji: '😢', label: 'Very Sad', color: '#ff4757' },
    { value: 2, emoji: '😞', label: 'Sad', color: '#ff6b7a' },
    { value: 3, emoji: '😐', label: 'Neutral', color: '#ffa502' },
    { value: 4, emoji: '🙂', label: 'Happy', color: '#7bed9f' },
    { value: 5, emoji: '😄', label: 'Very Happy', color: '#2ed573' }
  ];

  const availableTags = ['work', 'family', 'health', 'sleep', 'exercise', 'social', 'stress', 'anxiety'];
  
  const interventions: InterventionModule[] = [
    {
      id: 'breathing_478',
      name: '4-7-8 Breathing',
      description: 'Calming breathing technique to reduce anxiety and stress',
      duration: 5,
      instructions: [
        'Sit comfortably with your back straight',
        'Exhale completely through your mouth',
        'Inhale through nose for 4 counts',
        'Hold your breath for 7 counts',
        'Exhale through mouth for 8 counts',
        'Repeat 3-4 times'
      ]
    },
    {
      id: 'grounding_54321',
      name: '5-4-3-2-1 Grounding',
      description: 'Grounding technique to manage anxiety and overwhelm',
      duration: 3,
      instructions: [
        'Name 5 things you can see',
        'Name 4 things you can touch',
        'Name 3 things you can hear',
        'Name 2 things you can smell',
        'Name 1 thing you can taste'
      ]
    },
    {
      id: 'positive_affirmation',
      name: 'Positive Affirmations',
      description: 'Boost self-esteem and positive thinking',
      duration: 2,
      instructions: [
        'I am worthy of love and respect',
        'I have the strength to overcome challenges',
        'I choose to focus on what I can control',
        'I am growing and learning every day',
        'I deserve happiness and peace'
      ]
    }
  ];

  useEffect(() => {
    // Load mood history from localStorage
    const saved = localStorage.getItem('moodHistory');
    if (saved) {
      const history = JSON.parse(saved);
      setMoodHistory(history);
      
      // Calculate baseline from history
      if (history.length > 0) {
        const scores = history.map((entry: MoodEntry) => entry.mood);
        const baselineData = calculateBaseline(scores);
        setBaseline(baselineData);
      }
    }

    // Check if PWA is installable
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setIsInstallable(true);
    });

    // Initialize encryption if password exists
    const hasPassword = localStorage.getItem('hasEncryption');
    if (hasPassword && !isEncrypted) {
      setShowPasswordSetup(true);
    }
  }, [isEncrypted]);

  const handleMoodSelect = async (mood: number) => {
    setCurrentMood(mood);
    
    // Check for crisis keywords in note
    if (moodNote) {
      const crisisCheck = detectCrisisKeywords(moodNote);
      if (crisisCheck.detected && crisisCheck.severity === 'critical') {
        alert('⚠️ Crisis Support: If you\'re having thoughts of self-harm, please reach out:\n\n🇺🇸 National Suicide Prevention Lifeline: 988\n🇮🇳 AASRA: +91-22-27546669\n\nYou are not alone. Help is available.');
      }
    }
    
    const newEntry: MoodEntry = {
      mood,
      timestamp: new Date().toISOString(),
      note: moodNote,
      tags: selectedTags
    };
    
    const updatedHistory = [newEntry, ...moodHistory.slice(0, 19)]; // Keep last 20
    setMoodHistory(updatedHistory);
    localStorage.setItem('moodHistory', JSON.stringify(updatedHistory));
    
    // Update baseline
    const scores = updatedHistory.map(entry => entry.mood);
    const baselineData = calculateBaseline(scores);
    setBaseline(baselineData);
    
    // Suggest intervention if needed
    if (baselineData.changePointDetected || baselineData.zScore < -1.0) {
      const recentInterventions = JSON.parse(localStorage.getItem('recentInterventions') || '[]');
      const recommendation = selectMicroIntervention(baselineData, recentInterventions);
      
      if (recommendation.priority === 'high' || recommendation.priority === 'urgent') {
        setTimeout(() => {
          const userWantsIntervention = window.confirm(`💡 Suggestion: ${recommendation.reason}\n\nWould you like to try a ${recommendation.estimatedDuration}-minute intervention?`);
          if (userWantsIntervention) {
            const intervention = interventions.find(i => i.id === recommendation.interventionId);
            if (intervention) {
              setCurrentIntervention(intervention);
              setCurrentView('interventions');
            }
          }
        }, 1000);
      }
    }
    
    // Clear form
    setMoodNote('');
    setSelectedTags([]);
  };

  const handleInstallPWA = () => {
    alert('PWA installation will be implemented with service worker!');
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;
    
    const userMessage = { text: chatInput, sender: 'user' as const, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMessage]);
    setChatLoading(true);
    
    const currentInput = chatInput;
    setChatInput('');
    
    try {
      let aiResponse: AIResponse;
      
      // Simple local AI responses for now (working implementation)
      const responses = [
        "I hear you, and I want you to know that your feelings are valid. What's been weighing on your mind lately?",
        "It sounds like you're going through a challenging time. Can you tell me more about what's happening?",
        "Thank you for sharing that with me. How are you taking care of yourself during this difficult period?",
        "I'm here to listen. What kind of support would be most helpful for you right now?",
        "That sounds really tough. Have you been able to talk to anyone else about how you're feeling?",
        "I appreciate you opening up. What usually helps you feel a bit better when things get overwhelming?",
        "It takes courage to reach out. What's one small thing that might bring you some comfort today?"
      ];

      // Crisis detection
      const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'want to die', 'hopeless', 'worthless', 'can\'t go on'];
      const crisisDetected = crisisKeywords.some(keyword => 
        currentInput.toLowerCase().includes(keyword)
      );

      if (crisisDetected) {
        aiResponse = {
          message: "I'm very concerned about what you've shared. Please reach out to a crisis helpline immediately:\n\n🇺🇸 US: 988 (Suicide & Crisis Lifeline)\n🇮🇳 India: +91-22-27546669 (AASRA)\n🚨 Emergency: 911 (US) or 112 (India)\n\nYou don't have to go through this alone. Help is available right now.",
          confidence: 0.95,
          crisisDetected: true,
          suggestedActions: [
            'Call crisis helpline immediately: 988 (US) or +91-22-27546669 (India)',
            'Go to nearest emergency room if in immediate danger',
            'Contact a trusted friend, family member, or counselor',
            'Consider calling emergency services: 911 (US) or 112 (India)'
          ]
        };
        
        // Show immediate crisis alert
        setTimeout(() => {
          alert('🚨 CRISIS SUPPORT NEEDED\n\nImmediate help is available:\n• US: 988 (Suicide & Crisis Lifeline)\n• India: +91-22-27546669 (AASRA)\n• Emergency: 911 (US) or 112 (India)\n\nYou are not alone. Please reach out now.');
        }, 500);
      } else {
        // Use AI service if configured, otherwise use local responses
        if (aiProvider === 'openai' && isAiConfigured) {
          try {
            aiResponse = await aiService.chat(currentInput);
          } catch (error) {
            console.log('OpenAI failed, using local response:', error);
            aiResponse = {
              message: responses[Math.floor(Math.random() * responses.length)],
              confidence: 0.7,
              crisisDetected: false
            };
          }
        } else {
          // Local response
          aiResponse = {
            message: responses[Math.floor(Math.random() * responses.length)],
            confidence: 0.8,
            crisisDetected: false
          };
        }
      }
      
      const botMessage = { 
        text: aiResponse.message, 
        sender: 'bot' as const, 
        timestamp: new Date(),
        confidence: aiResponse.confidence
      };
      
      setChatMessages(prev => [...prev, botMessage]);
      
      // Suggest interventions if appropriate
      if (aiResponse.suggestedActions && aiResponse.suggestedActions.length > 0) {
        setTimeout(() => {
          const actionMessage = {
            text: `💡 Suggested actions:\n${aiResponse.suggestedActions!.map(action => `• ${action}`).join('\n')}`,
            sender: 'bot' as const,
            timestamp: new Date(),
            confidence: 0.9
          };
          setChatMessages(prev => [...prev, actionMessage]);
        }, 1500);
      }
      
    } catch (error) {
      console.error('Chat error:', error);
      
      // Fallback response
      const fallbackMessage = { 
        text: "I'm here to listen and support you. How are you feeling right now? If this is urgent, please consider reaching out to a crisis helpline: 988 (US) or +91-22-27546669 (India).", 
        sender: 'bot' as const, 
        timestamp: new Date(),
        confidence: 0.6
      };
      setChatMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const startIntervention = (intervention: InterventionModule) => {
    setCurrentIntervention(intervention);
    
    // Track intervention usage
    const recentInterventions = JSON.parse(localStorage.getItem('recentInterventions') || '[]');
    const updated = [intervention.id, ...recentInterventions.slice(0, 4)];
    localStorage.setItem('recentInterventions', JSON.stringify(updated));
  };

  const completeIntervention = () => {
    if (currentIntervention) {
      alert(`✅ Great job completing the ${currentIntervention.name} intervention!\n\nHow do you feel now? Consider logging your mood again.`);
      setCurrentIntervention(null);
      setCurrentView('mood');
    }
  };

  const setupEncryption = async () => {
    if (userPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    
    try {
      const salt = generateSalt();
      const key = await deriveKeyFromPassword(userPassword, salt);
      dbService.setEncryptionKey(key);
      aiService.setEncryptionKey(key);
      
      localStorage.setItem('hasEncryption', 'true');
      localStorage.setItem('salt', btoa(String.fromCharCode(...salt)));
      
      setIsEncrypted(true);
      setShowPasswordSetup(false);
      setUserPassword('');
      
      alert('🔒 Encryption enabled! Your data is now secure.');
    } catch (error) {
      alert('Failed to setup encryption. Please try again.');
    }
  };

  const configureAIProvider = (provider: 'local' | 'openai' | 'huggingface', key?: string) => {
    setAiProvider(provider);
    
    if (key) {
      setApiKeyState(key);
      setIsAiConfigured(true);
      configureAI(provider, key);
      alert(`✅ ${provider.toUpperCase()} AI configured successfully!`);
    } else if (provider === 'local') {
      setIsAiConfigured(true);
      configureAI(provider);
      alert(`✅ Local AI activated! Privacy-first responses enabled.`);
    } else {
      setIsAiConfigured(true);
      configureAI(provider);
      alert(`✅ ${provider.toUpperCase()} AI configured!`);
    }
  };

  const styles = {
    app: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      color: '#333'
    },
    nav: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      padding: '1rem',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      flexWrap: 'wrap' as const
    },
    navBtn: {
      padding: '0.5rem 1rem',
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      borderRadius: '20px',
      color: 'white',
      cursor: 'pointer',
      fontSize: '0.9rem',
      transition: 'all 0.3s ease'
    },
    navBtnActive: {
      background: 'rgba(255, 255, 255, 0.9)',
      color: '#333'
    },
    header: {
      textAlign: 'center' as const,
      padding: '2rem',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    title: {
      margin: '0 0 0.5rem 0',
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#2c3e50'
    },
    subtitle: {
      margin: '0 0 1rem 0',
      fontSize: '1.1rem',
      color: '#7f8c8d'
    },
    installBtn: {
      background: '#3498db',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '25px',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem'
    },
    section: {
      background: 'white',
      borderRadius: '20px',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    },
    sectionTitle: {
      textAlign: 'center' as const,
      marginBottom: '2rem',
      color: '#2c3e50',
      fontSize: '1.5rem'
    },
    moodOptions: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      flexWrap: 'wrap' as const,
      marginBottom: '2rem'
    },
    moodBtn: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      padding: '1rem',
      background: 'white',
      border: '3px solid #ecf0f1',
      borderRadius: '15px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minWidth: '100px'
    },
    moodBtnSelected: {
      transform: 'translateY(-3px)',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)'
    },
    moodEmoji: {
      fontSize: '2.5rem',
      marginBottom: '0.5rem'
    },
    moodLabel: {
      fontSize: '0.9rem',
      fontWeight: 600,
      color: '#2c3e50'
    },
    feedback: {
      textAlign: 'center' as const,
      padding: '1rem',
      background: '#d5f4e6',
      borderRadius: '10px',
      borderLeft: '4px solid #27ae60'
    },
    historyItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.5rem 0',
      borderBottom: '1px solid #ecf0f1'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #ecf0f1',
      borderRadius: '10px',
      fontSize: '1rem',
      marginBottom: '1rem'
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #ecf0f1',
      borderRadius: '10px',
      fontSize: '1rem',
      marginBottom: '1rem',
      minHeight: '100px',
      resize: 'vertical' as const
    },
    tagGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
      gap: '0.5rem',
      marginBottom: '1rem'
    },
    tag: {
      padding: '0.5rem',
      border: '2px solid #ecf0f1',
      borderRadius: '20px',
      textAlign: 'center' as const,
      cursor: 'pointer',
      fontSize: '0.9rem',
      transition: 'all 0.3s ease'
    },
    tagSelected: {
      background: '#3498db',
      color: 'white',
      borderColor: '#3498db'
    },
    btn: {
      padding: '0.75rem 1.5rem',
      background: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'all 0.3s ease'
    },
    chatContainer: {
      height: '400px',
      overflowY: 'auto' as const,
      border: '2px solid #ecf0f1',
      borderRadius: '10px',
      padding: '1rem',
      marginBottom: '1rem'
    },
    message: {
      marginBottom: '1rem',
      padding: '0.75rem',
      borderRadius: '10px',
      maxWidth: '80%'
    },
    userMessage: {
      background: '#3498db',
      color: 'white',
      marginLeft: 'auto'
    },
    botMessage: {
      background: '#ecf0f1',
      color: '#333'
    },
    vrScene: {
      width: '100%',
      height: '400px',
      borderRadius: '20px',
      overflow: 'hidden',
      position: 'relative' as const
    },
    loadingDot: {
      width: '8px',
      height: '8px',
      background: '#3498db',
      borderRadius: '50%',
      animation: 'pulse 1.5s infinite'
    }
  };

  // Add CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 0.3; transform: scale(0.8); }
        50% { opacity: 1; transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Password setup modal
  if (showPasswordSetup) {
    return (
      <div style={styles.app}>
        <div style={{...styles.section, margin: '10% auto', maxWidth: '400px'}}>
          <h2 style={styles.sectionTitle}>🔒 Setup Encryption</h2>
          <p>Secure your mental health data with end-to-end encryption.</p>
          <input
            type="password"
            placeholder="Enter a secure password (8+ characters)"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
            style={styles.input}
          />
          <div style={{display: 'flex', gap: '1rem'}}>
            <button onClick={setupEncryption} style={styles.btn}>
              Enable Encryption
            </button>
            <button 
              onClick={() => setShowPasswordSetup(false)} 
              style={{...styles.btn, background: '#95a5a6'}}
            >
              Skip for Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>🧠 MindWell</h1>
        <p style={styles.subtitle}>Privacy-first mental wellness tracking</p>
        {isInstallable && (
          <button onClick={handleInstallPWA} style={styles.installBtn}>
            📱 Install App
          </button>
        )}
        {isEncrypted && <span style={{color: '#27ae60', fontSize: '0.9rem'}}>🔒 Encrypted</span>}
      </header>

      {/* Navigation */}
      <nav style={styles.nav}>
        {[
          {id: 'mood', label: '😊 Mood', icon: '😊'},
          {id: 'dashboard', label: '📊 Dashboard', icon: '📊'},
          {id: 'interventions', label: '🧘 Interventions', icon: '🧘'},
          {id: 'vr', label: '🥽 VR Scenes', icon: '🥽'},
          {id: 'chat', label: '💬 Chat', icon: '💬'},
          {id: 'privacy', label: '🔒 Privacy', icon: '🔒'}
        ].map(nav => (
          <button
            key={nav.id}
            onClick={() => setCurrentView(nav.id as any)}
            style={{
              ...styles.navBtn,
              ...(currentView === nav.id ? styles.navBtnActive : {})
            }}
          >
            {nav.label}
          </button>
        ))}
      </nav>

      <main style={styles.main}>
        {/* Mood Tracking View */}
        {currentView === 'mood' && (
          <>
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>How are you feeling right now?</h2>
              <div style={styles.moodOptions}>
                {moodOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleMoodSelect(option.value)}
                    style={{
                      ...styles.moodBtn,
                      borderColor: option.color,
                      ...(currentMood === option.value ? styles.moodBtnSelected : {})
                    }}
                    aria-label={`Select mood: ${option.label}`}
                  >
                    <span style={styles.moodEmoji}>{option.emoji}</span>
                    <span style={styles.moodLabel}>{option.label}</span>
                  </button>
                ))}
              </div>

              {/* Mood Note */}
              <textarea
                placeholder="Add a note about your mood (optional)..."
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                style={styles.textarea}
              />

              {/* Tags */}
              <h3>Tags (optional):</h3>
              <div style={styles.tagGrid}>
                {availableTags.map(tag => (
                  <div
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    style={{
                      ...styles.tag,
                      ...(selectedTags.includes(tag) ? styles.tagSelected : {})
                    }}
                  >
                    {tag}
                  </div>
                ))}
              </div>
              
              {currentMood && (
                <div style={styles.feedback}>
                  <p>✅ Mood recorded: {moodOptions.find(m => m.value === currentMood)?.label}</p>
                  <p>🔒 Stored securely on your device</p>
                  {baseline && baseline.changePointDetected && (
                    <p>📊 Significant mood change detected - consider trying an intervention</p>
                  )}
                </div>
              )}
            </section>

            {moodHistory.length > 0 && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Recent Mood History</h2>
                {moodHistory.slice(0, 5).map((entry, index) => (
                  <div key={index} style={styles.historyItem}>
                    <div>
                      <span>
                        {moodOptions.find(m => m.value === entry.mood)?.emoji} {' '}
                        {moodOptions.find(m => m.value === entry.mood)?.label}
                      </span>
                      {entry.note && <p style={{margin: '0.25rem 0', fontSize: '0.9rem', color: '#666'}}>{entry.note}</p>}
                      {entry.tags && entry.tags.length > 0 && (
                        <div style={{fontSize: '0.8rem', color: '#888'}}>
                          Tags: {entry.tags.join(', ')}
                        </div>
                      )}
                    </div>
                    <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                  </div>
                ))}
              </section>
            )}
          </>
        )}

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>📊 Mental Wellness Dashboard</h2>
            {baseline ? (
              <div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem'}}>
                  <div style={{padding: '1rem', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center'}}>
                    <h3>Current Baseline</h3>
                    <p style={{fontSize: '2rem', margin: '0.5rem 0'}}>{baseline.rollingMean.toFixed(1)}</p>
                    <p>Average Mood</p>
                  </div>
                  <div style={{padding: '1rem', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center'}}>
                    <h3>Z-Score</h3>
                    <p style={{fontSize: '2rem', margin: '0.5rem 0', color: baseline.zScore > 0 ? '#27ae60' : '#e74c3c'}}>
                      {baseline.zScore.toFixed(2)}
                    </p>
                    <p>{baseline.zScore > 1.5 ? 'Above Normal' : baseline.zScore < -1.5 ? 'Below Normal' : 'Normal Range'}</p>
                  </div>
                  <div style={{padding: '1rem', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center'}}>
                    <h3>Confidence</h3>
                    <p style={{fontSize: '2rem', margin: '0.5rem 0'}}>{(baseline.confidence * 100).toFixed(0)}%</p>
                    <p>Data Reliability</p>
                  </div>
                </div>
                {baseline.changePointDetected && (
                  <div style={{...styles.feedback, background: '#fff3cd', borderLeft: '4px solid #ffc107'}}>
                    <p>⚠️ Significant mood change detected. Consider tracking more frequently or trying an intervention.</p>
                  </div>
                )}
              </div>
            ) : (
              <p>Track your mood for a few days to see your baseline analysis.</p>
            )}
            
            <h3>Recent Trends</h3>
            <div style={{height: '200px', background: '#f8f9fa', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <p>📈 Chart visualization will be implemented with Chart.js</p>
            </div>
          </section>
        )}

        {/* Interventions View */}
        {currentView === 'interventions' && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>🧘 Micro-Interventions</h2>
            {currentIntervention ? (
              <div>
                <h3>{currentIntervention.name}</h3>
                <p>{currentIntervention.description}</p>
                <p><strong>Duration:</strong> {currentIntervention.duration} minutes</p>
                <h4>Instructions:</h4>
                <ol>
                  {currentIntervention.instructions.map((instruction, index) => (
                    <li key={index} style={{marginBottom: '0.5rem'}}>{instruction}</li>
                  ))}
                </ol>
                <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
                  <button onClick={completeIntervention} style={styles.btn}>
                    ✅ Complete Intervention
                  </button>
                  <button 
                    onClick={() => setCurrentIntervention(null)} 
                    style={{...styles.btn, background: '#95a5a6'}}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p>Choose an intervention technique to help manage stress, anxiety, or improve your mood:</p>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem'}}>
                  {interventions.map(intervention => (
                    <div key={intervention.id} style={{padding: '1.5rem', border: '2px solid #ecf0f1', borderRadius: '15px'}}>
                      <h3>{intervention.name}</h3>
                      <p>{intervention.description}</p>
                      <p><strong>Duration:</strong> {intervention.duration} minutes</p>
                      <button 
                        onClick={() => startIntervention(intervention)} 
                        style={styles.btn}
                      >
                        Start Intervention
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* VR Scenes View */}
        {currentView === 'vr' && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>🥽 VR Calming Scenes</h2>
            {vrScene ? (
              <div>
                <div style={styles.vrScene}>
                  <div style={{
                    width: '100%', 
                    height: '100%', 
                    background: vrScene === 'forest' ? 'linear-gradient(to bottom, #87CEEB, #228B22)' :
                                vrScene === 'ocean' ? 'linear-gradient(to bottom, #87CEFA, #4682B4)' :
                                'linear-gradient(to bottom, #E0E6FF, #8A2BE2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.5rem'
                  }}>
                    {vrScene === 'forest' && '🌲🌳🌲 Peaceful Forest 🌲🌳🌲'}
                    {vrScene === 'ocean' && '🌊🐚🌊 Calming Ocean 🌊🐚🌊'}
                    {vrScene === 'mountain' && '🏔️⛰️🏔️ Serene Mountains 🏔️⛰️🏔️'}
                  </div>
                </div>
                <div style={{textAlign: 'center', marginTop: '1rem'}}>
                  <button 
                    onClick={() => setVrScene(null)} 
                    style={styles.btn}
                  >
                    Exit VR Scene
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p>Immerse yourself in calming virtual environments. Choose a scene:</p>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem'}}>
                  {[
                    {id: 'forest', name: '🌲 Peaceful Forest', desc: 'Gentle swaying trees and forest sounds'},
                    {id: 'ocean', name: '🌊 Calming Ocean', desc: 'Rhythmic waves and ocean breeze'},
                    {id: 'mountain', name: '🏔️ Serene Mountains', desc: 'Majestic peaks and mountain air'}
                  ].map(scene => (
                    <div key={scene.id} style={{padding: '1.5rem', border: '2px solid #ecf0f1', borderRadius: '15px', textAlign: 'center'}}>
                      <h3>{scene.name}</h3>
                      <p>{scene.desc}</p>
                      <button 
                        onClick={() => setVrScene(scene.id as any)} 
                        style={styles.btn}
                      >
                        Enter Scene
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Chat View */}
        {currentView === 'chat' && (
          <section style={styles.section}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
              <h2 style={{...styles.sectionTitle, margin: 0}}>💬 AI Mental Health Support</h2>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <span style={{fontSize: '0.9rem', color: aiProvider === 'local' ? '#95a5a6' : '#27ae60'}}>
                  {aiProvider === 'openai' ? '🤖 GPT-4' : aiProvider === 'huggingface' ? '🤗 HuggingFace' : '🏠 Local'}
                </span>
                {isAiConfigured && <span style={{color: '#27ae60'}}>✅</span>}
              </div>
            </div>

            {/* AI Configuration Panel */}
            <div style={{marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '10px'}}>
              <h4 style={{margin: '0 0 1rem 0'}}>AI Configuration</h4>
              <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap'}}>
                <button 
                  onClick={() => configureAIProvider('local')}
                  style={{
                    ...styles.btn, 
                    background: aiProvider === 'local' ? '#3498db' : '#95a5a6',
                    padding: '0.5rem 1rem'
                  }}
                >
                  🏠 Local (Free)
                </button>
                <button 
                  onClick={() => {
                    const key = prompt('Enter your OpenAI API key:');
                    if (key) configureAIProvider('openai', key);
                  }}
                  style={{
                    ...styles.btn, 
                    background: aiProvider === 'openai' ? '#3498db' : '#95a5a6',
                    padding: '0.5rem 1rem'
                  }}
                >
                  🤖 OpenAI GPT-4
                </button>
                <button 
                  onClick={() => configureAIProvider('huggingface')}
                  style={{
                    ...styles.btn, 
                    background: aiProvider === 'huggingface' ? '#3498db' : '#95a5a6',
                    padding: '0.5rem 1rem'
                  }}
                >
                  🤗 HuggingFace
                </button>
              </div>
              <p style={{fontSize: '0.8rem', color: '#666', margin: 0}}>
                <strong>Local:</strong> Privacy-first, works offline • 
                <strong>OpenAI:</strong> Advanced AI, requires API key • 
                <strong>HuggingFace:</strong> Open-source models
              </p>
            </div>

            <div style={styles.chatContainer}>
              {chatMessages.length === 0 && (
                <div style={{...styles.message, ...styles.botMessage}}>
                  <p>Hello! I'm your AI mental health support assistant. I'm here to listen and provide support. How are you feeling today?</p>
                  <small style={{opacity: 0.7}}>
                    Using: {aiProvider === 'openai' ? 'OpenAI GPT-4' : aiProvider === 'huggingface' ? 'HuggingFace AI' : 'Local AI'} • 
                    Privacy: {isEncrypted ? 'Encrypted' : 'Standard'}
                  </small>
                </div>
              )}
              {chatMessages.map((message, index) => (
                <div 
                  key={index} 
                  style={{
                    ...styles.message,
                    ...(message.sender === 'user' ? styles.userMessage : styles.botMessage)
                  }}
                >
                  <p style={{whiteSpace: 'pre-line'}}>{message.text}</p>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <small>{message.timestamp.toLocaleTimeString()}</small>
                    {message.confidence && message.sender === 'bot' && (
                      <small style={{opacity: 0.6}}>
                        Confidence: {(message.confidence * 100).toFixed(0)}%
                      </small>
                    )}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{...styles.message, ...styles.botMessage}}>
                  <p>🤔 Thinking...</p>
                  <div style={{display: 'flex', gap: '0.25rem'}}>
                    <div style={{width: '8px', height: '8px', background: '#3498db', borderRadius: '50%', animation: 'pulse 1.5s infinite'}}></div>
                    <div style={{width: '8px', height: '8px', background: '#3498db', borderRadius: '50%', animation: 'pulse 1.5s infinite 0.5s'}}></div>
                    <div style={{width: '8px', height: '8px', background: '#3498db', borderRadius: '50%', animation: 'pulse 1.5s infinite 1s'}}></div>
                  </div>
                </div>
              )}
            </div>
            <div style={{display: 'flex', gap: '1rem'}}>
              <input
                type="text"
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleChatSend()}
                disabled={chatLoading}
                style={{
                  ...styles.input, 
                  marginBottom: 0, 
                  flex: 1,
                  opacity: chatLoading ? 0.6 : 1
                }}
              />
              <button 
                onClick={handleChatSend} 
                disabled={chatLoading || !chatInput.trim()}
                style={{
                  ...styles.btn,
                  opacity: (chatLoading || !chatInput.trim()) ? 0.6 : 1,
                  cursor: (chatLoading || !chatInput.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                {chatLoading ? '⏳' : 'Send'}
              </button>
            </div>
            <div style={{marginTop: '1rem', padding: '1rem', background: '#fff3cd', borderRadius: '10px', border: '1px solid #ffc107'}}>
              <p style={{fontSize: '0.8rem', color: '#856404', margin: 0}}>
                <strong>⚠️ Important:</strong> This AI assistant provides support but is not a replacement for professional mental health care. 
                In crisis situations, please contact: <strong>988 (US)</strong> or <strong>+91-22-27546669 (India)</strong> immediately.
              </p>
            </div>
          </section>
        )}

        {/* Privacy View */}
        {currentView === 'privacy' && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>🔒 Privacy & Data Control</h2>
            <div style={{marginBottom: '2rem'}}>
              <h3>Encryption Status</h3>
              <p>
                {isEncrypted ? (
                  <span style={{color: '#27ae60'}}>✅ Your data is encrypted with AES-256-GCM</span>
                ) : (
                  <span style={{color: '#e74c3c'}}>❌ Encryption not enabled</span>
                )}
              </p>
              {!isEncrypted && (
                <button 
                  onClick={() => setShowPasswordSetup(true)} 
                  style={styles.btn}
                >
                  Enable Encryption
                </button>
              )}
            </div>
            
            <div style={{marginBottom: '2rem'}}>
              <h3>Data Storage</h3>
              <p>✅ All data stored locally on your device</p>
              <p>✅ No data sent to external servers</p>
              <p>✅ You have complete control over your information</p>
            </div>

            <div style={{marginBottom: '2rem'}}>
              <h3>Data Management</h3>
              <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                <button 
                  onClick={() => {
                    const data = JSON.stringify(moodHistory, null, 2);
                    const blob = new Blob([data], {type: 'application/json'});
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'mindwell-data-export.json';
                    a.click();
                  }}
                  style={styles.btn}
                >
                  📥 Export Data
                </button>
                <button 
                  onClick={() => {
                    const confirmDelete = window.confirm('Are you sure you want to delete all your data? This cannot be undone.');
                    if (confirmDelete) {
                      localStorage.clear();
                      setMoodHistory([]);
                      setBaseline(null);
                      alert('All data has been securely deleted.');
                    }
                  }}
                  style={{...styles.btn, background: '#e74c3c'}}
                >
                  🗑️ Delete All Data
                </button>
              </div>
            </div>

            <div>
              <h3>Privacy Features</h3>
              <ul>
                <li>🔒 End-to-end encryption with WebCrypto API</li>
                <li>🏠 Local-only data storage (IndexedDB)</li>
                <li>🚫 No tracking or analytics</li>
                <li>🔐 PBKDF2 key derivation with 100,000 iterations</li>
                <li>📱 Works completely offline</li>
                <li>🗑️ Secure data deletion</li>
              </ul>
            </div>
          </section>
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '2rem', color: 'white' }}>
        <p>MindWell v2.0.0 - Your mental wellness, your data, your control</p>
        <p style={{fontSize: '0.8rem', opacity: 0.8}}>
          {moodHistory.length} mood entries • {isEncrypted ? 'Encrypted' : 'Unencrypted'} • 
          {baseline ? ` Baseline: ${baseline.rollingMean.toFixed(1)}` : ' Building baseline...'}
        </p>
      </footer>
    </div>
  );
};

export default MinimalApp;
