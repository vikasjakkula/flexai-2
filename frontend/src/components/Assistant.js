import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, MessageCircle, Trash2 } from 'lucide-react';
import './Assistant.css';

const Assistant = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isApiAvailable, setIsApiAvailable] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  // Backend API base URL
  const API_BASE_URL = 'http://localhost:5000';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat session
  const startNewChatSession = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to start chat session');
      }

      const data = await response.json();
      setSessionId(data.sessionId);
      setMessages([{
        ...data.message,
        timestamp: new Date(data.message.timestamp)
      }]);
      setIsApiAvailable(true);
      
    } catch (error) {
      console.error('Error starting chat session:', error);
      setIsApiAvailable(false);
      // Set fallback welcome message
      setMessages([{
        id: 1,
        text: "Hi! I'm your AI fitness assistant FLEX.AI , help with basic fitness tips!",
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  }, [API_BASE_URL]);

  // Initialize chat session on component mount
  useEffect(() => {
    startNewChatSession();
  }, [startNewChatSession]);

  // Send message to backend
  const sendMessageToAPI = async (message) => {
    if (!sessionId) {
      throw new Error('No active chat session');
    }

    const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        message
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  };

  // Fallback responses if API fails
  const simulateFitnessAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
      return "Quick workout tip: Try 10 push-ups, 15 squats, 30-sec plank. Repeat 3x! 💪 (Offline mode)";
    }
    if (lowerMessage.includes('diet') || lowerMessage.includes('nutrition')) {
      return "Quick nutrition tip: Fill half your plate with veggies, quarter with protein, quarter with complex carbs! 🥗 (Offline mode)";
    }
    if (lowerMessage.includes('motivation')) {
      return "You're already winning by asking! 🏆 Every small step counts. Keep going, champion! (Offline mode)";
    }
    
    return "I'm in offline mode right now. Try asking about workouts, nutrition, or motivation! 🤖";
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
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      // Send message to backend API
      const data = await sendMessageToAPI(currentInput);
      
      const botResponse = {
        ...data.message,
        timestamp: new Date(data.message.timestamp)
      };

      setMessages(prev => [...prev, botResponse]);
      
      // Update API availability status
      if (data.isOffline) {
        setIsApiAvailable(false);
      } else {
        setIsApiAvailable(true);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setIsApiAvailable(false);
      
      // Use fallback response
      const fallbackText = simulateFitnessAIResponse(currentInput);
      const errorResponse = {
        id: Date.now() + 1,
        text: fallbackText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = async () => {
    try {
      // Clear chat on backend if session exists
      if (sessionId) {
        await fetch(`${API_BASE_URL}/api/chat/${sessionId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
      // Start new chat session
      startNewChatSession();
      
    } catch (error) {
      console.error('Error clearing chat:', error);
      // Fallback: just clear messages locally
      setMessages([{
        id: 1,
        text: "Hi! I'm your AI fitness assistant. Ask me anything about workouts, nutrition, or fitness! 💪",
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="assistant-modal-overlay" style={{ position: 'relative', background: 'transparent', backdropFilter: 'none' }}>
      {/* Tailwind CSS Test removed */}
      
      <div className="assistant-chat-container">
        {/* Header */}
        <div className="assistant-header">
          <div className="assistant-header-info">
            <div className="assistant-header-avatar">
              <Bot className="w-5 h-5" />
            </div>
            <div className="assistant-header-text">
              <h3>AI Fitness Assistant</h3>
              <p className={isApiAvailable ? "text-green-500 text-xs" : "text-red-500 text-xs"}>
                {isApiAvailable ? "🟢 Gemini AI Active" : "🔴 Offline Mode"}
              </p>
            </div>
          </div>
          <div className="assistant-header-actions">
            <button
              onClick={clearChat}
              className="assistant-header-btn"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="assistant-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-wrapper ${message.sender}`}
            >
              <div className={`message-avatar ${message.sender}`}>
                {message.sender === 'bot' ? (
                  <Bot className="w-3 h-3 text-white" />
                ) : (
                  <MessageCircle className="w-3 h-3 text-white" />
                )}
              </div>
              <div className="message-content">
                <div className={`message-bubble ${message.sender}`}>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
                </div>
                <p className="message-timestamp">
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="typing-indicator">
              <div className="message-avatar bot">
                <Bot className="w-3 h-3 text-white" />
              </div>
              <div className="typing-bubble">
                <div className="typing-dots">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="assistant-input-area">
          <div className="assistant-input-wrapper">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about fitness..."
              className="assistant-input"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="assistant-send-btn"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="assistant-help-text">
            {isApiAvailable ? "Powered by Google Gemini AI" : "Running in offline mode"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Assistant;