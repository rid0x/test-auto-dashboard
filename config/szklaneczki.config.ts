import { ProjectConfig } from '../src/core/types/project.types';

export const szklaneczkiConfig: ProjectConfig = {
  name: 'szklaneczki',
  baseUrl: process.env.SZKLANECZKI_BASE_URL || 'https://szklaneczki.pl',

  credentials: {
    valid: {
      email: process.env.SZKLANECZKI_USER_EMAIL || 'l.tumiel@auroracreation.com',
      password: process.env.SZKLANECZKI_USER_PASSWORD || 'Kokoko90!',
    },
    invalid: {
      email: 'invalid@example.pl',
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
    validQuery: 'szklanka',
    invalidQuery: 'qwertyasdfghzxcvbn99999',
    expectedResultMinCount: 1,
  },

  product: {
    url: '/kieliszki-do-margarity-luxito-havana-300ml-6szt.html',
    name: 'Kieliszki do margarity LUXITO',
  },

  category: {
    url: '/kuchnia.html',
    name: 'Kuchnia',
    expectedMinProducts: 3,
  },

  features: {
    hasRecaptchaOnLogin: true,
    hasRecaptchaOnRegistration: true,
    hasRecaptchaOnCheckout: false,
    hasCookieConsent: true,
    cookieConsentSelector: 'text=Zezw�l na wszystkie',
  },

  api: {
    baseUrl: process.env.SZKLANECZKI_API_URL || 'https://szklaneczki.pl',
    restEndpoint: '/rest/V1',
    graphqlEndpoint: '/graphql',
  },
};
