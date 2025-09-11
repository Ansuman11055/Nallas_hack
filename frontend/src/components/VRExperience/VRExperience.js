import React, { useState, useEffect } from 'react';

function VRExperience() {
  const [currentScene, setCurrentScene] = useState('forest');
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);

  const scenes = {
    forest: {
      name: '🌲 Peaceful Forest',
      description: 'Tall trees, gentle breeze, bird sounds',
      background: 'linear-gradient(to bottom, #87CEEB, #228B22)',
      sounds: '🐦 Birds chirping, leaves rustling'
    },
    beach: {
      name: '🏖️ Calm Beach',
      description: 'Ocean waves, sandy shore, sunset',
      background: 'linear-gradient(to bottom, #FFE4B5, #20B2AA)',
      sounds: '🌊 Gentle waves, seagulls'
    },
    mountain: {
      name: '⛰️ Mountain View',
      description: 'Snow peaks, clear sky, fresh air',
      background: 'linear-gradient(to bottom, #E6E6FA, #4682B4)',
      sounds: '💨 Wind, distant eagle calls'
    },
    garden: {
      name: '🌸 Zen Garden',
      description: 'Flowing water, cherry blossoms, peace',
      background: 'linear-gradient(to bottom, #FFB6C1, #90EE90)',
      sounds: '💧 Water fountain, gentle breeze'
    }
  };

  const breathingPatterns = {
    '4-7-8': { name: '4-7-8 Technique', inhale: 4, hold: 7, exhale: 8 },
    '4-4-4': { name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4 },
    '6-6': { name: 'Simple 6-6', inhale: 6, hold: 0, exhale: 6 }
  };

  const [selectedPattern, setSelectedPattern] = useState('4-7-8');

  useEffect(() => {
    let timer;
    if (sessionTime > 0) {
      timer = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sessionTime]);

  const startBreathingExercise = () => {
    setIsBreathing(true);
    setBreathCount(0);
    setSessionTime(1);
  };

  const stopBreathingExercise = () => {
    setIsBreathing(false);
    setSessionTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>🌅 VR Wellness Experience</h1>
        <p>Immersive environments for relaxation and mindfulness</p>
      </div>

      {/* Scene Selector */}
      <div style={styles.sceneSelector}>
        <h2>Choose Your Environment</h2>
        <div style={styles.sceneGrid}>
          {Object.entries(scenes).map(([key, scene]) => (
            <button
              key={key}
              onClick={() => setCurrentScene(key)}
              style={{
                ...styles.sceneBtn,
                ...(currentScene === key ? styles.activeScene : {})
              }}
            >
              <div style={styles.sceneName}>{scene.name}</div>
              <div style={styles.sceneDescription}>{scene.description}</div>
              <div style={styles.sceneSounds}>{scene.sounds}</div>
            </button>
          ))}
        </div>
      </div>

      {/* VR Display */}
      <div style={{
        ...styles.vrDisplay,
        background: scenes[currentScene].background
      }}>
        <div style={styles.vrContent}>
          <div style={styles.sceneTitle}>
            {scenes[currentScene].name}
          </div>
          
          {/* Simple VR-like visualization */}
          <div style={styles.vrScene}>
            {currentScene === 'forest' && (
              <div style={styles.forestScene}>
                <div style={styles.tree}>🌳</div>
                <div style={styles.tree}>🌲</div>
                <div style={styles.tree}>🌳</div>
                <div style={styles.sun}>☀️</div>
                <div style={styles.clouds}>☁️</div>
              </div>
            )}
            
            {currentScene === 'beach' && (
              <div style={styles.beachScene}>
                <div style={styles.sun}>🌅</div>
                <div style={styles.palm}>🌴</div>
                <div style={styles.waves}>🌊</div>
                <div style={styles.seagull}>🕊️</div>
              </div>
            )}
            
            {currentScene === 'mountain' && (
              <div style={styles.mountainScene}>
                <div style={styles.mountain}>⛰️</div>
                <div style={styles.clouds}>☁️</div>
                <div style={styles.eagle}>🦅</div>
              </div>
            )}
            
            {currentScene === 'garden' && (
              <div style={styles.gardenScene}>
                <div style={styles.cherry}>🌸</div>
                <div style={styles.fountain}>⛲</div>
                <div style={styles.butterfly}>🦋</div>
                <div style={styles.rocks}>🪨</div>
              </div>
            )}
          </div>

          {/* Breathing Guide */}
          {isBreathing && (
            <div style={styles.breathingGuide}>
              <div style={styles.breathingCircle}>
                <div style={styles.breathingText}>
                  Breathe with the circle
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={styles.controlsPanel}>
        <div style={styles.breathingControls}>
          <h3>Guided Breathing</h3>
          
          <div style={styles.patternSelector}>
            <label>Breathing Pattern:</label>
            <select 
              value={selectedPattern} 
              onChange={(e) => setSelectedPattern(e.target.value)}
              style={styles.select}
            >
              {Object.entries(breathingPatterns).map(([key, pattern]) => (
                <option key={key} value={key}>{pattern.name}</option>
              ))}
            </select>
          </div>

          <div style={styles.sessionInfo}>
            {sessionTime > 0 && (
              <div style={styles.sessionStats}>
                <div>⏱️ Session Time: {formatTime(sessionTime)}</div>
                <div>💨 Breath Count: {breathCount}</div>
              </div>
            )}
          </div>

          <div style={styles.actionButtons}>
            {!isBreathing ? (
              <button 
                onClick={startBreathingExercise}
                style={styles.startButton}
              >
                🧘‍♀️ Start Breathing Exercise
              </button>
            ) : (
              <button 
                onClick={stopBreathingExercise}
                style={styles.stopButton}
              >
                ⏹️ Stop Session
              </button>
            )}
          </div>
        </div>

        <div style={styles.features}>
          <h3>Available Features</h3>
          <ul style={styles.featureList}>
            <li>🎵 Ambient soundscapes</li>
            <li>🧘 Guided breathing exercises</li>
            <li>⏰ Meditation timers</li>
            <li>📊 Progress tracking</li>
            <li>🌙 Sleep mode</li>
            <li>🎯 Focus sessions</li>
          </ul>
        </div>
      </div>

      <div style={styles.instructions}>
        <h3>💡 How to Use</h3>
        <ol style={styles.instructionList}>
          <li>Choose a calming environment that resonates with you</li>
          <li>Find a comfortable position and put on headphones if available</li>
          <li>Select a breathing pattern that feels right for your current state</li>
          <li>Click "Start Breathing Exercise" and follow the visual guide</li>
          <li>Focus on the scene and let your mind relax</li>
          <li>Use this space whenever you need a mental break</li>
        </ol>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1000px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  sceneSelector: {
    marginBottom: '30px'
  },
  sceneGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginTop: '15px'
  },
  sceneBtn: {
    padding: '15px',
    background: 'white',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s'
  },
  activeScene: {
    borderColor: '#4CAF50',
    background: '#f0fff0'
  },
  sceneName: {
    fontSize: '1.1em',
    fontWeight: 'bold',
    marginBottom: '5px'
  },
  sceneDescription: {
    color: '#666',
    fontSize: '0.9em',
    marginBottom: '5px'
  },
  sceneSounds: {
    color: '#888',
    fontSize: '0.8em',
    fontStyle: 'italic'
  },
  vrDisplay: {
    height: '400px',
    borderRadius: '15px',
    marginBottom: '30px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  },
  vrContent: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
  },
  sceneTitle: {
    fontSize: '2em',
    fontWeight: 'bold',
    marginBottom: '20px'
  },
  vrScene: {
    fontSize: '3em',
    display: 'flex',
    gap: '20px',
    alignItems: 'center'
  },
  forestScene: {
    display: 'flex',
    gap: '15px',
    alignItems: 'flex-end'
  },
  beachScene: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center'
  },
  mountainScene: {
    display: 'flex',
    gap: '25px',
    alignItems: 'center'
  },
  gardenScene: {
    display: 'flex',
    gap: '18px',
    alignItems: 'center'
  },
  breathingGuide: {
    position: 'absolute',
    bottom: '20px',
    right: '20px'
  },
  breathingCircle: {
    width: '80px',
    height: '80px',
    border: '3px solid white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'breathe 6s infinite'
  },
  breathingText: {
    fontSize: '0.8em',
    textAlign: 'center',
    lineHeight: '1.2'
  },
  controlsPanel: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    marginBottom: '30px'
  },
  breathingControls: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  patternSelector: {
    marginBottom: '20px'
  },
  select: {
    width: '100%',
    padding: '8px',
    marginTop: '5px',
    border: '1px solid #ddd',
    borderRadius: '5px'
  },
  sessionInfo: {
    marginBottom: '20px'
  },
  sessionStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    color: '#666'
  },
  actionButtons: {
    display: 'flex',
    gap: '10px'
  },
  startButton: {
    flex: 1,
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em'
  },
  stopButton: {
    flex: 1,
    padding: '12px',
    background: '#ff6b6b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em'
  },
  features: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  instructions: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  instructionList: {
    paddingLeft: '20px',
    lineHeight: '1.6'
  }
};

export default VRExperience;

