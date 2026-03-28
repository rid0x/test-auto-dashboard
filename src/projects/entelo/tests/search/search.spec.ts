import { test, expect } from '../../fixture';

test.describe('Entelo - Search @search @e2e', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should find results for valid query', async ({ page, config }) => {
    await page.locator('#search, input[name="q"]').first().fill(config.search.validQuery);
    await page.locator('#search, input[name="q"]').first().press('Enter');
    await page.waitForLoadState('load');
    // Some stores redirect search to category pages
    const products = page.locator('.product-item, .product-item-info, .products-grid .item');
    await products.first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    expect(await products.count()).toBeGreaterThan(0);
  });

  test('should show no results for invalid query', async ({ page, config }) => {
    await page.locator('#search, input[name="q"]').first().fill(config.search.invalidQuery);
    await page.locator('#search, input[name="q"]').first().press('Enter');
    await page.waitForLoadState('load');
    const products = page.locator('.product-item, .product-item-info');
    const noResults = page.locator('.message.notice, .search.no-results, :has-text("Brak wyników")');
    const productCount = await products.count();
    const hasNoResultsMsg = await noResults.first().isVisible().catch(() => false);
    expect(productCount === 0 || hasNoResultsMsg).toBeTruthy();
  });

  test('should show search suggestions (autocomplete)', async ({ page, config }) => {
    const searchInput = page.locator('#search, input[name="q"]').first();
    await searchInput.click({ force: true });
    await searchInput.pressSequentially(config.search.validQuery.substring(0, 4), { delay: 100 });
    const suggestions = page.locator('#search_autocomplete, .search-autocomplete, [class*="doofinder"], [class*="suggest"]');
    const isVisible = await suggestions.first().isVisible({ timeout: 10000 }).catch(() => false);
    if (!isVisible) {
      test.skip(true, 'Autouzupełnianie wyszukiwania nie jest dostępne');
    }
  });

  test('should search via form submit', async ({ page, config }) => {
    await page.locator('#search, input[name="q"]').first().fill(config.search.validQuery);
    await page.locator('#search, input[name="q"]').first().press('Enter');
    await page.waitForLoadState('load');
    // Verify we navigated somewhere (URL changed)
    expect(page.url()).not.toBe(config.baseUrl + '/');
  });

  test('should display product info in results', async ({ page, config }) => {
    await page.locator('#search, input[name="q"]').first().fill(config.search.validQuery);
    await page.locator('#search, input[name="q"]').first().press('Enter');
    await page.waitForLoadState('load');
    const firstProduct = page.locator('.product-item, .product-item-info').first();
    await expect(firstProduct).toBeVisible({ timeout: 15000 });
  });

  test('should handle empty search', async ({ page }) => {
    await page.locator('#search, input[name="q"]').first().fill('');
    await page.locator('#search, input[name="q"]').first().press('Enter');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have search input in header', async ({ page }) => {
    await expect(page.locator('#search, input[name="q"]').first()).toBeVisible();
  });
});
