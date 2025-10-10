import configuration from './configuration';

const config = configuration();

export default {
  identifier: 'crowdin-srx-automation-app',
  name: 'Crowdin SRX Automation App',
  logo: '/assets/logo.png',
  baseUrl: config.app.baseUrl,
  authentication: {
    type: 'authorization_code',
    clientId: config.crowdin.clientId,
  },
  events: {
    installed: '/installed',
    uninstall: '/uninstall',
  },
  scopes: [
    'project',
    'project.file',
    'project.file.update',
    'project.group',
  ],
  modules: {
    integrations: [
      {
        key: 'srx-automation',
        name: 'SRX Automation',
        description: 'Automatically configure SRX rules and parser settings for XML files in Strava Project Group',
        logo: '/assets/logo.png',
        url: '/',
      },
    ],
  },
};
