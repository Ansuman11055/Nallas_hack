import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [userStats, setUserStats] = useState({
    totalSessions: 0,
    moodScore: 0,
    streakDays: 0,
    completedActivities: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [moodHistory, setMoodHistory] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Simulate fetching user stats
    const fetchUserStats = () => {
      setUserStats({
        totalSessions: 24,
        moodScore: 7.2,
        streakDays: 5,
        completedActivities: 18
      });
    };

    // Simulate fetching recent activities
    const fetchRecentActivities = () => {
      const activities = [
        { id: 1, activity: 'Meditation Session', time: '2 hours ago', type: 'meditation' },
        { id: 2, activity: 'Mood Check-in', time: '4 hours ago', type: 'mood' },
        { id: 3, activity: 'Breathing Exercise', time: '1 day ago', type: 'breathing' },
        { id: 4, activity: 'Gratitude Journal', time: '1 day ago', type: 'journal' },
        { id: 5, activity: 'Sleep Tracking', time: '2 days ago', type: 'sleep' }
      ];
      setRecentActivities(activities);
    };

    // Simulate mood history data
    const fetchMoodHistory = () => {
      const history = [
        { day: 'Mon', mood: 6 },
        { day: 'Tue', mood: 7 },
        { day: 'Wed', mood: 8 },
        { day: 'Thu', mood: 6 },
        { day: 'Fri', mood: 9 },
        { day: 'Sat', mood: 7 },
        { day: 'Sun', mood: 8 }
      ];
      setMoodHistory(history);
    };

    fetchUserStats();
    fetchRecentActivities();
    fetchMoodHistory();

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getMoodColor = (mood) => {
    if (mood >= 8) return '#4CAF50';
    if (mood >= 6) return '#FF9800';
    return '#F44336';
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="stat-content">
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="greeting">
          <h1>{getGreeting()}, User!</h1>
          <p>Let's check in on your mental wellness journey</p>
        </div>
        <div className="current-time">
          {currentTime.toLocaleDateString()} - {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </header>

      <div className="dashboard-content">
        <div className="stats-grid">
          <StatCard
            title="Total Sessions"
            value={userStats.totalSessions}
            icon="📊"
            color="#3498db"
          />
          <StatCard
            title="Current Mood"
            value={`${userStats.moodScore}/10`}
            icon="😊"
            color="#2ecc71"
          />
          <StatCard
            title="Streak Days"
            value={userStats.streakDays}
            icon="🔥"
            color="#e74c3c"
          />
          <StatCard
            title="Activities Completed"
            value={userStats.completedActivities}
            icon="✅"
            color="#f39c12"
          />
        </div>

        <div className="dashboard-main">
          <div className="left-section">
            <div className="mood-chart">
              <h2>Weekly Mood Tracker</h2>
              <div className="mood-bars">
                {moodHistory.map((day, index) => (
                  <div key={index} className="mood-day">
                    <div 
                      className="mood-bar"
                      style={{ 
                        height: `${day.mood * 10}%`,
                        backgroundColor: getMoodColor(day.mood)
                      }}
                    />
                    <span>{day.day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="wellness-tools">
              <h2>Wellness Tools</h2>
              <div className="tools-grid">
                <button className="tool-btn meditation">🧘‍♀️ Guided Meditation</button>
                <button className="tool-btn breathing">💨 Breathing Exercises</button>
                <button className="tool-btn music">🎵 Relaxing Music</button>
                <button className="tool-btn journal">📝 Mood Journal</button>
                <button className="tool-btn sleep">😴 Sleep Stories</button>
                <button className="tool-btn mindfulness">🌿 Mindfulness</button>
              </div>
            </div>
          </div>

          <div className="right-section">
            <div className="recent-activity">
              <h2>Recent Activity</h2>
              <div className="activity-list">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className={`activity-icon ${activity.type}`}>
                      {activity.type === 'meditation' && '🧘‍♀️'}
                      {activity.type === 'mood' && '😊'}
                      {activity.type === 'breathing' && '💨'}
                      {activity.type === 'journal' && '📝'}
                      {activity.type === 'sleep' && '😴'}
                    </div>
                    <div className="activity-details">
                      <p className="activity-name">{activity.activity}</p>
                      <p className="activity-time">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="action-buttons">
                <button className="action-btn primary">📝 Log Your Mood</button>
                <button className="action-btn secondary">🎯 Set Daily Goal</button>
                <button className="action-btn secondary">📈 View Progress</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
