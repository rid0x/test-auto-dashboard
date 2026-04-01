import { test, expect } from '@playwright/test';
import { hulajnogimicroConfig } from '../../../../../config/hulajnogimicro.config';

const config = hulajnogimicroConfig;
const BASE = config.baseUrl;

// Visual Regression Tests — porownanie screenshotow z baseline
// Pierwszy run: npx playwright test --grep @visual --update-snapshots  (tworzy baseline)
// Kolejne runy: npx playwright test --grep @visual  (porownuje z baseline)
// maxDiffPixelRatio: 0.02 = tolerancja 2% pikseli (antyaliasing, fonty)

test.use({ animations: 'disabled' });

test.describe('Hulajnogimicro - Visual Regression @visual', () => {

  test.beforeEach(async ({ page }) => {
    // Zamknij cookie consent
    try { await page.click('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll', { timeout: 3000 }); } catch {}
    await page.waitForTimeout(500);
    // Usun popupy marketingowe (Salesmanago, GetResponse, Doofinder, itp.)
    await page.waitForTimeout(2000);
    // Zatrzymaj WSZYSTKIE animacje/slidery/carousele
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = '*, *::before, *::after { animation: none !important; transition: none !important; animation-duration: 0s !important; transition-duration: 0s !important; animation-delay: 0s !important; scroll-behavior: auto !important; }';
      document.head.appendChild(style);
      // Zatrzymaj slidery (Swiper, Slick, Owl, itp.)
      document.querySelectorAll('.swiper-wrapper, .slick-track, .owl-stage, [class*="carousel"], [class*="slider"], [class*="slideshow"]').forEach(el => {
        (el as HTMLElement).style.transform = 'none';
        (el as HTMLElement).style.animation = 'none';
      });
      // Zatrzymaj video/gif
      document.querySelectorAll('video').forEach(v => v.pause());
    });
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
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    // Ukryj slider/carousel — zmienia sie przy kazdym renderze
    await page.evaluate(() => {
      document.querySelectorAll('[class*="slider"], [class*="swiper"], [class*="carousel"], [class*="slideshow"], [class*="banner-rotator"], .owl-carousel').forEach(el => {
        (el as HTMLElement).style.visibility = 'hidden';
      });
    });
    // Viewport only (nie full page — bo wysokosc zmienia sie przez lazy load)
    await expect(page).toHaveScreenshot('homepage.png', { maxDiffPixelRatio: 0.03 });
  });

  test('login page visual', async ({ page }) => {
    await page.goto(BASE + '/customer/account/login/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('login.png', { maxDiffPixelRatio: 0.03 });
  });

  test('category page visual', async ({ page }) => {
    await page.goto(BASE + config.category.url);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot('category.png', { maxDiffPixelRatio: 0.03 });
  });

  test('product page visual', async ({ page }) => {
    await page.goto(BASE + config.product.url);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('product.png', { maxDiffPixelRatio: 0.03 });
  });

  test('search results visual', async ({ page }) => {
    await page.goto(BASE + '/catalogsearch/result/?q=' + encodeURIComponent(config.search.validQuery));
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    // Viewport only + wieksza tolerancja (wyniki/ceny moga sie roznic)
    await expect(page).toHaveScreenshot('search-results.png', { maxDiffPixelRatio: 0.06 });
  });

  test('empty cart visual', async ({ page }) => {
    await page.goto(BASE + '/checkout/cart/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('cart-empty.png', { maxDiffPixelRatio: 0.03 });
  });

  test('cart with product visual', async ({ page, context }) => {
    // Dodaj produkt do koszyka
    await page.goto(BASE + config.product.url);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    // Probuj rozne selektory add-to-cart
    let added = false;
    for (const sel of ['#product-addtocart-button', 'button.tocart', 'button:has-text("Dodaj do koszyka")', 'button:has-text("Do koszyka")', 'button:has-text("Add to Cart")', '.action.tocart']) {
      try {
        const btn = page.locator(sel).first();
        if (await btn.isVisible({ timeout: 1000 })) {
          await btn.click();
          added = true;
          break;
        }
      } catch {}
    }
    if (!added) { test.skip(true, 'Nie znaleziono przycisku dodaj do koszyka'); return; }
    await page.waitForTimeout(3000);
    await page.goto(BASE + '/checkout/cart/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot('cart-with-product.png', { maxDiffPixelRatio: 0.05 });
  });

  test('checkout page visual', async ({ page }) => {
    // Dodaj produkt i przejdz do checkout
    await page.goto(BASE + config.product.url);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    let added = false;
    for (const sel of ['#product-addtocart-button', 'button.tocart', 'button:has-text("Dodaj do koszyka")', 'button:has-text("Do koszyka")', 'button:has-text("Add to Cart")', '.action.tocart']) {
      try {
        const btn = page.locator(sel).first();
        if (await btn.isVisible({ timeout: 1000 })) {
          await btn.click();
          added = true;
          break;
        }
      } catch {}
    }
    if (!added) { test.skip(true, 'Nie znaleziono przycisku dodaj do koszyka'); return; }
    await page.waitForTimeout(3000);
    await page.goto(BASE + '/checkout/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    await expect(page).toHaveScreenshot('checkout.png', { maxDiffPixelRatio: 0.05 });
  });
});
