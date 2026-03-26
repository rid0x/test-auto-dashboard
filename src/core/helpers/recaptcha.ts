import { Page } from '@playwright/test';

/**
 * Checks if reCAPTCHA is actively blocking the page.
 * Only triggers on VISIBLE recaptcha elements or loaded recaptcha iframes.
 * Hidden inputs alone don't count — Magento adds those to every form as fallback.
 */
export async function isRecaptchaPresent(page: Page): Promise<boolean> {
  // Strong signals — these mean reCAPTCHA is actually loaded and active
  const strongSelectors = [
    'iframe[src*="recaptcha"]',
    'iframe[src*="google.com/recaptcha"]',
    '.g-recaptcha[data-sitekey]',
    '[data-sitekey]',
  ];

  for (const selector of strongSelectors) {
    try {
      const count = await page.locator(selector).count();
      if (count > 0) {
        return true;
      }
    } catch {}
  }

  // Weak signals — only count if visible (hidden inputs are Magento boilerplate)
  const weakSelectors = [
    '.g-recaptcha:visible',
    '#recaptcha:visible',
  ];

  for (const selector of weakSelectors) {
    try {
      const el = page.locator(selector);
      if (await el.count() > 0 && await el.first().isVisible()) {
        return true;
      }
    } catch {}
  }

  return false;
}

/**
 * Skips the current test with a clear annotation if reCAPTCHA is detected.
 * Shows SKIPPED (not FAILED) in reports with clear reason.
 */
export async function skipIfRecaptcha(
  page: Page,
  testInfo: {
    skip: (condition: boolean, description?: string) => void;
    annotations: Array<{ type: string; description?: string }>;
  }
): Promise<void> {
  const hasRecaptcha = await isRecaptchaPresent(page);
  if (hasRecaptcha) {
    testInfo.annotations.push({
      type: 'skip',
      description: 'RECAPTCHA: reCAPTCHA aktywna na stronie — test nie moze przejsc bez bypass. Nie jest to blad.',
    });
    testInfo.skip(true, 'RECAPTCHA: reCAPTCHA aktywna — nie mozna zautomatyzowac tego kroku');
  }
}

/**
 * For tests that use config to know about reCAPTCHA upfront.
 * Skips before even navigating to the page.
 */
export function skipIfRecaptchaConfigured(
  hasRecaptcha: boolean,
  testInfo: {
    skip: (condition: boolean, description?: string) => void;
    annotations: Array<{ type: string; description?: string }>;
  }
): void {
  if (hasRecaptcha) {
    testInfo.annotations.push({
      type: 'skip',
      description: 'RECAPTCHA: Strona ma skonfigurowana reCAPTCHA — test skipniety aby uniknac false positive.',
    });
    testInfo.skip(true, 'RECAPTCHA: Skonfigurowana w ustawieniach projektu — nie mozna zautomatyzowac');
  }
}

/**
 * Annotation helper
 */
export function recaptchaWarning(): { type: string; description: string } {
  return {
    type: 'issue',
    description: 'Ten test moze byc zablokowany przez reCAPTCHA w niektorych srodowiskach',
  };
}
