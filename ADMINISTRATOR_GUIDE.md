# 🔧 **Crowdin SRX Automation App - Administrator's Guide**

## 📋 **Overview**
This guide provides comprehensive instructions for IT administrators to manage the Crowdin SRX Automation App, including deployments, configurations, troubleshooting, and support procedures.

---

## 🏗️ **Architecture Overview**

### **System Components:**
- **Application**: NestJS-based Crowdin app
- **Hosting**: Railway.app (production deployment)
- **Code Repository**: GitHub (Ben408/crowdin-import-toolbox)
- **Database**: SQLite (persistent storage)
- **Integration**: Crowdin Enterprise API
- **Target Environment**: Crowdin Enterprise (strava.crowdin.com)

### **Key URLs:**
- **App Interface**: `https://crowdin-import-toolbox-production.up.railway.app`
- **GitHub Repository**: `https://github.com/Ben408/crowdin-import-toolbox`
- **Railway Dashboard**: `https://railway.app/dashboard`
- **Crowdin OAuth Apps**: `https://strava.crowdin.com/u/system-settings/oauth-apps`

---

## 🔐 **Access and Authentication**

### **Required Access:**
1. **GitHub**: Repository admin access
2. **Railway**: Project owner access
3. **Crowdin Enterprise**: Organization admin access
4. **Local Development**: Node.js, Git, Railway CLI

### **Installation Prerequisites:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Install Node.js dependencies
npm install

# Login to Railway
railway login
```

---

## ⚙️ **Configuration Management**

### **Environment Variables (Railway)**

#### **Core Application Settings:**
```bash
# Application Configuration
APP_NAME=Crowdin SRX Automation App
APP_VERSION=1.0.0
NODE_ENV=production
PORT=3000

# Database
DB_TYPE=sqlite
DB_DATABASE=./data/crowdin-app.db

# Security Keys (generate new ones for production)
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here
```

#### **Crowdin Integration:**
```bash
# Crowdin OAuth (from Crowdin Enterprise)
CROWDIN_CLIENT_ID=rC3A4VTNGbOhA1tS4nYj
CROWDIN_CLIENT_SECRET=5zpJ2SUWGgF3K7kFndWPyz1Ig4Br4d5CLx5eGBLe

# API Endpoints
CROWDIN_API_URL=https://api.crowdin.com/api/v2
CROWDIN_ENTERPRISE_API_URL=https://strava.crowdin.com/api/v2
```

#### **Target Configuration (CRITICAL):**
```bash
# Target Group (change this to control scope)
TARGET_PROJECT_GROUP=SRX Testing
TARGET_PROJECT_GROUP_ID=62

# Specific Projects (optional - comma-separated IDs)
TARGET_PROJECT_IDS=

# Safety Controls
ENABLE_AUTO_CONFIG=false  # Set to true only when ready
SRX_RULES_FILE=strava_help_center_srx.srx
```

### **Configuration Commands:**
```bash
# View all variables
railway variables

# Set individual variables
railway variables --set "TARGET_PROJECT_GROUP_ID=62"
railway variables --set "ENABLE_AUTO_CONFIG=false"

# Set multiple variables
railway variables --set "TARGET_PROJECT_GROUP=SRX Testing" --set "ENABLE_AUTO_CONFIG=false"
```

---

## 🚀 **Deployment Procedures**

### **Standard Deployment (GitHub to Railway):**
```bash
# 1. Make changes locally
git add .
git commit -m "Your change description"
git push origin main

# 2. Railway automatically deploys
railway up  # Trigger manual deployment if needed

# 3. Verify deployment
railway logs --tail 20
```

### **Emergency Deployment:**
```bash
# Quick rollback to previous version
git revert HEAD
git push origin main

# Or deploy specific commit
git checkout <commit-hash>
git push origin main --force
```

### **Database Management:**
```bash
# Database is SQLite, stored in Railway volume
# Backup: Download from Railway dashboard
# Restore: Upload via Railway dashboard
```

---

## 🔧 **Common Administrative Tasks**

### **1. Change Target Group**
```bash
# Step 1: Update environment variables
railway variables --set "TARGET_PROJECT_GROUP_ID=new_group_id"
railway variables --set "TARGET_PROJECT_GROUP=new_group_name"

# Step 2: Verify changes
railway variables | findstr -i "TARGET"

# Step 3: Test configuration
curl https://crowdin-import-toolbox-production.up.railway.app/health
```

### **2. Enable/Disable Auto-Configuration**
```bash
# Disable (Emergency Stop)
railway variables --set "ENABLE_AUTO_CONFIG=false"

# Enable (When Ready)
railway variables --set "ENABLE_AUTO_CONFIG=true"

# Verify status
railway variables | findstr -i "ENABLE"
```

### **3. Target Specific Projects**
```bash
# Target only specific projects within a group
railway variables --set "TARGET_PROJECT_IDS=123,456,789"

# Clear project filter (target all projects in group)
railway variables --set "TARGET_PROJECT_IDS="
```

### **4. Update SRX Rules**
```bash
# 1. Update the SRX file locally
# Edit: strava_help_center_srx.srx

# 2. Commit and deploy
git add strava_help_center_srx.srx
git commit -m "Update SRX rules"
git push origin main
```

---

## 🛠️ **Troubleshooting Guide**

### **Application Issues**

#### **App Not Responding:**
```bash
# Check deployment status
railway status

# View recent logs
railway logs --tail 50

# Check health endpoint
curl https://crowdin-import-toolbox-production.up.railway.app/health
```

#### **Database Connection Issues:**
```bash
# Check database configuration
railway variables | findstr -i "DB_"

# Restart application
railway up
```

#### **Crowdin API Issues:**
```bash
# Verify OAuth credentials
railway variables | findstr -i "CROWDIN"

# Test API connectivity
curl https://crowdin-import-toolbox-production.up.railway.app/test
```

### **Common Error Scenarios**

#### **Error: "Cannot find module"**
```bash
# Check build process
railway logs | grep -i "build"

# Redeploy
railway up
```

#### **Error: "Failed to lookup view"**
```bash
# Views directory issue - check deployment
railway logs | grep -i "view"

# Redeploy
git push origin main
```

#### **Error: "Request failed with status code 404"**
```bash
# Check Crowdin API credentials
railway variables | findstr -i "CROWDIN_CLIENT"

# Verify target group exists
# Check: https://strava.crowdin.com/u/groups/{group_id}
```

### **Log Analysis:**
```bash
# View all logs
railway logs

# Filter by specific service
railway logs --service crowdin-import-toolbox

# Follow logs in real-time
railway logs --follow
```

---

## 🔒 **Security Management**

### **OAuth Credentials:**
1. **Rotate Credentials:**
   - Go to: `https://strava.crowdin.com/u/system-settings/oauth-apps`
   - Find "Crowdin SRX Automation App"
   - Click "EDIT"
   - Generate new Client Secret
   - Update Railway: `railway variables --set "CROWDIN_CLIENT_SECRET=new_secret"`

### **Security Keys:**
```bash
# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate new encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Update in Railway
railway variables --set "JWT_SECRET=new_jwt_secret"
railway variables --set "ENCRYPTION_KEY=new_encryption_key"
```

### **Access Control:**
- **GitHub**: Repository access should be limited to authorized developers
- **Railway**: Project access should be limited to administrators
- **Crowdin**: OAuth app should only have necessary scopes

---

## 📊 **Monitoring and Maintenance**

### **Health Checks:**
```bash
# Application health
curl https://crowdin-import-toolbox-production.up.railway.app/health

# Test endpoint
curl https://crowdin-import-toolbox-production.up.railway.app/test

# Manifest
curl https://crowdin-import-toolbox-production.up.railway.app/manifest.json
```

### **Performance Monitoring:**
```bash
# Check Railway metrics
# Go to: https://railway.app/dashboard
# View: CPU, Memory, Network usage

# Check application logs for errors
railway logs | grep -i "error\|exception"
```

### **Regular Maintenance Tasks:**
1. **Weekly**: Review logs for errors
2. **Monthly**: Check Railway usage and costs
3. **Quarterly**: Review and rotate security credentials
4. **As Needed**: Update dependencies and security patches

---

## 🆘 **Support Procedures**

### **User Support Requests:**

#### **"App is not working"**
1. Check app health: `curl https://crowdin-import-toolbox-production.up.railway.app/health`
2. Check Railway status: `railway status`
3. Review logs: `railway logs --tail 20`
4. Verify target group configuration

#### **"SRX rules not being applied"**
1. Check auto-configuration: `railway variables | findstr -i "ENABLE"`
2. Verify target group: `railway variables | findstr -i "TARGET"`
3. Check Crowdin API connectivity
4. Review file monitoring logs

#### **"Wrong projects being affected"**
1. **IMMEDIATE**: Disable auto-config: `railway variables --set "ENABLE_AUTO_CONFIG=false"`
2. Check target group configuration
3. Verify project filtering settings
4. Review monitoring logs

### **Emergency Procedures:**

#### **Stop All Automation:**
```bash
railway variables --set "ENABLE_AUTO_CONFIG=false"
```

#### **Change Target Group:**
```bash
railway variables --set "TARGET_PROJECT_GROUP_ID=safe_group_id"
```

#### **Rollback Deployment:**
```bash
git revert HEAD
git push origin main
```

---

## 📋 **Maintenance Checklist**

### **Daily:**
- [ ] Check application health endpoint
- [ ] Review error logs
- [ ] Verify target group configuration

### **Weekly:**
- [ ] Review Railway usage metrics
- [ ] Check for security updates
- [ ] Verify OAuth app status in Crowdin

### **Monthly:**
- [ ] Review and clean up logs
- [ ] Check database size
- [ ] Update dependencies if needed
- [ ] Review access permissions

### **Quarterly:**
- [ ] Rotate security credentials
- [ ] Review and update documentation
- [ ] Security audit of configurations
- [ ] Backup database

---

## 📞 **Contact Information**

### **Internal Contacts:**
- **Development Team**: [Your dev team contact]
- **Crowdin Admin**: [Your Crowdin admin contact]
- **IT Support**: [Your IT support contact]

### **External Resources:**
- **Railway Support**: https://railway.app/help
- **Crowdin Support**: https://support.crowdin.com/
- **GitHub Support**: https://support.github.com/

---

## 📚 **Additional Resources**

### **Documentation:**
- **Project README**: `https://github.com/Ben408/crowdin-import-toolbox/blob/main/README.md`
- **Crowdin Apps Guide**: `https://support.crowdin.com/developer/crowdin-apps-about/`
- **Railway Documentation**: `https://docs.railway.app/`

### **Useful Commands Reference:**
```bash
# Railway CLI
railway login
railway status
railway logs
railway variables
railway up

# Git
git status
git log --oneline
git diff
git push origin main

# Application
curl https://crowdin-import-toolbox-production.up.railway.app/health
curl https://crowdin-import-toolbox-production.up.railway.app/test
```

---

**Administrator's Guide Version**: 1.0  
**Last Updated**: October 10, 2025  
**Target Environment**: Production Railway Deployment  
**Maintenance Level**: High (Production System)
