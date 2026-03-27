import { test, expect } from '../../fixture';
import { dismissCookiesIfPresent } from '../../../../core/helpers/cookie-consent';

const CONFIGURATOR_URL = '/pl/fujitsu-rx300-s8-konfigurator-fujitsu-primergy-rx300-s8-8x-25.html';

test.describe('Getprice - Server Configurator @configurator @e2e', () => {
  test.beforeEach(async ({ page, config }) => {
    await page.goto(`${config.baseUrl}${CONFIGURATOR_URL}`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    await dismissCookiesIfPresent(page, config.features.cookieConsentSelector);
  });

  // @desc: Strona konfiguratora wyswietla tytul produktu i cene
  test('should display configurator page', async ({ page }) => {
    await test.step('Verify product title', async () => {
      const title = page.locator('h1');
      await expect(title.first()).toBeVisible();
      const text = await title.first().textContent();
      expect(text).toContain('Konfigurator');
    });

    await test.step('Verify product price', async () => {
      const price = page.locator('.price-box .price, .price');
      await expect(price.first()).toBeVisible();
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Configurator page', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Kroki konfiguracji (wybor, wycena) sa widoczne jako przyciski
  test('should display configuration steps', async ({ page }) => {
    await test.step('Step 1: Wybierz konfiguracje', async () => {
      const step1 = page.locator('button:has-text("Wybierz konfiguracje"), :has-text("1. Wybierz")');
      await expect(step1.first()).toBeVisible();
    });

    await test.step('Step 2: Wycena konfiguracji', async () => {
      const step2 = page.locator('button:has-text("Wycena konfiguracji"), :has-text("2. Wycena")');
      await expect(step2.first()).toBeVisible();
    });
  });

  // @desc: Dropdown gwarancji wyswietla opcje do wyboru
  test('should display guarantee select', async ({ page }) => {
    const guarantee = page.locator('select');
    await expect(guarantee.first()).toBeVisible();
    const options = await guarantee.first().locator('option').count();
    expect(options).toBeGreaterThan(1);

    const screenshot = await page.screenshot();
    await test.info().attach('Guarantee options', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Przycisk "Dodaj do koszyka" jest widoczny na stronie
  test('should have add to cart button', async ({ page }) => {
    await expect(page.locator('#product-addtocart-button')).toBeVisible();
  });

  // @desc: Dodanie konfiguratora do koszyka po wyborze opcji gwarancji
  test('should add configurator product to cart', async ({ page }) => {
    await test.step('Select guarantee option', async () => {
      const guarantee = page.locator('select').first();
      await guarantee.selectOption({ index: 1 });
    });

    await test.step('Click add to cart', async () => {
      await page.locator('#product-addtocart-button').click();
    });

    await test.step('Verify success', async () => {
      const msg = page.locator('.message.success, .message:has-text("Dodałeś")');
      await expect(msg.first()).toBeVisible({ timeout: 10000 });
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Added to cart', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Przycisk zapisu konfiguracji jest widoczny
  test('should have save configuration button', async ({ page }) => {
    const saveBtn = page.locator('button:has-text("Zapisz konfigurację"), :has-text("Zapisz konfigura")');
    await expect(saveBtn.first()).toBeVisible();
  });

  // @desc: Zdjecie produktu jest widoczne na stronie
  test('should display product image', async ({ page }) => {
    const img = page.locator('img[alt*="Konfigurator"], img[alt*="Fujitsu"], .product-info-main img, img.object-contain');
    const count = await img.count();
    expect(count).toBeGreaterThan(0);
  });

  // @desc: Breadcrumbs (sciezka nawigacji) sa widoczne
  test('should display breadcrumbs', async ({ page }) => {
    const bc = page.locator('.breadcrumbs, nav[aria-label="breadcrumb"]');
    await expect(bc.first()).toBeVisible();
  });
});
