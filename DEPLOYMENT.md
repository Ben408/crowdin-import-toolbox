# Deployment Guide - Crowdin SRX Automation App

This guide will walk you through deploying the Crowdin SRX Automation App and integrating it with your Crowdin Enterprise instance at `https://strava.crowdin.com`.

## 📋 Prerequisites

- [ ] Node.js 16+ installed
- [ ] Docker installed (for containerized deployment)
- [ ] Access to Crowdin Enterprise organization settings
- [ ] A public hosting service account (Heroku, AWS, Google Cloud, Azure, or DigitalOcean)

## 🚀 Deployment Options

### Option 1: Heroku (Recommended for Quick Setup)

#### Step 1: Install Heroku CLI
```bash
# Download from https://devcenter.heroku.com/articles/heroku-cli
# Or install via npm
npm install -g heroku
```

#### Step 2: Login and Create App
```bash
heroku login
heroku create crowdin-srx-automation-strava
```

#### Step 3: Add Buildpacks
```bash
heroku buildpacks:add heroku/nodejs
```

#### Step 4: Set Environment Variables
```bash
# Crowdin OAuth Credentials (get these from Crowdin Enterprise)
heroku config:set CROWDIN_CLIENT_ID=your_client_id_here
heroku config:set CROWDIN_CLIENT_SECRET=your_client_secret_here

# Application Configuration
heroku config:set BASE_URL=https://crowdin-srx-automation-strava.herokuapp.com
heroku config:set NODE_ENV=production
heroku config:set PORT=3000

# Security Keys
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set ENCRYPTION_KEY=$(openssl rand -base64 32)

# Database Configuration
heroku config:set DB_TYPE=sqlite
heroku config:set DB_DATABASE=./data/crowdin-app.db

# Crowdin API Configuration
heroku config:set CROWDIN_API_URL=https://api.crowdin.com/api/v2
heroku config:set CROWDIN_ENTERPRISE_API_URL=https://strava.crowdin.com/api/v2

# SRX Configuration
heroku config:set SRX_RULES_FILE=strava_help_center_srx.srx
heroku config:set TARGET_PROJECT_GROUP=Strava
heroku config:set TARGET_PROJECT_GROUP_ID=24
heroku config:set ENABLE_AUTO_CONFIG=true

# App Metadata
heroku config:set APP_NAME="Crowdin SRX Automation App"
heroku config:set APP_VERSION=1.0.0
heroku config:set APP_DESCRIPTION="Automatically configure SRX rules for XML files in Strava Project Group"
```

#### Step 5: Deploy
```bash
git push heroku main
```

#### Step 6: Open App
```bash
heroku open
heroku logs --tail  # Monitor logs
```

---

### Option 2: Docker + Cloud Hosting (AWS, Google Cloud, Azure)

#### Step 1: Build Docker Image
```bash
docker build -t crowdin-srx-automation .
```

#### Step 2: Tag for Your Registry
```bash
# For AWS ECR
docker tag crowdin-srx-automation:latest <aws-account-id>.dkr.ecr.<region>.amazonaws.com/crowdin-srx-automation:latest

# For Google Container Registry
docker tag crowdin-srx-automation:latest gcr.io/<project-id>/crowdin-srx-automation:latest

# For Azure Container Registry
docker tag crowdin-srx-automation:latest <registry-name>.azurecr.io/crowdin-srx-automation:latest
```

#### Step 3: Push to Registry
```bash
# AWS ECR
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <aws-account-id>.dkr.ecr.<region>.amazonaws.com
docker push <aws-account-id>.dkr.ecr.<region>.amazonaws.com/crowdin-srx-automation:latest

# Google Cloud
gcloud auth configure-docker
docker push gcr.io/<project-id>/crowdin-srx-automation:latest

# Azure
az acr login --name <registry-name>
docker push <registry-name>.azurecr.io/crowdin-srx-automation:latest
```

#### Step 4: Deploy to Cloud Service
Follow your cloud provider's documentation for deploying containers.

---

### Option 3: DigitalOcean App Platform

#### Step 1: Create App on DigitalOcean
1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Connect your GitHub repository: `Ben408/crowdin-import-toolbox`
4. Select `main` branch

#### Step 2: Configure Build & Run
- **Build Command**: `npm run build`
- **Run Command**: `npm run start:prod`
- **HTTP Port**: `3000`

#### Step 3: Set Environment Variables
Add all the environment variables from `env.example` in the DigitalOcean dashboard.

#### Step 4: Deploy
Click "Deploy" and wait for the build to complete.

---

## 🔐 Setting Up Crowdin OAuth App

Before deploying, you need to create an OAuth app in Crowdin Enterprise:

### Step 1: Access Organization Settings
1. Go to `https://strava.crowdin.com`
2. Navigate to **Organization Settings** → **OAuth Apps**

### Step 2: Create New OAuth App
1. Click **"Create Application"**
2. Fill in the details:
   - **Name**: `Crowdin SRX Automation App`
   - **Description**: `Automatically configure SRX rules for XML files`
   - **Homepage URL**: `https://your-deployed-app-url.com`
   - **Authorization callback URL**: `https://your-deployed-app-url.com/auth/callback`
   - **Logo**: Upload `resources/logo.png`

### Step 3: Save Credentials
1. Copy the **Client ID** and **Client Secret**
2. Update your environment variables with these credentials

---

## 📦 Installing the App in Crowdin Enterprise

### Step 1: Access Apps Section
1. Go to `https://strava.crowdin.com`
2. Navigate to **Organization Settings** → **Apps** (or **Integrations**)

### Step 2: Install Custom App
1. Click **"Install Custom App"** or **"Add App"**
2. Enter your app's manifest URL: `https://your-deployed-app-url.com/manifest.json`
3. Click **"Install"**

### Step 3: Authorize App
1. Review the requested permissions:
   - ✅ `project` - Access to projects
   - ✅ `project.file` - Read file information
   - ✅ `project.file.update` - Update file parser configuration
   - ✅ `project.group` - Access to project groups
2. Click **"Authorize"**

### Step 4: Verify Installation
1. The app should now appear in your installed apps
2. Navigate to a project in the Strava group
3. Look for the **SRX Automation** integration in the project menu

---

## ✅ Post-Deployment Verification

### Test the App
```bash
# 1. Check health endpoint
curl https://your-deployed-app-url.com/health

# 2. Check manifest
curl https://your-deployed-app-url.com/manifest.json

# 3. Check SRX rules
curl https://your-deployed-app-url.com/srx/rules

# 4. Check monitoring status
curl https://your-deployed-app-url.com/monitoring/status
```

### Monitor Logs
```bash
# Heroku
heroku logs --tail --app crowdin-srx-automation-strava

# Docker
docker logs -f <container-id>

# Cloud providers have their own logging dashboards
```

### Test SRX Automation
1. Upload an XML file to a project in the Strava group
2. Wait for the scheduled check (runs every 5 minutes)
3. Verify the file's parser configuration includes the SRX rules
4. Check the app logs for confirmation

---

## 🔧 Troubleshooting

### App Installation Fails
- **Check**: Manifest URL is publicly accessible
- **Check**: OAuth credentials are correct
- **Check**: App is running and healthy

### Authentication Errors
- **Check**: `CROWDIN_CLIENT_ID` and `CROWDIN_CLIENT_SECRET` match Crowdin OAuth app
- **Check**: Redirect URI matches exactly
- **Check**: Scopes are correctly defined in manifest

### File Configuration Not Applied
- **Check**: `TARGET_PROJECT_GROUP_ID` is correct (should be `24` for Strava)
- **Check**: File monitoring is enabled (`ENABLE_AUTO_CONFIG=true`)
- **Check**: App has proper permissions to update files
- **Check**: App logs for errors

### Database Issues
- **Check**: Data directory exists and is writable
- **Check**: SQLite database file has proper permissions
- **For Heroku**: Use PostgreSQL add-on for persistent storage

---

## 🔄 Updating the App

### Code Updates
```bash
# Make your changes
git add .
git commit -m "Your update message"
git push heroku main  # For Heroku
git push origin main  # For other platforms
```

### Environment Variable Updates
```bash
# Heroku
heroku config:set VARIABLE_NAME=new_value

# Docker - update your docker-compose.yml or deployment configuration
# Cloud platforms - update via their dashboard
```

---

## 📊 Monitoring & Maintenance

### Set Up Monitoring
- Enable application performance monitoring (APM)
- Set up error tracking (e.g., Sentry, Rollbar)
- Configure uptime monitoring (e.g., UptimeRobot, Pingdom)

### Regular Maintenance
- Monitor app logs for errors
- Check file configuration success rate
- Update dependencies regularly: `npm update`
- Review security audit: `npm audit`

---

## 🆘 Support

For assistance:
- **Crowdin Support**: support@crowdin.com
- **GitHub Issues**: https://github.com/Ben408/crowdin-import-toolbox/issues
- **Crowdin Developer Portal**: https://support.crowdin.com/developer/

---

## 📚 Additional Resources

- [Crowdin Apps Documentation](https://support.crowdin.com/developer/crowdin-apps-about/)
- [Crowdin Enterprise API](https://support.crowdin.com/developer/enterprise/api/v2/)
- [App Descriptor Reference](https://support.crowdin.com/developer/app-descriptor/)
- [Publishing Crowdin Apps](https://support.crowdin.com/developer/publishing/)

---

**Next Step**: Choose your deployment option and follow the steps above to get your app live! 🚀

