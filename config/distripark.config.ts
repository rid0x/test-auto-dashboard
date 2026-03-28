import { ProjectConfig } from '../src/core/types/project.types';

export const distriparkConfig: ProjectConfig = {
  name: 'distripark',
  baseUrl: process.env.DISTRIPARK_BASE_URL || 'https://distripark.com',

  credentials: {
    valid: {
      email: process.env.DISTRIPARK_USER_EMAIL || 'l.tumiel@auroracreation.com',
      password: process.env.DISTRIPARK_USER_PASSWORD || 'Kokoko90!',
    },
    invalid: {
      email: 'invalid@distripark.com',
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
    validQuery: 'soda',
    invalidQuery: 'qwertyasdfghzxcvbn99999',
    expectedResultMinCount: 1,
  },

  product: {
    url: '/soda-kaustyczna-k',
    name: 'Soda Kaustyczna',
  },

  category: {
    url: '/surowce-kosmetyczne',
    name: 'Surowce kosmetyczne',
    expectedMinProducts: 5,
  },

  features: {
    hasRecaptchaOnLogin: false,
    hasRecaptchaOnRegistration: true,
    hasRecaptchaOnCheckout: false,
    hasCookieConsent: false,
  },

  api: {
    baseUrl: process.env.DISTRIPARK_API_URL || 'https://distripark.com',
    restEndpoint: '/rest/V1',
    graphqlEndpoint: '/graphql',
  },
};
