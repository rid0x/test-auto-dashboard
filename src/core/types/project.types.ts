export interface ProjectConfig {
  name: string;
  baseUrl: string;
  credentials: {
    valid: { email: string; password: string };
    invalid: { email: string; password: string };
  };
  registration: {
    testEmail: string;
    testPassword: string;
    firstName: string;
    lastName: string;
  };
  search: {
    validQuery: string;
    invalidQuery: string;
    expectedResultMinCount: number;
  };
  product: {
    url: string;
    name: string;
  };
  category: {
    url: string;
    name: string;
    expectedMinProducts: number;
  };
  features: {
    hasRecaptchaOnLogin: boolean;
    hasRecaptchaOnRegistration: boolean;
    hasRecaptchaOnCheckout: boolean;
    hasCookieConsent: boolean;
    cookieConsentSelector?: string;
  };
  api?: {
    baseUrl: string;
    graphqlEndpoint?: string;
    restEndpoint?: string;
  };
}

export type ProjectName = 'getprice' | 'willsoor' | 'pieceofcase' | '4szpaki';

export interface LocatorStrategy {
  primary: string;
  fallbacks: string[];
  description: string;
}
