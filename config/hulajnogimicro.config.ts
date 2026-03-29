import { ProjectConfig } from '../src/core/types/project.types';

export const hulajnogimicroConfig: ProjectConfig = {
  name: 'hulajnogimicro',
  baseUrl: process.env.HULAJNOGIMICRO_BASE_URL || 'https://hulajnogimicro.pl',

  credentials: {
    valid: {
      email: process.env.HULAJNOGIMICRO_USER_EMAIL || 'test@hulajnogimicro.pl',
      password: process.env.HULAJNOGIMICRO_USER_PASSWORD || 'TestPassword123!',
    },
    invalid: {
      email: 'invalid@hulajnogimicro.pl',
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
    validQuery: 'hulajnoga',
    invalidQuery: 'xyznonexistent99999',
    expectedResultMinCount: 1,
  },

  product: {
    url: '/mini-micro-deluxe-glow-led',
    name: 'Mini Micro Deluxe Glow LED Plus',
  },

  category: {
    url: '/hulajnoga-dla-dzieci/hulajnogi-trojkolowe/mini-micro',
    name: 'hulajnogi mini micro',
    expectedMinProducts: 5,
  },

  features: {
    hasRecaptchaOnLogin: true,
    hasRecaptchaOnRegistration: true,
    hasRecaptchaOnCheckout: false,
    hasCookieConsent: true,
    cookieConsentSelector: '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
  },

  api: {
    baseUrl: process.env.HULAJNOGIMICRO_API_URL || 'https://hulajnogimicro.pl',
    restEndpoint: '/rest/V1',
    graphqlEndpoint: '/graphql',
  },
};
