import { Page } from '@playwright/test';

/**
 * Handles cookie consent banners.
 * If customSelector is provided, ONLY tries that (fast path).
 * Otherwise falls back to common Magento selectors.
 */
export async function acceptCookies(page: Page, customSelector?: string): Promise<void> {
  // Fast path: if project has a known cookie selector, only try that one
  if (customSelector) {
    try {
      const el = page.locator(customSelector);
      await el.first().waitFor({ timeout: 2000, state: 'visible' });
      await el.first().click();
      await page.waitForTimeout(300);
      return;
    } catch {
      return; // Cookie already dismissed or not present
    }
  }

  // Slow path: try common selectors (only if no custom selector)
  const selectors = [
    '#btn-cookie-allow',
    '.action.allow',
    'button:has-text("Akceptuję")',
    'button:has-text("Zgadzam się")',
    '.amgdprcookie-button.-allow',
    '.consent-cookie-directive button',
    '.ec-gtm-cookie-directive button',
  ];

  for (const selector of selectors) {
    try {
      const el = page.locator(selector);
      await el.first().waitFor({ timeout: 1500, state: 'visible' });
      await el.first().click();
      await page.waitForTimeout(300);
      return;
    } catch {
      // Try next
    }
  }
}

export async function dismissCookiesIfPresent(page: Page, customSelector?: string): Promise<void> {
  try {
    await acceptCookies(page, customSelector);
  } catch {
    // Silently continue
  }
}
