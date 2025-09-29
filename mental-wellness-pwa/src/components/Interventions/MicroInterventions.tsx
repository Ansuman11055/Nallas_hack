import React, { useState, useEffect, useRef } from 'react';
import { InterventionModule } from '../../types';

interface MicroInterventionsProps {
  intervention: InterventionModule;
  onComplete: (effectiveness?: number) => void;
  onExit: () => void;
}

const MicroInterventions: React.FC<MicroInterventionsProps> = ({
  intervention,
  onComplete,
  onExit
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingCount, setBreathingCount] = useState(4);
  const [completionRating, setCompletionRating] = useState<number | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [affirmations] = useState([
    "I am capable of handling whatever comes my way",
    "I choose to focus on what I can control",
    "I am worthy of love and respect",
    "Every challenge is an opportunity to grow",
    "I trust in my ability to make good decisions",
    "I am resilient and can overcome difficulties",
    "I deserve happiness and peace",
    "I am exactly where I need to be right now"
  ]);
  const [groundingInputs, setGroundingInputs] = useState({
    see: ['', '', '', '', ''],
    touch: ['', '', '', ''],
    hear: ['', '', ''],
    smell: ['', ''],
    taste: ['']
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
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
  }, [isActive]);

  useEffect(() => {
    // Breathing exercise timer
    if (intervention.type === 'breathing' && isActive) {
      const breathingTimer = setInterval(() => {
        setBreathingCount(prev => {
          if (prev <= 1) {
            setBreathingPhase(current => {
              if (current === 'inhale') return 'hold';
              if (current === 'hold') return 'exhale';
              return 'inhale';
            });
            return current === 'inhale' ? 4 : current === 'hold' ? 7 : 8;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(breathingTimer);
    }
  }, [intervention.type, isActive, breathingPhase]);

  const startSession = () => {
    setIsActive(true);
    setTimer(0);
    
    // Start audio guide if available
    if (intervention.audioGuide && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  };

  const completeSession = () => {
    setIsActive(false);
    setShowCompletion(true);
    
    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleRatingComplete = () => {
    onComplete(completionRating || undefined);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateGroundingInput = (category: keyof typeof groundingInputs, index: number, value: string) => {
    setGroundingInputs(prev => ({
      ...prev,
      [category]: prev[category].map((item, i) => i === index ? value : item)
    }));
  };

  const renderBreathingExercise = () => (
    <div className="breathing-exercise">
      <div className="breathing-visual">
        <div className={`breathing-circle ${breathingPhase} ${isActive ? 'active' : ''}`}>
          <div className="breathing-inner-circle">
            <div className="breathing-count">{breathingCount}</div>
          </div>
        </div>
      </div>
      
      <div className="breathing-instructions">
        <h3>
          {breathingPhase === 'inhale' && 'Breathe In'}
          {breathingPhase === 'hold' && 'Hold'}
          {breathingPhase === 'exhale' && 'Breathe Out'}
        </h3>
        <p>
          {breathingPhase === 'inhale' && 'Inhale slowly through your nose'}
          {breathingPhase === 'hold' && 'Hold your breath gently'}
          {breathingPhase === 'exhale' && 'Exhale slowly through your mouth'}
        </p>
      </div>

      <div className="breathing-progress">
        <div className="cycle-indicator">
          <span>Cycle: {Math.floor(timer / 19) + 1}</span>
        </div>
      </div>
    </div>
  );

  const renderGroundingTechnique = () => (
    <div className="grounding-technique">
      <div className="grounding-steps">
        <div className="grounding-step active">
          <h3>🔍 5 Things You Can See</h3>
          <p>Look around and name 5 things you can see</p>
          <div className="grounding-inputs">
            {groundingInputs.see.map((item, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Thing ${index + 1} you can see...`}
                value={item}
                onChange={(e) => updateGroundingInput('see', index, e.target.value)}
                className="grounding-input"
              />
            ))}
          </div>
        </div>

        <div className="grounding-step">
          <h3>✋ 4 Things You Can Touch</h3>
          <p>Notice 4 things you can physically touch</p>
          <div className="grounding-inputs">
            {groundingInputs.touch.map((item, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Thing ${index + 1} you can touch...`}
                value={item}
                onChange={(e) => updateGroundingInput('touch', index, e.target.value)}
                className="grounding-input"
              />
            ))}
          </div>
        </div>

        <div className="grounding-step">
          <h3>👂 3 Things You Can Hear</h3>
          <p>Listen carefully and identify 3 sounds</p>
          <div className="grounding-inputs">
            {groundingInputs.hear.map((item, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Sound ${index + 1} you can hear...`}
                value={item}
                onChange={(e) => updateGroundingInput('hear', index, e.target.value)}
                className="grounding-input"
              />
            ))}
          </div>
        </div>

        <div className="grounding-step">
          <h3>👃 2 Things You Can Smell</h3>
          <p>Notice 2 different scents around you</p>
          <div className="grounding-inputs">
            {groundingInputs.smell.map((item, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Scent ${index + 1} you can smell...`}
                value={item}
                onChange={(e) => updateGroundingInput('smell', index, e.target.value)}
                className="grounding-input"
              />
            ))}
          </div>
        </div>

        <div className="grounding-step">
          <h3>👅 1 Thing You Can Taste</h3>
          <p>Focus on any taste in your mouth</p>
          <div className="grounding-inputs">
            <input
              type="text"
              placeholder="Something you can taste..."
              value={groundingInputs.taste[0]}
              onChange={(e) => updateGroundingInput('taste', 0, e.target.value)}
              className="grounding-input"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPositiveAffirmations = () => (
    <div className="positive-affirmations">
      <div className="affirmations-container">
        <h3>Repeat these affirmations to yourself:</h3>
        <div className="affirmations-list">
          {affirmations.map((affirmation, index) => (
            <div key={index} className="affirmation-item">
              <div className="affirmation-icon">✨</div>
              <p className="affirmation-text">{affirmation}</p>
            </div>
          ))}
        </div>
        <div className="affirmation-instructions">
          <p>
            Take your time with each affirmation. Breathe deeply and really feel the truth of these words.
            Choose 2-3 that resonate most with you and repeat them several times.
          </p>
        </div>
      </div>
    </div>
  );

  const renderMindfulMoment = () => (
    <div className="mindful-moment">
      <div className="mindfulness-guide">
        <div className="mindfulness-visual">
          <div className="mindfulness-circle">
            <div className="mindfulness-pulse"></div>
            <div className="mindfulness-text">Breathe</div>
          </div>
        </div>
        
        <div className="mindfulness-instructions">
          <h3>Present Moment Awareness</h3>
          <div className="mindfulness-steps">
            <div className="mindfulness-step">
              <span className="step-number">1</span>
              <p>Notice your breath without changing it</p>
            </div>
            <div className="mindfulness-step">
              <span className="step-number">2</span>
              <p>When thoughts arise, acknowledge them gently</p>
            </div>
            <div className="mindfulness-step">
              <span className="step-number">3</span>
              <p>Return your attention to your breath</p>
            </div>
            <div className="mindfulness-step">
              <span className="step-number">4</span>
              <p>Be kind to yourself throughout this practice</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVRRedirect = () => (
    <div className="vr-redirect">
      <div className="vr-redirect-content">
        <div className="vr-icon">🥽</div>
        <h3>VR Relaxation Experience</h3>
        <p>
          For the full VR relaxation experience, we'll redirect you to our immersive VR environment.
        </p>
        <button
          onClick={() => window.location.href = '/vr'}
          className="btn btn-primary btn-large"
        >
          Enter VR Experience
        </button>
      </div>
    </div>
  );

  const renderInterventionContent = () => {
    switch (intervention.type) {
      case 'breathing':
        return renderBreathingExercise();
      case 'grounding':
        return renderGroundingTechnique();
      case 'affirmation':
        return renderPositiveAffirmations();
      case 'mindful':
        return renderMindfulMoment();
      case 'vr':
        return renderVRRedirect();
      default:
        return <div>Intervention type not supported</div>;
    }
  };

  if (showCompletion) {
    return (
      <div className="intervention-completion">
        <div className="completion-container">
          <div className="completion-header">
            <div className="completion-icon">🎉</div>
            <h2>Session Complete!</h2>
            <p>You've completed the {intervention.name} session.</p>
          </div>

          <div className="completion-stats">
            <div className="stat">
              <span className="stat-label">Duration:</span>
              <span className="stat-value">{formatTime(timer)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Target:</span>
              <span className="stat-value">{intervention.duration} min</span>
            </div>
          </div>

          <div className="effectiveness-rating">
            <h3>How effective was this session?</h3>
            <p>Rate how much this intervention helped you (1-5 scale)</p>
            <div className="rating-buttons">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setCompletionRating(rating)}
                  className={`rating-btn ${completionRating === rating ? 'selected' : ''}`}
                >
                  <span className="rating-emoji">
                    {rating === 1 && '😞'}
                    {rating === 2 && '😐'}
                    {rating === 3 && '🙂'}
                    {rating === 4 && '😊'}
                    {rating === 5 && '😄'}
                  </span>
                  <span className="rating-number">{rating}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="completion-actions">
            <button
              onClick={handleRatingComplete}
              className="btn btn-primary btn-large"
              disabled={!completionRating}
            >
              Complete Session
            </button>
            <button
              onClick={onExit}
              className="btn btn-secondary"
            >
              Skip Rating
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="micro-intervention">
      {/* Audio Guide */}
      {intervention.audioGuide && (
        <audio
          ref={audioRef}
          preload="auto"
          style={{ display: 'none' }}
        >
          <source src={intervention.audioGuide} type="audio/mpeg" />
        </audio>
      )}

      {/* Header */}
      <div className="intervention-header">
        <div className="intervention-info">
          <h1>{intervention.name}</h1>
          <p>{intervention.description}</p>
        </div>
        
        <div className="intervention-controls">
          <div className="session-timer">
            {formatTime(timer)} / {intervention.duration}:00
          </div>
          <button
            onClick={onExit}
            className="exit-btn"
            aria-label="Exit intervention"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="intervention-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${Math.min((timer / (intervention.duration * 60)) * 100, 100)}%` 
            }}
          />
        </div>
      </div>

      {/* Instructions (before starting) */}
      {!isActive && (
        <div className="intervention-instructions">
          <h3>Instructions</h3>
          <ol>
            {intervention.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
          
          <div className="start-session">
            <button
              onClick={startSession}
              className="btn btn-primary btn-large"
            >
              Start {intervention.name}
            </button>
          </div>
        </div>
      )}

      {/* Active Intervention Content */}
      {isActive && (
        <div className="intervention-content">
          {renderInterventionContent()}
          
          <div className="intervention-actions">
            <button
              onClick={completeSession}
              className="btn btn-success btn-large"
            >
              Complete Session
            </button>
            <button
              onClick={onExit}
              className="btn btn-secondary"
            >
              Exit Early
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MicroInterventions;
