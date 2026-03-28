import { ProjectConfig } from '../src/core/types/project.types';

export const cornetteConfig: ProjectConfig = {
  name: 'cornette',
  baseUrl: process.env.CORNETTE_BASE_URL || 'https://cornette.pl',

  credentials: {
    valid: {
      email: process.env.CORNETTE_USER_EMAIL || 'l.tumiel@auroracreation.com',
      password: process.env.CORNETTE_USER_PASSWORD || 'Kokoko90!',
    },
    invalid: {
      email: 'invalid@cornette.pl',
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
    validQuery: 'boss',
    invalidQuery: 'xyznonexistent99999',
    expectedResultMinCount: 1,
  },

  product: {
    url: '/mezczyzni/bokserki/bokserki-he-508-166',
    name: 'Bokserki HE 508/166',
  },

  category: {
    url: '/mezczyzni/bokserki',
    name: 'Bokserki',
    expectedMinProducts: 5,
  },

  features: {
    hasRecaptchaOnLogin: false,
    hasRecaptchaOnRegistration: false,
    hasRecaptchaOnCheckout: false,
    hasCookieConsent: true,
    cookieConsentSelector: '.cky-btn-accept, [data-cky-tag="accept-button"]',
  },

  api: {
    baseUrl: process.env.CORNETTE_API_URL || 'https://cornette.pl',
    restEndpoint: '/rest/V1',
    graphqlEndpoint: '/graphql',
  },
};
