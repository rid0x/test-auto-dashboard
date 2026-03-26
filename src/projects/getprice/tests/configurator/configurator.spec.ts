import { test, expect } from '../../fixture';

const CONFIGURATOR_URL = '/pl/fujitsu-rx300-s8-konfigurator-fujitsu-primergy-rx300-s8-8x-25.html';

test.describe('Getprice - Server Configurator @configurator @e2e', () => {
  test.beforeEach(async ({ page, config }) => {
    await page.goto(`${config.baseUrl}${CONFIGURATOR_URL}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    // Cookie
    try { await page.locator('.consent-cookie-directive button').first().click({ timeout: 2000 }); } catch {}
  });

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

  test('should display guarantee select', async ({ page }) => {
    const guarantee = page.locator('select');
    await expect(guarantee.first()).toBeVisible();
    const options = await guarantee.first().locator('option').count();
    expect(options).toBeGreaterThan(1);

    const screenshot = await page.screenshot();
    await test.info().attach('Guarantee options', { body: screenshot, contentType: 'image/png' });
  });

  test('should have add to cart button', async ({ page }) => {
    await expect(page.locator('#product-addtocart-button')).toBeVisible();
  });

  test('should add configurator product to cart', async ({ page }) => {
    await test.step('Select guarantee option', async () => {
      const guarantee = page.locator('select').first();
      await guarantee.selectOption({ index: 1 });
    });

    await test.step('Click add to cart', async () => {
      await page.locator('#product-addtocart-button').click();
      await page.waitForTimeout(3000);
    });

    await test.step('Verify success', async () => {
      const msg = page.locator('.message.success, .message:has-text("Dodałeś")');
      await expect(msg.first()).toBeVisible({ timeout: 10000 });
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Added to cart', { body: screenshot, contentType: 'image/png' });
  });

  test('should have save configuration button', async ({ page }) => {
    const saveBtn = page.locator('button:has-text("Zapisz konfigurację"), :has-text("Zapisz konfigura")');
    await expect(saveBtn.first()).toBeVisible();
  });

  test('should display product image', async ({ page }) => {
    const img = page.locator('img[alt*="Konfigurator"], img[alt*="Fujitsu"], .product-info-main img, img.object-contain');
    const count = await img.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display breadcrumbs', async ({ page }) => {
    const bc = page.locator('.breadcrumbs, nav[aria-label="breadcrumb"]');
    await expect(bc.first()).toBeVisible();
  });
});
