import { ProjectConfig } from '../src/core/types/project.types';

export const pierrereneConfig: ProjectConfig = {
  name: 'pierrerene',
  baseUrl: process.env.PIERRERENE_BASE_URL || 'https://www.pierrerene.pl',

  credentials: {
    valid: {
      email: process.env.PIERRERENE_USER_EMAIL || 'l.tumiel@auroracreation.com',
      password: process.env.PIERRERENE_USER_PASSWORD || 'Kokoko90!',
    },
    invalid: {
      email: 'invalid@pierrerene.pl',
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
    validQuery: 'pomadka',
    invalidQuery: 'xyznonexistent99999',
    expectedResultMinCount: 1,
  },

  product: {
    url: '/pl/pomadka-matowa-royal-mat-lipstick-nr-03-nude-sand',
    name: 'Pomadka matowa – Royal Mat Lipstick nr 03 Nude Sand',
  },

  category: {
    url: '/pl/kosmetyki-14/usta',
    name: 'Usta',
    expectedMinProducts: 5,
  },

  features: {
    hasRecaptchaOnLogin: false,
    hasRecaptchaOnRegistration: false,
    hasRecaptchaOnCheckout: false,
    hasCookieConsent: true,
    cookieConsentSelector: '.ec-gtm-cookie-directive a.accept-all',
  },

  api: {
    baseUrl: process.env.PIERRERENE_API_URL || 'https://www.pierrerene.pl',
    restEndpoint: '/rest/V1',
    graphqlEndpoint: '/pl/graphql',
  },
};
