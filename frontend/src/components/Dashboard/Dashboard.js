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
  const [currentMood, setCurrentMood] = useState(5);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [dailyGoal, setDailyGoal] = useState('');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [userName, setUserName] = useState('User');
  const [showNameModal, setShowNameModal] = useState(false);

  useEffect(() => {
    // Load data from localStorage
    loadUserData();
    
    // Initialize with default data if none exists
    const initializeData = () => {
      setUserStats({
        totalSessions: parseInt(localStorage.getItem('totalSessions')) || 24,
        moodScore: parseFloat(localStorage.getItem('averageMood')) || 7.2,
        streakDays: parseInt(localStorage.getItem('streakDays')) || 5,
        completedActivities: parseInt(localStorage.getItem('completedActivities')) || 18
      });

      const savedActivities = JSON.parse(localStorage.getItem('recentActivities')) || [
        { id: 1, activity: 'Welcome to Mental Wellness!', time: 'Just now', type: 'mood' },
        { id: 2, activity: 'Dashboard Loaded', time: '1 minute ago', type: 'meditation' }
      ];
      setRecentActivities(savedActivities);

      const savedMoodHistory = JSON.parse(localStorage.getItem('moodHistory')) || [
        { day: 'Mon', mood: 6 },
        { day: 'Tue', mood: 7 },
        { day: 'Wed', mood: 8 },
        { day: 'Thu', mood: 6 },
        { day: 'Fri', mood: 9 },
        { day: 'Sat', mood: 7 },
        { day: 'Sun', mood: 8 }
      ];
      setMoodHistory(savedMoodHistory);
    };

    initializeData();

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const loadUserData = () => {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setUserName(savedName);
    }
    
    const savedGoal = localStorage.getItem('dailyGoal');
    if (savedGoal) {
      setDailyGoal(savedGoal);
    }
  };

  const saveToLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

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

  const logMood = () => {
    const newActivity = {
      id: Date.now(),
      activity: `Mood logged: ${currentMood}/10`,
      time: 'Just now',
      type: 'mood'
    };

    const updatedActivities = [newActivity, ...recentActivities.slice(0, 4)];
    setRecentActivities(updatedActivities);
    saveToLocalStorage('recentActivities', updatedActivities);

    // Update mood history for today
    const today = new Date().toLocaleDateString('en', { weekday: 'short' });
    const updatedMoodHistory = moodHistory.map(day => 
      day.day === today ? { ...day, mood: currentMood } : day
    );
    setMoodHistory(updatedMoodHistory);
    saveToLocalStorage('moodHistory', updatedMoodHistory);

    // Update average mood score
    const avgMood = updatedMoodHistory.reduce((sum, day) => sum + day.mood, 0) / updatedMoodHistory.length;
    setUserStats(prev => ({ ...prev, moodScore: avgMood.toFixed(1) }));
    localStorage.setItem('averageMood', avgMood.toFixed(1));

    setShowMoodModal(false);
    alert(`Mood logged: ${currentMood}/10`);
  };

  const setGoal = () => {
    if (dailyGoal.trim()) {
      localStorage.setItem('dailyGoal', dailyGoal);
      
      const newActivity = {
        id: Date.now(),
        activity: `Goal set: ${dailyGoal}`,
        time: 'Just now',
        type: 'journal'
      };

      const updatedActivities = [newActivity, ...recentActivities.slice(0, 4)];
      setRecentActivities(updatedActivities);
      saveToLocalStorage('recentActivities', updatedActivities);
      
      setShowGoalModal(false);
      alert(`Daily goal set: ${dailyGoal}`);
    }
  };

  const updateUserName = () => {
    if (userName.trim()) {
      localStorage.setItem('userName', userName);
      setShowNameModal(false);
    }
  };

  const startActivity = (activityType) => {
    const activities = {
      meditation: 'Started 5-minute meditation',
      breathing: 'Started breathing exercise',
      music: 'Playing relaxing music',
      journal: 'Opened gratitude journal',
      sleep: 'Started sleep story',
      mindfulness: 'Started mindfulness session'
    };

    const newActivity = {
      id: Date.now(),
      activity: activities[activityType],
      time: 'Just now',
      type: activityType
    };

    const updatedActivities = [newActivity, ...recentActivities.slice(0, 4)];
    setRecentActivities(updatedActivities);
    saveToLocalStorage('recentActivities', updatedActivities);

    // Update completed activities count
    const newCount = (parseInt(localStorage.getItem('completedActivities')) || 0) + 1;
    localStorage.setItem('completedActivities', newCount);
    setUserStats(prev => ({ ...prev, completedActivities: newCount }));

    // Simulate activity duration
    setTimeout(() => {
      alert(`${activities[activityType]} completed! Great job!`);
    }, 2000);
  };

  const viewProgress = () => {
    const stats = `
📊 Your Progress Summary:
• Total Sessions: ${userStats.totalSessions}
• Average Mood: ${userStats.moodScore}/10
• Current Streak: ${userStats.streakDays} days
• Activities Completed: ${userStats.completedActivities}
• Daily Goal: ${dailyGoal || 'Not set'}
    `;
    alert(stats);
  };

  const StatCard = ({ title, value, icon, color, onClick }) => (
    <div className="stat-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
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
          <h1 onClick={() => setShowNameModal(true)} style={{ cursor: 'pointer' }}>
            {getGreeting()}, {userName}! ✏️
          </h1>
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
            onClick={viewProgress}
          />
          <StatCard
            title="Average Mood"
            value={`${userStats.moodScore}/10`}
            icon="😊"
            color="#2ecc71"
            onClick={() => setShowMoodModal(true)}
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
                      title={`${day.day}: ${day.mood}/10`}
                    />
                    <span>{day.day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="wellness-tools">
              <h2>Wellness Tools</h2>
              <div className="tools-grid">
                <button className="tool-btn meditation" onClick={() => startActivity('meditation')}>
                  🧘‍♀️ Guided Meditation
                </button>
                <button className="tool-btn breathing" onClick={() => startActivity('breathing')}>
                  💨 Breathing Exercises
                </button>
                <button className="tool-btn music" onClick={() => startActivity('music')}>
                  🎵 Relaxing Music
                </button>
                <button className="tool-btn journal" onClick={() => startActivity('journal')}>
                  📝 Mood Journal
                </button>
                <button className="tool-btn sleep" onClick={() => startActivity('sleep')}>
                  😴 Sleep Stories
                </button>
                <button className="tool-btn mindfulness" onClick={() => startActivity('mindfulness')}>
                  🌿 Mindfulness
                </button>
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
                      {activity.type === 'mindfulness' && '🌿'}
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
                <button className="action-btn primary" onClick={() => setShowMoodModal(true)}>
                  📝 Log Your Mood
                </button>
                <button className="action-btn secondary" onClick={() => setShowGoalModal(true)}>
                  🎯 Set Daily Goal
                </button>
                <button className="action-btn secondary" onClick={viewProgress}>
                  📈 View Progress
                </button>
              </div>
              {dailyGoal && (
                <div className="current-goal">
                  <p><strong>Today's Goal:</strong> {dailyGoal}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mood Logging Modal */}
      {showMoodModal && (
        <div className="modal-overlay" onClick={() => setShowMoodModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>How are you feeling today?</h3>
            <div className="mood-slider">
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={currentMood} 
                onChange={(e) => setCurrentMood(parseInt(e.target.value))}
              />
              <p>Mood: {currentMood}/10</p>
            </div>
            <div className="modal-buttons">
              <button onClick={logMood} className="btn-primary">Log Mood</button>
              <button onClick={() => setShowMoodModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Setting Modal */}
      {showGoalModal && (
        <div className="modal-overlay" onClick={() => setShowGoalModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Set Your Daily Goal</h3>
            <input 
              type="text" 
              placeholder="Enter your goal for today..."
              value={dailyGoal}
              onChange={(e) => setDailyGoal(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={setGoal} className="btn-primary">Set Goal</button>
              <button onClick={() => setShowGoalModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Name Update Modal */}
      {showNameModal && (
        <div className="modal-overlay" onClick={() => setShowNameModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Update Your Name</h3>
            <input 
              type="text" 
              placeholder="Enter your name..."
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={updateUserName} className="btn-primary">Update Name</button>
              <button onClick={() => setShowNameModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
