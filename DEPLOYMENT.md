# Deployment Guide - Crowdin SRX Automation App

This guide will walk you through deploying the Crowdin SRX Automation App to Railway and integrating it with your Crowdin Enterprise instance at `https://strava.crowdin.com`.

## 📋 Prerequisites

- [ ] Railway account ([Sign up free at railway.app](https://railway.app))
- [ ] GitHub account (for connecting your repository)
- [ ] Access to Crowdin Enterprise organization settings
- [ ] Node.js 16+ installed locally (for testing)

## 🚀 Quick Start: Deploy to Railway

### Step 1: Install Railway CLI

```bash
# Install via npm (recommended)
npm install -g @railway/cli

# Or download from https://docs.railway.app/develop/cli
```

### Step 2: Login to Railway

```bash
railway login
```

This will open your browser to authenticate with GitHub.

### Step 3: Initialize Project

```bash
# Make sure you're in the project directory
cd "C:\Users\bjcor\Desktop\Coding Projects\Crowdin Post-Import Toolbox"

# Link to Railway (creates new project)
railway init

# When prompted:
# - Project name: crowdin-srx-automation
# - Environment: production
```

### Step 4: Set Environment Variables

You'll need to set these variables in Railway. You can do this via CLI or Railway dashboard.

#### Option A: Via Railway Dashboard (Recommended)

1. Go to [railway.app/dashboard](https://railway.app/dashboard)
2. Select your `crowdin-srx-automation` project
3. Click **"Variables"** tab
4. Add each variable below

#### Option B: Via CLI

```bash
# Crowdin OAuth Credentials (GET THESE FROM CROWDIN FIRST - see below)
railway variables set CROWDIN_CLIENT_ID=your_client_id_here
railway variables set CROWDIN_CLIENT_SECRET=your_client_secret_here

# Application Configuration
railway variables set BASE_URL=https://crowdin-srx-automation-production.up.railway.app
railway variables set NODE_ENV=production
railway variables set PORT=3000

# Security Keys (generate strong random keys)
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set ENCRYPTION_KEY=$(openssl rand -base64 32)

# Database Configuration
railway variables set DB_TYPE=sqlite
railway variables set DB_DATABASE=./data/crowdin-app.db

# Crowdin API Configuration
railway variables set CROWDIN_API_URL=https://api.crowdin.com/api/v2
railway variables set CROWDIN_ENTERPRISE_API_URL=https://strava.crowdin.com/api/v2

# SRX Configuration
railway variables set SRX_RULES_FILE=strava_help_center_srx.srx
railway variables set TARGET_PROJECT_GROUP=Strava
railway variables set TARGET_PROJECT_GROUP_ID=24
railway variables set ENABLE_AUTO_CONFIG=true

# App Metadata
railway variables set APP_NAME="Crowdin SRX Automation App"
railway variables set APP_VERSION=1.0.0
railway variables set APP_DESCRIPTION="Automatically configure SRX rules for XML files in Strava Project Group"
```

### Step 5: Deploy to Railway

```bash
# Deploy from current directory
railway up

# Railway will:
# - Detect Node.js project
# - Install dependencies (npm install)
# - Build the project (npm run build)
# - Start the server (npm run start:prod)
```

### Step 6: Get Your App URL

```bash
# Generate a public URL
railway domain

# Or check in dashboard
# URL will be: https://crowdin-srx-automation-production.up.railway.app
```

---

## 🔐 Setting Up Crowdin OAuth App (DO THIS FIRST!)

Before deploying, you need to create OAuth credentials in Crowdin Enterprise:

### Step 1: Access Organization Settings

1. Go to `https://strava.crowdin.com`
2. Click your profile icon (top right)
3. Navigate to **Organization Settings** → **OAuth Apps**

### Step 2: Create New OAuth App

1. Click **"Create Application"** or **"New OAuth App"**
2. Fill in the details:
   - **Name**: `Crowdin SRX Automation App`
   - **Description**: `Automatically configure SRX rules for XML files in Strava Project Group`
   - **Homepage URL**: `https://crowdin-srx-automation-production.up.railway.app`
   - **Authorization callback URL**: `https://crowdin-srx-automation-production.up.railway.app/auth/callback`
   - **Logo**: Upload `resources/logo.png` (optional)

### Step 3: Save Credentials

1. After creating, you'll see:
   - **Client ID**: Something like `abc123def456`
   - **Client Secret**: Something like `xyz789uvw012` (KEEP THIS SECRET!)
2. Copy both values
3. Add them to Railway environment variables (see Step 4 above)

### Step 4: Update Callback URL (After First Deploy)

If your Railway URL is different:
1. Go back to OAuth app settings in Crowdin
2. Update **Authorization callback URL** with your actual Railway URL
3. Save changes

---

## 📦 Installing the App in Crowdin Enterprise

### Step 1: Verify Deployment

Before installing, make sure your app is running:

```bash
# Check health endpoint
curl https://your-railway-url.up.railway.app/health

# Expected response:
# {"status":"ok","timestamp":"2025-01-10T..."}

# Check manifest
curl https://your-railway-url.up.railway.app/manifest.json

# Should return JSON with app details
```

### Step 2: Install Custom App in Crowdin

1. Go to `https://strava.crowdin.com`
2. Navigate to **Organization Settings** → **Apps** (or **Integrations**)
3. Click **"Install Custom App"** or **"Add Custom App"**
4. Enter your app's manifest URL:
   ```
   https://your-railway-url.up.railway.app/manifest.json
   ```
5. Click **"Install"**

### Step 3: Authorize App Permissions

Review and authorize the requested permissions:
- ✅ `project` - Access to projects
- ✅ `project.file` - Read file information
- ✅ `project.file.update` - Update file parser configuration
- ✅ `project.group` - Access to project groups

Click **"Authorize"** to complete installation.

### Step 4: Verify Installation

1. The app should appear in your **Installed Apps** list
2. Navigate to any project in the Strava group
3. Look for **"SRX Automation"** in the integrations menu

---

## ✅ Post-Deployment Verification

### Test All Endpoints

```bash
# Set your Railway URL
export APP_URL=https://your-railway-url.up.railway.app

# 1. Health check
curl $APP_URL/health

# 2. Manifest
curl $APP_URL/manifest.json

# 3. SRX rules
curl $APP_URL/srx/rules

# 4. Monitoring status
curl $APP_URL/monitoring/status

# 5. Test endpoints
curl $APP_URL/test/srx-validation
curl $APP_URL/test/monitoring-status
```

### Check Railway Logs

```bash
# Via CLI
railway logs

# Or in Railway dashboard:
# - Go to your project
# - Click "Deployments" tab
# - Click on latest deployment
# - View logs in real-time
```

### Test SRX Automation

1. **Upload a test XML file** to a project in the Strava group
2. **Wait 5 minutes** (monitoring runs every 5 minutes)
3. **Check the file's parser configuration** in Crowdin:
   - Go to project → Files
   - Click on the XML file
   - Check "File Settings" or "Parser Configuration"
   - Should include custom SRX rules
4. **Verify in logs**:
   ```bash
   railway logs --filter "FileMonitoringService"
   ```

---

## 🔧 Railway Configuration Files

Railway auto-detects your project, but here's what it uses:

### `package.json` Scripts (Already Configured)

```json
{
  "scripts": {
    "build": "nest build",
    "start:prod": "node dist/main",
    "start:dev": "nest start --watch"
  }
}
```

### Optional: Create `railway.toml` (Advanced)

If you need custom build/start commands:

```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm run start:prod"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

---

## 🔄 Updating Your App

### Deploy Updates

```bash
# Make your code changes
git add .
git commit -m "Your update message"
git push origin main

# Railway auto-deploys from GitHub
# Or manually trigger:
railway up
```

### Update Environment Variables

```bash
# Via CLI
railway variables set VARIABLE_NAME=new_value

# Or via Railway dashboard:
# Project → Variables → Edit
```

### Rollback if Needed

```bash
# Via dashboard:
# - Go to Deployments
# - Click on previous successful deployment
# - Click "Redeploy"
```

---

## 📊 Monitoring & Maintenance

### Railway Dashboard

Access at [railway.app/dashboard](https://railway.app/dashboard):
- **Deployments**: View deployment history and logs
- **Metrics**: CPU, memory, network usage
- **Variables**: Manage environment variables
- **Settings**: Configure custom domains, scaling

### Set Up Monitoring

#### 1. Enable Railway Webhooks (Optional)

Configure deployment notifications:
- Go to Project Settings → Webhooks
- Add Discord/Slack webhook for deployment notifications

#### 2. External Monitoring (Recommended)

Set up uptime monitoring:
- [UptimeRobot](https://uptimerobot.com) (free)
- [Pingdom](https://www.pingdom.com)
- Monitor: `https://your-app.up.railway.app/health`

#### 3. Error Tracking (Optional)

Integrate error tracking:
- [Sentry](https://sentry.io) - Free tier available
- Add to your NestJS app for detailed error reports

### View Logs

```bash
# Real-time logs
railway logs --follow

# Filter logs
railway logs --filter "error"
railway logs --filter "FileMonitoringService"

# Recent logs (last 100 lines)
railway logs --tail 100
```

### Check Resource Usage

```bash
# View metrics
railway status

# In dashboard:
# - Navigate to Metrics tab
# - View CPU, memory, network graphs
```

---

## 💰 Railway Pricing & Costs

### Free Tier

- **$5 free credit per month**
- **Usage-based**: $0.000231/GB-hour
- No credit card required to start

### Expected Costs for This App

| Resource | Usage | Cost/Month |
|----------|-------|------------|
| **Memory** | ~512MB average | ~$4-5 |
| **CPU** | Light usage | ~$1-2 |
| **Network** | Minimal | <$1 |
| **Total** | | **~$5-7/month** |

**With $5 free credit**: **~$0-2/month actual cost**

### Cost Optimization Tips

1. **Enable sleep on inactivity** (if app isn't mission-critical 24/7):
   - Settings → Sleep Mode
   - Wakes up on requests (adds ~5s latency)

2. **Use PostgreSQL add-on instead of SQLite** (for better persistence):
   - Railway PostgreSQL: Included in usage
   - More reliable than file-based SQLite

3. **Monitor usage regularly**:
   - Check Metrics tab
   - Set up billing alerts

---

## 🔒 Security Best Practices

### Environment Variables

- ✅ **Never commit** `.env` files to Git
- ✅ **Use strong secrets** for JWT and encryption keys
- ✅ **Rotate secrets** periodically (every 90 days)
- ✅ **Store secrets in Railway** only, not in code

### Database

- ✅ **Regular backups**: Download SQLite file periodically
- ✅ **Consider PostgreSQL**: For production, switch to Railway PostgreSQL
  ```bash
  # Add PostgreSQL to your project
  railway add postgresql
  
  # Update DB_TYPE in variables
  railway variables set DB_TYPE=postgres
  ```

### API Access

- ✅ **Crowdin credentials**: Keep Client Secret secure
- ✅ **Rate limiting**: Already configured in NestJS
- ✅ **CORS**: Properly configured for Crowdin domains

---

## 🐛 Troubleshooting

### Deployment Fails

**Issue**: Build fails during `npm install` or `npm run build`

**Solutions**:
```bash
# Check logs
railway logs

# Common fixes:
# 1. Check Node.js version in package.json
# 2. Clear Railway cache
railway run npm cache clean --force
railway up

# 3. Verify dependencies
npm install
npm run build
```

### App Crashes on Startup

**Issue**: App starts but crashes immediately

**Solutions**:
```bash
# Check logs for errors
railway logs --filter "error"

# Common causes:
# 1. Missing environment variables
railway variables

# 2. Database connection issues
railway variables set DB_DATABASE=/app/data/crowdin-app.db

# 3. Port configuration
railway variables set PORT=3000
```

### OAuth/Authentication Errors

**Issue**: Can't install app in Crowdin

**Solutions**:
1. **Verify OAuth credentials** match Crowdin:
   ```bash
   railway variables | grep CROWDIN_CLIENT
   ```

2. **Check callback URL** in Crowdin OAuth app settings:
   - Must exactly match: `https://your-app.up.railway.app/auth/callback`

3. **Verify manifest is accessible**:
   ```bash
   curl https://your-app.up.railway.app/manifest.json
   ```

### File Monitoring Not Working

**Issue**: SRX rules not being applied to XML files

**Solutions**:
```bash
# 1. Check if monitoring is enabled
curl https://your-app.up.railway.app/monitoring/status

# 2. Verify project group ID
railway variables | grep TARGET_PROJECT_GROUP

# 3. Check logs for errors
railway logs --filter "FileMonitoringService"

# 4. Manually trigger check
curl -X POST https://your-app.up.railway.app/monitoring/check
```

### Database Issues

**Issue**: Data not persisting between deployments

**Solution**: Use Railway PostgreSQL instead of SQLite:
```bash
# Add PostgreSQL
railway add postgresql

# Update environment variables
railway variables set DB_TYPE=postgres
railway variables set DB_HOST=${{PGHOST}}
railway variables set DB_PORT=${{PGPORT}}
railway variables set DB_USERNAME=${{PGUSER}}
railway variables set DB_PASSWORD=${{PGPASSWORD}}
railway variables set DB_DATABASE=${{PGDATABASE}}
```

### Port Already in Use (Local Testing)

**Issue**: `EADDRINUSE: address already in use :::3000`

**Solutions**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port locally
PORT=3001 npm run start:dev
```

---

## 🔄 Migrating from SQLite to PostgreSQL (Recommended for Production)

### Why PostgreSQL?

- ✅ **Better persistence**: Data survives redeployments
- ✅ **Better performance**: Faster queries, indexing
- ✅ **Automatic backups**: Railway handles this
- ✅ **Scalability**: Can handle more concurrent connections

### Migration Steps

1. **Add PostgreSQL to Railway**:
   ```bash
   railway add postgresql
   ```

2. **Update `package.json` dependencies**:
   ```json
   {
     "dependencies": {
       "pg": "^8.11.3",
       "typeorm": "^0.3.17"
     }
   }
   ```

3. **Update environment variables**:
   ```bash
   railway variables set DB_TYPE=postgres
   # Railway automatically provides: DATABASE_URL
   ```

4. **Update `src/config/typeorm-config.ts`**:
   ```typescript
   // Add PostgreSQL configuration
   if (this.configService.get('database.type') === 'postgres') {
     return {
       type: 'postgres',
       url: process.env.DATABASE_URL,
       entities: [__dirname + '/../**/*.entity{.ts,.js}'],
       synchronize: this.configService.get('env') !== 'production',
       ssl: { rejectUnauthorized: false },
     };
   }
   ```

5. **Deploy updated code**:
   ```bash
   git add .
   git commit -m "Migrate to PostgreSQL"
   git push origin main
   railway up
   ```

---

## 📚 Additional Resources

### Railway Documentation
- [Railway Docs](https://docs.railway.app)
- [CLI Reference](https://docs.railway.app/develop/cli)
- [Deploy Node.js Apps](https://docs.railway.app/guides/nodejs)

### Crowdin Resources
- [Crowdin Apps Documentation](https://support.crowdin.com/developer/crowdin-apps-about/)
- [Crowdin Enterprise API](https://support.crowdin.com/developer/enterprise/api/v2/)
- [App Descriptor Reference](https://support.crowdin.com/developer/app-descriptor/)
- [OAuth Apps Guide](https://support.crowdin.com/developer/authorizing-oauth-apps/)

### NestJS Resources
- [NestJS Deployment](https://docs.nestjs.com/faq/deployment)
- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [NestJS Task Scheduling](https://docs.nestjs.com/techniques/task-scheduling)

---

## 🆘 Support

### Railway Support
- **Discord**: [railway.app/discord](https://railway.app/discord)
- **Twitter**: [@Railway](https://twitter.com/Railway)
- **Email**: team@railway.app

### Crowdin Support
- **Email**: support@crowdin.com
- **Community**: [community.crowdin.com](https://community.crowdin.com)

### Project Support
- **GitHub Issues**: [github.com/Ben408/crowdin-import-toolbox/issues](https://github.com/Ben408/crowdin-import-toolbox/issues)

---

## 🎯 Quick Reference: Common Commands

```bash
# Login to Railway
railway login

# Deploy
railway up

# View logs
railway logs
railway logs --follow
railway logs --filter "error"

# Check status
railway status

# Manage variables
railway variables
railway variables set KEY=value

# Generate public URL
railway domain

# Open dashboard
railway open

# Run commands in Railway environment
railway run npm run build
railway run node dist/main.js

# Link to existing project
railway link

# Switch environments
railway environment
```

---

**Next Step**: Let's get you set up! 

1. ✅ Install Railway CLI: `npm install -g @railway/cli`
2. ✅ Create OAuth app in Crowdin (get Client ID & Secret)
3. ✅ Deploy: `railway login && railway init && railway up`

Ready to start? 🚀
