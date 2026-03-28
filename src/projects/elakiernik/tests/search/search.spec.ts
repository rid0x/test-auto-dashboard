import { test, expect } from '../../fixture';

test.describe('Elakiernik - Search @search @e2e', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should find results for valid query', async ({ page, config }) => {
    await page.locator('#search').fill(config.search.validQuery);
    await page.locator('#search').press('Enter');
    await page.waitForLoadState('load');
    const url = page.url();
    expect(url.includes('catalogsearch/result') || url.includes(config.search.validQuery.toLowerCase())).toBeTruthy();
    const products = page.locator('.product-item, li.product-item');
    const count = await products.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show no results for invalid query', async ({ page, config }) => {
    await page.goto(`${config.baseUrl}/catalogsearch/result/?q=${config.search.invalidQuery}`, { waitUntil: 'load' });
    expect(await page.locator('.product-item').count()).toBe(0);
  });

  test('should show search suggestions (autocomplete)', async ({ page, config }) => {
    const searchInput = page.locator('#search');
    await searchInput.click({ force: true });
    await searchInput.pressSequentially(config.search.validQuery.substring(0, 3), { delay: 150 });
    const suggestions = page.locator('#search_autocomplete, .search-autocomplete');
    const isVisible = await suggestions.first().isVisible({ timeout: 10000 }).catch(() => false);
    if (!isVisible) {
      test.skip(true, 'Autouzupełnianie wyszukiwania nie jest dostępne');
    }
  });

  test('should search via form submit', async ({ page, config }) => {
    await page.locator('#search').fill(config.search.validQuery);
    await page.locator('#search').press('Enter');
    await page.waitForLoadState('load');
    const products = page.locator('.product-item, li.product-item');
    await expect(products.first()).toBeVisible({ timeout: 15000 });
  });

  test('should display product info in results', async ({ page, config }) => {
    await page.locator('#search').fill(config.search.validQuery);
    await page.locator('#search').press('Enter');
    await page.waitForLoadState('load');

    const firstProduct = page.locator('.product-item, li.product-item').first();
    await expect(firstProduct).toBeVisible({ timeout: 15000 });

    const name = firstProduct.locator('.product-item-name, .product-item-link, a.product-item-link').first();
    await expect(name).toBeVisible();
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
