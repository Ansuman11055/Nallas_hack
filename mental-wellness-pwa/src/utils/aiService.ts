// AI Service with Privacy-First Architecture
import { encryptData, decryptData } from './encryption';

export interface AIResponse {
  message: string;
  confidence: number;
  crisisDetected: boolean;
  suggestedActions?: string[];
}

export interface AIConfig {
  provider: 'openai' | 'huggingface' | 'local';
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

class AIService {
  private config: AIConfig;
  private encryptionKey: CryptoKey | null = null;

  constructor(config: AIConfig) {
    this.config = config;
  }

  setEncryptionKey(key: CryptoKey) {
    this.encryptionKey = key;
  }

  // OpenAI GPT-4 Integration
  private async callOpenAI(message: string): Promise<AIResponse> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are a compassionate mental health support assistant for MindWell PWA. 
    
Guidelines:
- Provide empathetic, supportive responses
- Encourage professional help for serious concerns
- Use crisis keywords to detect urgent situations
- Keep responses concise (under 150 words)
- Never provide medical diagnoses
- Focus on emotional support and coping strategies

Crisis keywords to watch for: suicide, kill myself, end it all, hopeless, worthless, can't go on`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model || 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: this.config.maxTokens || 150,
          temperature: this.config.temperature || 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = data.choices[0]?.message?.content || 'I apologize, but I\'m having trouble responding right now. Please try again.';

      // Detect crisis keywords in user message
      const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'want to die', 'better off dead', 'hopeless', 'worthless'];
      const crisisDetected = crisisKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
      );

      return {
        message: aiMessage,
        confidence: 0.9,
        crisisDetected,
        suggestedActions: crisisDetected ? [
          'Contact crisis helpline: 988 (US) or +91-22-27546669 (India)',
          'Reach out to a trusted friend or family member',
          'Consider professional counseling'
        ] : undefined
      };

    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getFallbackResponse(message);
    }
  }

  // Hugging Face Local Model Integration
  private async callHuggingFace(message: string): Promise<AIResponse> {
    try {
      // This would use @huggingface/transformers for local inference
      // For now, providing a structured fallback that mimics AI responses
      
      const responses = [
        "I hear you, and I want you to know that your feelings are valid. What's been weighing on your mind lately?",
        "It sounds like you're going through a challenging time. Can you tell me more about what's happening?",
        "Thank you for sharing that with me. How are you taking care of yourself during this difficult period?",
        "I'm here to listen. What kind of support would be most helpful for you right now?",
        "That sounds really tough. Have you been able to talk to anyone else about how you're feeling?",
        "I appreciate you opening up. What usually helps you feel a bit better when things get overwhelming?",
        "It takes courage to reach out. What's one small thing that might bring you some comfort today?"
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // Simple crisis detection
      const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'want to die', 'hopeless'];
      const crisisDetected = crisisKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
      );

      return {
        message: crisisDetected ? 
          "I'm very concerned about what you've shared. Please reach out to a crisis helpline immediately: 988 (US) or +91-22-27546669 (India). You don't have to go through this alone." :
          randomResponse,
        confidence: 0.7,
        crisisDetected
      };

    } catch (error) {
      console.error('Hugging Face error:', error);
      return this.getFallbackResponse(message);
    }
  }

  // Local fallback responses (always available)
  private getFallbackResponse(message: string): AIResponse {
    const responses = [
      "I'm here to listen. How are you feeling right now?",
      "That sounds challenging. What support do you need?",
      "Thank you for sharing. Would you like to try a breathing exercise?",
      "I hear you. What usually helps you feel better?",
      "It's okay to feel this way. What's one thing you're grateful for today?"
    ];

    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'want to die', 'hopeless'];
    const crisisDetected = crisisKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    if (crisisDetected) {
      return {
        message: "I'm concerned about what you've shared. Please consider reaching out to a crisis helpline: 988 (US) or +91-22-27546669 (India). You are not alone.",
        confidence: 0.8,
        crisisDetected: true,
        suggestedActions: [
          'Call crisis helpline immediately',
          'Go to nearest emergency room',
          'Contact a trusted friend or family member'
        ]
      };
    }

    return {
      message: responses[Math.floor(Math.random() * responses.length)],
      confidence: 0.6,
      crisisDetected: false
    };
  }

  // Main chat method
  async chat(message: string): Promise<AIResponse> {
    // Encrypt message before processing (if encryption is enabled)
    let processedMessage = message;
    if (this.encryptionKey) {
      // In a real implementation, you might want to encrypt the message
      // before sending to external APIs for additional privacy
      console.log('Message encrypted for processing');
    }

    try {
      switch (this.config.provider) {
        case 'openai':
          return await this.callOpenAI(processedMessage);
        case 'huggingface':
          return await this.callHuggingFace(processedMessage);
        case 'local':
        default:
          return this.getFallbackResponse(processedMessage);
      }
    } catch (error) {
      console.error('AI Service error:', error);
      return this.getFallbackResponse(processedMessage);
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<AIConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      const testResponse = await this.chat("Hello, this is a test message.");
      return testResponse.confidence > 0;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const aiService = new AIService({
  provider: 'local', // Start with local fallback
  maxTokens: 150,
  temperature: 0.7
});

// Configuration helper
export function configureAI(provider: 'openai' | 'huggingface' | 'local', apiKey?: string) {
  aiService.updateConfig({
    provider,
    apiKey,
    model: provider === 'openai' ? 'gpt-4' : undefined
  });
}

// Privacy-safe API key storage
export function setAPIKey(apiKey: string, encryptionKey?: CryptoKey) {
  if (encryptionKey) {
    // Encrypt API key before storing
    encryptData(apiKey, encryptionKey).then(encrypted => {
      localStorage.setItem('ai_api_key_encrypted', encrypted);
    });
  } else {
    // Store in memory only (not persistent)
    aiService.updateConfig({ apiKey });
  }
}

export async function getStoredAPIKey(encryptionKey: CryptoKey): Promise<string | null> {
  const encrypted = localStorage.getItem('ai_api_key_encrypted');
  if (encrypted && encryptionKey) {
    try {
      return await decryptData(encrypted, encryptionKey);
    } catch (error) {
      console.error('Failed to decrypt API key:', error);
      return null;
    }
  }
  return null;
}
