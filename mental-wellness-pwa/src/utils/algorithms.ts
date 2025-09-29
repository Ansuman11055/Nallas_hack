// Statistical algorithms for mental wellness baseline analysis

import { 
  BaselineData, 
  BehaviorMetrics, 
  InterventionRecommendation, 
  KeystrokeEvent, 
  SessionEvent 
} from '../types';

/**
 * Calculate emotional baseline using Exponentially Weighted Moving Average (EWMA)
 * @param moodScores - Array of mood scores (1-5 scale)
 * @param windowSize - Rolling window size in days (default: 21)
 * @param alpha - EWMA smoothing factor (default: 0.1)
 * @returns BaselineData with statistical measures
 */
export function calculateBaseline(
  moodScores: number[],
  windowSize: number = 21,
  alpha: number = 0.1
): BaselineData {
  if (moodScores.length === 0) {
    return {
      rollingMean: 3.0, // Default neutral mood
      rollingStd: 1.0,
      zScore: 0,
      changePointDetected: false
    };
  }

  // Calculate rolling mean using EWMA
  let ewma = moodScores[0];
  const ewmaValues: number[] = [ewma];
  
  for (let i = 1; i < moodScores.length; i++) {
    ewma = alpha * moodScores[i] + (1 - alpha) * ewma;
    ewmaValues.push(ewma);
  }

  // Calculate rolling standard deviation
  const recentScores = moodScores.slice(-windowSize);
  const mean = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
  const variance = recentScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / recentScores.length;
  const rollingStd = Math.sqrt(variance);

  // Calculate z-score for the most recent mood
  const currentMood = moodScores[moodScores.length - 1];
  const zScore = rollingStd > 0 ? (currentMood - mean) / rollingStd : 0;

  // Detect change points (significant mood shifts)
  const changePointDetected = Math.abs(zScore) > 1.5;

  return {
    rollingMean: mean,
    rollingStd: Math.max(rollingStd, 0.1), // Avoid division by zero
    zScore,
    changePointDetected
  };
}

/**
 * Analyze behavioral patterns from user interaction data
 * @param typingEvents - Array of keystroke timing events
 * @param sessionTimes - Array of session durations in milliseconds
 * @param screenEvents - Array of screen interaction events
 * @returns BehaviorMetrics with behavioral indicators
 */
export function analyzeBehaviorMetrics(
  typingEvents: KeystrokeEvent[],
  sessionTimes: number[],
  screenEvents: Array<{ start: number; end: number }>
): BehaviorMetrics {
  // Keystroke dynamics analysis
  const latencies = typingEvents.map(e => e.latency).filter(l => l > 0 && l < 2000); // Filter outliers
  const typingLatencyMean = latencies.length > 0 
    ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length 
    : 0;

  // Calculate typing bursts (rapid sequences of keystrokes)
  let burstCount = 0;
  for (let i = 1; i < typingEvents.length; i++) {
    const timeDiff = typingEvents[i].timestamp - typingEvents[i - 1].timestamp;
    if (timeDiff < 100) { // Less than 100ms between keystrokes
      burstCount++;
    }
  }

  // Session frequency analysis
  const sessionCount = sessionTimes.length;
  
  // Screen time calculation
  const totalScreenTime = screenEvents.reduce((total, event) => {
    return total + (event.end - event.start);
  }, 0);

  // Anomaly detection using statistical methods
  const sessionMean = sessionTimes.length > 0 
    ? sessionTimes.reduce((sum, time) => sum + time, 0) / sessionTimes.length 
    : 0;
  
  const sessionStd = sessionTimes.length > 1 
    ? Math.sqrt(sessionTimes.reduce((sum, time) => sum + Math.pow(time - sessionMean, 2), 0) / sessionTimes.length)
    : 0;

  // Calculate anomaly score based on recent session patterns
  let anomalyScore = 0;
  if (sessionTimes.length > 0 && sessionStd > 0) {
    const recentSession = sessionTimes[sessionTimes.length - 1];
    const zScore = Math.abs((recentSession - sessionMean) / sessionStd);
    anomalyScore = Math.min(zScore / 3, 1); // Normalize to 0-1 scale
  }

  return {
    typingLatencyMean,
    burstCount,
    sessionCount,
    screenTime: totalScreenTime,
    anomalyScore
  };
}

/**
 * Select appropriate micro-intervention based on baseline and recent history
 * @param baseline - Current emotional baseline data
 * @param recentInterventions - Array of recently used intervention IDs
 * @returns InterventionRecommendation with suggested intervention
 */
export function selectMicroIntervention(
  baseline: BaselineData,
  recentInterventions: string[]
): InterventionRecommendation {
  const { zScore, changePointDetected } = baseline;
  
  // Define intervention priorities based on mood state
  let interventionOptions: Array<{
    id: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    reason: string;
    duration: number;
  }> = [];

  if (zScore > 1.5) {
    // Positive mood spike - reinforce with positive interventions
    interventionOptions = [
      {
        id: 'positive_affirmation',
        priority: 'medium',
        reason: 'Reinforce positive mood with affirmations',
        duration: 2
      },
      {
        id: 'gratitude_practice',
        priority: 'medium',
        reason: 'Build on positive emotions with gratitude',
        duration: 3
      },
      {
        id: 'mindful_moment',
        priority: 'low',
        reason: 'Maintain awareness of positive state',
        duration: 5
      }
    ];
  } else if (zScore < -1.5) {
    // Negative mood spike - supportive interventions
    interventionOptions = [
      {
        id: 'breathing_exercise',
        priority: 'high',
        reason: 'Regulate emotions with breathing',
        duration: 4
      },
      {
        id: 'grounding_technique',
        priority: 'high',
        reason: 'Ground yourself in the present moment',
        duration: 5
      },
      {
        id: 'vr_calming_scene',
        priority: 'medium',
        reason: 'Immersive relaxation experience',
        duration: 10
      }
    ];
  } else if (changePointDetected) {
    // Significant mood change detected
    interventionOptions = [
      {
        id: 'mindful_check_in',
        priority: 'medium',
        reason: 'Process recent mood changes mindfully',
        duration: 3
      },
      {
        id: 'emotion_labeling',
        priority: 'medium',
        reason: 'Identify and understand current emotions',
        duration: 4
      }
    ];
  } else {
    // Stable mood - maintenance interventions
    interventionOptions = [
      {
        id: 'daily_reflection',
        priority: 'low',
        reason: 'Maintain emotional awareness',
        duration: 3
      },
      {
        id: 'brief_meditation',
        priority: 'low',
        reason: 'Continue building mindfulness',
        duration: 5
      }
    ];
  }

  // Filter out recently used interventions (within last 24 hours)
  const availableInterventions = interventionOptions.filter(
    intervention => !recentInterventions.includes(intervention.id)
  );

  // Select intervention with highest priority, or fallback to any available
  const selectedIntervention = availableInterventions.length > 0 
    ? availableInterventions.sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })[0]
    : interventionOptions[0]; // Fallback to first option if all were recent

  return {
    interventionId: selectedIntervention.id,
    priority: selectedIntervention.priority,
    reason: selectedIntervention.reason,
    estimatedDuration: selectedIntervention.duration
  };
}

/**
 * Detect mood trends over time
 * @param moodScores - Array of mood scores with timestamps
 * @param days - Number of days to analyze (default: 7)
 * @returns Trend analysis result
 */
export function detectMoodTrends(
  moodScores: Array<{ score: number; timestamp: Date }>,
  days: number = 7
): {
  trend: 'improving' | 'declining' | 'stable';
  slope: number;
  confidence: number;
} {
  if (moodScores.length < 3) {
    return { trend: 'stable', slope: 0, confidence: 0 };
  }

  // Filter to recent days
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentScores = moodScores
    .filter(entry => entry.timestamp >= cutoffDate)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  if (recentScores.length < 3) {
    return { trend: 'stable', slope: 0, confidence: 0 };
  }

  // Calculate linear regression slope
  const n = recentScores.length;
  const sumX = recentScores.reduce((sum, _, i) => sum + i, 0);
  const sumY = recentScores.reduce((sum, entry) => sum + entry.score, 0);
  const sumXY = recentScores.reduce((sum, entry, i) => sum + i * entry.score, 0);
  const sumXX = recentScores.reduce((sum, _, i) => sum + i * i, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  
  // Calculate correlation coefficient for confidence
  const meanX = sumX / n;
  const meanY = sumY / n;
  
  const numerator = recentScores.reduce((sum, entry, i) => 
    sum + (i - meanX) * (entry.score - meanY), 0);
  const denomX = Math.sqrt(recentScores.reduce((sum, _, i) => 
    sum + Math.pow(i - meanX, 2), 0));
  const denomY = Math.sqrt(recentScores.reduce((sum, entry) => 
    sum + Math.pow(entry.score - meanY, 2), 0));
  
  const correlation = denomX * denomY > 0 ? numerator / (denomX * denomY) : 0;
  const confidence = Math.abs(correlation);

  // Determine trend
  let trend: 'improving' | 'declining' | 'stable';
  if (Math.abs(slope) < 0.1) {
    trend = 'stable';
  } else if (slope > 0) {
    trend = 'improving';
  } else {
    trend = 'declining';
  }

  return { trend, slope, confidence };
}

/**
 * Calculate intervention effectiveness score
 * @param preInterventionMood - Mood score before intervention
 * @param postInterventionMood - Mood score after intervention
 * @param interventionType - Type of intervention used
 * @returns Effectiveness score (0-1 scale)
 */
export function calculateInterventionEffectiveness(
  preInterventionMood: number,
  postInterventionMood: number,
  interventionType: string
): number {
  const moodChange = postInterventionMood - preInterventionMood;
  
  // Different expectations based on intervention type
  const expectedImprovements: Record<string, number> = {
    'breathing_exercise': 0.5,
    'grounding_technique': 0.7,
    'positive_affirmation': 0.3,
    'vr_calming_scene': 0.8,
    'mindful_moment': 0.4,
    'default': 0.5
  };

  const expectedImprovement = expectedImprovements[interventionType] || expectedImprovements.default;
  
  // Normalize effectiveness (0-1 scale)
  const effectiveness = Math.max(0, Math.min(1, moodChange / expectedImprovement));
  
  return effectiveness;
}

/**
 * Generate personalized insights from mood and behavior data
 * @param moodData - Recent mood entries
 * @param behaviorData - Recent behavior metrics
 * @returns Array of insight messages
 */
export function generateInsights(
  moodData: Array<{ score: number; timestamp: Date; tags: string[] }>,
  behaviorData: BehaviorMetrics
): string[] {
  const insights: string[] = [];
  
  if (moodData.length === 0) {
    return ['Start tracking your mood to see personalized insights here.'];
  }

  // Mood pattern insights
  const recentMoods = moodData.slice(-7).map(d => d.score);
  const avgMood = recentMoods.reduce((sum, score) => sum + score, 0) / recentMoods.length;
  
  if (avgMood >= 4) {
    insights.push('Your mood has been consistently positive this week. Keep up the great work!');
  } else if (avgMood <= 2) {
    insights.push('Your mood has been lower recently. Consider trying some of the suggested interventions.');
  }

  // Tag-based insights
  const tagCounts: Record<string, number> = {};
  moodData.forEach(entry => {
    entry.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const mostCommonTag = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (mostCommonTag && mostCommonTag[1] > 2) {
    insights.push(`You've been tracking "${mostCommonTag[0]}" frequently. Consider how this area affects your wellbeing.`);
  }

  // Behavior insights
  if (behaviorData.anomalyScore > 0.7) {
    insights.push('Your app usage patterns have changed recently. This might reflect changes in your routine or mood.');
  }

  if (behaviorData.sessionCount > 10) {
    insights.push('You\'ve been actively engaging with the app. This consistent self-care is beneficial for your mental health.');
  }

  return insights.length > 0 ? insights : ['Keep tracking your mood to discover personalized insights.'];
}
