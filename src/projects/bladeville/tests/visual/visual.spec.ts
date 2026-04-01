import { test, expect } from '@playwright/test';
import { bladevilleConfig } from '../../../../../config/bladeville.config';

const config = bladevilleConfig;
const BASE = config.baseUrl;

// Visual Regression Tests — porownanie screenshotow z baseline
// Pierwszy run: npx playwright test --grep @visual --update-snapshots  (tworzy baseline)
// Kolejne runy: npx playwright test --grep @visual  (porownuje z baseline)
// maxDiffPixelRatio: 0.02 = tolerancja 2% pikseli (antyaliasing, fonty)

test.describe('Bladeville - Visual Regression @visual', () => {

  test.beforeEach(async ({ page }) => {
    // Zamknij cookie consent
    try { await page.click('.amgdprcookie-button.-allow', { timeout: 3000 }); } catch {}
    await page.waitForTimeout(500);
    // Usun popupy marketingowe (Salesmanago, GetResponse, Doofinder, itp.)
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      // Usun typowe marketing popupy/overlaye
      const selectors = [
        '[class*="popup"]', '[class*="Popup"]', '[class*="modal"]:not(#authentication-popup)',
        '[class*="overlay"]:not(.loading-mask)', '[class*="newsletter"]',
        '[class*="salesmanago"]', '[class*="getresponse"]', '[class*="doofinder"]',
        '[class*="sm-popup"]', '[class*="greet-popup"]', '[class*="mage-dropdown"]',
        '[id*="newsletter"]', '.modals-overlay', '.modal-popup.confirm',
        '[class*="exit-intent"]', '[class*="slide-in"]', '[class*="notification-bar"]',
      ];
      for (const sel of selectors) {
        document.querySelectorAll(sel).forEach(el => {
          const style = window.getComputedStyle(el);
          if (style.position === 'fixed' || style.position === 'absolute' || style.zIndex > '100') {
            (el as HTMLElement).style.display = 'none';
          }
        });
      }
      // Usun tez ogolne fixed/absolute overlay z wysokim z-index
      document.querySelectorAll('*').forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.position === 'fixed' && parseInt(style.zIndex) > 999 && el.tagName !== 'HEADER' && el.tagName !== 'NAV') {
          (el as HTMLElement).style.display = 'none';
        }
      });
    });
    await page.waitForTimeout(300);
  });

  test('homepage visual', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('homepage.png', { fullPage: true, maxDiffPixelRatio: 0.02 });
  });

  test('login page visual', async ({ page }) => {
    await page.goto(BASE + '/customer/account/login/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('login.png', { maxDiffPixelRatio: 0.02 });
  });

  test('category page visual', async ({ page }) => {
    await page.goto(BASE + config.category.url);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('category.png', { maxDiffPixelRatio: 0.02 });
  });

  test('product page visual', async ({ page }) => {
    await page.goto(BASE + config.product.url);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('product.png', { maxDiffPixelRatio: 0.02 });
  });

  test('search results visual', async ({ page }) => {
    await page.goto(BASE + '/catalogsearch/result/?q=' + encodeURIComponent(config.search.validQuery));
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('search-results.png', { maxDiffPixelRatio: 0.02 });
  });

  test('cart page visual', async ({ page }) => {
    await page.goto(BASE + '/checkout/cart/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('cart.png', { maxDiffPixelRatio: 0.02 });
  });
});
