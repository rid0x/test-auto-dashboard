import { test, expect } from '../../fixture';

test.describe('Bladeville - Search @search @e2e', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  // @desc: Wyszukiwanie poprawnej frazy zwraca wyniki produktow
  test('should find results for valid query', async ({ page, config }) => {
    await page.goto(`${config.baseUrl}/catalogsearch/result/?q=${config.search.validQuery}`, { waitUntil: 'load' });

    const products = page.locator('.product-item');
    const count = await products.count();
    expect(count).toBeGreaterThanOrEqual(config.search.expectedResultMinCount);

    const screenshot = await page.screenshot();
    await test.info().attach('Search results', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Wyszukiwanie bzdurnej frazy zwraca zero wynikow
  test('should show no results for invalid query', async ({ page, config }) => {
    await page.goto(`${config.baseUrl}/catalogsearch/result/?q=${config.search.invalidQuery}`, { waitUntil: 'load' });

    const products = page.locator('.product-item');
    const count = await products.count();
    expect(count).toBe(0);
  });

  // @desc: Podpowiedzi wyszukiwania pojawiaja sie po wpisaniu tekstu
  test('should show search suggestions', async ({ page, config }) => {
    const searchInput = page.locator('#search, input[name="q"]').first();
    await searchInput.click();
    await searchInput.pressSequentially(config.search.validQuery.substring(0, 4), { delay: 100 });

    // Wait for Magento AJAX autocomplete response
    const suggestions = page.locator('#search_autocomplete, .search-autocomplete');
    await expect(suggestions.first()).toBeVisible({ timeout: 15000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Search suggestions', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Wyszukiwanie klawiszem Enter przenosi na strone wynikow
  test('should search via Enter key', async ({ page, config }) => {
    const searchInput = page.locator('#search, input[name="q"]').first();
    await searchInput.fill(config.search.validQuery);
    await searchInput.press('Enter');

    await page.waitForURL(/catalogsearch\/result/, { timeout: 15000 });
    expect(page.url()).toContain('catalogsearch/result');
  });

  // @desc: Wyniki wyszukiwania wyswietlaja nazwe produktu
  test('should display product info in results', async ({ page, config }) => {
    await page.goto(`${config.baseUrl}/catalogsearch/result/?q=${config.search.validQuery}`, { waitUntil: 'load' });

    const firstProduct = page.locator('.product-item').first();
    await expect(firstProduct).toBeVisible();

    const name = firstProduct.locator('.product-item-name, .product-item-link, a strong').first();
    await expect(name).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Product info', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Puste wyszukiwanie nie powoduje bledu na stronie
  test('should handle empty search', async ({ page }) => {
    const searchInput = page.locator('#search, input[name="q"]').first();
    await searchInput.fill('');
    await page.keyboard.press('Enter');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });
});
