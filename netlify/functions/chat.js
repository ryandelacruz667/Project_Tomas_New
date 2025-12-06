/**
 * Netlify Serverless Function for Gemini AI Chatbot
 * 
 * This function handles chat messages and returns AI responses.
 * Deploy to Netlify by placing this file in the /netlify/functions directory.
 * 
 * Environment Variables Required (set in Netlify dashboard):
 * - GEMINI_API_KEY: Your Google Gemini API key
 * - GEMINI_MODEL: (Optional) Model name, defaults to 'gemini-pro'
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Store conversation history (in production, use a database or Redis)
const conversationHistory = {};

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({})
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message, sessionId } = JSON.parse(event.body);

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Message is required and must be a non-empty string'
        })
      };
    }

    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('ERROR: GEMINI_API_KEY is not set');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Server configuration error. Please contact support.'
        })
      };
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    const result = await chat.sendMessage(
      conversationHistory[sessionId][conversationHistory[sessionId].length - 1].parts[0].text
    );
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
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: responseText,
        sessionId: sessionId
      })
    };

  } catch (error) {
    console.error('Error processing chat message:', error);
    
    // Handle specific Gemini API errors
    if (error.message && error.message.includes('API_KEY')) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'API key configuration error. Please check server configuration.'
        })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'An error occurred while processing your message. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
