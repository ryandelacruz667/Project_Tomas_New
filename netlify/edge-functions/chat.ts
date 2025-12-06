/**
 * Netlify Edge Function for AI Chat
 * 
 * SIMPLE SETUP:
 * 1. Deploy to Netlify (git push or drag & drop folder)
 * 2. In Netlify dashboard → Site settings → Environment variables
 * 3. Add: GEMINI_API_KEY = your_api_key_here
 * 
 * That's it! No build, no npm install, nothing else needed.
 * 
 * This uses Deno runtime - just works out of the box.
 */

// Store conversation history in memory (resets on deploy)
const conversationHistory = new Map<string, any[]>();

export default async (req: Request) => {
  // Handle CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { message, sessionId } = await req.json();

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get API key from environment
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.error('ERROR: GEMINI_API_KEY not set');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize session history
    if (!conversationHistory.has(sessionId)) {
      conversationHistory.set(sessionId, []);
    }

    const history = conversationHistory.get(sessionId)!;

    // Add user message to history
    history.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Prepare conversation with system prompt
    const systemPrompt = `You are a helpful assistant for PROJECT TOMaS (Tactical Overlay for Mapping and Safety), a flood mapping and analysis system. 
You help users understand flood data, minimum needs, household information, and provide guidance on using the application.
Be concise, helpful, and focus on flood-related queries and application usage.`;

    // Build messages array for Gemini API
    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      {
        role: 'model',
        parts: [{ text: 'I understand. I will help users with PROJECT TOMaS flood mapping and analysis questions.' }]
      },
      ...history
    ].map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: msg.parts
    }));

    // Call Gemini API directly (no dependencies needed)
    const model = Deno.env.get('GEMINI_MODEL') || 'gemini-pro';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contents })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;

    // Add AI response to history
    history.push({
      role: 'model',
      parts: [{ text: responseText }]
    });

    // Limit history size (keep last 20 messages)
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    // Return response
    return new Response(
      JSON.stringify({
        success: true,
        message: responseText,
        sessionId: sessionId
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error processing chat:', error);
    return new Response(
      JSON.stringify({
        error: 'An error occurred. Please try again.',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};
