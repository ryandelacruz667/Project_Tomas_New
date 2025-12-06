# Serverless Deployment Guide for Gemini Chatbot

This guide explains how to deploy your Gemini AI chatbot as serverless functions on various platforms. Serverless functions are perfect for this use case because they:

- **Scale automatically** - Handle traffic spikes without configuration
- **Pay per use** - Only pay for actual API calls
- **No server management** - No need to maintain servers
- **Global deployment** - Deploy to edge locations for low latency

## Table of Contents

1. [Vercel Deployment](#vercel-deployment)
2. [Netlify Deployment](#netlify-deployment)
3. [AWS Lambda Deployment](#aws-lambda-deployment)
4. [Frontend Configuration](#frontend-configuration)
5. [Comparison of Platforms](#comparison-of-platforms)

---

## Vercel Deployment

Vercel is the easiest platform for deploying serverless functions, especially if you're already hosting your frontend there.

### Prerequisites

- A Vercel account (free tier available)
- Your Gemini API key
- Node.js 16+ installed locally (for testing)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Configure Your Project

The serverless functions are already set up in the `/api` directory:
- `api/chat.js` - Main chat endpoint
- `api/health.js` - Health check endpoint

### Step 3: Deploy to Vercel

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Deploy your project:**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project or create new
   - Confirm project settings
   - Deploy

3. **Set Environment Variables:**
   
   After deployment, go to your Vercel dashboard:
   - Navigate to your project
   - Go to Settings → Environment Variables
   - Add:
     - `GEMINI_API_KEY` = `your_api_key_here`
     - `GEMINI_MODEL` = `gemini-pro` (optional)

4. **Redeploy:**
   ```bash
   vercel --prod
   ```

### Step 4: Update Frontend

Your API endpoint will be: `https://your-project.vercel.app/api/chat`

Update your frontend configuration:
```javascript
window.CHATBOT_CONFIG = {
    apiEndpoint: 'https://your-project.vercel.app/api/chat'
};
```

### Vercel Advantages

- ✅ Free tier: 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Zero configuration
- ✅ Automatic deployments from Git

---

## Netlify Deployment

Netlify is another excellent option for serverless functions with a generous free tier.

### Prerequisites

- A Netlify account (free tier available)
- Your Gemini API key
- Netlify CLI (optional, for CLI deployment)

### Step 1: Install Netlify CLI (Optional)

```bash
npm install -g netlify-cli
```

### Step 2: Configure Your Project

The serverless functions are already set up in the `/netlify/functions` directory:
- `netlify/functions/chat.js` - Main chat endpoint
- `netlify/functions/health.js` - Health check endpoint

The `netlify.toml` file is already configured.

### Step 3: Deploy to Netlify

**Option A: Deploy via Netlify Dashboard**

1. Go to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository
4. Build settings:
   - Build command: (leave empty if no build step)
   - Publish directory: `.` (root directory)
5. Click "Deploy site"

**Option B: Deploy via CLI**

```bash
# Login
netlify login

# Initialize (if first time)
netlify init

# Deploy
netlify deploy --prod
```

### Step 4: Set Environment Variables

1. Go to your site dashboard on Netlify
2. Navigate to Site settings → Environment variables
3. Add:
   - `GEMINI_API_KEY` = `your_api_key_here`
   - `GEMINI_MODEL` = `gemini-pro` (optional)
4. Redeploy your site

### Step 5: Update Frontend

Your API endpoint will be: `https://your-site.netlify.app/api/chat`

Update your frontend configuration:
```javascript
window.CHATBOT_CONFIG = {
    apiEndpoint: 'https://your-site.netlify.app/api/chat'
};
```

### Netlify Advantages

- ✅ Free tier: 100GB bandwidth/month, 125K function invocations
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Easy Git integration
- ✅ Form handling and other features

---

## AWS Lambda Deployment

AWS Lambda provides the most control and scalability, but requires more setup.

### Prerequisites

- AWS account
- AWS CLI installed and configured
- Your Gemini API key
- Node.js 16+ installed locally

### Step 1: Install Dependencies

Create a deployment package:

```bash
# Create a directory for Lambda deployment
mkdir lambda-deployment
cd lambda-deployment

# Copy the Lambda function
cp ../aws-lambda/chat.js index.js

# Install dependencies
npm init -y
npm install @google/generative-ai

# Create deployment package
zip -r function.zip index.js node_modules/
```

### Step 2: Create Lambda Function

**Option A: Via AWS Console**

1. Go to AWS Lambda Console
2. Click "Create function"
3. Choose "Author from scratch"
4. Function name: `tomas-gemini-chatbot`
5. Runtime: Node.js 18.x or 20.x
6. Click "Create function"
7. Upload the `function.zip` file
8. Set handler to: `index.handler`

**Option B: Via AWS CLI**

```bash
aws lambda create-function \
  --function-name tomas-gemini-chatbot \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 512
```

### Step 3: Set Environment Variables

In Lambda console:
1. Go to Configuration → Environment variables
2. Add:
   - `GEMINI_API_KEY` = `your_api_key_here`
   - `GEMINI_MODEL` = `gemini-pro` (optional)

### Step 4: Configure API Gateway

1. Go to API Gateway Console
2. Create a new REST API
3. Create a POST method for `/chat`
4. Set integration type to Lambda Function
5. Select your Lambda function
6. Enable CORS
7. Deploy API to a stage (e.g., "prod")
8. Note the API endpoint URL

### Step 5: Update Frontend

Your API endpoint will be: `https://your-api-id.execute-api.region.amazonaws.com/prod/chat`

Update your frontend configuration:
```javascript
window.CHATBOT_CONFIG = {
    apiEndpoint: 'https://your-api-id.execute-api.region.amazonaws.com/prod/chat'
};
```

### AWS Lambda Advantages

- ✅ Highly scalable
- ✅ Pay per invocation (very cheap)
- ✅ Integrates with other AWS services
- ✅ More control over configuration
- ⚠️ More complex setup

---

## Frontend Configuration

Update your frontend to use the serverless endpoint. You can do this in one of two ways:

### Method 1: Update chatbot.js directly

Edit `script/chatbot.js` and change the default endpoint:

```javascript
function initializeApiEndpoint() {
    var config = window.CHATBOT_CONFIG || {};
    // Update this to your serverless endpoint
    apiEndpoint = config.apiEndpoint || 'https://your-deployment.vercel.app/api/chat';
    console.log('Chatbot API endpoint:', apiEndpoint);
}
```

### Method 2: Set via HTML (Recommended)

Add this to your `index.html` before the chatbot script:

```html
<script>
    window.CHATBOT_CONFIG = {
        apiEndpoint: 'https://your-deployment.vercel.app/api/chat'
    };
</script>
<script src="./script/chatbot.js"></script>
```

### Environment-Specific Configuration

For different environments, you can use:

```javascript
<script>
    // Auto-detect environment
    const isProduction = window.location.hostname !== 'localhost';
    window.CHATBOT_CONFIG = {
        apiEndpoint: isProduction 
            ? 'https://your-production.vercel.app/api/chat'
            : 'http://localhost:3000/api/chat'  // Local development
    };
</script>
```

---

## Comparison of Platforms

| Feature | Vercel | Netlify | AWS Lambda |
|---------|--------|---------|------------|
| **Free Tier** | 100GB bandwidth | 100GB bandwidth, 125K invocations | 1M requests/month |
| **Ease of Setup** | ⭐⭐⭐⭐⭐ Very Easy | ⭐⭐⭐⭐⭐ Very Easy | ⭐⭐ Moderate |
| **Deployment Speed** | ⭐⭐⭐⭐⭐ Fast | ⭐⭐⭐⭐⭐ Fast | ⭐⭐⭐ Moderate |
| **Scalability** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ Excellent |
| **Cost (after free tier)** | Low | Low | Very Low (pay per use) |
| **Global CDN** | ✅ Yes | ✅ Yes | ⚠️ Via CloudFront |
| **Git Integration** | ✅ Automatic | ✅ Automatic | ⚠️ Via CI/CD |
| **Best For** | Quick deployment, Next.js projects | Static sites, JAMstack | Enterprise, AWS ecosystem |

### Recommendation

- **For quick deployment**: Use **Vercel** or **Netlify**
- **For AWS ecosystem**: Use **AWS Lambda**
- **For maximum simplicity**: Use **Vercel**

---

## Testing Your Deployment

After deployment, test your endpoints:

### Health Check

```bash
curl https://your-deployment.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "Gemini Chatbot API (Serverless)",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Chat Endpoint

```bash
curl -X POST https://your-deployment.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, how can you help me?",
    "sessionId": "test_session_123"
  }'
```

---

## Troubleshooting

### Function Timeout

If you experience timeouts:
- **Vercel**: Increase `maxDuration` in `vercel.json` (up to 60s on Pro plan)
- **Netlify**: Increase timeout in `netlify.toml` (up to 26s on free tier)
- **AWS Lambda**: Increase timeout in Lambda configuration (up to 15 minutes)

### CORS Issues

If you see CORS errors:
- Ensure CORS headers are set in your function
- Check that your frontend domain is allowed
- For production, restrict CORS to your actual domain

### Environment Variables Not Working

- Verify variables are set in the platform dashboard
- Redeploy after setting environment variables
- Check variable names match exactly (case-sensitive)

### Cold Start Delays

Serverless functions may have a "cold start" delay on first invocation:
- This is normal and usually < 1 second
- Subsequent requests are much faster
- Consider using provisioned concurrency (paid feature) if needed

---

## Production Best Practices

1. **Use Environment-Specific Endpoints**
   - Development: Local server
   - Staging: Staging deployment
   - Production: Production deployment

2. **Monitor Usage**
   - Set up alerts for function errors
   - Monitor API costs
   - Track response times

3. **Security**
   - Never expose API keys in frontend code
   - Use environment variables
   - Restrict CORS to your domain in production
   - Consider rate limiting

4. **Performance**
   - Use connection pooling if using databases
   - Cache responses when appropriate
   - Optimize function size

---

## Next Steps

1. Choose a platform (recommend Vercel for simplicity)
2. Deploy your serverless function
3. Update frontend configuration
4. Test thoroughly
5. Monitor and optimize

For questions or issues, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)
- [AWS Lambda Docs](https://docs.aws.amazon.com/lambda/)
