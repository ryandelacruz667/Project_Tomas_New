# Quick Setup Instructions for Chatbot

## Step 1: Create .env File

Create a file named `.env` in the project root directory with the following content:

```env
# Gemini API Configuration
# Get your API key from: https://makersuite.google.com/app/apikey
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

**⚠️ SECURITY WARNING:** 
- Never commit your `.env` file to version control (it's already in `.gitignore`)
- Never share your API key in documentation or code
- Store your API key only in the `.env` file on your local machine
- See `SECURITY_GUIDE.md` for detailed security best practices

## Step 2: Install Dependencies

Open a terminal in the project root and run:

```bash
npm install
```

This will install all required packages:
- express
- @google/generative-ai
- cors
- dotenv

## Step 3: Start the Backend Server

Run the server:

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

You should see:
```
🚀 Gemini Chatbot Server is running on port 3000
📡 API endpoint: http://localhost:3000/api/chat
💡 Health check: http://localhost:3000/api/health
```

## Step 4: Test the Chatbot

1. Open your PROJECT TOMaS application in a web browser
2. Click the robot icon (FAB button) in the bottom-right corner
3. The chatbot panel should open
4. Type a message and press Enter or click Send

## Troubleshooting

### If the server doesn't start:
- Make sure you created the `.env` file in the project root (same folder as `server.js`)
- Check that Node.js is installed (run `node --version` in terminal)
- Verify all dependencies are installed (check that `node_modules` folder exists)

### If chatbot shows "Offline":
- Make sure the backend server is running (check terminal for the startup message)
- Open browser console (F12) and check for errors
- Verify the API endpoint URL matches your server port

### Security Note:
Your API key is now configured in the `.env` file. This file is automatically ignored by Git, so your key will never be exposed in version control. Keep it secure!

## Next Steps

- The chatbot is ready to use!
- See `CHATBOT_README.md` for more detailed documentation
- For production deployment, update the `ALLOWED_ORIGIN` in `.env` to your domain

