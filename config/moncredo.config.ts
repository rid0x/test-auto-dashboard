import { ProjectConfig } from '../src/core/types/project.types';

export const moncredoConfig: ProjectConfig = {
  name: 'moncredo',
  baseUrl: process.env.MONCREDO_BASE_URL || 'https://moncredo.pl',

  credentials: {
    valid: {
      email: process.env.MONCREDO_USER_EMAIL || '',
      password: process.env.MONCREDO_USER_PASSWORD || '',
    },
    invalid: {
      email: 'invalid@moncredo.pl',
      password: 'WrongPassword123!',
    },
  },

  registration: {
    testEmail: `aurorabot-${Date.now()}@auroracreation.com`,
    testPassword: 'AutoTest123!@#',
    firstName: 'Aurora',
    lastName: 'Bot',
  },

  search: {
    validQuery: 'perfumy',
    invalidQuery: 'xyznonexistent99999',
    expectedResultMinCount: 1,
  },

  product: {
    url: '/arkano-delle-stelle.html',
    name: 'Arkano Delle Stelle',
  },

  category: {
    url: '/perfumy/dla-niej.html',
    name: 'Dla niej',
    expectedMinProducts: 5,
  },

  features: {
    hasRecaptchaOnLogin: false,
    hasRecaptchaOnRegistration: false,
    hasRecaptchaOnCheckout: false,
    hasCookieConsent: false,
    cookieConsentSelector: undefined,
  },

  api: {
    baseUrl: process.env.MONCREDO_API_URL || 'https://moncredo.pl',
    restEndpoint: '/rest/V1',
    graphqlEndpoint: '/graphql',
  },
};
