// src/pages/AssistantPage.js
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, MessageCircle, Dumbbell, Heart, Target } from 'lucide-react';
import LoadingPage from '../components/LoadingPage';

const AssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Fitness assistant! Ask Flex.Ai anything about fitness and Exercise",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [messages]);

  const simulateFitnessAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Fitness-specific responses
    if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
      return "Great question about workouts! For beginners, I recommend starting with compound movements like squats, push-ups, and planks 3-4 times per week. For intermediate/advanced, try progressive overload with weights. What's your current fitness level and goals?";
    }
    if (lowerMessage.includes('diet') || lowerMessage.includes('nutrition')) {
      return "Nutrition is 70% of your fitness journey! Focus on: lean proteins (chicken, fish, beans), complex carbs (oats, brown rice), healthy fats (avocado, nuts), and plenty of vegetables. Are you looking to lose weight, gain muscle, or maintain?";
    }
    if (lowerMessage.includes('muscle') || lowerMessage.includes('strength')) {
      return "For muscle building: Focus on progressive overload, compound exercises (deadlifts, squats, bench press), 3-4 sets of 8-12 reps, and ensure adequate protein intake (0.8-1g per lb bodyweight). Don't forget rest days for recovery!";
    }
    if (lowerMessage.includes('cardio') || lowerMessage.includes('running')) {
      return "Cardio is excellent for heart health and fat loss! Mix steady-state cardio (30-45 min moderate intensity) with HIIT (high-intensity intervals). Aim for 150-300 minutes moderate cardio per week. What's your cardio preference?";
    }
    if (lowerMessage.includes('weight loss') || lowerMessage.includes('lose weight')) {
      return "Weight loss = caloric deficit! Combine strength training (preserves muscle), cardio (burns calories), and proper nutrition. Aim for 1-2 lbs per week. Track your food, stay hydrated, and be consistent. Need a specific plan?";
    }
    if (lowerMessage.includes('beginner') || lowerMessage.includes('start')) {
      return "Welcome to your fitness journey! Start with: bodyweight exercises (push-ups, squats, planks), 20-30 min walks daily, and simple nutrition changes. Consistency beats perfection. What's your main goal - strength, weight loss, or general fitness?";
    }
    if (lowerMessage.includes('motivation') || lowerMessage.includes('motivated')) {
      return "You've got this! 🔥 Remember: every workout counts, progress isn't always linear, and small consistent actions lead to big results. Set small daily goals and celebrate victories. What's your biggest fitness challenge right now?";
    }
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Ready to crush your goals today? I'm here to help with workouts, motivation, and any fitness questions , What would you like to tackle first?";
    }
    if (lowerMessage.includes('thank')) {
      return "You're absolutely welcome! Keep up the amazing work on your fitness journey. Remember, consistency is your superpower! 🌟 Feel free to ask me anything else!";
    }
    
    
    // General fitness responses
    const fitnessResponses = [
      "That's an excellent fitness question! The key is finding what works for your body and lifestyle. Consistency and proper form always win over intensity. What specific area interests you most?",
      "Love your enthusiasm for fitness! 🎯 Every expert was once a beginner. Focus on mastering the basics first - proper form, consistent routine, and adequate recovery. Need help with any specific exercise?",
      "Great point! Fitness is a marathon, not a sprint. Progressive overload, adequate nutrition, and quality sleep are your three pillars of success. What's your current biggest challenge?",
      "Fantastic question! Remember that fitness is highly individual - what works for others might need tweaking for you. Listen to your body and adjust accordingly. Want to dive deeper into any specific topic?",
      "You're asking the right questions! 💪 The best workout is the one you'll actually do consistently. Whether it's lifting, running, yoga, or sports - find your passion and build from there!",
      "Excellent inquiry! Fitness success comes from the compound effect of small daily choices. Focus on progress, not perfection. What aspect of fitness would you like to explore today?"
    ];
    
    return fitnessResponses[Math.floor(Math.random() * fitnessResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: simulateFitnessAIResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Welcome to your personal fitness assistant! 💪 I'm here to help you with workout routines, nutrition advice, exercise techniques, and answer any fitness-related questions. What would you like to know today?",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickQuestions = [
    { icon: Dumbbell, text: "Show me a beginner workout", question: "Can you give me a beginner-friendly workout routine?" },
    { icon: Heart, text: "Cardio vs Strength?", question: "What's better for weight loss - cardio or strength training?" },
    { icon: Target, text: "Nutrition tips", question: "What are the best nutrition tips for muscle building?" }
  ];

  if (loading) return <LoadingPage />;

  return (
    <div style={{ minHeight: '100vh', background: '#f4fafd' }}>
      <div style={{ maxWidth: '48rem', margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ background: '#1DA1F2', color: 'white', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '1.5rem 1.5rem 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '3rem', height: '3rem', background: '#fff', color: '#1DA1F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle style={{ width: '2rem', height: '2rem' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: 0 }}>Flex.AI</h1>
              <p style={{ color: 'white', margin: 0 }}>Your personal workout answers are here</p>
            </div>
          </div>
          <button
            onClick={clearChat}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', color: 'white', background: 'rgba(29,161,242,0.2)', border: 'none', borderRadius: '0.75rem', cursor: 'pointer' }}
            title="Clear chat"
          >
            <Trash2 style={{ width: '1.25rem', height: '1.25rem' }} />
            <span style={{ display: 'none' }}>Clear Chat</span>
          </button>
        </div>
        {/* Quick Questions */}
        <div style={{ background: '#fff', borderBottom: '1px solid #1DA1F2', padding: '1rem' }}>
          <p style={{ color: '#1DA1F2', marginBottom: '0.75rem', fontSize: '1rem' }}>Quick starter:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {quickQuestions.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setInputMessage(item.question);
                  handleSendMessage();
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#1DA1F2', color: 'white', border: 'none', borderRadius: '9999px', fontSize: '1rem', cursor: 'pointer' }}
              >
                <item.icon style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                <span>{item.text}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Messages Container */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: '#f4fafd' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexDirection: message.sender === 'user' ? 'row-reverse' : 'row' }}
            >
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: '#1DA1F2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {message.sender === 'user' ? (
                  <User style={{ width: '1.5rem', height: '1.5rem' }} />
                ) : (
                  <Bot style={{ width: '1.5rem', height: '1.5rem' }} />
                )}
              </div>
              <div style={{ maxWidth: '32rem', display: 'flex', flexDirection: 'column', alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ padding: '1rem 1.5rem', borderRadius: '1.5rem', background: '#1DA1F2', color: 'white', fontSize: '1rem', marginBottom: 0 }}>
                  <p style={{ margin: 0 }}>{message.text}</p>
                </div>
                <p style={{ color: '#1DA1F2', fontSize: '0.85rem', margin: '0.5rem 0 0 0', padding: '0 0.5rem' }}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          {/* Typing Indicator */}
          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: '#1DA1F2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot style={{ width: '1.5rem', height: '1.5rem' }} />
              </div>
              <div style={{ background: '#fff', border: '1px solid #1DA1F2', borderRadius: '1.5rem', padding: '1rem 1.5rem', boxShadow: '0 2px 8px rgba(29,161,242,0.08)' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ width: '0.75rem', height: '0.75rem', background: '#1DA1F2', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out' }}></div>
                  <div style={{ width: '0.75rem', height: '0.75rem', background: '#1DA1F2', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out', animationDelay: '0.1s' }}></div>
                  <div style={{ width: '0.75rem', height: '0.75rem', background: '#1DA1F2', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out', animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input Area */}
        <div style={{ background: '#fff', borderTop: '1px solid #1DA1F2', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Flex.Ai"
                style={{ width: '100%', padding: '1rem 1.5rem', border: '1px solid #1DA1F2', borderRadius: '1.5rem', fontSize: '1rem', background: '#fff', color: '#1DA1F2', outline: 'none', resize: 'none', minHeight: '56px', maxHeight: '128px' }}
                rows={1}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              style={{ padding: '1rem', background: '#1DA1F2', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: '1.25rem', opacity: !inputMessage.trim() || isTyping ? 0.5 : 1 }}
            >
              <Send style={{ width: '1.5rem', height: '1.5rem' }} />
            </button>
          </div>
          <p style={{ color: '#1DA1F2', fontSize: '0.9rem', marginTop: '1rem', textAlign: 'center' }}>
            
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssistantPage;