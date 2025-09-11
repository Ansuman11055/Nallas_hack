import React, { useState, useEffect } from 'react';

function MoodTracker() {
  const [currentMood, setCurrentMood] = useState(5);
  const [activities, setActivities] = useState([]);
  const [notes, setNotes] = useState('');
  const [moodHistory, setMoodHistory] = useState([]);

  const activityOptions = [
    '🏃 Exercise', '📚 Reading', '🎵 Music', '👥 Social', 
    '💤 Sleep', '🍔 Eating', '💼 Work', '🎨 Creative',
    '🧘 Meditation', '🌳 Nature', '📺 Entertainment', '🛍️ Shopping'
  ];

  useEffect(() => {
    // Load mood history from localStorage
    const savedHistory = localStorage.getItem('moodHistory');
    if (savedHistory) {
      setMoodHistory(JSON.parse(savedHistory));
    }
  }, []);

  const getMoodEmoji = (mood) => {
    const moods = ['😢', '😕', '😐', '🙂', '😊', '😄', '🤗', '😆', '🥰', '🤩'];
    return moods[mood - 1] || '😐';
  };

  const getMoodLabel = (mood) => {
    const labels = [
      'Very Sad', 'Sad', 'Down', 'Okay', 'Good', 
      'Happy', 'Very Happy', 'Excited', 'Joyful', 'Euphoric'
    ];
    return labels[mood - 1] || 'Neutral';
  };

  const toggleActivity = (activity) => {
    if (activities.includes(activity)) {
      setActivities(activities.filter(a => a !== activity));
    } else {
      setActivities([...activities, activity]);
    }
  };

  const logMood = () => {
    const entry = {
      mood: currentMood,
      activities: activities,
      notes: notes,
      timestamp: new Date().toISOString(),
      date: new Date().toDateString()
    };

    const newHistory = [entry, ...moodHistory];
    setMoodHistory(newHistory);
    localStorage.setItem('moodHistory', JSON.stringify(newHistory));
    localStorage.setItem('todayMood', currentMood);

    // Reset form
    setActivities([]);
    setNotes('');
    
    alert('Mood logged successfully! 🎉');
  };

  const getAverageThisWeek = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const thisWeek = moodHistory.filter(entry => 
      new Date(entry.timestamp) > weekAgo
    );
    
    if (thisWeek.length === 0) return 0;
    
    const average = thisWeek.reduce((sum, entry) => sum + entry.mood, 0) / thisWeek.length;
    return average.toFixed(1);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>🎯 Mood Tracker</h1>
        <p>Track your daily mood and activities to identify patterns</p>
      </div>

      <div style={styles.trackerCard}>
        <h2>How are you feeling right now?</h2>
        
        <div style={styles.moodSelector}>
          <div style={styles.currentMoodDisplay}>
            <span style={styles.moodEmoji}>{getMoodEmoji(currentMood)}</span>
            <div>
              <div style={styles.moodScore}>{currentMood}/10</div>
              <div style={styles.moodLabel}>{getMoodLabel(currentMood)}</div>
            </div>
          </div>
          
          <input
            type="range"
            min="1"
            max="10"
            value={currentMood}
            onChange={(e) => setCurrentMood(parseInt(e.target.value))}
            style={styles.slider}
          />
          
          <div style={styles.sliderLabels}>
            <span>😢 Very Sad</span>
            <span>🤩 Euphoric</span>
          </div>
        </div>

        <div style={styles.activitiesSection}>
          <h3>What activities did you do today?</h3>
          <div style={styles.activityGrid}>
            {activityOptions.map(activity => (
              <button
                key={activity}
                onClick={() => toggleActivity(activity)}
                style={{
                  ...styles.activityBtn,
                  ...(activities.includes(activity) ? styles.selectedActivity : {})
                }}
              >
                {activity}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.notesSection}>
          <h3>Any notes about your mood?</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What influenced your mood today? Any thoughts or feelings you want to remember..."
            style={styles.textarea}
          />
        </div>

        <button onClick={logMood} style={styles.logButton}>
          📝 Log My Mood
        </button>
      </div>

      <div style={styles.statsSection}>
        <h2>📊 Your Mood Insights</h2>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3>This Week Average</h3>
            <div style={styles.statValue}>
              {getAverageThisWeek()}/10
            </div>
          </div>
          <div style={styles.statCard}>
            <h3>Total Entries</h3>
            <div style={styles.statValue}>
              {moodHistory.length}
            </div>
          </div>
          <div style={styles.statCard}>
            <h3>Streak</h3>
            <div style={styles.statValue}>
              7 days 🔥
            </div>
          </div>
        </div>
      </div>

      <div style={styles.historySection}>
        <h2>📅 Recent Entries</h2>
        {moodHistory.length === 0 ? (
          <p style={styles.noData}>No mood entries yet. Start tracking today! 🌟</p>
        ) : (
          <div style={styles.historyList}>
            {moodHistory.slice(0, 5).map((entry, index) => (
              <div key={index} style={styles.historyItem}>
                <div style={styles.historyMood}>
                  <span style={styles.historyEmoji}>{getMoodEmoji(entry.mood)}</span>
                  <span>{entry.mood}/10</span>
                </div>
                <div style={styles.historyDetails}>
                  <div style={styles.historyDate}>
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </div>
                  <div style={styles.historyActivities}>
                    {entry.activities.join(', ')}
                  </div>
                  {entry.notes && (
                    <div style={styles.historyNotes}>"{entry.notes}"</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  trackerCard: {
    background: 'white',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  },
  moodSelector: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  currentMoodDisplay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '20px'
  },
  moodEmoji: {
    fontSize: '4em'
  },
  moodScore: {
    fontSize: '2em',
    fontWeight: 'bold',
    color: '#333'
  },
  moodLabel: {
    fontSize: '1.2em',
    color: '#666'
  },
  slider: {
    width: '100%',
    height: '8px',
    background: 'linear-gradient(to right, #ff6b6b, #feca57, #48cae4, #51cf66)',
    borderRadius: '4px',
    outline: 'none',
    marginBottom: '10px'
  },
  sliderLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9em',
    color: '#666'
  },
  activitiesSection: {
    marginBottom: '30px'
  },
  activityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '10px',
    marginTop: '15px'
  },
  activityBtn: {
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '0.9em'
  },
  selectedActivity: {
    borderColor: '#4CAF50',
    background: '#e8f5e8'
  },
  notesSection: {
    marginBottom: '30px'
  },
  textarea: {
    width: '100%',
    height: '80px',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '1em',
    resize: 'vertical',
    fontFamily: 'Arial, sans-serif'
  },
  logButton: {
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1em',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  statsSection: {
    marginBottom: '30px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px'
  },
  statCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  statValue: {
    fontSize: '2em',
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: '10px'
  },
  historySection: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  noData: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: '40px'
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  historyItem: {
    display: 'flex',
    gap: '15px',
    padding: '15px',
    background: '#f9f9f9',
    borderRadius: '8px'
  },
  historyMood: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '60px'
  },
  historyEmoji: {
    fontSize: '2em'
  },
  historyDetails: {
    flex: 1
  },
  historyDate: {
    fontWeight: 'bold',
    marginBottom: '5px'
  },
  historyActivities: {
    color: '#666',
    fontSize: '0.9em',
    marginBottom: '5px'
  },
  historyNotes: {
    fontStyle: 'italic',
    color: '#888',
    fontSize: '0.9em'
  }
};

export default MoodTracker;
