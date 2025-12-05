# PROJECT TOMaS Chatbot Setup Guide

This guide will help you set up the secure Gemini AI chatbot for PROJECT TOMaS.

## Overview

The chatbot uses a secure backend server architecture where:
- **Backend Server** (Node.js/Express) - Handles API calls to Google Gemini API securely
- **Frontend Interface** (JavaScript) - Communicates with the backend server
- **API Key** - Stays on the server and is never exposed to the frontend

## Prerequisites

1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/

2. **Gemini API Key**
   - Get your free API key from: https://makersuite.google.com/app/apikey
   - You'll need a Google account

## Setup Instructions

### Step 1: Install Backend Dependencies

Open a terminal in the project root directory and run:

```bash
npm install
```

This will install all required packages:
- `express` - Web server framework
- `@google/generative-ai` - Google Gemini AI SDK
- `cors` - Cross-Origin Resource Sharing
- `dotenv` - Environment variable management

### Step 2: Configure Environment Variables

1. Create a `.env` file in the project root directory

2. Copy the following template into the `.env` file:

```env
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Gemini Model (optional, defaults to 'gemini-pro')
GEMINI_MODEL=gemini-pro

# Server Configuration
PORT=3000

# CORS Configuration (for production, specify your domain)
ALLOWED_ORIGIN=*

# Environment
NODE_ENV=development
```

3. Replace `your_gemini_api_key_here` with your actual Gemini API key from Step 1

### Step 3: Start the Backend Server

Run the server using one of these commands:

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
🚀 Gemini Chatbot Server is running on port 3000
📡 API endpoint: http://localhost:3000/api/chat
💡 Health check: http://localhost:3000/api/health
```

### Step 4: Configure Frontend API Endpoint (Optional)

By default, the frontend connects to `http://localhost:3000/api/chat`.

If your backend server runs on a different URL, you can configure it by adding this to your HTML file (before the chatbot script):

```html
<script>
    window.CHATBOT_CONFIG = {
        apiEndpoint: 'http://your-server-url:port/api/chat'
    };
</script>
```

### Step 5: Test the Chatbot

1. Open your PROJECT TOMaS application in a web browser
2. Click the robot icon (FAB button) in the bottom-right corner
3. The chatbot panel should open
4. Type a message and press Enter or click Send

## Troubleshooting

### Backend Server Won't Start

**Error: "GEMINI_API_KEY is not set"**
- Make sure you created a `.env` file in the project root
- Verify the `.env` file contains `GEMINI_API_KEY=your_actual_key`
- Restart the server after creating/modifying `.env`

**Error: "Port 3000 is already in use"**
- Change the PORT in your `.env` file to a different port (e.g., 3001)
- Update the frontend configuration to match

### Chatbot Shows "Offline" Status

- Check if the backend server is running
- Verify the API endpoint URL in the browser console
- Check browser console for CORS errors
- Ensure the backend server is accessible from your frontend domain

### Messages Not Sending

- Open browser Developer Tools (F12)
- Check the Console tab for error messages
- Check the Network tab to see if requests are being made
- Verify the backend server logs for errors

## Production Deployment

### Security Considerations

1. **Environment Variables:**
   - Never commit `.env` file to version control (already in `.gitignore`)
   - Use secure environment variable management in production

2. **CORS Configuration:**
   - Update `ALLOWED_ORIGIN` in `.env` to your actual domain:
     ```env
     ALLOWED_ORIGIN=https://yourdomain.com
     ```

3. **API Key Security:**
   - Use environment variables or secure secret management
   - Never expose API keys in client-side code

4. **HTTPS:**
   - Always use HTTPS in production
   - Configure SSL/TLS certificates

### Deployment Options

**Option 1: Same Server**
- Deploy both frontend and backend on the same server
- Use a reverse proxy (nginx/Apache) to route requests

**Option 2: Separate Servers**
- Deploy backend on a dedicated server
- Update frontend configuration to point to backend URL
- Configure CORS appropriately

**Option 3: Cloud Platforms**
- **Heroku**: Use environment variables in Heroku dashboard
- **AWS/GCP/Azure**: Use their respective secret management services
- **Vercel/Netlify**: Use serverless functions (requires code modification)

## API Endpoints

### POST /api/chat
Send a chat message to the AI.

**Request:**
```json
{
    "message": "Your message here",
    "sessionId": "session_123456789"
}
```

**Response:**
```json
{
    "success": true,
    "message": "AI response text",
    "sessionId": "session_123456789"
}
```

### POST /api/chat/clear
Clear conversation history for a session.

**Request:**
```json
{
    "sessionId": "session_123456789"
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
    "status": "ok",
    "service": "Gemini Chatbot API",
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Customization

### Changing the AI Model

Edit `.env`:
```env
GEMINI_MODEL=gemini-pro-vision  # or other available models
```

### Modifying System Prompt

Edit `server.js` and modify the `systemPrompt` variable in the `/api/chat` endpoint.

### Styling

Chatbot styles are in `css/main.css` under the "Chatbot Styles" section. Modify as needed.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs for error messages
3. Check browser console for client-side errors
4. Verify API key is valid and has necessary permissions

## License

This chatbot implementation is part of PROJECT TOMaS.

