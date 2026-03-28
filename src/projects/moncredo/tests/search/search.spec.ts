import { test, expect } from '../../fixture';

test.describe('Moncredo - Search @search @e2e', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  // @desc: Wyszukiwanie poprawnej frazy zwraca liste produktow (count > 0)
  test('should find results for valid query', async ({ page, config }) => {
    await test.step('Submit search form', async () => {
      await page.locator('#search').fill(config.search.validQuery);
      // Amasty search intercepts Enter — use form submit instead
      await page.locator('#search_mini_form').evaluate(form => (form as HTMLFormElement).submit());
      await page.waitForLoadState('load');
    });

    await test.step('Verify results page', async () => {
      expect(page.url()).toContain('catalogsearch/result');
      const products = page.locator('.product-item-info, .cs-product-tile, .product-item-link');
      const count = await products.count();
      expect(count).toBeGreaterThan(0);
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Search results', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Wyszukiwanie bzdury nie zwraca zadnych produktow (count = 0)
  test('should show no results for invalid query', async ({ page, config }) => {
    // Go directly to search results URL for reliability
    await page.goto(`https://moncredo.pl/catalogsearch/result/?q=${config.search.invalidQuery}`, { waitUntil: 'load' });

    const products = page.locator('.product-item');
    const count = await products.count();
    expect(count).toBe(0);
  });

  // @desc: Wpisywanie frazy wyświetla podpowiedzi autouzupełniania (Amasty)
  test('should show search suggestions (autocomplete)', async ({ page, config }) => {
    const searchInput = page.locator('#search');
    await searchInput.click({ force: true });
    await searchInput.pressSequentially(config.search.validQuery.substring(0, 3), { delay: 100 });

    // Wait for autocomplete to appear - Moncredo uses #search_autocomplete or cs-autocomplete
    const suggestions = page.locator('#search_autocomplete, .cs-autocomplete, .search-autocomplete');
    await expect(suggestions.first()).toBeVisible({ timeout: 15000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Autocomplete suggestions', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Wyszukiwanie przez formularz (submit) przenosi na strone wynikow
  test('should search via form submit', async ({ page, config }) => {
    await page.locator('#search').fill(config.search.validQuery);
    await page.locator('#search_mini_form').evaluate(form => (form as HTMLFormElement).submit());
    await page.waitForLoadState('load');

    expect(page.url()).toContain('catalogsearch/result');
  });

  // @desc: Wyniki wyszukiwania wyswietlaja nazwy produktow
  test('should display product info in results', async ({ page, config }) => {
    await page.goto(`https://moncredo.pl/catalogsearch/result/?q=${config.search.validQuery}`, { waitUntil: 'load' });

    const firstProduct = page.locator('.product-item-info, .cs-product-tile').first();
    await expect(firstProduct).toBeVisible();

    const name = firstProduct.locator('.product-item-name, .product-item-link, .cs-product-tile__name-link, a[href*=".html"]').first();
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
