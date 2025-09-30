// Statistical Analysis Algorithms for Mental Wellness Baseline Detection

export interface BaselineData {
  rollingMean: number;
  rollingStd: number;
  zScore: number;
  changePointDetected: boolean;
  confidence: number;
}

export interface BehaviorMetrics {
  typingLatencyMean: number;
  burstCount: number;
  sessionCount: number;
  screenTime: number;
  anomalyScore: number;
}

export interface InterventionRecommendation {
  interventionId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  estimatedDuration: number; // in minutes
  confidence: number;
}

// Calculate emotional baseline using EWMA (Exponentially Weighted Moving Average)
export function calculateBaseline(
  moodScores: number[],
  windowSize: number = 21,
  alpha: number = 0.1
): BaselineData {
  if (moodScores.length === 0) {
    return {
      rollingMean: 3.0,
      rollingStd: 1.0,
      zScore: 0,
      changePointDetected: false,
      confidence: 0
    };
  }

  // Calculate rolling statistics
  const recentScores = moodScores.slice(-windowSize);
  const rollingMean = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
  
  // Calculate standard deviation
  const variance = recentScores.reduce((sum, score) => sum + Math.pow(score - rollingMean, 2), 0) / recentScores.length;
  const rollingStd = Math.sqrt(variance);
  
  // Calculate z-score for most recent entry
  const currentScore = moodScores[moodScores.length - 1];
  const zScore = rollingStd > 0 ? (currentScore - rollingMean) / rollingStd : 0;
  
  // Detect change points (significant deviations)
  const changePointDetected = Math.abs(zScore) > 1.5;
  
  // Calculate confidence based on data points available
  const confidence = Math.min(recentScores.length / windowSize, 1.0);
  
  return {
    rollingMean,
    rollingStd,
    zScore,
    changePointDetected,
    confidence
  };
}

// Analyze behavioral patterns from interaction data
export function analyzeBehaviorMetrics(
  typingEvents: Array<{ timestamp: number; latency: number }>,
  sessionTimes: number[],
  screenEvents: Array<{ start: number; end: number }>
): BehaviorMetrics {
  // Keystroke dynamics analysis
  const latencies = typingEvents.map(e => e.latency);
  const typingLatencyMean = latencies.length > 0 
    ? latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length 
    : 0;
  
  // Calculate typing bursts (rapid sequences)
  let burstCount = 0;
  for (let i = 1; i < typingEvents.length; i++) {
    const timeDiff = typingEvents[i].timestamp - typingEvents[i-1].timestamp;
    if (timeDiff < 200) { // Less than 200ms between keystrokes
      burstCount++;
    }
  }
  
  // Session frequency analysis
  const sessionCount = sessionTimes.length;
  
  // Screen time calculation
  const screenTime = screenEvents.reduce((total, event) => {
    return total + (event.end - event.start);
  }, 0);
  
  // Anomaly detection using statistical methods
  const baselineLatency = 300; // ms baseline
  const latencyDeviation = Math.abs(typingLatencyMean - baselineLatency) / baselineLatency;
  const sessionDeviation = Math.abs(sessionCount - 5) / 5; // Assuming 5 sessions is normal
  
  const anomalyScore = (latencyDeviation + sessionDeviation) / 2;
  
  return {
    typingLatencyMean,
    burstCount,
    sessionCount,
    screenTime,
    anomalyScore
  };
}

// Select appropriate micro-intervention based on current state
export function selectMicroIntervention(
  baseline: BaselineData,
  recentInterventions: string[],
  timeOfDay: number = new Date().getHours()
): InterventionRecommendation {
  const interventions = [
    {
      id: 'breathing_478',
      name: '4-7-8 Breathing',
      duration: 5,
      conditions: ['anxiety', 'stress', 'negative_mood'],
      timeRestrictions: []
    },
    {
      id: 'grounding_54321',
      name: '5-4-3-2-1 Grounding',
      duration: 3,
      conditions: ['anxiety', 'overwhelm', 'panic'],
      timeRestrictions: []
    },
    {
      id: 'positive_affirmation',
      name: 'Positive Affirmations',
      duration: 2,
      conditions: ['low_mood', 'negative_thoughts'],
      timeRestrictions: []
    },
    {
      id: 'mindful_moment',
      name: 'Mindful Moment',
      duration: 5,
      conditions: ['stress', 'distraction'],
      timeRestrictions: []
    },
    {
      id: 'vr_forest',
      name: 'VR Forest Scene',
      duration: 10,
      conditions: ['high_stress', 'need_escape'],
      timeRestrictions: [6, 22] // Only during daytime
    },
    {
      id: 'progressive_relaxation',
      name: 'Progressive Muscle Relaxation',
      duration: 15,
      conditions: ['physical_tension', 'sleep_prep'],
      timeRestrictions: [18, 23] // Evening preferred
    }
  ];
  
  // Determine current condition based on baseline
  let currentCondition = 'neutral';
  let priority: 'low' | 'medium' | 'high' | 'urgent' = 'low';
  let reason = 'Maintaining wellness';
  
  if (baseline.zScore < -1.5) {
    currentCondition = 'low_mood';
    priority = 'high';
    reason = 'Detected significant mood decline';
  } else if (baseline.zScore < -1.0) {
    currentCondition = 'negative_mood';
    priority = 'medium';
    reason = 'Mood below baseline';
  } else if (baseline.changePointDetected && baseline.zScore < 0) {
    currentCondition = 'stress';
    priority = 'medium';
    reason = 'Detected mood change point';
  } else if (baseline.zScore > 1.5) {
    currentCondition = 'positive_mood';
    priority = 'low';
    reason = 'Reinforcing positive state';
  }
  
  // Filter interventions based on conditions and time
  const suitableInterventions = interventions.filter(intervention => {
    // Check if intervention addresses current condition
    const addressesCondition = intervention.conditions.includes(currentCondition) ||
                              intervention.conditions.includes('stress') ||
                              intervention.conditions.includes('anxiety');
    
    // Check time restrictions
    const timeOk = intervention.timeRestrictions.length === 0 ||
                   (timeOfDay >= intervention.timeRestrictions[0] && 
                    timeOfDay <= intervention.timeRestrictions[1]);
    
    // Avoid recent interventions (within last 24 hours)
    const notRecent = !recentInterventions.includes(intervention.id);
    
    return addressesCondition && timeOk && notRecent;
  });
  
  // Select intervention (prefer shorter ones for frequent use)
  const selectedIntervention = suitableInterventions.length > 0
    ? suitableInterventions.sort((a, b) => a.duration - b.duration)[0]
    : interventions[0]; // Fallback to breathing exercise
  
  return {
    interventionId: selectedIntervention.id,
    priority,
    reason,
    estimatedDuration: selectedIntervention.duration,
    confidence: baseline.confidence
  };
}

// Calculate mood trend over time
export function calculateMoodTrend(
  moodScores: number[],
  timestamps: Date[],
  periodDays: number = 7
): {
  trend: 'improving' | 'declining' | 'stable';
  slope: number;
  correlation: number;
} {
  if (moodScores.length < 2) {
    return { trend: 'stable', slope: 0, correlation: 0 };
  }
  
  // Filter data for the specified period
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - periodDays);
  
  const recentData = moodScores
    .map((score, index) => ({ score, timestamp: timestamps[index] }))
    .filter(item => item.timestamp >= cutoffDate);
  
  if (recentData.length < 2) {
    return { trend: 'stable', slope: 0, correlation: 0 };
  }
  
  // Calculate linear regression
  const n = recentData.length;
  const x = recentData.map((_, index) => index);
  const y = recentData.map(item => item.score);
  
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, index) => sum + val * y[index], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);
  const sumYY = y.reduce((sum, val) => sum + val * val, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const correlation = (n * sumXY - sumX * sumY) / 
    Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  
  // Determine trend
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (Math.abs(slope) > 0.1) { // Significant slope threshold
    trend = slope > 0 ? 'improving' : 'declining';
  }
  
  return { trend, slope, correlation };
}

// Detect crisis keywords in text
export function detectCrisisKeywords(text: string): {
  detected: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  keywords: string[];
} {
  const crisisKeywords = {
    critical: ['suicide', 'kill myself', 'end it all', 'want to die', 'better off dead'],
    high: ['hopeless', 'worthless', 'can\'t go on', 'no point', 'give up'],
    medium: ['depressed', 'anxious', 'overwhelmed', 'stressed', 'worried'],
    low: ['sad', 'down', 'upset', 'frustrated', 'tired']
  };
  
  const lowerText = text.toLowerCase();
  const detectedKeywords: string[] = [];
  let maxSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  
  // Check each severity level
  for (const [severity, keywords] of Object.entries(crisisKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        detectedKeywords.push(keyword);
        if (severity === 'critical' || 
           (severity === 'high' && maxSeverity !== 'critical') ||
           (severity === 'medium' && !['critical', 'high'].includes(maxSeverity)) ||
           (severity === 'low' && maxSeverity === 'low')) {
          maxSeverity = severity as 'low' | 'medium' | 'high' | 'critical';
        }
      }
    }
  }
  
  return {
    detected: detectedKeywords.length > 0,
    severity: maxSeverity,
    keywords: detectedKeywords
  };
}
