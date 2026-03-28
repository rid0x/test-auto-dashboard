import { ProjectConfig } from '../src/core/types/project.types';

export const abazurConfig: ProjectConfig = {
  name: 'abazur',
  baseUrl: process.env.ABAZUR_BASE_URL || 'https://abazur.pl',

  credentials: {
    valid: {
      email: process.env.ABAZUR_USER_EMAIL || 'l.tumiel@auroracreation.com',
      password: process.env.ABAZUR_USER_PASSWORD || 'Kokoko90!',
    },
    invalid: {
      email: 'invalid@abazur.pl',
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
    validQuery: 'lampa biurkowa',
    invalidQuery: 'qwertyasdfghzxcvbn99999',
    expectedResultMinCount: 1,
  },

  product: {
    url: '/kinkiet-lampa-scienno-sufitowa-nowoczesny-led-10w-zloty-amadeo-71275-rabalux',
    name: 'Kinkiet lampa ścienno-sufitowa nowoczesny LED 10W złoty AMADEO 71275 Rabalux',
  },

  category: {
    url: '/kinkiety',
    name: 'Kinkiety',
    expectedMinProducts: 5,
  },

  features: {
    hasRecaptchaOnLogin: true,
    hasRecaptchaOnRegistration: true,
    hasRecaptchaOnCheckout: false,
    hasCookieConsent: true,
    cookieConsentSelector: '.ec-gtm-cookie-directive a.accept-all',
  },

  api: {
    baseUrl: process.env.ABAZUR_API_URL || 'https://abazur.pl',
    restEndpoint: '/rest/V1',
    graphqlEndpoint: '/graphql',
  },
};
