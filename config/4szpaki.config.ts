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
    invalidQuery: 'qwertyasdfghzxcvbn99999',
    expectedResultMinCount: 1,
  },

  product: {
    url: '/mydla-w-kostce/p/mydlo-mis',
    name: 'Mydło Miś',
  },

  category: {
    url: '/twarz',
    name: 'Twarz',
    expectedMinProducts: 3,
  },

  features: {
    hasRecaptchaOnLogin: false,
    hasRecaptchaOnRegistration: false,
    hasRecaptchaOnCheckout: false,
    hasCookieConsent: true,
    cookieConsentSelector: '.ec-gtm-cookie-directive a.accept-all, a:has-text("ZGODA NA WSZYSTKIE")',
  },

  api: {
    baseUrl: process.env.SZPAKI_API_URL || 'https://4szpaki.pl',
    restEndpoint: '/rest/V1',
    graphqlEndpoint: '/graphql',
  },
};
