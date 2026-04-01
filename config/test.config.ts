import { ProjectConfig } from '../src/core/types/project.types';

export const testConfig: ProjectConfig = {
  name: 'test',
  baseUrl: process.env.TEST_BASE_URL || 'https://shop-dental.pl',

  credentials: {
    valid: {
      email: process.env.TEST_USER_EMAIL || '',
      password: process.env.TEST_USER_PASSWORD || '',
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
    validQuery: 'test',
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
    baseUrl: process.env.TEST_API_URL || 'https://shop-dental.pl',
    restEndpoint: '/rest/V1',
    graphqlEndpoint: '/graphql',
  },
};
