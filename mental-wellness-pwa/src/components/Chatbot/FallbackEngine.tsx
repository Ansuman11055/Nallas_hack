import { ChatMessage, ChatPattern } from '../../types';

class FallbackEngine {
  private patterns: ChatPattern[] = [
    {
      pattern: /\b(sad|depressed|down|low|upset|unhappy)\b/i,
      responses: [
        "I hear that you're feeling down. It's okay to have difficult emotions - they're a natural part of life.",
        "I'm sorry you're feeling this way. Your feelings are valid and it's important to acknowledge them.",
        "When we feel sad, it can help to practice self-compassion. Would you like to try a grounding technique?",
        "Sadness can feel overwhelming, but remember that emotions are temporary. Let's work through this together."
      ],
      intent: 'mood_support_sad',
      suggestedIntervention: 'grounding_technique'
    },
    {
      pattern: /\b(anxious|worried|nervous|stressed|panic|overwhelmed)\b/i,
      responses: [
        "It sounds like you might be feeling anxious. Anxiety is very common and there are effective ways to manage it.",
        "When anxiety strikes, focusing on your breathing can help. Let's try the 4-7-8 breathing technique.",
        "I understand you're feeling stressed. Remember that you've gotten through difficult times before.",
        "Anxiety can feel intense, but grounding techniques can help bring you back to the present moment."
      ],
      intent: 'anxiety_support',
      suggestedIntervention: 'breathing_exercise'
    },
    {
      pattern: /\b(happy|good|great|amazing|wonderful|excited|joy)\b/i,
      responses: [
        "That's wonderful to hear! It's important to celebrate and savor positive moments.",
        "I'm so glad you're feeling good! Positive emotions can help build resilience for challenging times.",
        "It's great that you're experiencing joy. Consider keeping a gratitude journal to remember these moments.",
        "Your happiness is contagious! Sharing positive emotions can strengthen relationships and wellbeing."
      ],
      intent: 'mood_support_positive',
      suggestedIntervention: 'positive_affirmation'
    },
    {
      pattern: /\b(angry|mad|furious|irritated|frustrated|rage)\b/i,
      responses: [
        "Anger is a normal emotion that signals something important to us. Let's explore what might be underneath it.",
        "When we feel angry, it can help to take some deep breaths before responding. Would you like to try that?",
        "Frustration can be really difficult to handle. Sometimes physical movement can help release that energy.",
        "It's okay to feel angry. The key is finding healthy ways to express and process these feelings."
      ],
      intent: 'anger_support',
      suggestedIntervention: 'mindful_moment'
    },
    {
      pattern: /\b(sleep|tired|exhausted|insomnia|can't sleep)\b/i,
      responses: [
        "Sleep issues can really impact our mental health. Good sleep hygiene can make a big difference.",
        "Having trouble sleeping is frustrating. Try creating a calming bedtime routine without screens.",
        "When we can't sleep, our minds often race. Progressive muscle relaxation might help you unwind.",
        "Sleep and mental health are closely connected. Consider limiting caffeine and creating a dark, cool environment."
      ],
      intent: 'sleep_support',
      suggestedIntervention: 'vr_calming_scene'
    },
    {
      pattern: /\b(help|support|don't know|confused|lost)\b/i,
      responses: [
        "I'm here to support you. Sometimes just talking about what we're experiencing can be helpful.",
        "It's okay to feel uncertain. Taking things one step at a time can make challenges more manageable.",
        "Asking for help shows strength, not weakness. What specific area would you like support with?",
        "When we feel lost, grounding ourselves in the present moment can provide clarity and calm."
      ],
      intent: 'general_support',
      suggestedIntervention: 'grounding_technique'
    },
    {
      pattern: /\b(work|job|career|boss|colleague|deadline|meeting)\b/i,
      responses: [
        "Work stress is very common. Setting boundaries and taking regular breaks can help manage workplace pressure.",
        "Career challenges can feel overwhelming. Remember that your worth isn't defined by your job performance.",
        "Workplace stress can spill over into other areas of life. Consider practicing mindfulness during your workday.",
        "It's important to separate work identity from personal identity. What brings you joy outside of work?"
      ],
      intent: 'work_stress',
      suggestedIntervention: 'breathing_exercise'
    },
    {
      pattern: /\b(family|relationship|friend|partner|conflict|argument)\b/i,
      responses: [
        "Relationship challenges are part of human connection. Communication and empathy can help resolve conflicts.",
        "Family dynamics can be complex. Remember that you can only control your own actions and responses.",
        "Healthy relationships require boundaries and mutual respect. It's okay to prioritize your wellbeing.",
        "When relationships feel difficult, practicing self-compassion can help you respond rather than react."
      ],
      intent: 'relationship_support',
      suggestedIntervention: 'mindful_moment'
    },
    {
      pattern: /\b(motivation|lazy|procrastination|goal|achievement)\b/i,
      responses: [
        "Motivation naturally fluctuates. Breaking large goals into smaller, manageable steps can help build momentum.",
        "Sometimes what we call 'laziness' is actually our mind and body needing rest. Be kind to yourself.",
        "Procrastination often stems from perfectionism or fear. What small step could you take right now?",
        "Achievement is important, but so is self-compassion. Celebrate small wins along the way."
      ],
      intent: 'motivation_support',
      suggestedIntervention: 'positive_affirmation'
    },
    {
      pattern: /\b(lonely|alone|isolated|disconnected|nobody)\b/i,
      responses: [
        "Loneliness is a difficult feeling that many people experience. You're not alone in feeling this way.",
        "Even when we feel isolated, there are people who care about us. Consider reaching out to someone today.",
        "Social connection is important for mental health. Small interactions, even with strangers, can help.",
        "Loneliness doesn't mean you're unlikeable. Sometimes it's about finding the right connections for you."
      ],
      intent: 'loneliness_support',
      suggestedIntervention: 'positive_affirmation'
    }
  ];

  private defaultResponses = [
    "I understand you're going through something difficult. Can you tell me more about how you're feeling?",
    "Thank you for sharing that with me. Your feelings and experiences are important.",
    "It sounds like you have a lot on your mind. Sometimes talking through things can help bring clarity.",
    "I'm here to listen and support you. What would be most helpful for you right now?",
    "Everyone's mental health journey is unique. What strategies have helped you in the past?"
  ];

  generateResponse(userInput: string): ChatMessage {
    const input = userInput.toLowerCase().trim();
    
    // Find matching pattern
    for (const pattern of this.patterns) {
      if (pattern.pattern.test(input)) {
        const randomResponse = pattern.responses[Math.floor(Math.random() * pattern.responses.length)];
        
        return {
          id: crypto.randomUUID(),
          text: randomResponse,
          sender: 'bot',
          timestamp: new Date(),
          intent: pattern.intent,
          suggestedIntervention: pattern.suggestedIntervention
        };
      }
    }

    // No pattern matched, use default response
    const randomDefault = this.defaultResponses[Math.floor(Math.random() * this.defaultResponses.length)];
    
    return {
      id: crypto.randomUUID(),
      text: randomDefault,
      sender: 'bot',
      timestamp: new Date(),
      intent: 'general_support'
    };
  }

  // Get contextual follow-up questions based on intent
  getFollowUpQuestions(intent: string): string[] {
    const followUps: Record<string, string[]> = {
      'mood_support_sad': [
        "What's been contributing to these feelings?",
        "Have you been taking care of your basic needs - sleep, food, movement?",
        "Is there someone you trust that you could talk to about this?"
      ],
      'anxiety_support': [
        "What situations tend to trigger your anxiety?",
        "Have you noticed any physical symptoms along with the anxiety?",
        "What coping strategies have you tried before?"
      ],
      'work_stress': [
        "What aspects of work are most stressful for you?",
        "Are you able to take breaks during your workday?",
        "How is work stress affecting other areas of your life?"
      ],
      'relationship_support': [
        "How long has this relationship challenge been going on?",
        "Have you been able to communicate your feelings to the other person?",
        "What would an ideal resolution look like for you?"
      ]
    };

    return followUps[intent] || [
      "Can you tell me more about that?",
      "How has this been affecting your daily life?",
      "What would feel most supportive right now?"
    ];
  }

  // Suggest appropriate interventions based on detected mood/intent
  suggestIntervention(intent: string): string | undefined {
    const interventionMap: Record<string, string> = {
      'mood_support_sad': 'grounding_technique',
      'anxiety_support': 'breathing_exercise',
      'anger_support': 'mindful_moment',
      'sleep_support': 'vr_calming_scene',
      'work_stress': 'breathing_exercise',
      'relationship_support': 'mindful_moment',
      'motivation_support': 'positive_affirmation',
      'loneliness_support': 'positive_affirmation'
    };

    return interventionMap[intent];
  }
}

export default FallbackEngine;
