import React, { useState, useEffect } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { selectMicroIntervention } from '../../utils/algorithms';
import { InterventionModule, InterventionRecommendation } from '../../types';
import MicroInterventions from './MicroInterventions';

const InterventionSequencer: React.FC = () => {
  const { currentBaseline, interventions, saveIntervention } = useDatabase();
  const [selectedIntervention, setSelectedIntervention] = useState<InterventionModule | null>(null);
  const [recommendation, setRecommendation] = useState<InterventionRecommendation | null>(null);
  const [isInSession, setIsInSession] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  const interventionModules: InterventionModule[] = [
    {
      id: 'breathing_exercise',
      name: '4-7-8 Breathing',
      description: 'A powerful breathing technique to reduce anxiety and promote relaxation',
      type: 'breathing',
      duration: 4,
      instructions: [
        'Sit or lie down in a comfortable position',
        'Place one hand on your chest, one on your belly',
        'Inhale through your nose for 4 counts',
        'Hold your breath for 7 counts',
        'Exhale through your mouth for 8 counts',
        'Repeat this cycle 4-6 times'
      ],
      audioGuide: '/audio/breathing-guide.mp3',
      visualGuide: true
    },
    {
      id: 'grounding_technique',
      name: '5-4-3-2-1 Grounding',
      description: 'Use your senses to ground yourself in the present moment',
      type: 'grounding',
      duration: 5,
      instructions: [
        'Find a comfortable position and take a deep breath',
        'Name 5 things you can see around you',
        'Name 4 things you can touch',
        'Name 3 things you can hear',
        'Name 2 things you can smell',
        'Name 1 thing you can taste'
      ],
      visualGuide: true
    },
    {
      id: 'positive_affirmation',
      name: 'Positive Affirmations',
      description: 'Boost your mood with evidence-based positive statements',
      type: 'affirmation',
      duration: 3,
      instructions: [
        'Find a quiet space and sit comfortably',
        'Take three deep breaths to center yourself',
        'Read each affirmation slowly and mindfully',
        'Repeat the ones that resonate with you',
        'Believe in the truth of these statements'
      ],
      visualGuide: true
    },
    {
      id: 'mindful_moment',
      name: 'Mindful Moment',
      description: 'A brief mindfulness practice to increase present-moment awareness',
      type: 'mindful',
      duration: 5,
      instructions: [
        'Sit comfortably with your eyes closed or softly focused',
        'Notice your breath without trying to change it',
        'When your mind wanders, gently return to your breath',
        'Observe thoughts and feelings without judgment',
        'End by taking three conscious breaths'
      ],
      audioGuide: '/audio/mindfulness-guide.mp3',
      visualGuide: true
    },
    {
      id: 'vr_calming_scene',
      name: 'VR Relaxation',
      description: 'Immerse yourself in a calming virtual environment',
      type: 'vr',
      duration: 10,
      instructions: [
        'Choose a calming environment that appeals to you',
        'Put on headphones for the full experience',
        'Use fullscreen mode or VR headset if available',
        'Focus on your breathing while exploring the scene',
        'Allow yourself to be fully present in the virtual space'
      ],
      visualGuide: false
    }
  ];

  useEffect(() => {
    // Generate recommendation based on current baseline
    if (currentBaseline) {
      const recentInterventionIds = interventions
        .filter(intervention => {
          const dayAgo = new Date();
          dayAgo.setDate(dayAgo.getDate() - 1);
          return new Date(intervention.startTime) > dayAgo;
        })
        .map(intervention => intervention.interventionId);

      const rec = selectMicroIntervention(currentBaseline, recentInterventionIds);
      setRecommendation(rec);
    }
  }, [currentBaseline, interventions]);

  const startIntervention = async (intervention: InterventionModule) => {
    setSelectedIntervention(intervention);
    setIsInSession(true);
    setSessionStartTime(new Date());

    // Save intervention start
    await saveIntervention({
      interventionId: intervention.id,
      startTime: new Date()
    });
  };

  const completeIntervention = async (effectiveness?: number) => {
    if (!selectedIntervention || !sessionStartTime) return;

    // Find the intervention record and update it
    const interventionRecord = interventions.find(
      i => i.interventionId === selectedIntervention.id && 
      Math.abs(new Date(i.startTime).getTime() - sessionStartTime.getTime()) < 60000 // Within 1 minute
    );

    if (interventionRecord?.id) {
      // Update intervention with completion data
      // This would be implemented in the database context
      console.log('Intervention completed:', {
        id: interventionRecord.id,
        endTime: new Date(),
        outcome: 'completed',
        effectiveness
      });
    }

    setIsInSession(false);
    setSelectedIntervention(null);
    setSessionStartTime(null);
  };

  const getRecommendedIntervention = (): InterventionModule | null => {
    if (!recommendation) return null;
    return interventionModules.find(m => m.id === recommendation.interventionId) || null;
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'urgent': return '#F44336';
      case 'high': return '#FF9800';
      case 'medium': return '#2196F3';
      case 'low': return '#4CAF50';
      default: return '#2196F3';
    }
  };

  const getInterventionIcon = (type: string): string => {
    switch (type) {
      case 'breathing': return '🫁';
      case 'grounding': return '🌱';
      case 'affirmation': return '💪';
      case 'mindful': return '🧘';
      case 'vr': return '🥽';
      default: return '✨';
    }
  };

  if (isInSession && selectedIntervention) {
    return (
      <MicroInterventions
        intervention={selectedIntervention}
        onComplete={completeIntervention}
        onExit={() => setIsInSession(false)}
      />
    );
  }

  const recommendedIntervention = getRecommendedIntervention();

  return (
    <div className="intervention-sequencer">
      <div className="container">
        <div className="interventions-header">
          <h1>🧘 Wellness Interventions</h1>
          <p>
            Discover evidence-based techniques to improve your mental wellness and emotional balance.
          </p>
        </div>

        {/* AI Recommendation */}
        {recommendation && recommendedIntervention && (
          <div className="recommendation-card">
            <div className="recommendation-header">
              <div className="recommendation-icon">🤖</div>
              <div className="recommendation-content">
                <h3>Personalized Recommendation</h3>
                <div 
                  className="recommendation-priority"
                  style={{ color: getPriorityColor(recommendation.priority) }}
                >
                  Priority: {recommendation.priority.toUpperCase()}
                </div>
              </div>
            </div>
            
            <div className="recommendation-body">
              <div className="recommended-intervention">
                <div className="intervention-preview">
                  <span className="intervention-icon-large">
                    {getInterventionIcon(recommendedIntervention.type)}
                  </span>
                  <div className="intervention-details">
                    <h4>{recommendedIntervention.name}</h4>
                    <p>{recommendedIntervention.description}</p>
                    <div className="intervention-meta">
                      <span className="duration">⏱️ {recommendedIntervention.duration} min</span>
                    </div>
                  </div>
                </div>
                
                <div className="recommendation-reason">
                  <p><strong>Why this intervention:</strong> {recommendation.reason}</p>
                </div>
                
                <button
                  onClick={() => startIntervention(recommendedIntervention)}
                  className="btn btn-primary btn-large"
                >
                  Start Recommended Session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* All Interventions */}
        <div className="interventions-section">
          <h2>All Interventions</h2>
          <div className="intervention-grid">
            {interventionModules.map((intervention) => (
              <div key={intervention.id} className="intervention-card">
                <div className="intervention-header">
                  <span className="intervention-icon">
                    {getInterventionIcon(intervention.type)}
                  </span>
                  <div className="intervention-title-section">
                    <h3 className="intervention-title">{intervention.name}</h3>
                    <div className="intervention-duration">
                      ⏱️ {intervention.duration} minutes
                    </div>
                  </div>
                </div>
                
                <p className="intervention-description">
                  {intervention.description}
                </p>
                
                <div className="intervention-features">
                  {intervention.audioGuide && (
                    <div className="feature-badge">🎧 Audio Guide</div>
                  )}
                  {intervention.visualGuide && (
                    <div className="feature-badge">👁️ Visual Guide</div>
                  )}
                </div>
                
                <div className="intervention-instructions-preview">
                  <h4>What you'll do:</h4>
                  <ul>
                    {intervention.instructions.slice(0, 2).map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                    {intervention.instructions.length > 2 && (
                      <li>+ {intervention.instructions.length - 2} more steps</li>
                    )}
                  </ul>
                </div>
                
                <button
                  onClick={() => startIntervention(intervention)}
                  className="btn btn-primary"
                >
                  Start Session
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        {interventions.length > 0 && (
          <div className="recent-sessions">
            <h2>Recent Sessions</h2>
            <div className="sessions-list">
              {interventions.slice(0, 5).map((session, index) => {
                const intervention = interventionModules.find(m => m.id === session.interventionId);
                if (!intervention) return null;

                return (
                  <div key={session.id || index} className="session-item">
                    <div className="session-icon">
                      {getInterventionIcon(intervention.type)}
                    </div>
                    <div className="session-details">
                      <div className="session-name">{intervention.name}</div>
                      <div className="session-time">
                        {new Date(session.startTime).toLocaleDateString()} at{' '}
                        {new Date(session.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="session-status">
                      {session.endTime ? (
                        <span className="status-completed">✅ Completed</span>
                      ) : (
                        <span className="status-incomplete">⏸️ Incomplete</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Benefits Information */}
        <div className="interventions-benefits">
          <h2>Why Use Interventions?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🧠</div>
              <h4>Neuroplasticity</h4>
              <p>Regular practice creates positive changes in brain structure and function</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">💪</div>
              <h4>Emotional Regulation</h4>
              <p>Build skills to manage difficult emotions and increase resilience</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">⚡</div>
              <h4>Immediate Relief</h4>
              <p>Quick techniques provide fast relief from stress, anxiety, and overwhelm</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">📈</div>
              <h4>Long-term Growth</h4>
              <p>Consistent practice leads to lasting improvements in mental wellness</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterventionSequencer;
