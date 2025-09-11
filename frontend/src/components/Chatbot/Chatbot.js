import React, { useState, useEffect, useRef } from 'react';

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your mental wellness companion. How are you feeling today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickResponses = [
    "I'm feeling anxious",
    "I had a good day",
    "I'm stressed about work",
    "I feel lonely",
    "I'm having trouble sleeping",
    "I want to practice gratitude"
  ];

  const getBotResponse = (message) => {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('anxious') || lowerMsg.includes('anxiety')) {
      return "I understand you're feeling anxious. That's completely normal. Let's try a quick breathing exercise: Take a deep breath in for 4 counts, hold for 4, then exhale for 6. Would you like me to guide you through more techniques?";
    }
    
    if (lowerMsg.includes('sad') || lowerMsg.includes('depressed') || lowerMsg.includes('down')) {
      return "I hear that you're feeling down. Your feelings are valid and it's okay to have difficult days. What's one small thing that usually brings you comfort? Sometimes starting small can help.";
    }
    
    if (lowerMsg.includes('stress') || lowerMsg.includes('overwhelmed')) {
      return "Stress can feel overwhelming. Let's break it down: What's the main thing causing you stress right now? Sometimes talking through it can help us find manageable steps.";
    }
    
    if (lowerMsg.includes('sleep') || lowerMsg.includes('insomnia')) {
      return "Sleep troubles can really affect how we feel. Have you tried creating a bedtime routine? I can suggest some relaxation techniques that might help you wind down.";
    }
    
    if (lowerMsg.includes('lonely') || lowerMsg.includes('alone')) {
      return "Feeling lonely is tough, and you're not alone in feeling this way. Even small connections can help. Have you been able to reach out to anyone recently, or would you like suggestions for ways to connect?";
    }
    
    if (lowerMsg.includes('good') || lowerMsg.includes('happy') || lowerMsg.includes('great')) {
      return "That's wonderful to hear! It's important to acknowledge and celebrate the good moments. What made today special for you?";
    }
    
    if (lowerMsg.includes('gratitude') || lowerMsg.includes('thankful')) {
      return "Gratitude practice is amazing for mental wellness! Can you share three things you're grateful for today? They can be big or small - every bit of gratitude counts.";
    }
    
    if (lowerMsg.includes('help') || lowerMsg.includes('support')) {
      return "I'm here to support you. You can talk to me about your feelings, try breathing exercises, or practice mindfulness. What kind of support would be most helpful right now?";
    }
    
    return "I'm here to listen and support you. Can you tell me more about what's on your mind? Sometimes just talking through our thoughts and feelings can be really helpful.";
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate thinking time
    setTimeout(() => {
      const botResponse = {
        text: getBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickResponse = (response) => {
    setInputMessage(response);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>💬 Mental Wellness Chat</h1>
        <p>A safe space to share your thoughts and feelings</p>
      </div>

      <div style={styles.chatContainer}>
        <div style={styles.messagesContainer}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                ...styles.messageWrapper,
                ...(msg.sender === 'user' ? styles.userMessageWrapper : styles.botMessageWrapper)
              }}
            >
              <div
                style={{
                  ...styles.message,
                  ...(msg.sender === 'user' ? styles.userMessage : styles.botMessage)
                }}
              >
                <p style={styles.messageText}>{msg.text}</p>
                <small style={styles.timestamp}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </small>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div style={{...styles.messageWrapper, ...styles.botMessageWrapper}}>
              <div style={{...styles.message, ...styles.botMessage}}>
                <p style={styles.typingIndicator}>
                  <span>🤖</span> Thinking<span style={styles.dots}>...</span>
                </p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div style={styles.quickResponses}>
          <p style={styles.quickResponsesTitle}>Quick responses:</p>
          <div style={styles.quickResponsesGrid}>
            {quickResponses.map((response, index) => (
              <button
                key={index}
                onClick={() => handleQuickResponse(response)}
                style={styles.quickResponseBtn}
              >
                {response}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.inputArea}>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share what's on your mind... (Press Enter to send)"
            style={styles.input}
            rows="3"
          />
          <button
            onClick={sendMessage}
            style={styles.sendButton}
            disabled={!inputMessage.trim() || isTyping}
          >
            Send 📨
          </button>
        </div>
      </div>

      <div style={styles.disclaimer}>
        <p>💡 <strong>Remember:</strong> This is a supportive chatbot, not a replacement for professional mental health care. If you're experiencing a crisis, please contact a mental health professional or crisis helpline.</p>
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
  chatContainer: {
    background: 'white',
    borderRadius: '15px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    marginBottom: '20px'
  },
  messagesContainer: {
    height: '400px',
    overflowY: 'auto',
    padding: '20px',
    background: '#f8f9fa'
  },
  messageWrapper: {
    marginBottom: '15px',
    display: 'flex'
  },
  userMessageWrapper: {
    justifyContent: 'flex-end'
  },
  botMessageWrapper: {
    justifyContent: 'flex-start'
  },
  message: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '18px',
    wordWrap: 'break-word'
  },
  userMessage: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderBottomRightRadius: '4px'
  },
  botMessage: {
    background: 'white',
    border: '1px solid #e0e0e0',
    color: '#333',
    borderBottomLeftRadius: '4px'
  },
  messageText: {
    margin: '0 0 5px 0',
    lineHeight: '1.4'
  },
  timestamp: {
    opacity: 0.7,
    fontSize: '0.8em'
  },
  typingIndicator: {
    margin: 0,
    fontStyle: 'italic',
    color: '#666'
  },
  dots: {
    animation: 'blink 1s infinite'
  },
  quickResponses: {
    padding: '20px',
    borderTop: '1px solid #e0e0e0',
    background: 'white'
  },
  quickResponsesTitle: {
    margin: '0 0 15px 0',
    color: '#666',
    fontSize: '0.9em'
  },
  quickResponsesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px'
  },
  quickResponseBtn: {
    padding: '8px 12px',
    background: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.85em',
    transition: 'all 0.2s',
    textAlign: 'left'
  },
  inputArea: {
    padding: '20px',
    background: 'white',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-end'
  },
  input: {
    flex: 1,
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '1em',
    resize: 'none',
    fontFamily: 'Arial, sans-serif'
  },
  sendButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1em',
    whiteSpace: 'nowrap'
  },
  disclaimer: {
    background: '#fff3cd',
    border: '1px solid #ffeaa7',
    borderRadius: '10px',
    padding: '15px',
    fontSize: '0.9em',
    color: '#856404'
  }
};

export default Chatbot;
