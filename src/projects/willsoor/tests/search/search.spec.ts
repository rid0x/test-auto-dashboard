import { test, expect } from '../../fixture';

test.describe('Willsoor - Search @search @e2e', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should find results for valid query', async ({ page, config }) => {
    await page.goto(`${config.baseUrl}/catalogsearch/result/?q=${config.search.validQuery}`, { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    const products = page.locator('.product-item');
    const count = await products.count();
    expect(count).toBeGreaterThanOrEqual(config.search.expectedResultMinCount);

    const screenshot = await page.screenshot();
    await test.info().attach('Search results', { body: screenshot, contentType: 'image/png' });
  });

  test('should show no results for invalid query', async ({ page, config }) => {
    await page.goto(`${config.baseUrl}/catalogsearch/result/?q=${config.search.invalidQuery}`, { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    const products = page.locator('.product-item');
    const count = await products.count();
    expect(count).toBe(0);
  });

  test('should show search suggestions', async ({ page, config }) => {
    const searchInput = page.locator('.amsearch-input, input[name="q"]').first();
    await searchInput.fill(config.search.validQuery.substring(0, 4));
    await page.waitForTimeout(3000);

    // Amasty shows product suggestions
    const suggestions = page.locator('.amsearch-products, .amsearch-item, [class*="amsearch"]:visible');
    const count = await suggestions.count();
    expect(count).toBeGreaterThan(0);

    const screenshot = await page.screenshot();
    await test.info().attach('Search suggestions', { body: screenshot, contentType: 'image/png' });
  });

  test('should search via Enter key', async ({ page, config }) => {
    const searchInput = page.locator('.amsearch-input, input[name="q"]').first();
    await searchInput.fill(config.search.validQuery);
    await page.keyboard.press('Enter');
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);

    expect(page.url()).toContain('catalogsearch/result');
  });

  test('should search via search button', async ({ page, config }) => {
    const searchInput = page.locator('.amsearch-input, input[name="q"]').first();
    await searchInput.fill(config.search.validQuery);

    const searchBtn = page.locator('.amsearch-button, button[title="Szukaj"]').first();
    await searchBtn.click();
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);

    const products = page.locator('.product-item');
    const count = await products.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display product info in results', async ({ page, config }) => {
    await page.goto(`${config.baseUrl}/catalogsearch/result/?q=${config.search.validQuery}`, { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    const firstProduct = page.locator('.product-item').first();
    await expect(firstProduct).toBeVisible();

    const name = firstProduct.locator('.product-item-name, .product-item-link').first();
    await expect(name).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Product info', { body: screenshot, contentType: 'image/png' });
  });

  test('should handle empty search', async ({ page }) => {
    const searchInput = page.locator('.amsearch-input, input[name="q"]').first();
    await searchInput.fill('');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });
});
