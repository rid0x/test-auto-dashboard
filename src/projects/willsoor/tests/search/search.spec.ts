import { test, expect } from '../../fixture';

test.describe('Willsoor - Search @search @e2e', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should find results for valid query', async ({ searchPage, config }) => {
    await searchPage.searchFromHeader(config.search.validQuery);
    await searchPage.expectResultsVisible();
    await searchPage.expectMinResults(config.search.expectedResultMinCount);
  });

  test('should show no results for invalid query', async ({ searchPage, config }) => {
    await searchPage.searchFromHeader(config.search.invalidQuery);
    await searchPage.expectNoResults();
  });

  test('should show search suggestions', async ({ page, config }) => {
    // Willsoor uses Amasty search with .amsearch-input
    const searchInput = page.locator('.amsearch-input');
    await searchInput.first().fill(config.search.validQuery.substring(0, 3));

    // Wait for Amasty autocomplete suggestions
    const suggestions = page.locator('.amsearch-results');
    await expect(suggestions.first()).toBeVisible({ timeout: 10000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Search suggestions', { body: screenshot, contentType: 'image/png' });
  });

  test('should search via Enter key', async ({ page, config }) => {
    const searchInput = page.locator('.amsearch-input');
    await searchInput.first().fill(config.search.validQuery);
    await page.keyboard.press('Enter');
    await page.waitForLoadState('load');

    // Should be on search results page
    expect(page.url()).toContain('catalogsearch/result');

    const screenshot = await page.screenshot();
    await test.info().attach('Search results via Enter', { body: screenshot, contentType: 'image/png' });
  });

  test('should search via search button', async ({ searchPage, config }) => {
    await searchPage.searchFor(config.search.validQuery);
    await searchPage.expectResultsVisible();
  });

  test('should display product info in results', async ({ searchPage, page, config }) => {
    await searchPage.searchFromHeader(config.search.validQuery);
    await searchPage.expectResultsVisible();

    // Each product item should have name and price
    const firstProduct = page.locator('.product-item').first();
    await expect(firstProduct.locator('.product-item-name, .product-item-link').first()).toBeVisible();
    await expect(firstProduct.locator('.price').first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Product info in results', { body: screenshot, contentType: 'image/png' });
  });

  test('should handle empty search gracefully', async ({ page }) => {
    const searchInput = page.locator('.amsearch-input');
    await searchInput.first().fill('');
    await page.keyboard.press('Enter');

    // Should either stay on same page or show validation
    await page.waitForTimeout(1000);
    // No crash, page is still responsive
    await expect(page.locator('body')).toBeVisible();
  });
});
