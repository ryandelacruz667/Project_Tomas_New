# Vercel AI Gateway Setup Guide

This guide will help you set up Vercel AI Gateway for your Gemini chatbot. AI Gateway provides automatic failover, unified monitoring, rate limiting, and cost tracking.

## What is Vercel AI Gateway?

Vercel AI Gateway is a service that:
- ✅ **Routes requests** through a unified endpoint
- ✅ **Provides automatic failover** if Gemini goes down
- ✅ **Monitors usage** with detailed analytics
- ✅ **Tracks costs** across all AI providers
- ✅ **Rate limits** requests automatically
- ✅ **Caches responses** for better performance

## Prerequisites

1. **Vercel Account** (Pro plan recommended for production, but works on free tier for testing)
2. **Gemini API Key** from Google
3. **Node.js 18+** installed locally

## Step 1: Install Dependencies

Install the Vercel AI SDK and Google provider:

```bash
npm install ai @ai-sdk/google
```

The `ai` package is the Vercel AI SDK, and `@ai-sdk/google` provides Google Gemini integration.

## Step 2: Update Your Serverless Function

Your `api/chat.js` has already been updated to use AI Gateway! The key changes:

1. **Uses `generateText` from `ai` SDK** instead of direct Gemini API
2. **Uses `google()` provider** from `@ai-sdk/google`
3. **Automatically routes through AI Gateway** when deployed on Vercel

## Step 3: Configure AI Gateway in Vercel Dashboard

### Option A: Automatic Configuration (Recommended)

When you deploy to Vercel, AI Gateway is automatically configured if:
- You're using the `ai` SDK
- You have a valid API key set as an environment variable
- Your function uses a supported provider (like `@ai-sdk/google`)

### Option B: Manual Configuration

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Go to **Settings** → **AI Gateway**

2. **Add Google Provider**
   - Click "Add Provider"
   - Select "Google" (Gemini)
   - Enter your `GEMINI_API_KEY`
   - Save

3. **Configure Settings** (Optional)
   - Enable caching
   - Set rate limits
   - Configure failover behavior

## Step 4: Set Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add:
   - `GEMINI_API_KEY` = `your_gemini_api_key_here`
   - `GEMINI_MODEL` = `gemini-pro` (optional, defaults to gemini-pro)

## Step 5: Deploy to Vercel

```bash
# Install Vercel CLI if you haven't
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## Step 6: Verify AI Gateway is Working

### Check Vercel Dashboard

1. Go to your project dashboard
2. Navigate to **Analytics** → **AI Gateway**
3. You should see:
   - Request metrics
   - Cost tracking
   - Response times
   - Error rates

### Test the Endpoint

```bash
curl -X POST https://your-project.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, how can you help me?",
    "sessionId": "test_session_123"
  }'
```

## How AI Gateway Works

### Automatic Routing

When deployed on Vercel:
1. Your function calls `generateText()` with `google()` provider
2. Vercel automatically routes the request through AI Gateway
3. AI Gateway handles:
   - Authentication
   - Rate limiting
   - Monitoring
   - Failover (if configured)

### Local Development

When running locally (`vercel dev` or `npm start`):
- Requests go directly to Gemini API
- AI Gateway features are not available locally
- This is normal and expected

### Production Deployment

When deployed to Vercel:
- Requests automatically go through AI Gateway
- You get all the benefits (monitoring, failover, etc.)
- No code changes needed!

## Benefits You Get

### 1. **Unified Monitoring**

View all AI usage in one dashboard:
- Total requests
- Cost per request
- Response times
- Error rates
- Token usage

### 2. **Automatic Failover**

If Gemini API goes down:
- AI Gateway can route to backup providers
- Or retry with exponential backoff
- Your app stays online

### 3. **Rate Limiting**

Protect your API key:
- Set rate limits per user/IP
- Prevent abuse
- Control costs

### 4. **Cost Tracking**

See exactly how much you're spending:
- Cost per request
- Daily/monthly totals
- Cost by model
- Budget alerts

## Available Models

You can use any Gemini model:

```javascript
// In your function
const modelName = 'gemini-pro';           // Standard model
const modelName = 'gemini-1.5-pro';       // Latest Pro model
const modelName = 'gemini-1.5-flash';     // Faster, cheaper model
```

Update `GEMINI_MODEL` environment variable or change in code.

## Troubleshooting

### AI Gateway Not Working

**Issue**: Requests not going through AI Gateway

**Solution**:
1. Verify you're deployed to Vercel (not running locally)
2. Check that `ai` and `@ai-sdk/google` are installed
3. Verify environment variables are set
4. Check Vercel dashboard → AI Gateway settings

### Rate Limit Errors

**Issue**: Getting 429 rate limit errors

**Solution**:
1. Check AI Gateway dashboard for rate limit settings
2. Increase rate limits if needed
3. Implement client-side retry logic

### High Costs

**Issue**: Costs higher than expected

**Solution**:
1. Check AI Gateway dashboard → Cost tracking
2. Review token usage per request
3. Consider using `gemini-1.5-flash` for faster/cheaper responses
4. Implement caching for repeated queries

### Local Development Issues

**Issue**: Function works locally but not on Vercel

**Solution**:
1. Make sure environment variables are set in Vercel dashboard
2. Check Vercel deployment logs
3. Verify `ai` and `@ai-sdk/google` are in `package.json` dependencies

## Migration from Direct API

If you were using direct Gemini API calls:

### Before (Direct API)
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
```

### After (AI Gateway)
```javascript
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
const result = await generateText({
  model: google('gemini-pro', { apiKey }),
  messages: messages
});
```

**Benefits of migration**:
- ✅ Automatic monitoring
- ✅ Built-in failover
- ✅ Cost tracking
- ✅ Rate limiting
- ✅ Better error handling

## Next Steps

1. ✅ Install dependencies: `npm install ai @ai-sdk/google`
2. ✅ Deploy to Vercel: `vercel --prod`
3. ✅ Configure AI Gateway in dashboard
4. ✅ Set environment variables
5. ✅ Test your deployment
6. ✅ Monitor usage in AI Gateway dashboard

## Resources

- [Vercel AI Gateway Docs](https://vercel.com/docs/ai-gateway)
- [Vercel AI SDK Docs](https://sdk.vercel.com/docs)
- [Google Provider Docs](https://sdk.vercel.com/providers/ai-sdk-providers/google)
- [AI Gateway Pricing](https://vercel.com/pricing)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review AI Gateway dashboard
3. Check environment variables
4. Verify dependencies are installed

Your chatbot is now using Vercel AI Gateway! 🚀
