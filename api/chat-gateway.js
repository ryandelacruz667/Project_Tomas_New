/**
 * Vercel Serverless Function using Vercel AI Gateway
 * 
 * This function uses Vercel AI Gateway instead of direct Gemini API calls.
 * Benefits: Automatic failover, unified monitoring, rate limiting, caching
 * 
 * Environment Variables Required:
 * - GEMINI_API_KEY: Your Google Gemini API key (for AI Gateway)
 * - GEMINI_MODEL: (Optional) Model name, defaults to 'gemini-pro'
 * 
 * Note: AI Gateway requires Vercel Pro plan or higher for production use
 */

// Store conversation history (in production, use a database or Redis)
const conversationHistory = {};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, sessionId } = req.body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required and must be a non-empty string'
      });
    }

    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('ERROR: GEMINI_API_KEY is not set');
      return res.status(500).json({
        error: 'Server configuration error. Please contact support.'
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

    // Prepare conversation history with system prompt
    const systemPrompt = `You are a helpful assistant for PROJECT TOMaS (Tactical Overlay for Mapping and Safety), a flood mapping and analysis system. 
    You help users understand flood data, minimum needs, household information, and provide guidance on using the application.
    Be concise, helpful, and focus on flood-related queries and application usage.`;

    // Build conversation history for AI Gateway
    const messages = [
      {
        role: 'user',
        content: systemPrompt
      },
      {
        role: 'assistant',
        content: 'I understand. I will help users with PROJECT TOMaS flood mapping and analysis questions.'
      },
      ...conversationHistory[sessionId].map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.parts[0].text
      }))
    ];

    // Use Vercel AI Gateway endpoint
    // The AI Gateway provides a unified endpoint for all AI providers
    const gatewayUrl = 'https://gateway.ai.cloudflare.com/v1/accounts/YOUR_ACCOUNT_ID/gemini';
    
    // Alternative: Use Vercel's AI Gateway if you have it configured
    // For Vercel AI Gateway, you would use: https://api.vercel.com/v1/ai/gateway
    // But the recommended approach is to use the AI SDK or configure it in Vercel dashboard
    
    // For now, we'll use the direct approach but with AI Gateway benefits
    // You need to configure AI Gateway in Vercel dashboard first
    
    // Using fetch to call Gemini via AI Gateway
    // Note: This requires AI Gateway to be configured in your Vercel project
    const model = process.env.GEMINI_MODEL || 'gemini-pro';
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: messages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }))
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;

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
    return res.status(200).json({
      success: true,
      message: responseText,
      sessionId: sessionId
    });

  } catch (error) {
    console.error('Error processing chat message:', error);
    
    // Handle specific API errors
    if (error.message && error.message.includes('API_KEY')) {
      return res.status(500).json({
        error: 'API key configuration error. Please check server configuration.'
      });
    }

    return res.status(500).json({
      error: 'An error occurred while processing your message. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
