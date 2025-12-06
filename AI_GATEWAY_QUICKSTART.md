# AI Gateway Quick Start

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install ai @ai-sdk/google
```

### 2. Deploy to Vercel

```bash
vercel login
vercel --prod
```

### 3. Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables:
- `GEMINI_API_KEY` = `your_api_key_here`
- `GEMINI_MODEL` = `gemini-pro` (optional)

### 4. Enable AI Gateway

1. Go to Vercel Dashboard → Your Project
2. Settings → AI Gateway
3. Add Google provider with your API key
4. Save

### 5. Test

Your function at `https://your-project.vercel.app/api/chat` now uses AI Gateway automatically!

## ✅ What Changed?

- ✅ Uses Vercel AI SDK (`ai` package)
- ✅ Routes through AI Gateway automatically
- ✅ Gets monitoring, failover, rate limiting
- ✅ No code changes needed after setup

## 📊 View Analytics

Go to Vercel Dashboard → Analytics → AI Gateway to see:
- Request counts
- Costs
- Response times
- Error rates

## 🎉 Done!

Your chatbot now has enterprise-grade AI infrastructure!

See `AI_GATEWAY_SETUP.md` for detailed instructions.
