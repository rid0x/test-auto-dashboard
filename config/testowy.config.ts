import { ProjectConfig } from '../src/core/types/project.types';

export const testowyConfig: ProjectConfig = {
  name: 'testowy',
  baseUrl: process.env.TESTOWY_BASE_URL || 'https://slodka-manufaktura.pl',

  credentials: {
    valid: {
      email: process.env.TESTOWY_USER_EMAIL || '',
      password: process.env.TESTOWY_USER_PASSWORD || '',
    },
    invalid: {
      email: 'invalid@example.pl',
      password: 'WrongPass123!',
    },
  },

  registration: {
    testEmail: `aurorabot-${Date.now()}@auroracreation.com`,
    testPassword: 'AutoTest123!@#',
    firstName: 'Aurora',
    lastName: 'Bot',
  },

  search: {
    validQuery: 'ciasto',
    invalidQuery: 'qwertyasdfgh99999',
    expectedResultMinCount: 1,
  },

  product: {
    url: '/sample-product',
    name: 'Sample Product',
  },

  category: {
    url: '/category',
    name: 'Category',
    expectedMinProducts: 3,
  },

  features: {
    hasRecaptchaOnLogin: false,
    hasRecaptchaOnRegistration: false,
    hasRecaptchaOnCheckout: false,
    hasCookieConsent: false,
    cookieConsentSelector: '',
  },

  api: {
    baseUrl: process.env.TESTOWY_API_URL || 'https://slodka-manufaktura.pl',
    restEndpoint: '/rest/V1',
    graphqlEndpoint: '/graphql',
  },
};
