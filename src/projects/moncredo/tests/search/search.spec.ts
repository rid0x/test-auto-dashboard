import { test, expect } from '../../fixture';

test.describe('Moncredo - Search @search @e2e', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should find results for valid query', async ({ page, config }) => {
    await test.step('Submit search form', async () => {
      await page.locator('#search').fill(config.search.validQuery);
      // Amasty search intercepts Enter — use form submit instead
      await page.locator('#search_mini_form').evaluate(form => (form as HTMLFormElement).submit());
      await page.waitForLoadState('load');
      await page.waitForTimeout(2000);
    });

    await test.step('Verify results page', async () => {
      expect(page.url()).toContain('catalogsearch/result');
      const products = page.locator('.product-item');
      const count = await products.count();
      expect(count).toBeGreaterThan(0);
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Search results', { body: screenshot, contentType: 'image/png' });
  });

  test('should show no results for invalid query', async ({ page, config }) => {
    // Go directly to search results URL for reliability
    await page.goto(`https://moncredo.pl/catalogsearch/result/?q=${config.search.invalidQuery}`, { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    const products = page.locator('.product-item');
    const count = await products.count();
    expect(count).toBe(0);
  });

  test('should show search suggestions (autocomplete)', async ({ page, config }) => {
    await page.locator('#search').fill(config.search.validQuery.substring(0, 3));
    await page.waitForTimeout(2000);

    const suggestions = page.locator('.amsearch-highlight, [class*="amsearch"]:visible');
    const count = await suggestions.count();
    expect(count).toBeGreaterThan(0);

    const screenshot = await page.screenshot();
    await test.info().attach('Autocomplete suggestions', { body: screenshot, contentType: 'image/png' });
  });

  test('should search via form submit', async ({ page, config }) => {
    await page.locator('#search').fill(config.search.validQuery);
    await page.locator('#search_mini_form').evaluate(form => (form as HTMLFormElement).submit());
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);

    expect(page.url()).toContain('catalogsearch/result');
  });

  test('should display product info in results', async ({ page, config }) => {
    await page.goto(`https://moncredo.pl/catalogsearch/result/?q=${config.search.validQuery}`, { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    const firstProduct = page.locator('.product-item').first();
    await expect(firstProduct).toBeVisible();

    const name = firstProduct.locator('.product-item-name, .product-item-link, a[href*=".html"]').first();
    await expect(name).toBeVisible();
  });

  test('should handle empty search', async ({ page }) => {
    await page.locator('#search').fill('');
    await page.locator('#search').press('Enter');
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have search input in header', async ({ page }) => {
    const searchInput = page.locator('#search');
    await expect(searchInput).toBeVisible();
  });
});
