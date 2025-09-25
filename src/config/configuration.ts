export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Crowdin OAuth Configuration
  crowdin: {
    clientId: process.env.CROWDIN_CLIENT_ID,
    clientSecret: process.env.CROWDIN_CLIENT_SECRET,
    apiUrl: process.env.CROWDIN_API_URL || 'https://api.crowdin.com',
    enterpriseApiUrl: process.env.CROWDIN_ENTERPRISE_API_URL,
  },
  
  // Application Configuration
  app: {
    name: process.env.APP_NAME || 'Crowdin SRX Automation App',
    version: process.env.APP_VERSION || '1.0.0',
    description: process.env.APP_DESCRIPTION || 'Automate SRX configuration for XML files in Strava Project Group',
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  },
  
  // Database Configuration
  database: {
    type: process.env.DB_TYPE || 'sqlite',
    database: process.env.DB_DATABASE || 'crowdin_srx_app.db',
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
  },
  
  // Security Configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-change-in-production',
    encryptionKey: process.env.ENCRYPTION_KEY || 'your-encryption-key-change-in-production',
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  
  // SRX Configuration
  srx: {
    rulesFile: process.env.SRX_RULES_FILE || 'strava_help_center_srx.srx',
    projectGroup: process.env.TARGET_PROJECT_GROUP || 'Strava',
    projectGroupId: process.env.TARGET_PROJECT_GROUP_ID || '24',
    enableAutoConfiguration: process.env.ENABLE_AUTO_CONFIG === 'true' || true,
  },
});
