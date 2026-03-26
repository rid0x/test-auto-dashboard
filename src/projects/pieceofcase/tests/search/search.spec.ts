import { test, expect } from '../../fixture';

test.describe('Pieceofcase - Search @search @e2e', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should find results for valid query', async ({ page, config }) => {
    await test.step('Submit search form', async () => {
      await page.locator('#search').fill(config.search.validQuery);
      await page.locator('#search_mini_form').evaluate(form => (form as HTMLFormElement).submit());
      await page.waitForLoadState('load');
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
    await page.goto(`https://pieceofcase.pl/catalogsearch/result/?q=${config.search.invalidQuery}`, { waitUntil: 'load' });

    const products = page.locator('.product-item');
    const count = await products.count();
    expect(count).toBe(0);
  });

  test('should show search suggestions (autocomplete)', async ({ page, config }) => {
    await page.locator('#search').fill(config.search.validQuery.substring(0, 3));
    // Wait for autocomplete AJAX response
    const suggestions = page.locator('#search_autocomplete:visible, .amsearch-highlight, [class*="amsearch"]:visible');
    await suggestions.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    const count = await suggestions.count();
    expect(count).toBeGreaterThan(0);

    const screenshot = await page.screenshot();
    await test.info().attach('Autocomplete suggestions', { body: screenshot, contentType: 'image/png' });
  });

  test('should search via form submit', async ({ page, config }) => {
    await page.locator('#search').fill(config.search.validQuery);
    await page.locator('#search_mini_form').evaluate(form => (form as HTMLFormElement).submit());
    await page.waitForLoadState('load');

    expect(page.url()).toContain('catalogsearch/result');
  });

  test('should display product info in results', async ({ page, config }) => {
    await page.goto(`https://pieceofcase.pl/catalogsearch/result/?q=${config.search.validQuery}`, { waitUntil: 'load' });

    const firstProduct = page.locator('.product-item').first();
    await expect(firstProduct).toBeVisible();

    const name = firstProduct.locator('.product-item-name, .product-item-link, a[href*=".html"]').first();
    await expect(name).toBeVisible();
  });

  test('should handle empty search', async ({ page }) => {
    await page.locator('#search').fill('');
    await page.locator('#search').press('Enter');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have search input in header', async ({ page }) => {
    const searchInput = page.locator('#search');
    await expect(searchInput).toBeVisible();
  });
});
