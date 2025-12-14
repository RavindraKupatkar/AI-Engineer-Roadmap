# 🚀 NeuroMap - Deployment Guide

## 📦 What We Fixed

✅ **Security:** API key now hidden in serverless function (not exposed to browser)  
✅ **Architecture:** Created `/api/gemini.ts` serverless endpoint  
✅ **Configuration:** Added Vercel deployment config  
✅ **Environment:** Created `.env.example` template  

---

## 🎯 Deploy to Vercel (FREE - 5 minutes)

### Step 1: Install Dependencies
```powershell
npm install
```

### Step 2: Test Locally (Optional)
```powershell
# Create .env.local file with your API key
cp .env.example .env.local
# Edit .env.local and add your Gemini API key

# Run development server
npm run dev
```

### Step 3: Deploy to Vercel

#### Option A: Deploy via Vercel CLI (Recommended)
```powershell
# Install Vercel CLI
npm install -g vercel

# Login to Vercel (creates free account if needed)
vercel login

# Deploy (follow prompts)
vercel

# Set environment variable
vercel env add GEMINI_API_KEY
# Paste your Gemini API key when prompted
# Select: Production, Preview, Development (all three)

# Deploy to production
vercel --prod
```

#### Option B: Deploy via GitHub + Vercel Dashboard
1. Push your code to GitHub:
```powershell
git add .
git commit -m "Secure deployment setup"
git push origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Vercel auto-detects settings ✅
6. Add Environment Variable:
   - Key: `GEMINI_API_KEY`
   - Value: Your Gemini API key
7. Click **"Deploy"** 🚀

---

## 🔑 Get Your Gemini API Key (FREE)

1. Visit: https://ai.google.dev/
2. Click **"Get API Key"**
3. Sign in with Google
4. Create a new API key
5. Copy the key

---

## 🌐 Alternative FREE Deployment Options

### Netlify
```powershell
npm install -g netlify-cli
netlify login
netlify deploy --prod
# Set GEMINI_API_KEY in Netlify dashboard
```

### Cloudflare Pages
1. Push to GitHub
2. Connect at [pages.cloudflare.com](https://pages.cloudflare.com)
3. Add `GEMINI_API_KEY` environment variable

---

## ✅ Verify Deployment

After deployment:
1. Visit your deployed URL
2. Check browser DevTools → Network → Look for `/api/gemini` requests
3. Inspect → Sources → No `GEMINI_API_KEY` should be visible ✅

---

## 🐛 Troubleshooting

**Build fails?**
```powershell
npm run build
# Check for TypeScript errors
```

**API not working?**
- Verify `GEMINI_API_KEY` is set in Vercel dashboard
- Check serverless function logs in Vercel dashboard

**Still issues?**
- Check Vercel logs: `vercel logs`
- Ensure `.env.local` is NOT committed to Git

---

## 📁 Files Changed

- ✅ `api/gemini.ts` - Serverless API endpoint
- ✅ `services/geminiService.ts` - Updated to use API endpoint
- ✅ `vite.config.ts` - Removed API key exposure
- ✅ `package.json` - Added @vercel/node
- ✅ `vercel.json` - Deployment configuration
- ✅ `.env.example` - Environment template
- ✅ `.gitignore` - Ensure .env.local is ignored

---

## 🎉 Your App is Now:
- ✅ Secure (API key hidden)
- ✅ Free to host (Vercel free tier)
- ✅ Production-ready
- ✅ Auto-deployed on git push

**Live URL:** Will be `https://your-project.vercel.app`
