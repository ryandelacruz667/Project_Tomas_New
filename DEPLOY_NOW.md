# 🚀 Deploy to Vercel - Quick Steps

## Fastest Way (5 minutes)

### 1️⃣ Push to GitHub (if not already)

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push
```

### 2️⃣ Go to Vercel

1. Visit: https://vercel.com
2. Click **"Sign Up"** (or "Log In")
3. Use **GitHub** to sign in (easiest)

### 3️⃣ Import Project

1. Click **"Add New..."** → **"Project"**
2. Select your **GitHub repository**
3. Click **"Import"**

### 4️⃣ Configure (Use These Settings)

- **Framework Preset**: `Other`
- **Root Directory**: `./` (leave as default)
- **Build Command**: (leave empty)
- **Output Directory**: `./` (leave as default)
- **Install Command**: `npm install`

Click **"Deploy"** and wait 1-2 minutes! ⏳

### 5️⃣ Set Environment Variables

After deployment:

1. Go to **Settings** → **Environment Variables**
2. Click **"Add New"**
3. Add:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: `your_api_key_here`
   - **Environment**: Select all (☑️ Production, ☑️ Preview, ☑️ Development)
4. Click **"Save"**

### 6️⃣ Redeploy

1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **"Redeploy"**

### 7️⃣ Configure AI Gateway

1. Go to **Settings** → **AI Gateway**
2. Click **"Add Provider"**
3. Select **"Google"**
4. Enter your `GEMINI_API_KEY`
5. Click **"Save"**

### 8️⃣ Test! 🎉

Your site is live at: `https://your-project.vercel.app`

Test the chatbot:
- Visit your site
- Click the robot icon (bottom right)
- Send a message!

---

## Alternative: Use CLI

```bash
# Install
npm install -g vercel

# Login
vercel login

# Deploy
cd "c:\Users\RyanDelacruz\Documents\Project_Tomas_New"
vercel --prod

# Set environment variables
vercel env add GEMINI_API_KEY
# (Enter your API key when prompted)
```

---

## ✅ Checklist

- [ ] Code pushed to GitHub
- [ ] Project imported to Vercel
- [ ] Environment variables set
- [ ] AI Gateway configured
- [ ] Site tested and working

---

## 🆘 Need Help?

See `VERCEL_DEPLOYMENT_GUIDE.md` for detailed instructions.

---

**That's it! Your chatbot is now live! 🎊**
