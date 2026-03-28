import { test, expect } from '../../fixture';

test.describe('Distripark - Search @search @e2e', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should find results for valid query', async ({ page, config }) => {
    await page.locator('#search').fill(config.search.validQuery);
    await page.locator('#search').press('Enter');
    await page.waitForLoadState('load');
    expect(page.url()).toContain('catalogsearch/result');
    expect(await page.locator('.product-item').count()).toBeGreaterThan(0);
  });

  test('should show no results for invalid query', async ({ page, config }) => {
    await page.goto(`${config.baseUrl}/catalogsearch/result/?q=${config.search.invalidQuery}`, { waitUntil: 'load' });
    expect(await page.locator('.product-item').count()).toBe(0);
  });

  test('should show search suggestions (autocomplete)', async ({ page, config }) => {
    const searchInput = page.locator('#search');
    await searchInput.click();
    await searchInput.pressSequentially(config.search.validQuery.substring(0, 3), { delay: 100 });
    const suggestions = page.locator('#search_autocomplete:visible, [class*="search-autocomplete"]:visible');
    await expect(suggestions.first()).toBeVisible({ timeout: 15000 });
  });

  test('should search via form submit', async ({ page, config }) => {
    await page.locator('#search').fill(config.search.validQuery);
    await page.locator('#search').press('Enter');
    await page.waitForLoadState('load');
    expect(page.url()).toContain('catalogsearch/result');
  });

  test('should display product info in results', async ({ page, config }) => {
    await page.goto(`${config.baseUrl}/catalogsearch/result/?q=${config.search.validQuery}`, { waitUntil: 'load' });
    const firstProduct = page.locator('.product-item').first();
    await expect(firstProduct).toBeVisible();
    await expect(firstProduct.locator('.product-item-name, .product-item-link, a[href]').first()).toBeVisible();
  });

  test('should handle empty search', async ({ page }) => {
    await page.locator('#search').fill('');
    await page.locator('#search').press('Enter');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have search input in header', async ({ page }) => {
    await expect(page.locator('#search')).toBeVisible();
  });
});
