# Troubleshooting: Chatbot Shows Offline

If your chatbot shows as "Offline" after deploying to Netlify, follow these steps:

## Step 1: Check Browser Console

1. Open your deployed site
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Look for error messages related to:
   - `Chatbot API endpoint:`
   - `Checking health at:`
   - `Health check response status:`
   - Any CORS or network errors

## Step 2: Verify Edge Functions Are Deployed

1. Go to your Netlify dashboard
2. Navigate to **Functions** → **Edge Functions**
3. You should see:
   - `chat` function
   - `health` function
4. If they're missing, check:
   - Files are in `netlify/edge-functions/` folder
   - `netlify.toml` is in the root directory
   - You've committed and pushed the files

## Step 3: Test Health Endpoint Directly

Open in your browser:
```
https://your-site-name.netlify.app/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "service": "AI Chat API (Edge Function)",
  "timestamp": "2024-..."
}
```

**If you get 404:**
- Edge functions aren't deployed
- Check `netlify.toml` configuration
- Redeploy your site

**If you get 500:**
- Check Netlify function logs
- Verify environment variables are set

## Step 4: Check Environment Variables

1. Netlify dashboard → **Site settings** → **Environment variables**
2. Verify `GEMINI_API_KEY` is set
3. Make sure it's set for **Production** (or All contexts)
4. **Important:** After adding/changing env vars, you need to **redeploy**

## Step 5: Check Netlify Function Logs

1. Netlify dashboard → **Functions** → **Edge Functions**
2. Click on `chat` or `health`
3. Check **Logs** tab for errors
4. Common errors:
   - `GEMINI_API_KEY not set` → Add environment variable
   - `Module not found` → Check file paths
   - `Syntax error` → Check TypeScript syntax

## Step 6: Verify File Structure

Your project should have:
```
Project_Tomas_New/
├── netlify/
│   └── edge-functions/
│       ├── chat.ts
│       └── health.ts
├── netlify.toml
└── script/
    └── chatbot.js
```

## Step 7: Common Issues & Fixes

### Issue: "404 Not Found" on /api/health
**Fix:**
- Verify `netlify.toml` has correct paths
- Make sure edge functions are in `netlify/edge-functions/`
- Redeploy after making changes

### Issue: "CORS error" in console
**Fix:**
- Edge functions should handle CORS (already included)
- Check that you're accessing via HTTPS
- Clear browser cache

### Issue: "500 Internal Server Error"
**Fix:**
- Check Netlify function logs
- Verify `GEMINI_API_KEY` is set correctly
- Test API key at: https://makersuite.google.com/app/apikey

### Issue: Functions not showing in dashboard
**Fix:**
- Make sure files are `.ts` (TypeScript) not `.js`
- Check `netlify.toml` syntax
- Files must be in `netlify/edge-functions/` directory
- Commit and push to trigger new deployment

## Step 8: Manual Test

Test the chat endpoint directly:

```bash
curl -X POST https://your-site.netlify.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test","sessionId":"test123"}'
```

**Expected:** JSON response with AI message
**If error:** Check the error message in response

## Still Not Working?

1. **Check Netlify Status:** https://www.netlifystatus.com/
2. **Verify Deployment:** Make sure latest code is deployed
3. **Clear Cache:** Hard refresh (Ctrl+Shift+R)
4. **Check Domain:** Make sure you're testing on the correct Netlify URL

## Quick Fix Checklist

- [ ] `netlify.toml` exists in root directory
- [ ] Edge functions are in `netlify/edge-functions/` folder
- [ ] Files are named `chat.ts` and `health.ts` (not `.js`)
- [ ] `GEMINI_API_KEY` is set in Netlify environment variables
- [ ] Site has been redeployed after adding env vars
- [ ] Browser console shows the correct API endpoint
- [ ] `/api/health` returns 200 OK when accessed directly
