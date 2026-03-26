import { Page } from '@playwright/test';

/**
 * Handles cookie consent banners.
 * Tries common Magento cookie consent selectors + custom project selector.
 */
export async function acceptCookies(page: Page, customSelector?: string): Promise<void> {
  const selectors = [
    customSelector,
    // Common Magento cookie consent selectors
    '#btn-cookie-allow',
    '.action.allow',
    '[data-action="accept-cookies"]',
    'button:has-text("Akceptuję")',
    'button:has-text("Accept")',
    'button:has-text("Zaakceptuj")',
    'button:has-text("Zgadzam się")',
    '.cookie-consent__accept',
    '#cookie-accept',
    '.amgdprcookie-button.-allow',
    // Getprice custom cookie consent
    '.consent-cookie-directive button',
    '.consent-cookie-directive button:has-text("Akceptuję")',
    // Willsoor EC GTM cookie directive
    '.ec-gtm-cookie-directive button',
  ].filter(Boolean) as string[];

  for (const selector of selectors) {
    try {
      const el = page.locator(selector);
      await el.first().waitFor({ timeout: 1500, state: 'visible' });
      await el.first().click();
      // Wait a bit for the banner to disappear
      await page.waitForTimeout(500);
      return;
    } catch {
      // Selector not found, try next
    }
  }

  // No cookie banner found — that's fine, maybe it was already accepted
}

/**
 * Dismisses cookie banner if present, doesn't fail if not found
 */
export async function dismissCookiesIfPresent(page: Page, customSelector?: string): Promise<void> {
  try {
    await acceptCookies(page, customSelector);
  } catch {
    // Silently continue
  }
}
