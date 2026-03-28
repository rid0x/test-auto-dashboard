import { ProjectConfig } from '../src/core/types/project.types';

export const enteloConfig: ProjectConfig = {
  name: 'entelo',
  baseUrl: process.env.ENTELO_BASE_URL || 'https://entelo.pl',

  credentials: {
    valid: {
      email: process.env.ENTELO_USER_EMAIL || 'l.tumiel@auroracreation.com',
      password: process.env.ENTELO_USER_PASSWORD || 'Kokoko90!',
    },
    invalid: {
      email: 'invalid@entelo.pl',
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
    validQuery: 'krzeslo',
    invalidQuery: 'qwertyasdfghzxcvbn99999',
    expectedResultMinCount: 1,
  },

  product: {
    url: '/zestaw-mebli-blox-water-15',
    name: 'Zestaw mebli BLOX Water 15',
  },

  category: {
    url: '/meble.html',
    name: 'Meble',
    expectedMinProducts: 3,
  },

  features: {
    hasRecaptchaOnLogin: false,
    hasRecaptchaOnRegistration: true,
    hasRecaptchaOnCheckout: false,
    hasCookieConsent: true,
    cookieConsentSelector: '#CookiebotDialogBodyLevelButtonLevelOptinAllowAll',
  },

  api: {
    baseUrl: process.env.ENTELO_API_URL || 'https://entelo.pl',
    restEndpoint: '/rest/V1',
    graphqlEndpoint: '/graphql',
  },
};
