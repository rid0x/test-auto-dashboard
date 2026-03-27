import { test, expect } from '../../fixture';

test.describe('Getprice - Search @search @e2e', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  // @desc: Wyszukiwanie poprawnej frazy zwraca liste produktow (count > 0)
  test('should find results for valid query', async ({ page, config }) => {
    // Go directly to search results (reliable, avoids Amasty JS intercepts)
    await page.goto(`${config.baseUrl}/pl/catalogsearch/result/?q=${config.search.validQuery}`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');

    await test.step('Verify results page', async () => {
      expect(page.url()).toContain('catalogsearch/result');
      const products = page.locator('.product-item');
      const count = await products.count();
      expect(count).toBeGreaterThan(0);
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Search results', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Wyszukiwanie bzdury nie zwraca zadnych produktow (count = 0)
  test('should show no results for invalid query', async ({ page, config }) => {
    // Go directly to search results URL for reliability
    await page.goto(`${config.baseUrl}/pl/catalogsearch/result/?q=${config.search.invalidQuery}`, { waitUntil: 'load' });

    const products = page.locator('.product-item');
    const count = await products.count();
    expect(count).toBe(0);
  });

  // @desc: Wpisywanie frazy wyświetla podpowiedzi autouzupełniania (Amasty)
  test('should show search suggestions (autocomplete)', async ({ page, config }) => {
    const searchInput = page.locator('#search');
    await searchInput.click();
    await searchInput.pressSequentially(config.search.validQuery.substring(0, 5), { delay: 100 });

    const suggestions = page.locator('.amsearch-highlight, .amsearch-products, .amsearch-results, [class*="amsearch"]:visible');
    await expect(suggestions.first()).toBeVisible({ timeout: 15000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Autocomplete suggestions', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Klikniecie linku przenosi na pelna strone wynikow wyszukiwania
  test('should navigate to full results via "Zobacz wszystkie"', async ({ page, config }) => {
    await page.locator('#search').fill(config.search.validQuery);

    // Amasty search opens overlay with products — click "Zobacz wszystkie" to go to full results
    const viewAllLink = page.locator('a:has-text("Zobacz wszystkie")');
    await expect(viewAllLink).toBeVisible({ timeout: 10000 });
    await viewAllLink.click();
    await page.waitForURL(/catalogsearch\/result/, { timeout: 10000 });

    expect(page.url()).toContain('catalogsearch/result');
  });

  // @desc: Wyniki wyszukiwania wyswietlaja nazwy produktow
  test('should display product info in results', async ({ page, config }) => {
    await page.goto(`${config.baseUrl}/pl/catalogsearch/result/?q=${config.search.validQuery}`, { waitUntil: 'load' });

    const firstProduct = page.locator('.product-item').first();
    await expect(firstProduct).toBeVisible();

    const name = firstProduct.locator('.product-item-name, .product-item-link, a[href*=".html"]').first();
    await expect(name).toBeVisible();
  });

  // @desc: Puste wyszukiwanie nie powoduje bledu strony
  test('should handle empty search', async ({ page }) => {
    await page.locator('#search').fill('');
    await page.locator('#search').press('Enter');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  // @desc: Pole wyszukiwania (#search) jest widoczne w naglowku strony
  test('should have search input in header', async ({ page }) => {
    const searchInput = page.locator('#search');
    await expect(searchInput).toBeVisible();
  });
});
