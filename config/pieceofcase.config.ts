import { ProjectConfig } from '../src/core/types/project.types';

export const pieceofcaseConfig: ProjectConfig = {
  name: 'pieceofcase',
  baseUrl: process.env.PIECEOFCASE_BASE_URL || 'https://pieceofcase.pl',

  credentials: {
    valid: {
      email: process.env.PIECEOFCASE_USER_EMAIL || 'l.tumiel@auroracreation.com',
      password: process.env.PIECEOFCASE_USER_PASSWORD || 'Kokoko90!',
    },
    invalid: {
      email: 'invalid@pieceofcase.pl',
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
    validQuery: 'etui',
    invalidQuery: 'xyznonexistent99999',
    expectedResultMinCount: 1,
  },

  product: {
    url: '/pl/bella-etui-szklane89a',
    name: 'Bella etui szklane',
  },

  category: {
    url: '/pl/rodzaj-etui',
    name: 'Rodzaj etui',
    expectedMinProducts: 5,
  },

  features: {
    hasRecaptchaOnLogin: false,
    hasRecaptchaOnRegistration: false,
    hasRecaptchaOnCheckout: false,
    hasCookieConsent: true,
    cookieConsentSelector: 'button.__pb-cookie_button_accept',
  },

  api: {
    baseUrl: process.env.PIECEOFCASE_API_URL || 'https://pieceofcase.pl',
    restEndpoint: '/rest/pl/V1',
    graphqlEndpoint: '/graphql',
  },
};
