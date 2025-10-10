# Railway Quick Start Guide

## 🚀 5-Minute Deployment Checklist

### Before You Start

- [ ] Railway account created at [railway.app](https://railway.app)
- [ ] GitHub account connected to Railway
- [ ] Crowdin OAuth app created (see below)

---

## Step 1: Create Crowdin OAuth App (5 minutes)

1. Go to `https://strava.crowdin.com`
2. Navigate to: **Profile** → **Organization Settings** → **OAuth Apps**
3. Click **"Create Application"**
4. Fill in:
   - **Name**: `Crowdin SRX Automation App`
   - **Homepage URL**: `https://crowdin-srx-automation-production.up.railway.app` (temporary, will update)
   - **Callback URL**: `https://crowdin-srx-automation-production.up.railway.app/auth/callback`
5. **Save and copy**:
   - ✅ Client ID
   - ✅ Client Secret (keep this secret!)

---

## Step 2: Deploy to Railway (2 minutes)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init
# When prompted:
# - Project name: crowdin-srx-automation
# - Start with empty project: Yes

# Deploy
railway up
```

---

## Step 3: Set Environment Variables (3 minutes)

### Required Variables

Go to [railway.app/dashboard](https://railway.app/dashboard) → Your Project → **Variables**:

```bash
# Crowdin OAuth (from Step 1)
CROWDIN_CLIENT_ID=<your-client-id>
CROWDIN_CLIENT_SECRET=<your-client-secret>

# Application URLs
BASE_URL=https://crowdin-srx-automation-production.up.railway.app
NODE_ENV=production
PORT=3000

# Security (generate random strings)
JWT_SECRET=<random-32-char-string>
ENCRYPTION_KEY=<random-32-char-string>

# Database
DB_TYPE=sqlite
DB_DATABASE=./data/crowdin-app.db

# Crowdin API
CROWDIN_API_URL=https://api.crowdin.com/api/v2
CROWDIN_ENTERPRISE_API_URL=https://strava.crowdin.com/api/v2

# SRX Configuration
SRX_RULES_FILE=strava_help_center_srx.srx
TARGET_PROJECT_GROUP=Strava
TARGET_PROJECT_GROUP_ID=24
ENABLE_AUTO_CONFIG=true

# App Info
APP_NAME=Crowdin SRX Automation App
APP_VERSION=1.0.0
APP_DESCRIPTION=Automatically configure SRX rules for XML files in Strava Project Group
```

### Generate Secure Keys

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY
openssl rand -base64 32
```

---

## Step 4: Get Your Railway URL

```bash
# Generate public domain
railway domain

# Copy the URL (looks like):
# https://crowdin-srx-automation-production.up.railway.app
```

**Important**: Update the OAuth app in Crowdin with this actual URL!

---

## Step 5: Update Crowdin OAuth App

1. Go back to Crowdin OAuth app settings
2. Update:
   - **Homepage URL**: `https://your-actual-railway-url.up.railway.app`
   - **Callback URL**: `https://your-actual-railway-url.up.railway.app/auth/callback`
3. Save

---

## Step 6: Install App in Crowdin (2 minutes)

1. Go to `https://strava.crowdin.com`
2. Navigate to: **Organization Settings** → **Apps**
3. Click **"Install Custom App"**
4. Enter: `https://your-railway-url.up.railway.app/manifest.json`
5. Click **"Install"** and **"Authorize"**

---

## ✅ Verify Deployment

```bash
# Check health
curl https://your-railway-url.up.railway.app/health

# Check manifest
curl https://your-railway-url.up.railway.app/manifest.json

# Check monitoring
curl https://your-railway-url.up.railway.app/monitoring/status
```

---

## 📊 View Logs

```bash
# Via CLI
railway logs

# Or in dashboard:
# Project → Deployments → Latest → View Logs
```

---

## 🔄 Deploy Updates

```bash
# Make changes to code
git add .
git commit -m "Your changes"
git push origin main

# Railway auto-deploys from GitHub!
# Or manually:
railway up
```

---

## 🐛 Quick Troubleshooting

### App won't start
```bash
railway logs --filter "error"
# Check for missing environment variables
```

### OAuth errors
- Verify callback URL matches exactly in Crowdin
- Check Client ID and Secret are correct

### Files not being configured
```bash
# Manually trigger check
curl -X POST https://your-railway-url.up.railway.app/monitoring/check

# Check logs
railway logs --filter "FileMonitoringService"
```

---

## 💰 Expected Costs

- **Free tier**: $5 credit/month
- **This app**: ~$5-7/month
- **Actual cost**: ~$0-2/month after free credit

---

## 📚 Full Documentation

See `DEPLOYMENT.md` for complete details!

---

## 🆘 Need Help?

- Railway Discord: [railway.app/discord](https://railway.app/discord)
- Crowdin Support: support@crowdin.com
- GitHub Issues: [github.com/Ben408/crowdin-import-toolbox/issues](https://github.com/Ben408/crowdin-import-toolbox/issues)

