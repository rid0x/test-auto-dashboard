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
      password: 'WrongPass123!',
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
    invalidQuery: 'qwertyasdfgh99999',
    expectedResultMinCount: 1,
  },

  product: {
    url: '/kieliszki-do-margarity-luxito-havana-300ml-6szt.html',
    name: 'Kieliszki do margarity LUXITO HAVANA 300ml 6szt',
  },

  category: {
    url: '/kuchnia.html',
    name: 'Kuchnia',
    expectedMinProducts: 3,
  },

  features: {
    hasRecaptchaOnLogin: true,
    hasRecaptchaOnRegistration: true,
    hasRecaptchaOnCheckout: true,
    hasCookieConsent: true,
    cookieConsentSelector: 'text=Zezwól na wszystkie',
  },

  api: {
    baseUrl: process.env.SZKLANECZKI_API_URL || 'https://szklaneczki.pl',
    restEndpoint: '/rest/V1',
    graphqlEndpoint: '/graphql',
  },
};
