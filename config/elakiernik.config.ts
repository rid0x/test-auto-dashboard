import { ProjectConfig } from '../src/core/types/project.types';

export const elakiernikConfig: ProjectConfig = {
  name: 'elakiernik',
  baseUrl: process.env.ELAKIERNIK_BASE_URL || 'https://e-lakiernik.net',

  credentials: {
    valid: {
      email: process.env.ELAKIERNIK_USER_EMAIL || '',
      password: process.env.ELAKIERNIK_USER_PASSWORD || '',
    },
    invalid: {
      email: 'invalid@e-lakiernik.net',
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
    validQuery: 'lakier',
    invalidQuery: 'xyznonexistent99999',
    expectedResultMinCount: 1,
  },

  product: {
    url: '/honeycomb-gabka-do-mycia-auta',
    name: 'Gąbka do mycia auta Honeycomb',
  },

  category: {
    url: '/lakierowanie/lakiery',
    name: 'Lakiery samochodowe',
    expectedMinProducts: 5,
  },

  features: {
    hasRecaptchaOnLogin: false,
    hasRecaptchaOnRegistration: false,
    hasRecaptchaOnCheckout: false,
    hasCookieConsent: true,
    cookieConsentSelector: '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
  },

  api: {
    baseUrl: process.env.ELAKIERNIK_API_URL || 'https://e-lakiernik.net',
    restEndpoint: '/rest/V1',
    graphqlEndpoint: '/graphql',
  },
};
