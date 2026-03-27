import { ProjectConfig } from '../src/core/types/project.types';

export const willsoorConfig: ProjectConfig = {
  name: 'willsoor',
  baseUrl: process.env.WILLSOOR_BASE_URL || 'https://www.willsoor.pl',

  credentials: {
    valid: {
      email: process.env.WILLSOOR_USER_EMAIL || 'test@willsoor.pl',
      password: process.env.WILLSOOR_USER_PASSWORD || 'TestPassword123!',
    },
    invalid: {
      email: 'invalid@willsoor.pl',
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
    validQuery: 'koszula',
    invalidQuery: 'xyznonexistent99999',
    expectedResultMinCount: 1,
  },

  product: {
    url: '/czarny-plecak-podrozny-james-hawk-69016.html',
    name: 'Czarny plecak podróżny James Hawk',
  },

  bundleProduct: {
    url: '/garnitur-damski-bordowy-willsoor-68262-68263.html',
    name: 'Garnitur damski bordowy',
  },

  category: {
    url: '/kobieta',
    name: 'Kobieta',
    expectedMinProducts: 10,
  },

  features: {
    hasRecaptchaOnLogin: true,
    hasRecaptchaOnRegistration: true,
    hasRecaptchaOnCheckout: false,
    hasCookieConsent: true,
    cookieConsentSelector: '.ec-gtm-cookie-directive a.accept-all, a:has-text("ZGODA NA WSZYSTKIE")',
  },

  api: {
    baseUrl: process.env.WILLSOOR_API_URL || 'https://www.willsoor.pl',
    restEndpoint: '/rest/V1',
    graphqlEndpoint: '/graphql',
  },
};
