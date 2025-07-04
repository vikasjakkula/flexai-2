const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Store chat sessions in memory (in production, use a database)
const chatSessions = new Map();

// Initialize Gemini model
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  systemInstruction: `You are a knowledgeable and fitness assistant. Provide helpful, encouraging responses about fitness , workouts, health , diet , sleep hours.
  Keep your responses conversational, friendly, focus on practical and safe advice, and be motivational and positive.
  and don't give any other information other than the fitness related information.

  Give detailed and very long answers explaining each and every thing in detail.

  answer in medium length to large length and in last request the user to ask me anything related to fitness if user tries to ask somthing else !
  or don't answer if user tries to ask somthing else ! just reply "I'm sorry, I can only answer questions about fitness and exercise. How can I help you with your GYM TRAINING STRUCTURE i.e, BICEPS (Elbow flexors) , TRICEPS (Elbow extensors)
  ,CHEST (Pectorals major/minor) , BACK (Lats, traps, rhomboids, erector spinae, teres major) , SHOULDERS (Deltoid front, middle, rear + traps) , 
  LEGS (Quads, hamstrings, glutes, calves)
Foundational muscles for full-body growth , ABS / CORE (Rectus abdominis, obliques, transverse abdominis) , 
  FULL-BODY / FUNCTIONAL MOVEMENTS , 
  MISCELLANEOUS (Cardio, Conditioning, Agility, & Mobility)
These exercises support muscle recovery, enhance endurance, burn fat, and improve athleticism.

 and also diet , sleep hours , disipline and hustle and health journey?"

  If the question isn't fitness-related,
  gently redirect to that topic while still being helpful and give a short answer and in last request the user to ask me anything related to fitness
  only and nothing else other that exercise and gym.`
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Gemini Fitness Assistant API is running!' });
});

// Start a new chat session
app.post('/api/chat/start', async (req, res) => {
  try {
    const sessionId = Date.now().toString();
    
    // Create a new chat session
    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });

    // Store the chat session
    chatSessions.set(sessionId, chat);

    // Send welcome message
    const welcomeMessage = "Hi! I'm your AI fitness assistant powered by Google Gemini. Ask me anything about workouts, nutrition, or fitness! 💪";

    res.json({
      sessionId,
      message: {
        id: Date.now(),
        text: welcomeMessage,
        sender: 'bot',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error starting chat session:', error);
    res.status(500).json({ 
      error: 'Failed to start chat session',
      details: error.message 
    });
  }
});

// Send message to chat
app.post('/api/chat/message', async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ 
        error: 'Session ID and message are required' 
      });
    }

    // Get the chat session
    const chat = chatSessions.get(sessionId);
    if (!chat) {
      return res.status(404).json({ 
        error: 'Chat session not found. Please start a new session.' 
      });
    }

    // Send message to Gemini
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const botReply = response.text();

    // Return the bot's response
    res.json({
      message: {
        id: Date.now(),
        text: botReply,
        sender: 'bot',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error sending message:', error);
    
    // Fallback response if API fails
    const fallbackResponses = {
      workout: "Quick workout tip: Try 10 push-ups, 15 squats, 30-sec plank. Repeat 3x! 💪",
      diet: "Quick nutrition tip: Fill half your plate with veggies, quarter with protein, quarter with complex carbs! 🥗",
      motivation: "You're already winning by asking! 🏆 Every small step counts. Keep going, champion!",
      default: "I'm having trouble connecting right now. Please try again! 🤖"
    };

    const lowerMessage = req.body.message?.toLowerCase() || '';
    let fallbackText = fallbackResponses.default;

    if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
      fallbackText = fallbackResponses.workout;
    } else if (lowerMessage.includes('diet') || lowerMessage.includes('nutrition')) {
      fallbackText = fallbackResponses.diet;
    } else if (lowerMessage.includes('motivation')) {
      fallbackText = fallbackResponses.motivation;
    }

    res.json({
      message: {
        id: Date.now(),
        text: fallbackText + " (Offline mode)",
        sender: 'bot',
        timestamp: new Date().toISOString()
      },
      isOffline: true
    });
  }
});

// Get chat history
app.get('/api/chat/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const chat = chatSessions.get(sessionId);
    
    if (!chat) {
      return res.status(404).json({ 
        error: 'Chat session not found' 
      });
    }

    // Get chat history
    const history = await chat.getHistory();
    
    res.json({
      history: history.map((item, index) => ({
        id: index,
        text: item.parts[0].text,
        sender: item.role === 'user' ? 'user' : 'bot',
        timestamp: new Date().toISOString()
      }))
    });

  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({ 
      error: 'Failed to get chat history',
      details: error.message 
    });
  }
});

// Clear chat session
app.delete('/api/chat/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (chatSessions.has(sessionId)) {
      chatSessions.delete(sessionId);
      res.json({ message: 'Chat session cleared successfully' });
    } else {
      res.status(404).json({ error: 'Chat session not found' });
    }
  } catch (error) {
    console.error('Error clearing chat session:', error);
    res.status(500).json({ 
      error: 'Failed to clear chat session',
      details: error.message 
    });
  }
});

// Cleanup old sessions (run every hour)
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  for (const [sessionId] of chatSessions) {
    const sessionAge = now - parseInt(sessionId);
    if (sessionAge > oneHour) {
      chatSessions.delete(sessionId);
      console.log(`Cleaned up old session: ${sessionId}`);
    }
  }
}, 60 * 60 * 1000);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Gemini Fitness Assistant API running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  Warning: GEMINI_API_KEY not found in environment variables');
  } else {
    console.log('✅ Gemini API key loaded successfully');
  }
});

module.exports = app;