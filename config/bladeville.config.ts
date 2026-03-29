import { ProjectConfig } from '../src/core/types/project.types';

export const bladevilleConfig: ProjectConfig = {
  name: 'bladeville',
  baseUrl: process.env.BLADEVILLE_BASE_URL || 'https://bladeville.pl',

  credentials: {
    valid: {
      email: process.env.BLADEVILLE_USER_EMAIL || 'test@bladeville.pl',
      password: process.env.BLADEVILLE_USER_PASSWORD || 'TestPassword123!',
    },
    invalid: {
      email: 'invalid@bladeville.pl',
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
    validQuery: 'rolki',
    invalidQuery: 'xyznonexistent99999',
    expectedResultMinCount: 1,
  },

  product: {
    url: '/in-line/inline-skate-wheels/luminous-led-pixel-80mm-85a-zielone-wicker-4',
    name: 'Kółka do Rolek Luminous LED Pixel 80mm/85a - Zielone-Wicker (4)',
  },

  category: {
    url: '/in-line/rolki',
    name: 'Rolki',
    expectedMinProducts: 10,
  },

  features: {
    hasRecaptchaOnLogin: false,
    hasRecaptchaOnRegistration: true,
    hasRecaptchaOnCheckout: false,
    hasCookieConsent: true,
    cookieConsentSelector: '.amgdprcookie-button.-allow',
  },

  api: {
    baseUrl: process.env.BLADEVILLE_API_URL || 'https://bladeville.pl',
    restEndpoint: '/rest/V1',
    graphqlEndpoint: '/graphql',
  },
};
