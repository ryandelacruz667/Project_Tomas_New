# Serverless Quick Start Guide

## 🚀 Quick Deploy to Vercel (Recommended - Easiest)

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login and Deploy
```bash
vercel login
vercel
```

### 3. Set Environment Variables
In Vercel Dashboard → Your Project → Settings → Environment Variables:
- `GEMINI_API_KEY` = `your_api_key_here`
- `GEMINI_MODEL` = `gemini-pro` (optional)

### 4. Deploy to Production
```bash
vercel --prod
```

### 5. Update Frontend
Add to `index.html` (before chatbot script):
```html
<script>
    window.CHATBOT_CONFIG = {
        apiEndpoint: 'https://your-project.vercel.app/api/chat'
    };
</script>
```

**Done!** Your chatbot is now serverless. ✅

---

## 🌐 Quick Deploy to Netlify

### 1. Install Netlify CLI (Optional)
```bash
npm install -g netlify-cli
```

### 2. Deploy
```bash
netlify login
netlify init
netlify deploy --prod
```

### 3. Set Environment Variables
In Netlify Dashboard → Site Settings → Environment Variables:
- `GEMINI_API_KEY` = `your_api_key_here`

### 4. Update Frontend
```html
<script>
    window.CHATBOT_CONFIG = {
        apiEndpoint: 'https://your-site.netlify.app/api/chat'
    };
</script>
```

---

## 📋 What Changed?

### Before (Traditional Server)
- ❌ Need to run `node server.js` constantly
- ❌ Need to manage server uptime
- ❌ Pay for server even when not in use
- ❌ Manual scaling required

### After (Serverless)
- ✅ Automatic scaling
- ✅ Pay only for API calls
- ✅ No server management
- ✅ Global deployment
- ✅ Automatic HTTPS

---

## 🔧 Testing Locally

You can still test with your local server:
```bash
npm start
```

The frontend will automatically use the configured endpoint, or fall back to `http://localhost:3000/api/chat` if no config is set.

---

## 📚 Full Documentation

See `SERVERLESS_DEPLOYMENT_GUIDE.md` for detailed instructions for all platforms.
