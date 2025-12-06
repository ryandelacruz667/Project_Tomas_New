# Simple AI Chat Setup (2 Minutes!)

This setup uses **Netlify Edge Functions** - no npm, no build, no complexity. Just works!

## Quick Setup (3 Steps)

### Step 1: Get a Gemini API Key
1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy your key

### Step 2: Deploy to Netlify
Choose ONE method:

**Option A: Git Push (Recommended)**
```bash
git add .
git commit -m "Add AI chat"
git push
```
Then connect your repo at https://app.netlify.com

**Option B: Drag & Drop**
1. Go to https://app.netlify.com/drop
2. Drag your entire project folder
3. Done!

### Step 3: Add API Key
1. In Netlify dashboard → Your site → **Site settings**
2. Go to **Environment variables**
3. Click **Add variable**
4. Key: `GEMINI_API_KEY`
5. Value: (paste your API key)
6. Click **Save**

**That's it!** Your chatbot is now working. 🎉

## How It Works

- ✅ **No npm install** - Uses Deno runtime (built-in)
- ✅ **No build process** - Just deploy and go
- ✅ **Secure** - API key stays on server, never exposed to clients
- ✅ **Fast** - Edge functions run globally at the edge
- ✅ **Free tier** - Netlify free tier includes edge functions

## Testing Locally (Optional)

To test locally, use Netlify CLI:
```bash
npm install -g netlify-cli
netlify dev
```

Then set environment variable:
```bash
netlify env:set GEMINI_API_KEY your_key_here
```

## Troubleshooting

**Chat shows "Offline"**
- Check that `GEMINI_API_KEY` is set in Netlify dashboard
- Make sure your site is deployed (not just local)
- Check browser console for errors

**API errors**
- Verify your Gemini API key is valid
- Check Netlify function logs: Site dashboard → Functions → View logs

## Security Notes

- ✅ API key is stored securely in Netlify (never in code)
- ✅ Requests are proxied through Netlify edge (no CORS issues)
- ✅ Rate limiting handled by Netlify automatically
- ⚠️  Free tier has usage limits (sufficient for testing/light use)
