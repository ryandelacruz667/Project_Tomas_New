# Fix for Vercel Deployment Issues

## Issues Fixed

1. ✅ **Converted ES6 imports to CommonJS** - Vercel serverless functions now use `require()` instead of `import`
2. ✅ **Updated CORS headers** - Added explicit CORS headers in the function responses
3. ✅ **Fixed vercel.json** - Added proper routing configuration
4. ✅ **Auto-detect API endpoint** - Frontend now automatically uses the correct endpoint

## What Was Changed

### 1. API Functions (`api/chat.js` and `api/health.js`)
- Changed from ES6 `import` to CommonJS `require()`
- Added explicit CORS headers in responses
- Changed from `export default` to `module.exports`

### 2. Frontend (`script/chatbot.js`)
- Auto-detects production vs development
- Automatically uses current domain for API endpoint in production
- Falls back to localhost for development

### 3. Vercel Configuration (`vercel.json`)
- Added proper routing for static files
- Configured API routes correctly

## Next Steps

### 1. Commit and Push Changes

```bash
git add .
git commit -m "Fix Vercel deployment - convert to CommonJS"
git push
```

### 2. Redeploy on Vercel

Vercel will automatically redeploy when you push, OR:

1. Go to Vercel Dashboard
2. Go to your project
3. Click "Deployments"
4. Click "Redeploy" on the latest deployment

### 3. Verify Environment Variables

Make sure these are set in Vercel Dashboard → Settings → Environment Variables:

- `GEMINI_API_KEY` = your API key
- `GEMINI_MODEL` = `gemini-pro` (optional)

### 4. Test Your Deployment

1. Visit: https://project-tomas-new-lake.vercel.app
2. Check browser console (F12) for any errors
3. Test the chatbot (click robot icon)
4. Test API directly:
   ```bash
   curl https://project-tomas-new-lake.vercel.app/api/health
   ```

## Common Issues and Solutions

### Issue: "Cannot find module 'ai'"

**Solution**: Make sure `package.json` includes:
```json
"dependencies": {
  "ai": "^3.4.0",
  "@ai-sdk/google": "^1.0.0"
}
```

Then redeploy.

### Issue: "500 Internal Server Error"

**Solution**: 
1. Check Vercel function logs (Dashboard → Logs)
2. Verify `GEMINI_API_KEY` is set
3. Check the error message in logs

### Issue: "CORS Error"

**Solution**: CORS headers are now included in the functions. If still seeing errors:
1. Clear browser cache
2. Check browser console for specific error
3. Verify the API endpoint URL is correct

### Issue: "Function Timeout"

**Solution**: 
- Current timeout is 30 seconds (configured in `vercel.json`)
- For longer timeouts, upgrade to Vercel Pro plan

## Testing Checklist

- [ ] Site loads at https://project-tomas-new-lake.vercel.app
- [ ] Map displays correctly
- [ ] Health endpoint works: `/api/health`
- [ ] Chatbot opens when clicking robot icon
- [ ] Chatbot sends messages successfully
- [ ] No console errors in browser

## If Issues Persist

1. **Check Vercel Logs**:
   - Go to Dashboard → Your Project → Logs
   - Look for error messages

2. **Check Browser Console**:
   - Press F12
   - Look at Console tab for errors
   - Check Network tab for failed requests

3. **Verify Environment Variables**:
   - Settings → Environment Variables
   - Make sure `GEMINI_API_KEY` is set
   - Redeploy after adding variables

4. **Test API Directly**:
   ```bash
   curl -X POST https://project-tomas-new-lake.vercel.app/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello", "sessionId": "test"}'
   ```

## Success Indicators

✅ Site loads without errors  
✅ Map displays correctly  
✅ Health endpoint returns `{"status":"ok"}`  
✅ Chatbot responds to messages  
✅ No errors in browser console  

Your deployment should now work! 🎉
