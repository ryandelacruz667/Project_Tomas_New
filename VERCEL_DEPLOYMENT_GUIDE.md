# Complete Vercel Deployment Guide

This guide will walk you through deploying PROJECT TOMaS to Vercel step-by-step.

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ Git repository (GitHub, GitLab, or Bitbucket)
- ✅ Vercel account (free tier works!)
- ✅ Gemini API key

## Method 1: Deploy via Vercel Dashboard (Easiest - Recommended)

### Step 1: Push Your Code to Git

If you haven't already, push your code to GitHub/GitLab/Bitbucket:

```bash
# Initialize git if needed
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - PROJECT TOMaS with AI Gateway"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/your-repo.git

# Push
git push -u origin main
```

### Step 2: Import Project to Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign up or log in (you can use GitHub to sign in)

2. **Import Your Project**
   - Click "Add New..." → "Project"
   - Select your Git provider (GitHub/GitLab/Bitbucket)
   - Authorize Vercel to access your repositories
   - Find and select your PROJECT TOMaS repository
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset**: Other (or leave as default)
   - **Root Directory**: `./` (root of your project)
   - **Build Command**: Leave empty (no build step needed)
   - **Output Directory**: `./` (serving static files)
   - **Install Command**: `npm install`

4. **Click "Deploy"**
   - Vercel will start deploying your project
   - Wait for deployment to complete (usually 1-2 minutes)

### Step 3: Set Environment Variables

1. **Go to Project Settings**
   - In your project dashboard, click "Settings"
   - Navigate to "Environment Variables"

2. **Add Variables**
   Click "Add New" and add:
   
   **Variable 1:**
   - Name: `GEMINI_API_KEY`
   - Value: `your_gemini_api_key_here`
   - Environment: Select all (Production, Preview, Development)
   - Click "Save"

   **Variable 2 (Optional):**
   - Name: `GEMINI_MODEL`
   - Value: `gemini-pro`
   - Environment: Select all
   - Click "Save"

3. **Redeploy**
   - Go to "Deployments" tab
   - Click the three dots (⋯) on the latest deployment
   - Click "Redeploy"
   - This applies the new environment variables

### Step 4: Configure AI Gateway

1. **Enable AI Gateway**
   - Go to Settings → AI Gateway
   - Click "Add Provider"
   - Select "Google" (Gemini)
   - Enter your `GEMINI_API_KEY`
   - Click "Save"

2. **Configure Settings (Optional)**
   - Enable caching if desired
   - Set rate limits
   - Configure failover behavior

### Step 5: Test Your Deployment

Your site is now live! Visit:
- **Production URL**: `https://your-project.vercel.app`
- **API Endpoint**: `https://your-project.vercel.app/api/chat`
- **Health Check**: `https://your-project.vercel.app/api/health`

Test the chatbot:
```bash
curl -X POST https://your-project.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello!",
    "sessionId": "test_123"
  }'
```

---

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

Or use npx (no installation needed):
```bash
npx vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

This will:
- Open your browser
- Ask you to authorize Vercel CLI
- Link your local machine to your Vercel account

### Step 3: Navigate to Your Project

```bash
cd "c:\Users\RyanDelacruz\Documents\Project_Tomas_New"
```

### Step 4: Deploy

**First deployment (preview):**
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No** (first time)
- Project name? (Press Enter for default or type a name)
- Directory? (Press Enter for current directory)
- Override settings? **No**

**Deploy to production:**
```bash
vercel --prod
```

### Step 5: Set Environment Variables via CLI

```bash
# Set GEMINI_API_KEY
vercel env add GEMINI_API_KEY

# When prompted:
# - Value: Enter your Gemini API key
# - Environment: Select all (production, preview, development)

# Set GEMINI_MODEL (optional)
vercel env add GEMINI_MODEL
# Value: gemini-pro
# Environment: Select all
```

### Step 6: Redeploy with Environment Variables

```bash
vercel --prod
```

### Step 7: Configure AI Gateway

Go to Vercel Dashboard → Your Project → Settings → AI Gateway and configure as described in Method 1, Step 4.

---

## Post-Deployment Checklist

### ✅ Verify Deployment

1. **Check Site is Live**
   - Visit your production URL
   - Verify the map loads correctly
   - Test the chatbot (click the robot icon)

2. **Test API Endpoints**
   ```bash
   # Health check
   curl https://your-project.vercel.app/api/health
   
   # Chat endpoint
   curl -X POST https://your-project.vercel.app/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello", "sessionId": "test"}'
   ```

3. **Check Logs**
   - Go to Vercel Dashboard → Your Project → Logs
   - Look for any errors or warnings

### ✅ Update Frontend Configuration

If your frontend needs to know the API endpoint, update `index.html`:

```html
<script>
    // Auto-detect environment
    const isProduction = window.location.hostname !== 'localhost';
    window.CHATBOT_CONFIG = {
        apiEndpoint: isProduction 
            ? 'https://your-project.vercel.app/api/chat'
            : 'http://localhost:3000/api/chat'  // Local development
    };
</script>
<script src="./script/chatbot.js"></script>
```

### ✅ Monitor Usage

1. **View Analytics**
   - Go to Vercel Dashboard → Analytics
   - See traffic, performance, and errors

2. **Check AI Gateway**
   - Go to Analytics → AI Gateway
   - View request counts, costs, and token usage

---

## Troubleshooting

### Issue: "Build Failed"

**Possible causes:**
- Missing dependencies
- Syntax errors in code
- Node version mismatch

**Solution:**
1. Check build logs in Vercel dashboard
2. Test locally: `npm install && npm start`
3. Verify `package.json` has all dependencies

### Issue: "Environment Variable Not Found"

**Solution:**
1. Go to Settings → Environment Variables
2. Verify variables are set correctly
3. Make sure they're enabled for the right environment
4. Redeploy after adding variables

### Issue: "API Endpoint Returns 500 Error"

**Solution:**
1. Check Vercel function logs
2. Verify `GEMINI_API_KEY` is set correctly
3. Test API key is valid
4. Check AI Gateway configuration

### Issue: "CORS Errors"

**Solution:**
- CORS headers are already configured in `vercel.json`
- If issues persist, check browser console
- Verify frontend and backend are on same domain

### Issue: "Function Timeout"

**Solution:**
- Check `vercel.json` - `maxDuration` is set to 30 seconds
- For longer timeouts, upgrade to Vercel Pro plan
- Optimize your function code

---

## Custom Domain (Optional)

### Step 1: Add Domain

1. Go to Settings → Domains
2. Click "Add Domain"
3. Enter your domain name
4. Follow DNS configuration instructions

### Step 2: Configure DNS

Add the CNAME record provided by Vercel to your domain's DNS settings.

### Step 3: Wait for SSL

Vercel automatically provisions SSL certificates (usually takes a few minutes).

---

## Continuous Deployment

Once connected to Git, Vercel automatically deploys:

- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches (creates preview URLs)
- **Pull Requests**: Automatic preview deployments

### Disable Auto-Deploy (if needed)

1. Go to Settings → Git
2. Uncheck "Automatic deployments from Git"
3. Deploy manually via CLI or dashboard

---

## Updating Your Deployment

### After Code Changes

**If using Git:**
```bash
git add .
git commit -m "Your changes"
git push
```
Vercel automatically deploys!

**If using CLI:**
```bash
vercel --prod
```

### After Environment Variable Changes

1. Update in Vercel Dashboard → Settings → Environment Variables
2. Redeploy (automatic if using Git, or manually via CLI)

---

## Vercel Plan Comparison

| Feature | Free | Pro ($20/mo) |
|---------|------|--------------|
| **Bandwidth** | 100GB | 1TB |
| **Function Execution** | 100GB-hours | 1000GB-hours |
| **Function Duration** | 10s | 60s |
| **AI Gateway** | ✅ Limited | ✅ Full access |
| **Custom Domains** | ✅ Yes | ✅ Yes |
| **SSL** | ✅ Automatic | ✅ Automatic |

**For PROJECT TOMaS**: Free tier is sufficient to start!

---

## Quick Reference Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (preview)
vercel

# Deploy (production)
vercel --prod

# View deployments
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove

# Link to existing project
vercel link
```

---

## Next Steps

1. ✅ Deploy to Vercel (choose Method 1 or 2 above)
2. ✅ Set environment variables
3. ✅ Configure AI Gateway
4. ✅ Test your deployment
5. ✅ Update frontend configuration
6. ✅ Monitor usage in dashboard

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **AI Gateway Docs**: [vercel.com/docs/ai-gateway](https://vercel.com/docs/ai-gateway)

---

**Your PROJECT TOMaS is now ready for production! 🚀**
