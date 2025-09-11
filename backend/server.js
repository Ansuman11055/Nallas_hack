const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));

// In-memory storage (replace with database in production)
let moodData = [];
let chatHistory = [];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mood tracking endpoints
app.post('/api/mood', (req, res) => {
  try {
    const moodEntry = {
      id: Date.now().toString(),
      mood: req.body.mood,
      activities: req.body.activities || [],
      notes: req.body.notes || '',
      timestamp: new Date().toISOString()
    };
    
    moodData.push(moodEntry);
    res.json({ success: true, mood: moodEntry });
  } catch (error) {
    console.error('Mood logging error:', error);
    res.status(500).json({ error: 'Failed to save mood data' });
  }
});

app.get('/api/mood', (req, res) => {
  try {
    res.json({ moods: moodData.reverse() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve mood data' });
  }
});

// Chatbot endpoint (simple responses - replace with Rasa integration)
app.post('/api/chat', (req, res) => {
  try {
    const userMessage = req.body.message;
    const userId = req.body.user_id || 'anonymous';
    
    // Simple bot responses (enhance with Rasa later)
    const getBotResponse = (message) => {
      const lowerMsg = message.toLowerCase();
      
      if (lowerMsg.includes('anxious') || lowerMsg.includes('anxiety')) {
        return "I understand you're feeling anxious. Try taking slow, deep breaths. Would you like me to guide you through a breathing exercise?";
      }
      
      if (lowerMsg.includes('sad') || lowerMsg.includes('depressed')) {
        return "I hear that you're feeling down. Your feelings are valid. What's one small thing that usually brings you comfort?";
      }
      
      if (lowerMsg.includes('stress')) {
        return "Stress can be overwhelming. Let's break it down - what's the main thing causing you stress right now?";
      }
      
      if (lowerMsg.includes('good') || lowerMsg.includes('happy')) {
        return "That's wonderful to hear! It's important to celebrate the good moments. What made today special?";
      }
      
      return "I'm here to listen and support you. Can you tell me more about what's on your mind?";
    };
    
    const botResponse = {
      text: getBotResponse(userMessage),
      timestamp: new Date().toISOString()
    };
    
    // Store chat history
    chatHistory.push({
      userId,
      userMessage,
      botResponse: botResponse.text,
      timestamp: botResponse.timestamp
    });
    
    res.json(botResponse);
  } catch (error) {
    console.error('Chat error:', error);
    res.json({ 
      text: "I'm experiencing some technical difficulties, but I'm here to help.",
      timestamp: new Date().toISOString()
    });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Mental Wellness API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

