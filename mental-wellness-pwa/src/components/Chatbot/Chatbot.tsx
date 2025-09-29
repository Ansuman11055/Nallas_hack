import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, ChatPattern } from '../../types';
import FallbackEngine from './FallbackEngine';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fallbackEngine = new FallbackEngine();

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text: "Hi there! I'm here to support you on your mental wellness journey. How are you feeling today?",
      sender: 'bot',
      timestamp: new Date(),
      intent: 'greeting'
    };
    setMessages([welcomeMessage]);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const detectCrisisKeywords = (text: string): boolean => {
    const crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'no point living',
      'want to die', 'better off dead', 'can\'t go on', 'hurt myself',
      'self harm', 'overdose', 'jump off', 'hang myself'
    ];
    
    const lowerText = text.toLowerCase();
    return crisisKeywords.some(keyword => lowerText.includes(keyword));
  };

  const getCrisisResponse = (): ChatMessage => {
    return {
      id: crypto.randomUUID(),
      text: `I'm concerned about what you've shared. Your safety and wellbeing are important. Please reach out to a crisis helpline immediately:

🇺🇸 National Suicide Prevention Lifeline: 988
🇮🇳 AASRA: +91-22-27546669
🌍 International: befrienders.org

You don't have to go through this alone. Professional help is available 24/7.`,
      sender: 'bot',
      timestamp: new Date(),
      intent: 'crisis_support'
    };
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Check for crisis keywords first
    if (detectCrisisKeywords(inputText)) {
      setTimeout(() => {
        const crisisResponse = getCrisisResponse();
        setMessages(prev => [...prev, crisisResponse]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    // Simulate typing delay
    setTimeout(async () => {
      let botResponse: ChatMessage;

      if (isOnline) {
        // Try to use online AI service (placeholder for now)
        botResponse = await getOnlineResponse(inputText);
      } else {
        // Use fallback engine
        botResponse = fallbackEngine.generateResponse(inputText);
      }

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getOnlineResponse = async (text: string): Promise<ChatMessage> => {
    // Placeholder for online AI service integration
    // In a real implementation, this would call an API like OpenAI, Rasa, etc.
    
    // For now, fall back to the local engine
    return fallbackEngine.generateResponse(text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="chatbot-container">
      <div className="container container-sm">
        <div className="chatbot-header">
          <h1>💬 Mental Wellness Support</h1>
          <div className="connection-status">
            <span className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
              {isOnline ? '🟢' : '🔴'}
            </span>
            <span className="status-text">
              {isOnline ? 'Online Support' : 'Offline Support'}
            </span>
          </div>
        </div>

        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message ${message.sender}`}
              >
                <div className="message-avatar">
                  {message.sender === 'bot' ? '🤖' : '👤'}
                </div>
                <div className="message-bubble">
                  <div className="message-content">
                    {message.text}
                  </div>
                  <div className="message-time">
                    {formatMessageTime(message.timestamp)}
                  </div>
                  {message.suggestedIntervention && (
                    <div className="suggested-intervention">
                      <p>💡 Suggested intervention:</p>
                      <a 
                        href={`/interventions?type=${message.suggestedIntervention}`}
                        className="btn btn-primary btn-small"
                      >
                        Try {message.suggestedIntervention.replace('_', ' ')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="chat-message bot">
                <div className="message-avatar">🤖</div>
                <div className="message-bubble">
                  <div className="typing-indicator">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span className="typing-text">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <div className="input-wrapper">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share what's on your mind..."
                className="chat-input"
                rows={1}
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                className="chat-send-btn"
                disabled={!inputText.trim() || isTyping}
                aria-label="Send message"
              >
                📤
              </button>
            </div>
          </div>
        </div>

        <div className="chat-suggestions">
          <p>Try asking about:</p>
          <div className="suggestion-chips">
            <button 
              className="suggestion-chip"
              onClick={() => setInputText("I'm feeling anxious")}
              disabled={isTyping}
            >
              Anxiety help
            </button>
            <button 
              className="suggestion-chip"
              onClick={() => setInputText("I can't sleep")}
              disabled={isTyping}
            >
              Sleep issues
            </button>
            <button 
              className="suggestion-chip"
              onClick={() => setInputText("I'm feeling stressed")}
              disabled={isTyping}
            >
              Stress management
            </button>
            <button 
              className="suggestion-chip"
              onClick={() => setInputText("I need motivation")}
              disabled={isTyping}
            >
              Motivation boost
            </button>
          </div>
        </div>

        <div className="chat-disclaimer">
          <p>
            ⚠️ <strong>Important:</strong> This chatbot provides general wellness support and is not a replacement for professional mental health care. 
            If you're experiencing a mental health crisis, please contact a crisis helpline or emergency services immediately.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
