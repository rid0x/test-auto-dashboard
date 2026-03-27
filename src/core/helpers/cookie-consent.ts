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
      await el.first().waitFor({ timeout: 10000, state: 'visible' });
      await el.first().click();
      await el.first().waitFor({ timeout: 3000, state: 'hidden' }).catch(() => {});
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
    'button:has-text("Zaakceptuj wszystkie")',
    'a:has-text("Zaakceptuj wszystkie")',
    '.amgdprcookie-button.-allow',
    '.consent-cookie-directive button',
    '.ec-gtm-cookie-directive button',
    '.ec-gtm-cookie-directive a.accept-all',
  ];

  for (const selector of selectors) {
    try {
      const el = page.locator(selector);
      await el.first().waitFor({ timeout: 1500, state: 'visible' });
      await el.first().click();
      await el.first().waitFor({ timeout: 2000, state: 'hidden' }).catch(() => {});
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

  // Dismiss salesmanago popup iframe if present (e.g. 4szpaki)
  // This popup appears after 15-30s delay — dismiss immediately if visible now
  await dismissSalesmanagoPopup(page);
}

/**
 * Dismiss salesmanago popup iframe. Can be called at any time.
 * Also sets up a listener to auto-dismiss if it appears later.
 */
export async function dismissSalesmanagoPopup(page: Page): Promise<void> {
  try {
    const iframe = page.locator('iframe[title*="salesmanago"]');
    if (await iframe.first().isVisible({ timeout: 1500 }).catch(() => false)) {
      const frame = iframe.first().contentFrame();
      await frame.getByRole('button', { name: 'Może później' }).click({ timeout: 2000 }).catch(() => {});
    }
  } catch {
    // No popup yet
  }
}

/**
 * Set up auto-dismiss for salesmanago popup.
 * Watches for the iframe to appear and dismisses it automatically.
 * Call once per test — runs in background.
 */
export function setupSalesmanagoAutoDismiss(page: Page): void {
  const checkAndDismiss = async () => {
    try {
      const iframe = page.locator('iframe[title*="salesmanago"]');
      if (await iframe.first().isVisible({ timeout: 500 }).catch(() => false)) {
        const frame = iframe.first().contentFrame();
        await frame.getByRole('button', { name: 'Może później' }).click({ timeout: 1000 }).catch(() => {});
      }
    } catch { /* ignore */ }
  };

  // Check periodically for 60 seconds
  const interval = setInterval(checkAndDismiss, 3000);
  setTimeout(() => clearInterval(interval), 60000);

  // Also try to dismiss on any dialog/popup event
  page.on('frameattached', async () => {
    await new Promise(r => setTimeout(r, 1000));
    await checkAndDismiss();
  });
}
