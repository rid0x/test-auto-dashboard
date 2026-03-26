import { ProjectConfig } from '../src/core/types/project.types';

export const szpakiConfig: ProjectConfig = {
  name: '4szpaki',
  baseUrl: process.env.SZPAKI_BASE_URL || 'https://4szpaki.pl',

  credentials: {
    valid: {
      email: process.env.SZPAKI_USER_EMAIL || '',
      password: process.env.SZPAKI_USER_PASSWORD || '',
    },
    invalid: {
      email: 'invalid@4szpaki.pl',
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
    validQuery: 'pasta',
    invalidQuery: 'xyznonexistent99999',
    expectedResultMinCount: 1,
  },

  product: {
    url: '/TBD',
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
    baseUrl: process.env.SZPAKI_API_URL || 'https://4szpaki.pl',
    restEndpoint: '/rest/V1',
    graphqlEndpoint: '/graphql',
  },
};
