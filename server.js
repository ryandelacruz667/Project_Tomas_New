/**
 * Secure Backend Server for Gemini AI Chatbot
 * This server handles API calls to Google Gemini API securely
 * so that the API key is never exposed to the frontend
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || '*', // In production, specify your domain
    credentials: true
}));
app.use(express.json());

// Validate API key exists
if (!process.env.GEMINI_API_KEY) {
    console.error('ERROR: GEMINI_API_KEY is not set in environment variables!');
    console.error('Please create a .env file with your Gemini API key.');
    process.exit(1);
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Store conversation history per session (in production, use a proper session store)
const conversationHistory = {};

/**
 * POST /api/chat
 * Handles chat messages and returns AI responses
 */
app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        // Validate input
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                error: 'Message is required and must be a non-empty string'
            });
        }

        // Initialize session if it doesn't exist
        if (!conversationHistory[sessionId]) {
            conversationHistory[sessionId] = [];
        }

        // Add user message to history
        conversationHistory[sessionId].push({
            role: 'user',
            parts: [{ text: message }]
        });

        // Get the model
        const model = genAI.getGenerativeModel({ 
            model: process.env.GEMINI_MODEL || 'gemini-pro'
        });

        // Create system prompt for context about the application
        const systemPrompt = `You are a helpful assistant for PROJECT TOMaS (Tactical Overlay for Mapping and Safety), a flood mapping and analysis system. 
        You help users understand flood data, minimum needs, household information, and provide guidance on using the application.
        Be concise, helpful, and focus on flood-related queries and application usage.`;

        // Prepare conversation history with system prompt
        const chatHistory = [
            {
                role: 'user',
                parts: [{ text: systemPrompt }]
            },
            {
                role: 'model',
                parts: [{ text: 'I understand. I will help users with PROJECT TOMaS flood mapping and analysis questions.' }]
            },
            ...conversationHistory[sessionId]
        ];

        // Start chat with history
        const chat = model.startChat({
            history: chatHistory.slice(0, -1) // Exclude the last user message for history
        });

        // Send the current message
        const result = await chat.sendMessage(conversationHistory[sessionId][conversationHistory[sessionId].length - 1].parts[0].text);
        const response = await result.response;
        const responseText = response.text();

        // Add AI response to history
        conversationHistory[sessionId].push({
            role: 'model',
            parts: [{ text: responseText }]
        });

        // Limit history size to prevent memory issues (keep last 20 messages)
        if (conversationHistory[sessionId].length > 20) {
            conversationHistory[sessionId] = conversationHistory[sessionId].slice(-20);
        }

        // Return response
        res.json({
            success: true,
            message: responseText,
            sessionId: sessionId
        });

    } catch (error) {
        console.error('Error processing chat message:', error);
        
        // Handle specific Gemini API errors
        if (error.message && error.message.includes('API_KEY')) {
            return res.status(500).json({
                error: 'API key configuration error. Please check server configuration.'
            });
        }

        res.status(500).json({
            error: 'An error occurred while processing your message. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * POST /api/chat/clear
 * Clears conversation history for a session
 */
app.post('/api/chat/clear', (req, res) => {
    try {
        const { sessionId } = req.body;

        if (sessionId && conversationHistory[sessionId]) {
            delete conversationHistory[sessionId];
        }

        res.json({
            success: true,
            message: 'Conversation history cleared'
        });
    } catch (error) {
        console.error('Error clearing chat history:', error);
        res.status(500).json({
            error: 'An error occurred while clearing chat history'
        });
    }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Gemini Chatbot API',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Gemini Chatbot Server is running on port ${PORT}`);
    console.log(`📡 API endpoint: http://localhost:${PORT}/api/chat`);
    console.log(`💡 Health check: http://localhost:${PORT}/api/health\n`);
    
    if (process.env.NODE_ENV !== 'production') {
        console.log('⚠️  Development mode - CORS is open to all origins');
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT received, shutting down gracefully...');
    process.exit(0);
});

