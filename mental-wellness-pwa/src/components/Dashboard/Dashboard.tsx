import React, { useEffect, useState } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { generateInsights } from '../../utils/algorithms';
import BaselineChart from './BaselineChart';

const Dashboard: React.FC = () => {
  const { 
    moodEntries, 
    currentBaseline, 
    stats, 
    isLoading, 
    getMoodEntries,
    updateBaseline 
  } = useDatabase();
  
  const [insights, setInsights] = useState<string[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'quarter'>('week');

  useEffect(() => {
    // Load initial data
    getMoodEntries(50);
    updateBaseline();
  }, []);

  useEffect(() => {
    // Generate insights when mood data changes
    if (moodEntries.length > 0) {
      const moodData = moodEntries.map(entry => ({
        score: entry.intensity,
        timestamp: new Date(entry.timestamp),
        tags: entry.tags
      }));
      
      // Mock behavior data for now
      const behaviorData = {
        typingLatencyMean: 150,
        burstCount: 5,
        sessionCount: stats.totalMoodEntries,
        screenTime: 1800000, // 30 minutes in ms
        anomalyScore: 0.2
      };
      
      const generatedInsights = generateInsights(moodData, behaviorData);
      setInsights(generatedInsights);
    }
  }, [moodEntries, stats]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getMoodTrend = () => {
    if (moodEntries.length < 2) return null;
    
    const recent = moodEntries.slice(0, 7);
    const older = moodEntries.slice(7, 14);
    
    if (recent.length === 0 || older.length === 0) return null;
    
    const recentAvg = recent.reduce((sum, entry) => sum + entry.intensity, 0) / recent.length;
    const olderAvg = older.reduce((sum, entry) => sum + entry.intensity, 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    
    if (Math.abs(diff) < 0.2) return { trend: 'stable', change: diff };
    return { trend: diff > 0 ? 'improving' : 'declining', change: diff };
  };

  const getLastMoodEntry = () => {
    if (moodEntries.length === 0) return null;
    return moodEntries[0];
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const moodTrend = getMoodTrend();
  const lastMood = getLastMoodEntry();

  if (isLoading && moodEntries.length === 0) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        {/* Welcome Header */}
        <div className="dashboard-header">
          <h1>{getGreeting()}! 👋</h1>
          <p className="dashboard-subtitle">
            Here's how you're doing on your mental wellness journey
          </p>
        </div>

        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalMoodEntries}</div>
              <div className="stat-label">Mood Entries</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-value">{stats.streakDays}</div>
              <div className="stat-label">Day Streak</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-value">{stats.averageMood.toFixed(1)}</div>
              <div className="stat-label">Avg Mood</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🧘</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalInterventions}</div>
              <div className="stat-label">Interventions</div>
            </div>
          </div>
        </div>

        {/* Current Mood Status */}
        {lastMood && (
          <div className="current-mood-card card">
            <div className="card-header">
              <h3>Latest Mood Entry</h3>
              <span className="mood-timestamp">{formatTimeAgo(new Date(lastMood.timestamp))}</span>
            </div>
            <div className="current-mood-content">
              <div className="mood-display">
                <div className="mood-emoji-large">
                  {lastMood.intensity === 1 && '😢'}
                  {lastMood.intensity === 2 && '😞'}
                  {lastMood.intensity === 3 && '😐'}
                  {lastMood.intensity === 4 && '🙂'}
                  {lastMood.intensity === 5 && '😄'}
                </div>
                <div className="mood-info">
                  <div className="mood-label-large">{lastMood.moodLabel}</div>
                  <div className="mood-intensity">Intensity: {lastMood.intensity}/5</div>
                  {lastMood.tags.length > 0 && (
                    <div className="mood-tags">
                      {lastMood.tags.map((tag, index) => (
                        <span key={index} className="mood-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {lastMood.note && (
                <div className="mood-note">
                  <p>"{lastMood.note}"</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mood Trend */}
        {moodTrend && (
          <div className="trend-card card">
            <div className="card-header">
              <h3>Mood Trend</h3>
            </div>
            <div className="trend-content">
              <div className={`trend-indicator ${moodTrend.trend}`}>
                <div className="trend-icon">
                  {moodTrend.trend === 'improving' && '📈'}
                  {moodTrend.trend === 'declining' && '📉'}
                  {moodTrend.trend === 'stable' && '➡️'}
                </div>
                <div className="trend-text">
                  <div className="trend-status">
                    {moodTrend.trend === 'improving' && 'Improving'}
                    {moodTrend.trend === 'declining' && 'Needs Attention'}
                    {moodTrend.trend === 'stable' && 'Stable'}
                  </div>
                  <div className="trend-description">
                    {moodTrend.trend === 'improving' && 'Your mood has been trending upward recently. Keep up the great work!'}
                    {moodTrend.trend === 'declining' && 'Your mood has been lower recently. Consider trying some interventions.'}
                    {moodTrend.trend === 'stable' && 'Your mood has been consistent lately.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Baseline Chart */}
        <div className="chart-section">
          <div className="chart-header">
            <h3>Mood Timeline & Baseline</h3>
            <div className="chart-controls">
              <button
                className={`chart-control-btn ${selectedTimeRange === 'week' ? 'active' : ''}`}
                onClick={() => setSelectedTimeRange('week')}
              >
                Week
              </button>
              <button
                className={`chart-control-btn ${selectedTimeRange === 'month' ? 'active' : ''}`}
                onClick={() => setSelectedTimeRange('month')}
              >
                Month
              </button>
              <button
                className={`chart-control-btn ${selectedTimeRange === 'quarter' ? 'active' : ''}`}
                onClick={() => setSelectedTimeRange('quarter')}
              >
                3 Months
              </button>
            </div>
          </div>
          <BaselineChart 
            moodEntries={moodEntries}
            baseline={currentBaseline}
            timeRange={selectedTimeRange}
          />
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <div className="insights-card card">
            <div className="card-header">
              <h3>💡 Personalized Insights</h3>
            </div>
            <div className="insights-content">
              {insights.map((insight, index) => (
                <div key={index} className="insight-item">
                  <div className="insight-icon">💡</div>
                  <p>{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions-card card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="quick-actions-grid">
            <a href="/mood" className="quick-action">
              <div className="action-icon">😊</div>
              <div className="action-text">
                <div className="action-title">Log Mood</div>
                <div className="action-subtitle">How are you feeling?</div>
              </div>
            </a>
            
            <a href="/interventions" className="quick-action">
              <div className="action-icon">🧘</div>
              <div className="action-text">
                <div className="action-title">Interventions</div>
                <div className="action-subtitle">Find calm & balance</div>
              </div>
            </a>
            
            <a href="/vr" className="quick-action">
              <div className="action-icon">🥽</div>
              <div className="action-text">
                <div className="action-title">VR Experience</div>
                <div className="action-subtitle">Immersive relaxation</div>
              </div>
            </a>
            
            <a href="/chat" className="quick-action">
              <div className="action-icon">💬</div>
              <div className="action-text">
                <div className="action-title">Chat Support</div>
                <div className="action-subtitle">Get guidance</div>
              </div>
            </a>
          </div>
        </div>

        {/* Empty State */}
        {moodEntries.length === 0 && (
          <div className="empty-state card">
            <div className="empty-state-content">
              <div className="empty-state-icon">🌱</div>
              <h3>Start Your Wellness Journey</h3>
              <p>
                Begin by logging your first mood entry. Track your emotional patterns 
                and get personalized insights to support your mental wellness.
              </p>
              <a href="/mood" className="btn btn-primary btn-large">
                Log Your First Mood
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
