# Crowdin SRX Automation App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NestJS](https://img.shields.io/badge/NestJS-8.0-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.2-blue.svg)](https://www.typescriptlang.org/)

> Automate SRX (Segmentation Rules eXchange) configuration for XML files in Crowdin projects within the Strava Project Group, eliminating manual parser configuration for project managers.

## 🎯 Overview

This Crowdin app automatically detects XML file uploads to projects within the Strava Project Group and applies standardized SRX rules and parser configuration settings to ensure consistent segmentation across all projects.

### Problem Solved
- **Time-consuming manual work** - PMs currently spend 5-10 minutes per project configuring parser settings
- **Inconsistent segmentation** - Manual configuration leads to variations across projects
- **Risk of configuration errors** - Human error in copying/pasting SRX rules
- **Poor scalability** - Manual process doesn't scale with project growth

### Solution
- **Automatic Detection** - Real-time monitoring of XML file uploads to Strava group projects
- **Standardized Configuration** - Consistent application of SRX rules and parser settings
- **Zero Manual Work** - Fully automated process requiring no PM intervention
- **Error Prevention** - Eliminates human error in configuration

## 🚀 Features

### Core Automation
- **Real-time XML Detection** - Monitors file uploads specifically in Strava Project Group
- **Automatic SRX Application** - Applies complete `strava_help_center_srx.srx` rules
- **Full Parser Configuration** - Automates all required parser settings
- **Smart Processing** - Only applies rules when needed

### Management & Monitoring
- **Status Dashboard** - Overview of Strava group project configurations
- **Audit Trail** - Complete log of all automated actions
- **Configuration Validation** - Ensures settings match required template
- **Error Handling** - Graceful recovery from configuration failures

### Security & Isolation
- **OAuth 2.0 Authentication** - Secure access to Crowdin APIs
- **Permission Scoping** - Limited to Strava group project access only
- **Isolated Environment** - Runs in distinct virtual environment
- **Audit Logging** - Track all configuration changes

## 🏗️ Architecture

### Technology Stack
- **Framework:** [NestJS](https://nestjs.com/) (TypeScript/Node.js)
- **Template:** [Crowdin create-crowdin-app](https://github.com/crowdin/create-crowdin-app)
- **UI:** Crowdin UI Kit + Handlebars templates
- **Database:** SQLite with TypeORM
- **Authentication:** OAuth 2.0 with Crowdin
- **Integration:** `@crowdin/crowdin-apps-functions`

### Core Components
1. **File Upload Listener** - Monitors Strava group XML file uploads
2. **Parser Configuration Checker** - Verifies current SRX configuration status
3. **SRX Rule Applicator** - Applies immutable SRX rules
4. **Configuration Manager** - Automates all parser settings

## 📋 Requirements

### Prerequisites
- Node.js 14+ and npm/yarn
- Crowdin Enterprise account with Strava Project Group
- OAuth app credentials from Crowdin
- Isolated development environment (Docker recommended)

### Environment Variables

#### Required Crowdin Credentials
```bash
# Crowdin OAuth App Configuration
CROWDIN_CLIENT_ID=your_crowdin_client_id_here
CROWDIN_CLIENT_SECRET=your_crowdin_client_secret_here

# Crowdin API Endpoints
CROWDIN_API_URL=https://api.crowdin.com
CROWDIN_ENTERPRISE_API_URL=https://strava.crowdin.com/api/v2
```

#### Application Configuration
```bash
# Base URL for the deployed application
BASE_URL=https://your-app-domain.com

# Database Configuration (SQLite)
DB_TYPE=sqlite
DB_DATABASE=crowdin_srx_app.db

# Security Keys (generate secure random strings)
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here
```

#### SRX Configuration (Configurable)
```bash
# SRX Rules File (default: strava_help_center_srx.srx)
SRX_RULES_FILE=strava_help_center_srx.srx

# Target Project Group Configuration
TARGET_PROJECT_GROUP=Strava
TARGET_PROJECT_GROUP_ID=24

# Auto Configuration Settings
ENABLE_AUTO_CONFIG=true
```

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-org/crowdin-srx-automation-app.git
cd crowdin-srx-automation-app
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Set Up Environment
```bash
cp .env.example .env
# Edit .env with your Crowdin credentials
```

### 4. Run Development Server
```bash
npm run start:dev
# or
yarn start:dev
```

### 5. Configure Crowdin App

#### Create Crowdin App
1. Go to [Crowdin Developer Portal](https://support.crowdin.com/developer)
2. Create a new Crowdin App
3. Configure OAuth settings with your app's callback URL
4. Note the Client ID and Client Secret

#### Configure App Permissions
The app requires the following scopes:
- `project` - Access to project information
- `file` - Access to file operations  
- `group` - Access to project group information

#### Install App in Crowdin
1. Navigate to your Crowdin organization settings
2. Go to Apps section
3. Install your custom app
4. Grant necessary permissions

### 6. Test the Application
```bash
# Test SRX rules validation
curl http://localhost:3000/test/srx-validation

# Test XML sample analysis
curl http://localhost:3000/test/xml-samples

# Test monitoring status
curl http://localhost:3000/test/monitoring-status
```

## 🚀 Deployment

### Docker Deployment (Recommended)
```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t crowdin-srx-app .
docker run -p 3000:3000 --env-file .env crowdin-srx-app
```

### Cloud Deployment Options
- **Heroku:** Use the provided Procfile
- **AWS/GCP/Azure:** Deploy as containerized application
- **Railway/Render:** Direct deployment from GitHub repository

### Production Checklist
- [ ] Configure all required environment variables
- [ ] Set up Crowdin OAuth app with production URLs
- [ ] Deploy to isolated environment
- [ ] Test connectivity with Crowdin API
- [ ] Monitor application logs
- [ ] Verify SRX automation is working

## 🔧 Development

### Available Scripts
```bash
npm run start          # Start production server
npm run start:dev      # Start development server with hot reload
npm run start:debug    # Start with debugging enabled
npm run build          # Build for production
npm run test           # Run unit tests
npm run test:e2e       # Run end-to-end tests
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
```

### Project Structure
```
src/
├── config/           # Configuration files
├── controller/       # HTTP controllers
├── decorator/        # Custom decorators
├── entity/           # Database entities
├── guard/            # Authentication guards
├── migration/        # Database migrations
├── model/            # Data models
├── service/          # Business logic services
└── main.ts          # Application entry point
```

## 📊 SRX Rules

### Current Rules (Immutable)
The app applies the complete `strava_help_center_srx.srx` file content:

```xml
<srx xmlns="http://www.lisa.org/srx20" version="2.0">
    <header segmentsubflows="yes" cascade="no">
        <formathandle type="start" include="no"></formathandle>
        <formathandle type="end" include="yes"></formathandle>
        <formathandle type="isolated" include="no"></formathandle>
    </header>
    <body>
        <languagerules>
            <languagerule languagerulename="default">
                <rule break="yes">
                    <beforebreak>&lt;/p&gt;</beforebreak>
                    <afterbreak>[\s\S]</afterbreak>
                </rule>
                <rule break="yes">
                    <beforebreak>&lt;/h.*?&gt;</beforebreak>
                    <afterbreak>[\s\S]</afterbreak>
                </rule>
                <rule break="yes">
                    <beforebreak>&lt;/li&gt;</beforebreak>
                    <afterbreak>[\s\S]</afterbreak>
                </rule>
            </languagerule>
        </languagerules>
        <maprules>
            <languagemap languagepattern=".*" languagerulename="default"></languagemap>
        </maprules>
    </body>
</srx>
```

**⚠️ CRITICAL:** This SRX file must NEVER be modified. The app reads it as-is and applies the complete content.

## 🎯 Parser Configuration

The app automatically configures these exact settings for XML files:

- ✅ **Translate content:** Enabled
- ✅ **Translate attributes:** Enabled
- ✅ **Translatable elements:** Empty (default)
- ✅ **Enable content segmentation:** Enabled
- ✅ **Use custom segmentation rules:** Enabled
- ✅ **SRX rules:** Complete content from `strava_help_center_srx.srx`

## 🔒 Scope & Constraints

### Target Scope
- **Project Group:** Strava Project Group only
- **File Types:** XML files only
- **Trigger:** New file uploads only (not retroactive)
- **Automation:** Fully automated (no manual override)

### Exclusions
- Other Crowdin project groups
- Non-XML file formats
- Existing files without SRX rules
- Manual configuration modifications

## 🚧 Development Status

### ✅ Completed (Phase 1-3)
- [x] NestJS application foundation
- [x] Crowdin app template integration
- [x] OAuth 2.0 authentication system
- [x] SQLite database with TypeORM
- [x] Basic app lifecycle handlers
- [x] **CrowdinApiService** - Enterprise API v2 integration
- [x] **FileMonitoringService** - Scheduled monitoring every 5 minutes
- [x] **SRXService** - Read-only SRX rules management
- [x] **ParserConfigurationService** - Complete automation
- [x] **Comprehensive testing suite** with sample XML files
- [x] **Docker deployment** configuration
- [x] **GitHub Actions CI/CD** pipeline

### ✅ Testing Results
- [x] **SRX Rules Validation:** ✅ PASSED
- [x] **XML Sample Analysis:** ✅ PASSED (2 test files detected)
- [x] **Parser Configuration:** ✅ PASSED
- [x] **Configuration Simulation:** ✅ PASSED
- [x] **Monitoring Status:** ✅ PASSED (Ready for testing)

### 🔄 Ready for Production (Phase 4)
- [x] Core functionality implemented and tested
- [x] Docker containerization ready
- [x] Environment configuration documented
- [ ] **Production deployment** (requires Crowdin credentials)
- [ ] **User training and documentation**
- [ ] **Live monitoring and iteration**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain test coverage
- Use conventional commit messages
- Follow NestJS architectural patterns

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Note:** This project inherits the MIT License from the [create-crowdin-app template](https://github.com/crowdin/create-crowdin-app).

## 🆘 Support

### Documentation
- [Crowdin Developer Portal](https://support.crowdin.com/developer)
- [Crowdin Apps Documentation](https://support.crowdin.com/developer/crowdin-apps-about)
- [Template Repository](https://github.com/crowdin/create-crowdin-app)

### Issues & Questions
- **GitHub Issues:** [Create an issue](https://github.com/your-org/crowdin-srx-automation-app/issues)
- **Crowdin Support:** [Contact Customer Success](https://support.crowdin.com/)

## 🙏 Acknowledgments

- Built on the [Crowdin create-crowdin-app](https://github.com/crowdin/create-crowdin-app) template
- Powered by [NestJS](https://nestjs.com/) framework
- Uses [Crowdin Apps Functions](https://www.npmjs.com/package/@crowdin/crowdin-apps-functions)

---

**Made with ❤️ for the Crowdin community**
