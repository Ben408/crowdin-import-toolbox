### Crowdin SRX Automation App - Project Plan

## Project Overview
**Goal:** Automate SRX (Segmentation Rules eXchange) configuration for XML files in Crowdin projects within the Strava Project Group, eliminating manual parser configuration for project managers.

**Problem:** Currently, PMs must manually paste SRX rules into each project's parser configuration for every XML file, resulting in:
- Time-consuming manual work
- Inconsistent segmentation across projects
- Risk of configuration errors
- Poor scalability

**Solution:** Custom Crowdin app that automatically detects XML file uploads to the Strava Project Group and applies standardized SRX rules and parser configuration settings to ensure consistent segmentation.

## Clarified Goals & Scope ✅

### 1. SRX Rules Scope
- **Initial Version:** Use the existing `strava_help_center_srx.srx` file as-is
- **CRITICAL CONSTRAINT:** This SRX file must NEVER be modified
- **Future Expansion:** May need additional SRX patterns for other XML file types
- **Current Rules:** HTML tag-based segmentation (`</p>`, `</h.*?>`, `</li>`)

### 2. File Detection Strategy
- **Target:** ALL XML files uploaded to projects within the 'Strava' Project Group
- **Exclusion:** Other project groups configured in Crowdin (not in scope)
- **Scope:** XML files only, regardless of content type or naming convention

### 3. Project Targeting
- **Primary Focus:** Strava Project Group only
- **Future Expansion:** May extend to other project groups with different SRX rules
- **New vs. Existing:** Only new file uploads (not retroactive)

### 4. Parser Configuration Requirements
Based on the Crowdin Parser Configuration screenshot, the app must automatically configure:
- **Translate content:** ✅ Enabled
- **Translate attributes:** ✅ Enabled  
- **Translatable elements:** Empty (default)
- **Enable content segmentation:** ✅ Enabled
- **Use custom segmentation rules:** ✅ Enabled
- **SRX rules:** Apply the complete `strava_help_center_srx.srx` content

### 5. Integration Priority
- **Primary:** New XML file uploads only
- **No Retroactive:** Existing files without SRX rules are not in scope
- **Real-time:** Immediate configuration upon file upload detection

### 6. Environment Requirements
- **Distinct Virtual Environment:** Must run in isolated environment to avoid conflicts
- **No System Dependencies:** Self-contained deployment

## Critical Constraints & Requirements

### 1. SRX File Immutability
- **NEVER modify** the `strava_help_center_srx.srx` file
- **Read-only access** - file content must remain exactly as provided
- **Version control** - track any changes to ensure file integrity

### 2. Scope Limitations
- **Strava Group Only:** No automation for other Crowdin project groups
- **XML Files Only:** No support for other file formats in initial version
- **New Uploads Only:** No retroactive processing of existing files

### 3. Configuration Automation
- **Full Parser Setup:** Automatically configure all settings shown in screenshot
- **SRX Application:** Apply complete SRX rules content to parser configuration
- **No Manual Override:** Fully automated process for Strava group XML files

## Technical Architecture

### Core Components
1. **File Upload Listener** (To Implement)
   - Monitors for new XML file uploads specifically in Strava Project Group
   - Triggers automation workflow when XML files are detected
   - Uses Crowdin webhook events for real-time detection
   - Filters events by project group membership

2. **Parser Configuration Checker** (To Implement)
   - Verifies current SRX configuration status for XML parser
   - Determines if rules need to be applied
   - Checks existing parser settings via Crowdin API
   - Validates against required configuration template

3. **SRX Rule Applicator** (To Implement)
   - Automatically applies complete `strava_help_center_srx.srx` content
   - Handles Crowdin's specific SRX 2.0 requirements
   - Updates project parser configuration via API
   - Ensures all required settings are configured

4. **Configuration Manager** (To Implement)
   - Applies all parser configuration settings from screenshot
   - Enables required toggles (translate content, attributes, segmentation)
   - Sets custom segmentation rules to enabled
   - Maintains configuration consistency across projects

### Technology Stack
- **Framework:** NestJS (TypeScript/Node.js) ✅
- **Template:** Crowdin create-crowdin-app ✅
- **UI:** Crowdin UI Kit + Handlebars templates ✅
- **Database:** SQLite with TypeORM ✅
- **Authentication:** OAuth 2.0 with Crowdin ✅
- **Crowdin Integration:** `@crowdin/crowdin-apps-functions` ✅
- **Environment:** Isolated virtual environment deployment

## SRX Rules to Automate
**Current Rules (from `strava_help_center_srx.srx` - IMMUTABLE):**
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

**Rules Description:** Break segments after HTML paragraph, heading, and list item tags to ensure proper sentence-level segmentation for translation.

**CRITICAL:** This file content must be applied exactly as-is to all XML parser configurations.

## Parser Configuration Template
Based on the Crowdin screenshot, the app must automatically configure these exact settings:

### Required Configuration Settings
- **Translate content:** ✅ Enabled
- **Translate attributes:** ✅ Enabled
- **Translatable elements:** Empty string (default)
- **Enable content segmentation:** ✅ Enabled
- **Use custom segmentation rules:** ✅ Enabled
- **SRX rules:** Complete content from `strava_help_center_srx.srx`

### Configuration Automation Logic
1. **Detect XML file upload** to Strava group project
2. **Check current parser configuration** for XML format
3. **Apply all required settings** if not already configured
4. **Insert complete SRX rules** from immutable file
5. **Save configuration** and log action

## Development Phases

### Phase 1: Foundation Setup ✅ COMPLETED
- ✅ Clone and set up Crowdin app template
- ✅ Configure OAuth app in Crowdin
- ✅ Set up development environment
- ✅ Basic app deployment and testing

### Phase 2: Core Functionality 
- [ ] Implement Strava group-specific file upload event listeners
- [ ] Create XML parser configuration checking logic
- [ ] Build SRX rule application system (read-only file access)
- [ ] Implement complete parser configuration automation
- [ ] Add error handling and logging

### Phase 3: Integration & Testing 
- [ ] Test with actual XML files from Strava group projects
- [ ] Verify SRX rules are applied correctly (exact match)
- [ ] Test parser configuration automation
- [ ] Performance optimization for Strava group scope

### Phase 4: Production Deployment 
- [ ] Deploy to isolated virtual environment
- [ ] Install app across Strava group projects only
- [ ] User training and documentation
- [ ] Monitor and iterate

## Key Features

### Automation Features
- **Automatic Detection:** Identifies XML file uploads to Strava group in real-time
- **Smart Configuration:** Only applies rules when needed
- **Complete Setup:** Automates all parser configuration settings
- **Error Recovery:** Graceful handling of configuration failures

### Management Features
- **Status Dashboard:** Overview of Strava group project configurations
- **Audit Trail:** Log of all automated actions
- **Configuration Validation:** Ensure settings match required template

### Security Features
- **OAuth Authentication:** Secure access to Crowdin APIs ✅
- **Permission Scoping:** Limited to Strava group project access
- **Audit Logging:** Track all configuration changes
- **Isolated Environment:** No conflicts with other system projects

## Success Metrics

### Quantitative
- **Time Savings:** Reduce PM configuration time from 5-10 minutes to 0 minutes per Strava group project
- **Error Reduction:** Eliminate manual configuration errors for XML files
- **Coverage:** 100% of XML files in Strava group automatically configured
- **Scope:** Limited to Strava group only (no false positives)

### Qualitative
- **Consistency:** Uniform segmentation across all Strava group projects
- **Reliability:** Predictable, repeatable configuration
- **User Experience:** Seamless integration with existing Crowdin workflow
- **Isolation:** No interference with other project groups

## Risk Mitigation

### Technical Risks
- **API Limitations:** Crowdin may not expose parser configuration endpoints
  - *Mitigation:* Investigate API capabilities early, have fallback plan
- **App Performance:** Large number of projects in Strava group may impact performance
  - *Mitigation:* Implement efficient caching and batch processing
- **Environment Conflicts:** Virtual environment isolation requirements
  - *Mitigation:* Use containerization or isolated deployment

### Business Risks
- **Scope Creep:** Expanding beyond Strava group scope
  - *Mitigation:* Strict filtering by project group membership
- **SRX File Integrity:** Accidental modification of rules file
  - *Mitigation:* Read-only access, version control, validation checks

## Resource Requirements

### Development Team
- **1 Backend Developer:** NestJS/TypeScript expertise ✅
- **1 Frontend Developer:** Crowdin UI Kit experience ✅
- **1 DevOps Engineer:** Isolated environment deployment

### Infrastructure
- **Development Environment:** Local development with ngrok ✅
- **Staging Environment:** Isolated test deployment
- **Production Environment:** Isolated virtual environment (no system conflicts)

### Tools & Services
- **Version Control:** GitHub repository ✅
- **CI/CD:** GitHub Actions for automated testing
- **Monitoring:** Application performance monitoring
- **Documentation:** Technical and user documentation
- **Environment Isolation:** Docker or virtual environment management

## Implementation Priorities

### Immediate Actions (This Week)
- [ ] Investigate Crowdin parser configuration API endpoints
- [ ] Design Strava group-specific file upload event handling
- [ ] Create SRX rule application service (read-only file access)
- [ ] Build parser configuration automation service
- [ ] Set up isolated development environment

### Week 1 Goals
- [ ] Strava group file upload event testing
- [ ] Parser configuration API investigation
- [ ] Basic SRX rule application testing (exact match validation)
- [ ] Parser configuration automation testing

### Success Criteria
- [ ] App successfully detects XML file uploads to Strava group only
- [ ] Can read current parser configuration for XML format
- [ ] Can apply SRX rules exactly as provided (no modifications)
- [ ] Can automate all required parser configuration settings
- [ ] Basic dashboard shows Strava group project status
- [ ] Runs in isolated environment without system conflicts

## Crowdin References
- **Crowdin Developer Portal:** support.crowdin.com/developer
- **Crowdin Apps Documentation:** support.crowdin.com/developer/crowdin-apps-about
- **Template Repository:** github.com/crowdin/create-crowdin-app
- **Current Implementation:** Based on create-crowdin-app template with NestJS backend
- **Environment:** Isolated virtual environment deployment required