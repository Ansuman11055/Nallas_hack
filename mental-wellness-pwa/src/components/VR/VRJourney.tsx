import React, { useState, useEffect, useRef } from 'react';
import CalmingScene from './CalmingScene';
import { VRScene } from '../../types';

const VRJourney: React.FC = () => {
  const [selectedScene, setSelectedScene] = useState<VRScene | null>(null);
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const vrScenes: VRScene[] = [
    {
      id: 'forest',
      name: 'Peaceful Forest',
      description: 'Walk through a serene forest with gentle sounds of nature',
      skyColor: '#87CEEB',
      ambientAudio: '/audio/forest-ambience.mp3',
      duration: 300, // 5 minutes
      elements: [
        {
          type: 'sky',
          position: [0, 0, 0],
          color: '#87CEEB'
        },
        {
          type: 'plane',
          position: [0, -2, 0],
          rotation: [-90, 0, 0],
          scale: [50, 50, 1],
          color: '#228B22'
        },
        // Trees
        {
          type: 'cylinder',
          position: [-5, 0, -10],
          scale: [0.5, 8, 0.5],
          color: '#8B4513',
          animation: {
            property: 'rotation',
            to: '0 2 0',
            dur: 10000,
            repeat: 'indefinite'
          }
        },
        {
          type: 'cylinder',
          position: [3, 0, -8],
          scale: [0.4, 6, 0.4],
          color: '#8B4513'
        },
        {
          type: 'cylinder',
          position: [-8, 0, -15],
          scale: [0.6, 10, 0.6],
          color: '#8B4513'
        },
        // Floating particles
        {
          type: 'sphere',
          position: [2, 3, -5],
          scale: [0.1, 0.1, 0.1],
          color: '#FFD700',
          animation: {
            property: 'position',
            to: '2 5 -5',
            dur: 3000,
            repeat: 'indefinite'
          }
        }
      ]
    },
    {
      id: 'ocean',
      name: 'Tranquil Ocean',
      description: 'Relax by calm ocean waves with soothing water sounds',
      skyColor: '#87CEFA',
      ambientAudio: '/audio/ocean-waves.mp3',
      duration: 600, // 10 minutes
      elements: [
        {
          type: 'sky',
          position: [0, 0, 0],
          color: '#87CEFA'
        },
        {
          type: 'plane',
          position: [0, -1, 0],
          rotation: [-90, 0, 0],
          scale: [100, 100, 1],
          color: '#4682B4',
          animation: {
            property: 'position',
            to: '0 -0.5 0',
            dur: 4000,
            repeat: 'indefinite'
          }
        },
        // Floating objects
        {
          type: 'sphere',
          position: [10, 2, -20],
          scale: [2, 2, 2],
          color: '#FF6347',
          animation: {
            property: 'rotation',
            to: '360 0 0',
            dur: 8000,
            repeat: 'indefinite'
          }
        },
        {
          type: 'box',
          position: [-15, 1, -25],
          scale: [1, 1, 1],
          color: '#32CD32',
          animation: {
            property: 'position',
            to: '-15 3 -25',
            dur: 6000,
            repeat: 'indefinite'
          }
        }
      ]
    },
    {
      id: 'mountain',
      name: 'Mountain Vista',
      description: 'Find peace in a majestic mountain landscape',
      skyColor: '#E0E6FF',
      ambientAudio: '/audio/wind-ambience.mp3',
      duration: 900, // 15 minutes
      elements: [
        {
          type: 'sky',
          position: [0, 0, 0],
          color: '#E0E6FF'
        },
        {
          type: 'plane',
          position: [0, -3, 0],
          rotation: [-90, 0, 0],
          scale: [200, 200, 1],
          color: '#8FBC8F'
        },
        // Mountains
        {
          type: 'box',
          position: [0, 5, -50],
          scale: [30, 20, 10],
          color: '#696969'
        },
        {
          type: 'box',
          position: [-40, 3, -60],
          scale: [25, 15, 8],
          color: '#708090'
        },
        {
          type: 'box',
          position: [35, 4, -55],
          scale: [20, 18, 12],
          color: '#778899'
        },
        // Clouds
        {
          type: 'sphere',
          position: [-20, 15, -30],
          scale: [8, 4, 8],
          color: '#FFFFFF',
          animation: {
            property: 'position',
            to: '20 15 -30',
            dur: 30000,
            repeat: 'indefinite'
          }
        }
      ]
    }
  ];

  useEffect(() => {
    // Check VR support
    setIsVRSupported('xr' in navigator);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isSessionActive) {
      timerRef.current = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isSessionActive]);

  const startVRSession = (scene: VRScene) => {
    setSelectedScene(scene);
    setSessionTimer(0);
    setIsSessionActive(true);
  };

  const endVRSession = () => {
    setSelectedScene(null);
    setIsSessionActive(false);
    setSessionTimer(0);
    setIsFullscreen(false);
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (selectedScene) {
    return (
      <div ref={containerRef} className={`vr-session ${isFullscreen ? 'fullscreen' : ''}`}>
        <CalmingScene 
          scene={selectedScene}
          onExit={endVRSession}
          sessionTimer={sessionTimer}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />
      </div>
    );
  }

  return (
    <div className="vr-journey">
      <div className="container">
        <div className="vr-header">
          <h1>🥽 VR Relaxation Journey</h1>
          <p>
            Immerse yourself in calming virtual environments designed to reduce stress and promote mindfulness.
          </p>
          
          {!isVRSupported && (
            <div className="vr-compatibility-notice">
              <p>
                💡 <strong>Tip:</strong> For the best experience, use a VR headset or enable VR mode on your device. 
                You can also enjoy these scenes in "magic window" mode on your phone or computer.
              </p>
            </div>
          )}
        </div>

        <div className="vr-scenes-grid">
          {vrScenes.map((scene) => (
            <div key={scene.id} className="vr-scene-card">
              <div className="scene-preview" style={{ backgroundColor: scene.skyColor }}>
                <div className="scene-icon">
                  {scene.id === 'forest' && '🌲'}
                  {scene.id === 'ocean' && '🌊'}
                  {scene.id === 'mountain' && '🏔️'}
                </div>
              </div>
              
              <div className="scene-info">
                <h3>{scene.name}</h3>
                <p>{scene.description}</p>
                
                <div className="scene-details">
                  <div className="scene-duration">
                    <span className="detail-icon">⏱️</span>
                    {Math.floor(scene.duration / 60)} minutes
                  </div>
                  <div className="scene-audio">
                    <span className="detail-icon">🔊</span>
                    Ambient audio
                  </div>
                </div>
                
                <button
                  onClick={() => startVRSession(scene)}
                  className="btn btn-primary btn-large"
                >
                  Enter {scene.name}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="vr-benefits">
          <h3>Benefits of VR Relaxation</h3>
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon">🧘</div>
              <h4>Stress Reduction</h4>
              <p>Immersive environments help activate the relaxation response</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">🎯</div>
              <h4>Improved Focus</h4>
              <p>VR meditation enhances mindfulness and present-moment awareness</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">😌</div>
              <h4>Anxiety Relief</h4>
              <p>Calming virtual spaces provide escape from anxious thoughts</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">💤</div>
              <h4>Better Sleep</h4>
              <p>Regular VR relaxation can improve sleep quality and duration</p>
            </div>
          </div>
        </div>

        <div className="vr-instructions">
          <h3>How to Use VR Relaxation</h3>
          <div className="instructions-list">
            <div className="instruction-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Choose Your Environment</h4>
                <p>Select a scene that appeals to you - forest, ocean, or mountains</p>
              </div>
            </div>
            <div className="instruction-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Get Comfortable</h4>
                <p>Find a quiet space, put on headphones, and sit or lie down comfortably</p>
              </div>
            </div>
            <div className="instruction-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Immerse Yourself</h4>
                <p>Use fullscreen mode or VR headset for the most immersive experience</p>
              </div>
            </div>
            <div className="instruction-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Focus on Breathing</h4>
                <p>Let the environment guide your breathing and help you relax</p>
              </div>
            </div>
          </div>
        </div>

        <div className="vr-safety-notice">
          <h4>⚠️ Safety Notice</h4>
          <ul>
            <li>Take breaks every 15-20 minutes to prevent eye strain</li>
            <li>Stop immediately if you feel dizzy or nauseous</li>
            <li>Ensure you're in a safe space before starting VR sessions</li>
            <li>Don't use VR while driving or operating machinery</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VRJourney;
