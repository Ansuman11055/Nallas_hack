import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [currentMood, setCurrentMood] = useState(5);
  const [streak, setStreak] = useState(7);
  const [averageMood, setAverageMood] = useState(7.2);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isVRActive, setIsVRActive] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
  const [moodHistory, setMoodHistory] = useState([]);
  const [moodNote, setMoodNote] = useState('');
  const [showMoodLogger, setShowMoodLogger] = useState(false);
  const [showMoodHistory, setShowMoodHistory] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // User Profile State
  const [userProfile, setUserProfile] = useState({
    name: '',
    age: '',
    gender: '',
    isFirstTime: true
  });

  const moodEmojis = ['😰', '😔', '😐', '🙂', '😊', '😄', '🤗', '😍', '🤩', '🥳'];
  
  const backgrounds = [
    'gradient-1',
    'gradient-2', 
    'gradient-3',
    'gradient-4',
    'gradient-5',
    'gradient-6'
  ];

  const darkBackgrounds = [
    'dark-gradient-1',
    'dark-gradient-2',
    'dark-gradient-3',
    'dark-gradient-4',
    'dark-gradient-5',
    'dark-gradient-6'
  ];

  const emergencyContacts = [
    {
      name: "National Suicide Prevention Lifeline",
      number: "988",
      country: "USA",
      available: "24/7"
    },
    {
      name: "Crisis Text Line",
      number: "Text HOME to 741741",
      country: "USA", 
      available: "24/7"
    },
    {
      name: "SAMHSA National Helpline",
      number: "1-800-662-4357",
      country: "USA",
      available: "24/7"
    },
    {
      name: "International Association for Suicide Prevention",
      number: "Visit iasp.info/resources",
      country: "Global",
      available: "24/7"
    },
    {
      name: "National Mental Health Helpline (India)",
      number: "1800-599-0019",
      country: "India",
      available: "24/7"
    }
  ];

  const [currentBg, setCurrentBg] = useState(0);

  // Cache busting and version control
  useEffect(() => {
    // Force cache refresh
    const currentVersion = "2.1.0";
    const savedVersion = localStorage.getItem('appVersion');
    
    if (savedVersion !== currentVersion) {
      // Clear old cache and force refresh
      localStorage.setItem('appVersion', currentVersion);
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
    }

    // Load saved data
    const savedMood = localStorage.getItem('currentMood');
    const savedStreak = localStorage.getItem('streak');
    const savedAverage = localStorage.getItem('averageMood');
    const savedTheme = localStorage.getItem('isDarkMode');
    const savedBg = localStorage.getItem('currentBg');
    const savedChatMessages = localStorage.getItem('chatMessages');
    const savedUserProfile = localStorage.getItem('userProfile');
    const savedMoodHistory = localStorage.getItem('moodHistory');
    
    if (savedMood) setCurrentMood(parseInt(savedMood));
    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedAverage) setAverageMood(parseFloat(savedAverage));
    if (savedTheme) setIsDarkMode(JSON.parse(savedTheme));
    if (savedBg) setCurrentBg(parseInt(savedBg));
    if (savedChatMessages) setChatMessages(JSON.parse(savedChatMessages));
    if (savedMoodHistory) setMoodHistory(JSON.parse(savedMoodHistory));
    if (savedUserProfile) {
      const profile = JSON.parse(savedUserProfile);
      setUserProfile(profile);
      if (profile.isFirstTime) {
        setShowProfile(true);
      }
    } else {
      setShowProfile(true);
    }

    // Auto change background every 8 seconds
    const bgInterval = setInterval(() => {
      setCurrentBg(prev => (prev + 1) % backgrounds.length);
    }, 8000);

    return () => clearInterval(bgInterval);
  }, [backgrounds.length]);

  // Initialize Three.js background animations
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => initThreeJS();
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const initThreeJS = () => {
    if (!window.THREE) return;

    const scene = new window.THREE.Scene();
    const camera = new window.THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new window.THREE.WebGLRenderer({ alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '0';
    renderer.domElement.style.pointerEvents = 'none';
    
    const container = document.querySelector('.dashboard-container');
    if (container) {
      container.appendChild(renderer.domElement);
    }

    // Create floating 3D objects
    const geometry1 = new window.THREE.IcosahedronGeometry(1, 0);
    const geometry2 = new window.THREE.OctahedronGeometry(1.5);
    const geometry3 = new window.THREE.TetrahedronGeometry(1.2);
    
    const material1 = new window.THREE.MeshBasicMaterial({ 
      color: 0x667eea, 
      transparent: true, 
      opacity: 0.1,
      wireframe: true 
    });
    const material2 = new window.THREE.MeshBasicMaterial({ 
      color: 0x764ba2, 
      transparent: true, 
      opacity: 0.08,
      wireframe: true 
    });
    const material3 = new window.THREE.MeshBasicMaterial({ 
      color: 0x43e97b, 
      transparent: true, 
      opacity: 0.12,
      wireframe: true 
    });

    const mesh1 = new window.THREE.Mesh(geometry1, material1);
    const mesh2 = new window.THREE.Mesh(geometry2, material2);
    const mesh3 = new window.THREE.Mesh(geometry3, material3);

    mesh1.position.set(-10, 5, -5);
    mesh2.position.set(10, -5, -8);
    mesh3.position.set(0, 8, -6);

    scene.add(mesh1);
    scene.add(mesh2);
    scene.add(mesh3);

    camera.position.z = 15;

    const animate = () => {
      requestAnimationFrame(animate);
      
      mesh1.rotation.x += 0.005;
      mesh1.rotation.y += 0.008;
      mesh2.rotation.x += 0.003;
      mesh2.rotation.y += 0.006;
      mesh3.rotation.x += 0.007;
      mesh3.rotation.y += 0.004;

      // Floating animation
      mesh1.position.y += Math.sin(Date.now() * 0.001) * 0.01;
      mesh2.position.y += Math.cos(Date.now() * 0.0008) * 0.01;
      mesh3.position.y += Math.sin(Date.now() * 0.0012) * 0.01;

      renderer.render(scene, camera);
    };

    animate();
  };

  const logMoodWithNote = () => {
    const moodEntry = {
      id: Date.now(),
      mood: currentMood,
      note: moodNote,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    };

    const updatedHistory = [...moodHistory, moodEntry];
    setMoodHistory(updatedHistory);
    localStorage.setItem('moodHistory', JSON.stringify(updatedHistory));
    
    handleMoodSelect(currentMood);
    setMoodNote('');
    setShowMoodLogger(false);
  };

  const handleMoodSelect = (mood) => {
    setCurrentMood(mood);
    localStorage.setItem('currentMood', mood.toString());
    
    const newAverage = moodHistory.length > 0 
      ? ((averageMood * moodHistory.length) + mood) / (moodHistory.length + 1)
      : mood;
    setAverageMood(Math.round(newAverage * 10) / 10);
    localStorage.setItem('averageMood', newAverage.toString());
    
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem('streak', newStreak.toString());
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('isDarkMode', JSON.stringify(newTheme));
  };

const resetAllData = () => {
  console.log('Reset button clicked');
  try {
    // Step 1: Close modal
    console.log('Closing confirmation modal...');
    setShowResetConfirm(false);
    
    // Step 2: Clear storage
    console.log('Clearing localStorage...');
    localStorage.clear();
    
    // Step 3: Reset states
    console.log('Resetting state variables...');
    setCurrentMood(5);
    setStreak(0);
    setAverageMood(5.0);
    setChatMessages([]);
    setMoodHistory([]);
    setUserProfile({ name: '', age: '', gender: '', isFirstTime: true });
    
    // Step 4: Close other modals
    console.log('Closing other modals...');
    setShowMoodLogger(false);
    setShowChat(false);
    setShowMoodHistory(false);
    setIsVRActive(false);
    setShowEmergencyContacts(false);
    
    console.log('Reset completed successfully!');
    
    // Step 5: Show profile
    setTimeout(() => {
      console.log('Opening profile setup...');
      setShowProfile(true);
    }, 500);
    
  } catch (error) {
    console.error('Reset error:', error);
    alert('Reset failed: ' + error.message);
  }
};

  const saveUserProfile = () => {
    if (userProfile.name.trim() && userProfile.age && userProfile.gender) {
      const updatedProfile = { ...userProfile, isFirstTime: false };
      setUserProfile(updatedProfile);
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setShowProfile(false);
    }
  };

  const updateProfile = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const sendChatMessage = async () => {
    if (chatInput.trim()) {
      const userMessage = { id: Date.now(), text: chatInput, sender: 'user' };
      const newMessages = [...chatMessages, userMessage];
      setChatMessages(newMessages);
      
      const inputText = chatInput;
      setChatInput('');
      setIsTyping(true);
      
      // Simulate typing delay
      setTimeout(() => {
        const botResponse = generateAIResponse(inputText);
        const finalMessages = [...newMessages, botResponse];
        setChatMessages(finalMessages);
        localStorage.setItem('chatMessages', JSON.stringify(finalMessages));
        setIsTyping(false);
      }, 1000);
    }
  };

  const generateAIResponse = (input) => {
    const lowerInput = input.toLowerCase();
    const recentMoods = moodHistory.slice(-7);
    const avgRecentMood = recentMoods.length > 0 
      ? recentMoods.reduce((sum, entry) => sum + entry.mood, 0) / recentMoods.length 
      : currentMood;

    let response = '';

    // Crisis keywords - immediate response
    if (lowerInput.includes('suicide') || lowerInput.includes('kill myself') || 
        lowerInput.includes('end it all') || lowerInput.includes('want to die') || 
        lowerInput.includes('hurt myself')) {
      response = `${userProfile.name}, I'm very concerned about what you've shared. Please reach out for help immediately:

🆘 USA: Call or text 988 (Suicide & Crisis Lifeline)
🆘 UK: Call 116 123 (Samaritans) 
🆘 Emergency: Call 911/999/112

You matter, and there are people who want to help you through this crisis. Please don't face this alone.`;
    }
    // Enhanced mood-based responses
    else if (avgRecentMood <= 3) {
      if (lowerInput.includes('sad') || lowerInput.includes('depressed') || lowerInput.includes('down')) {
        response = `${userProfile.name}, I notice you've been feeling low recently (average mood: ${avgRecentMood.toFixed(1)}/10). These feelings are completely valid. Have you considered talking to a mental health professional? Sometimes sharing our burden can help lighten it. 

What's been weighing on your mind lately?`;
      } else if (lowerInput.includes('help') || lowerInput.includes('support')) {
        response = `${userProfile.name}, reaching out shows incredible strength. Your recent mood patterns suggest you're going through a difficult time. Here are some immediate options:

• Contact a therapist or counselor
• Reach out to trusted friends/family  
• Call a mental health helpline
• Try gentle activities like short walks

Would you like me to share some emergency contacts?`;
      } else {
        response = `${userProfile.name}, I've noticed your mood has been consistently low (${avgRecentMood.toFixed(1)}/10 average). This is concerning, and I want you to know that help is available. 

What small step could we take together today to help you feel a bit better?`;
      }
    } else if (avgRecentMood <= 6) {
      if (lowerInput.includes('stress') || lowerInput.includes('anxious') || lowerInput.includes('worried')) {
        response = `${userProfile.name}, stress and anxiety are really challenging. Your recent average of ${avgRecentMood.toFixed(1)}/10 shows you're managing but could use support.

Try this quick technique: 4-7-8 breathing (inhale 4, hold 7, exhale 8). What specific stressors are you dealing with right now?`;
      } else {
        response = `${userProfile.name}, your mood seems moderate lately (${avgRecentMood.toFixed(1)}/10). This is actually a good time to build resilience. What activities usually help you feel better?`;
      }
    } else {
      if (lowerInput.includes('great') || lowerInput.includes('happy') || lowerInput.includes('good')) {
        response = `${userProfile.name}, it's wonderful to hear you're feeling good! Your recent average of ${avgRecentMood.toFixed(1)}/10 shows you're doing really well. What's been contributing to these positive feelings?`;
      } else {
        response = `${userProfile.name}, your mood has been quite positive recently (${avgRecentMood.toFixed(1)}/10)! That's fantastic. Remember to celebrate these good moments.`;
      }
    }

    return { 
      id: Date.now() + 1, 
      text: response, 
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString()
    };
  };

  const getMoodBasedSuggestions = () => {
    if (currentMood <= 3) {
      return [
        "🆘 Consider calling a mental health helpline if you need immediate support",
        "🗣️ Reach out to a trusted friend, family member, or counselor",
        "🚶‍♀️ Take a very short walk outside, even just to your mailbox",
        "🫁 Try simple breathing exercises - focus on slow, deep breaths"
      ];
    } else if (currentMood <= 6) {
      return [
        "📝 Write down three things you're grateful for, however small",
        "🎵 Listen to music that usually makes you feel better",
        "🧘‍♀️ Try a 5-minute guided meditation or breathing exercise",
        "📞 Reach out to someone you care about, even just with a text"
      ];
    } else {
      return [
        "✨ Share your positive energy with someone who might need it",
        "🏃‍♀️ Try a new physical activity or exercise you enjoy",
        "🌳 Spend some time in nature or outdoors",
        "🎯 Set a small, achievable goal for tomorrow"
      ];
    }
  };

  const startVRExperience = () => {
    setIsVRActive(true);
    setTimeout(() => setIsVRActive(false), 6000);
  };

  const trackMood = () => {
    setShowMoodLogger(true);
  };

  const showDetailedMoodHistory = () => {
    setShowMoodHistory(true);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting;
    if (hour < 12) timeGreeting = 'Good Morning';
    else if (hour < 18) timeGreeting = 'Good Afternoon';
    else timeGreeting = 'Good Evening';
    
    return `${timeGreeting}, ${userProfile.name || 'Friend'}!`;
  };

  const getMoodHistoryStats = () => {
    if (moodHistory.length === 0) return { days: 0, average: 0, trend: 'stable' };
    
    const last7Days = moodHistory.slice(-7);
    const last14Days = moodHistory.slice(-14, -7);
    
    const recent7Avg = last7Days.reduce((sum, entry) => sum + entry.mood, 0) / last7Days.length;
    const previous7Avg = last14Days.length > 0 
      ? last14Days.reduce((sum, entry) => sum + entry.mood, 0) / last14Days.length 
      : recent7Avg;
    
    let trend = 'stable';
    if (recent7Avg > previous7Avg + 0.5) trend = 'improving';
    else if (recent7Avg < previous7Avg - 0.5) trend = 'declining';
    
    return {
      days: moodHistory.length,
      average: recent7Avg.toFixed(1),
      trend: trend
    };
  };

  return (
    <div className={`dashboard-container ${isDarkMode ? darkBackgrounds[currentBg] : backgrounds[currentBg]}`}>
      {/* Background Scribbles */}
      <div className="background-scribbles">
        <svg className="scribble scribble-1" viewBox="0 0 100 100">
          <path d="M20,20 Q40,10 60,30 T90,50" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none"/>
        </svg>
        <svg className="scribble scribble-2" viewBox="0 0 100 100">
          <circle cx="30" cy="70" r="15" stroke="rgba(255,255,255,0.08)" strokeWidth="2" fill="none"/>
        </svg>
        <svg className="scribble scribble-3" viewBox="0 0 100 100">
          <path d="M10,50 L30,30 L50,70 L70,10 L90,40" stroke="rgba(255,255,255,0.06)" strokeWidth="2" fill="none"/>
        </svg>
      </div>

      {/* Top Controls */}
      <div className="top-controls">
        <button className="control-btn profile-btn" onClick={() => setShowProfile(true)} title="Edit Profile">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span className="btn-label">Profile</span>
        </button>
        <button className="control-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
          {isDarkMode ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
          <span className="btn-label">{isDarkMode ? 'Light' : 'Dark'}</span>
        </button>
        <button className="control-btn reset-btn" onClick={() => setShowResetConfirm(true)} title="Reset All Data">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          <span className="btn-label">Reset</span>
        </button>
      </div>

      {/* Enhanced Header */}
      <div className="header">
        <div className="header-decoration">
          <div className="decoration-line left"></div>
          <div className="header-icon">✨</div>
          <div className="decoration-line right"></div>
        </div>
        <h1 className="main-title">{getGreeting()}</h1>
        <p className="subtitle">How are you feeling today?</p>
        {userProfile.age && (
          <div className="user-badge">
            <span className="badge-text">{userProfile.age} • {userProfile.gender}</span>
          </div>
        )}
        <div className="header-glow"></div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-header">
            <h3>Today's Mood</h3>
            <div className="stat-icon mood-icon">📊</div>
          </div>
          <div className="mood-display">
            <span className="mood-emoji">{moodEmojis[currentMood - 1]}</span>
            <span className="mood-score">{currentMood}/10</span>
          </div>
        </div>

        <div className="stat-card clickable" onClick={showDetailedMoodHistory}>
          <div className="stat-header">
            <h3>Streak</h3>
            <div className="stat-icon streak-icon">🔥</div>
          </div>
          <div className="streak-display">
            <span className="streak-number">{streak} days</span>
            <span className="click-hint">Click to view history</span>
          </div>
        </div>

        <div className="stat-card clickable" onClick={showDetailedMoodHistory}>
          <div className="stat-header">
            <h3>This Week</h3>
            <div className="stat-icon week-icon">📈</div>
          </div>
          <div className="week-display">
            <span className="average-text">Average mood: {averageMood}/10</span>
            <span className="click-hint">Click to view history</span>
          </div>
        </div>
      </div>

      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn track-mood" onClick={trackMood}>
            <div className="btn-icon">📊</div>
            <span>Track Mood</span>
          </button>
          <button className="action-btn chat-support" onClick={() => setShowChat(true)}>
            <div className="btn-icon">💬</div>
            <span>Chat Support</span>
          </button>
          <button className="action-btn vr-experience" onClick={startVRExperience}>
            <div className="btn-icon">🥽</div>
            <span>VR Experience</span>
          </button>
          <button className="action-btn emergency-contacts" onClick={() => setShowEmergencyContacts(true)}>
            <div className="btn-icon">🆘</div>
            <span>Emergency Contacts</span>
          </button>
        </div>
      </div>

      {/* Mood-based Suggestions */}
      <div className="suggestions-section">
        <h2>Personalized Suggestions</h2>
        <div className="suggestions-list">
          {getMoodBasedSuggestions().map((suggestion, index) => (
            <div key={index} className="suggestion-item">
              <div className="suggestion-icon">💡</div>
              <span>{suggestion}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mood-check-section">
        <h2>Quick Mood Check</h2>
        <div className="mood-selector">
          {moodEmojis.map((emoji, index) => (
            <button
              key={index}
              className={`mood-btn ${currentMood === index + 1 ? 'selected' : ''}`}
              onClick={() => handleMoodSelect(index + 1)}
              title={`Mood level ${index + 1}`}
            >
              {emoji}
            </button>
          ))}
        </div>
        <p className="mood-scale">1 = Very Bad • 10 = Excellent</p>
      </div>

      {/* Enhanced Mood History Modal */}
      {showMoodHistory && (
        <div className="modal-overlay">
          <div className="history-modal">
            <div className="modal-header">
              <h3>📈 Mood History & Analytics</h3>
              <button className="close-modal" onClick={() => setShowMoodHistory(false)}>✕</button>
            </div>
            <div className="history-content">
              <div className="history-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Entries:</span>
                  <span className="stat-value">{getMoodHistoryStats().days}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">7-Day Average:</span>
                  <span className="stat-value">{getMoodHistoryStats().average}/10</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Trend:</span>
                  <span className={`stat-value trend-${getMoodHistoryStats().trend}`}>
                    {getMoodHistoryStats().trend === 'improving' ? '📈 Improving' : 
                     getMoodHistoryStats().trend === 'declining' ? '📉 Declining' : 
                     '➡️ Stable'}
                  </span>
                </div>
              </div>
              
              <div className="history-timeline">
                <h4>Recent Mood Entries</h4>
                {moodHistory.length === 0 ? (
                  <p className="no-history">No mood entries yet. Start tracking your mood to see your history here!</p>
                ) : (
                  <div className="timeline-items">
                    {moodHistory.slice(-20).reverse().map((entry) => (
                      <div key={entry.id} className="timeline-item">
                        <div className="timeline-date">
                          <span className="date">{entry.date}</span>
                          <span className="time">{entry.time}</span>
                        </div>
                        <div className="timeline-mood">
                          <span className="mood-emoji-small">{moodEmojis[entry.mood - 1]}</span>
                          <span className="mood-value">{entry.mood}/10</span>
                        </div>
                        {entry.note && (
                          <div className="timeline-note">
                            <p>"{entry.note}"</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Profile Modal */}
      {showProfile && (
        <div className="modal-overlay">
          <div className="profile-modal-enhanced">
            <div className="profile-header-enhanced">
              <div className="profile-avatar">
                <div className="avatar-circle">
                  <span className="avatar-initial">{userProfile.name ? userProfile.name[0].toUpperCase() : '👤'}</span>
                </div>
              </div>
              <h3>{userProfile.isFirstTime ? 'Welcome! Let\'s get to know you' : 'Your Profile'}</h3>
              {!userProfile.isFirstTime && (
                <button className="close-profile" onClick={() => setShowProfile(false)}>✕</button>
              )}
            </div>
            <div className="profile-form-enhanced">
              <div className="form-group-enhanced">
                <label>What should we call you? *</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="Enter your first name..."
                    value={userProfile.name}
                    onChange={(e) => updateProfile('name', e.target.value)}
                    className="profile-input"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group-enhanced">
                  <label>Your age *</label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      placeholder="Age"
                      min="13"
                      max="100"
                      value={userProfile.age}
                      onChange={(e) => updateProfile('age', e.target.value)}
                      className="profile-input"
                    />
                  </div>
                </div>
                
                <div className="form-group-enhanced">
                  <label>Gender *</label>
                  <div className="select-wrapper">
                    <select 
                      value={userProfile.gender}
                      onChange={(e) => updateProfile('gender', e.target.value)}
                      className="profile-select"
                    >
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="profile-actions-enhanced">
                <button 
                  className={`save-profile-enhanced ${!userProfile.name.trim() || !userProfile.age || !userProfile.gender ? 'disabled' : ''}`}
                  onClick={saveUserProfile}
                  disabled={!userProfile.name.trim() || !userProfile.age || !userProfile.gender}
                >
                  {userProfile.isFirstTime ? '🚀 Get Started!' : '💾 Save Changes'}
                </button>
              </div>
              
              <div className="privacy-notice">
                <div className="privacy-icon">🔒</div>
                <p>Your information is stored locally on your device and never shared with anyone. We respect your privacy completely.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Chat Modal */}
      {showChat && (
        <div className="modal-overlay">
          <div className="chat-modal-enhanced">
            <div className="chat-header-enhanced">
              <div className="chat-avatar">
                <div className="ai-indicator">
                  <div className="ai-pulse"></div>
                  🤖
                </div>
              </div>
              <div className="chat-title">
                <h3>AI Mental Health Assistant</h3>
                <p className="chat-status">Always here to listen</p>
              </div>
              <button className="close-chat-enhanced" onClick={() => setShowChat(false)}>✕</button>
            </div>
            
            <div className="chat-messages-enhanced">
              {chatMessages.length === 0 && (
                <div className="welcome-message-enhanced">
                  <div className="welcome-avatar">🤖</div>
                  <div className="welcome-text">
                    <h4>Hello {userProfile.name}! 👋</h4>
                    <p>I'm your AI mental health assistant. I'm here to provide personalized support, recognize when you might need extra help, and connect you with resources when needed.</p>
                    <div className="chat-features">
                      <span className="feature">✨ Personalized responses</span>
                      <span className="feature">🆘 Crisis support</span>
                      <span className="feature">📊 Mood insights</span>
                    </div>
                    <p className="chat-prompt">How are you feeling today?</p>
                  </div>
                </div>
              )}
              
              {chatMessages.map((message) => (
                <div key={message.id} className={`message-enhanced ${message.sender}`}>
                  <div className="message-avatar">
                    {message.sender === 'user' ? 
                      (userProfile.name ? userProfile.name[0].toUpperCase() : '👤') : 
                      '🤖'
                    }
                  </div>
                  <div className="message-content-enhanced">
                    <div className="message-text">
                      {message.text.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          {index < message.text.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </div>
                    {message.timestamp && (
                      <span className="timestamp-enhanced">{message.timestamp}</span>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="message-enhanced bot">
                  <div className="message-avatar">🤖</div>
                  <div className="typing-indicator">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span className="typing-text">AI is thinking...</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="chat-input-enhanced">
              <div className="input-container">
                <input
                  type="text"
                  placeholder="Share what's on your mind..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  className="chat-input-field"
                />
                <button 
                  onClick={sendChatMessage} 
                  className="send-button"
                  disabled={!chatInput.trim()}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                  </svg>
                </button>
              </div>
              <div className="chat-help">
                <span>💡 Tip: Be open about your feelings. I'm here to help and never judge.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other existing modals... */}
      {/* VR Experience Modal */}
      {isVRActive && (
        <div className="modal-overlay">
          <div className="vr-modal">
            <div className="vr-animation">
              <div className="vr-circle"></div>
              <div className="vr-circle"></div>
              <div className="vr-circle"></div>
            </div>
            <h3>🥽 VR Relaxation Experience Active</h3>
            <p>Close your eyes and take deep breaths, {userProfile.name}...</p>
            <div className="vr-instructions">
              <p>🌸 Imagine yourself in a peaceful garden</p>
              <p>🌊 Listen to the gentle sound of water</p>
              <p>☁️ Feel the soft breeze on your skin</p>
            </div>
          </div>
        </div>
      )}

      {/* Mood Logger Modal */}
      {showMoodLogger && (
        <div className="modal-overlay">
          <div className="mood-logger-modal">
            <div className="modal-header">
              <h3>📝 Log Your Mood</h3>
              <button className="close-modal" onClick={() => setShowMoodLogger(false)}>✕</button>
            </div>
            <div className="mood-logger-content">
              <div className="mood-selector-large">
                {moodEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    className={`mood-btn-large ${currentMood === index + 1 ? 'selected' : ''}`}
                    onClick={() => setCurrentMood(index + 1)}
                  >
                    <span className="emoji">{emoji}</span>
                    <span className="number">{index + 1}</span>
                  </button>
                ))}
              </div>
              <div className="mood-note-section">
                <label>What's affecting your mood today? (Optional)</label>
                <textarea
                  placeholder="Share what's on your mind..."
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  rows="4"
                />
              </div>
              <button className="log-mood-btn" onClick={logMoodWithNote}>
                Log Mood Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Contacts Modal */}
      {showEmergencyContacts && (
        <div className="modal-overlay">
          <div className="emergency-modal">
            <div className="modal-header emergency-header">
              <h3>🆘 Emergency Mental Health Contacts</h3>
              <button className="close-modal" onClick={() => setShowEmergencyContacts(false)}>✕</button>
            </div>
            <div className="emergency-content">
              <p className="emergency-warning">
                ⚠️ If you are in immediate danger or having thoughts of self-harm, please contact emergency services (911/999/112) or go to your nearest emergency room immediately.
              </p>
              <div className="contacts-list">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="contact-item">
                    <div className="contact-info">
                      <h4>{contact.name}</h4>
                      <p className="contact-number">{contact.number}</p>
                      <div className="contact-details">
                        <span className="country">{contact.country}</span>
                        <span className="availability">Available {contact.available}</span>
                      </div>
                    </div>
                    <button 
                      className="call-btn"
                      onClick={() => {
                        const phoneNumber = contact.number.replace(/[^0-9]/g, '');
                        if (phoneNumber) {
                          window.open(`tel:${phoneNumber}`, '_self');
                        }
                      }}
                    >
                      📞 Call
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation */}
      {showResetConfirm && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>⚠️ Reset All Data</h3>
            <p>This will permanently delete all your mood data, chat history, profile, and progress. This action cannot be undone.</p>
            <div className="confirm-buttons">
              <button className="confirm-yes" onClick={resetAllData}>Yes, Reset Everything</button>
              <button className="confirm-no" onClick={() => setShowResetConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
