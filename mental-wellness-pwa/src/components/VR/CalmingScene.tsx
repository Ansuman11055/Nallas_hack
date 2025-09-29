import React, { useEffect, useRef } from 'react';
import { VRScene } from '../../types';

interface CalmingSceneProps {
  scene: VRScene;
  onExit: () => void;
  sessionTimer: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

const CalmingScene: React.FC<CalmingSceneProps> = ({
  scene,
  onExit,
  sessionTimer,
  isFullscreen,
  onToggleFullscreen
}) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Initialize A-Frame scene
    if (sceneRef.current && !sceneRef.current.hasChildNodes()) {
      createAFrameScene();
    }

    // Start ambient audio
    if (audioRef.current && scene.ambientAudio) {
      audioRef.current.play().catch(console.error);
    }

    return () => {
      // Cleanup audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [scene]);

  const createAFrameScene = () => {
    if (!sceneRef.current) return;

    // Create A-Frame scene element
    const aframeScene = document.createElement('a-scene');
    aframeScene.setAttribute('embedded', 'true');
    aframeScene.setAttribute('background', `color: ${scene.skyColor}`);
    aframeScene.setAttribute('vr-mode-ui', 'enabled: true');
    aframeScene.setAttribute('device-orientation-permission-ui', 'enabled: true');

    // Add camera with look controls
    const camera = document.createElement('a-camera');
    camera.setAttribute('look-controls', 'enabled: true');
    camera.setAttribute('wasd-controls', 'enabled: true');
    camera.setAttribute('position', '0 1.6 3');
    aframeScene.appendChild(camera);

    // Add scene elements
    scene.elements.forEach((element, index) => {
      const entity = document.createElement('a-entity');
      
      switch (element.type) {
        case 'sky':
          entity.setAttribute('geometry', 'primitive: sphere; radius: 100');
          entity.setAttribute('material', `color: ${element.color}; side: back`);
          break;
          
        case 'plane':
          entity.setAttribute('geometry', 'primitive: plane');
          entity.setAttribute('material', `color: ${element.color}`);
          break;
          
        case 'box':
          entity.setAttribute('geometry', 'primitive: box');
          entity.setAttribute('material', `color: ${element.color}`);
          break;
          
        case 'sphere':
          entity.setAttribute('geometry', 'primitive: sphere');
          entity.setAttribute('material', `color: ${element.color}`);
          break;
          
        case 'cylinder':
          entity.setAttribute('geometry', 'primitive: cylinder');
          entity.setAttribute('material', `color: ${element.color}`);
          break;
      }

      // Set position
      entity.setAttribute('position', element.position.join(' '));
      
      // Set rotation if specified
      if (element.rotation) {
        entity.setAttribute('rotation', element.rotation.join(' '));
      }
      
      // Set scale if specified
      if (element.scale) {
        entity.setAttribute('scale', element.scale.join(' '));
      }

      // Add animation if specified
      if (element.animation) {
        const animationAttr = `
          property: ${element.animation.property};
          to: ${element.animation.to};
          dur: ${element.animation.dur};
          repeat: ${element.animation.repeat};
          dir: alternate;
          easing: easeInOutQuad
        `;
        entity.setAttribute('animation', animationAttr);
      }

      aframeScene.appendChild(entity);
    });

    // Add lighting
    const ambientLight = document.createElement('a-light');
    ambientLight.setAttribute('type', 'ambient');
    ambientLight.setAttribute('color', '#404040');
    aframeScene.appendChild(ambientLight);

    const directionalLight = document.createElement('a-light');
    directionalLight.setAttribute('type', 'directional');
    directionalLight.setAttribute('position', '0 1 1');
    directionalLight.setAttribute('color', '#ffffff');
    directionalLight.setAttribute('intensity', '0.5');
    aframeScene.appendChild(directionalLight);

    sceneRef.current.appendChild(aframeScene);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionProgress = (): number => {
    return Math.min((sessionTimer / scene.duration) * 100, 100);
  };

  return (
    <div className="calming-scene-container">
      {/* Ambient Audio */}
      {scene.ambientAudio && (
        <audio
          ref={audioRef}
          loop
          preload="auto"
          style={{ display: 'none' }}
        >
          <source src={scene.ambientAudio} type="audio/mpeg" />
        </audio>
      )}

      {/* VR Scene */}
      <div 
        ref={sceneRef} 
        className="vr-scene-wrapper"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Controls Overlay */}
      <div className="vr-controls-overlay">
        <div className="vr-session-info">
          <div className="session-title">
            <span className="scene-icon">
              {scene.id === 'forest' && '🌲'}
              {scene.id === 'ocean' && '🌊'}
              {scene.id === 'mountain' && '🏔️'}
            </span>
            {scene.name}
          </div>
          
          <div className="session-timer">
            {formatTime(sessionTimer)}
          </div>
          
          <div className="session-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${getSessionProgress()}%` }}
              />
            </div>
            <span className="progress-text">
              {Math.round(getSessionProgress())}% Complete
            </span>
          </div>
        </div>

        <div className="vr-control-buttons">
          <button
            onClick={onToggleFullscreen}
            className="vr-control-btn"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? '🔲' : '⛶'}
          </button>
          
          <button
            onClick={() => {
              if (audioRef.current) {
                if (audioRef.current.paused) {
                  audioRef.current.play();
                } else {
                  audioRef.current.pause();
                }
              }
            }}
            className="vr-control-btn"
            title="Toggle Audio"
          >
            🔊
          </button>
          
          <button
            onClick={onExit}
            className="vr-control-btn exit-btn"
            title="Exit VR Session"
          >
            ❌
          </button>
        </div>
      </div>

      {/* Breathing Guide Overlay */}
      <div className="breathing-guide">
        <div className="breathing-circle">
          <div className="breathing-text">
            Breathe
          </div>
        </div>
        <div className="breathing-instructions">
          <p>Follow the circle: Inhale as it expands, exhale as it contracts</p>
        </div>
      </div>

      {/* Mobile VR Instructions */}
      <div className="mobile-vr-hint">
        <p>
          📱 Rotate your device to look around • Use headphones for best experience
        </p>
      </div>

      {/* Session Complete Modal */}
      {sessionTimer >= scene.duration && (
        <div className="session-complete-modal">
          <div className="modal-content">
            <div className="completion-icon">✨</div>
            <h3>Session Complete!</h3>
            <p>
              You've completed a {Math.floor(scene.duration / 60)}-minute relaxation session.
              How are you feeling now?
            </p>
            <div className="post-session-actions">
              <button 
                onClick={onExit}
                className="btn btn-primary"
              >
                Return to Dashboard
              </button>
              <button 
                onClick={() => window.location.href = '/mood'}
                className="btn btn-secondary"
              >
                Log Your Mood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalmingScene;
