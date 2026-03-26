import { ProjectConfig } from '../src/core/types/project.types';

export const mocnredoConfig: ProjectConfig = {
  name: 'mocnredo',
  baseUrl: process.env.MOCNREDO_BASE_URL || 'https://mocnredo.pl',

  credentials: {
    valid: {
      email: process.env.MOCNREDO_USER_EMAIL || '',
      password: process.env.MOCNREDO_USER_PASSWORD || '',
    },
    invalid: {
      email: 'invalid@mocnredo.pl',
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
    validQuery: 'krem',
    invalidQuery: 'xyznonexistent99999',
    expectedResultMinCount: 1,
  },

  product: {
    url: '/sample-product.html',
    name: 'TBD',
  },

  category: {
    url: '/TBD',
    name: 'TBD',
    expectedMinProducts: 5,
  },

  features: {
    hasRecaptchaOnLogin: false,
    hasRecaptchaOnRegistration: false,
    hasRecaptchaOnCheckout: false,
    hasCookieConsent: true,
    cookieConsentSelector: undefined,
  },

  api: {
    baseUrl: process.env.MOCNREDO_API_URL || 'https://mocnredo.pl',
    restEndpoint: '/rest/V1',
    graphqlEndpoint: '/graphql',
  },
};
