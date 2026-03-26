import { ProjectConfig } from '../src/core/types/project.types';

export const getpriceConfig: ProjectConfig = {
  name: 'getprice',
  baseUrl: process.env.GETPRICE_BASE_URL || 'https://getprice.pl',

  credentials: {
    valid: {
      email: process.env.GETPRICE_USER_EMAIL || 'test@getprice.pl',
      password: process.env.GETPRICE_USER_PASSWORD || 'TestPassword123!',
    },
    invalid: {
      email: 'invalid@getprice.pl',
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
    validQuery: 'patchcord',
    invalidQuery: 'xyznonexistent99999',
    expectedResultMinCount: 1,
  },

  product: {
    url: '/pl/patchcord-utp-rj45-cat-6-1gbps-1m-53149.html',
    name: 'Patchcord UTP RJ45 Cat 6 1Gbps 1m',
  },

  category: {
    url: '/pl/serwery.html',
    name: 'Serwery',
    expectedMinProducts: 5,
  },

  features: {
    hasRecaptchaOnLogin: false,
    hasRecaptchaOnRegistration: true, // invisible reCAPTCHA v3 blocks Playwright (headless AND headed)
    hasRecaptchaOnCheckout: false,
    hasCookieConsent: true,
    cookieConsentSelector: '.consent-cookie-directive button',
  },

  api: {
    baseUrl: process.env.GETPRICE_API_URL || 'https://getprice.pl',
    restEndpoint: '/rest/V1',
    graphqlEndpoint: '/graphql',
  },
};
