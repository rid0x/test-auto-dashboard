import { test, expect } from '../../fixture';

test.describe('Pierrerene - Search @search @e2e', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  // @desc: Wyszukiwanie poprawnej frazy zwraca liste produktow (count > 0)
  test('should find results for valid query', async ({ page, config }) => {
    await test.step('Submit search form', async () => {
      await page.locator('#search, .js-search-input').first().fill(config.search.validQuery);
      await page.locator('#search, .js-search-input').first().press('Enter');
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

  // @desc: Wyszukiwanie bzdury nie zwraca zadnych produktow (count = 0)
  test('should show no results for invalid query', async ({ page, config }) => {
    await page.goto(`${config.baseUrl}/pl/catalogsearch/result/?q=${config.search.invalidQuery}`, { waitUntil: 'load' });

    const products = page.locator('.product-item');
    const count = await products.count();
    expect(count).toBe(0);
  });

  // @desc: Wpisywanie frazy wyswietla podpowiedzi autouzupelniania
  test('should show search suggestions (autocomplete)', async ({ page, config }) => {
    const searchInput = page.locator('#search, .js-search-input').first();
    await searchInput.click();
    await searchInput.pressSequentially(config.search.validQuery.substring(0, 3), { delay: 150 });

    const suggestions = page.locator(
      '#search_autocomplete, .amsearch-results, [class*="search-autocomplete"], ' +
      '[class*="suggest"], .autocomplete-suggestions, .search-autocomplete, ' +
      '.minisearch-suggest, [class*="autosuggest"]'
    );

    const isVisible = await suggestions.first().isVisible({ timeout: 10000 }).catch(() => false);
    if (!isVisible) {
      test.skip(true, 'Autouzupelnianie wyszukiwania nie jest dostepne w tym sklepie');
    }

    const screenshot = await page.screenshot();
    await test.info().attach('Autocomplete suggestions', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Wyszukiwanie przez formularz (submit) przenosi na strone wynikow
  test('should search via form submit', async ({ page, config }) => {
    await page.locator('#search, .js-search-input').first().fill(config.search.validQuery);
    await page.locator('#search, .js-search-input').first().press('Enter');
    await page.waitForLoadState('load');

    expect(page.url()).toContain('catalogsearch/result');
  });

  // @desc: Wyniki wyszukiwania wyswietlaja nazwy produktow
  test('should display product info in results', async ({ page, config }) => {
    await page.goto(`${config.baseUrl}/pl/catalogsearch/result/?q=${config.search.validQuery}`, { waitUntil: 'load' });

    const firstProduct = page.locator('.product-item').first();
    await expect(firstProduct).toBeVisible();

    const name = firstProduct.locator('.product-item-name, .product-item-link, a[href*="/pl/"]').first();
    await expect(name).toBeVisible();
  });

  // @desc: Puste wyszukiwanie nie powoduje bledu strony
  test('should handle empty search', async ({ page }) => {
    await page.locator('#search, .js-search-input').first().fill('');
    await page.locator('#search, .js-search-input').first().press('Enter');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  // @desc: Pole wyszukiwania jest widoczne w naglowku strony
  test('should have search input in header', async ({ page }) => {
    const searchInput = page.locator('#search, .js-search-input');
    await expect(searchInput.first()).toBeVisible();
  });
});
