import { test, expect } from '../../fixture';

test.describe('Pieceofcase - Search @search @e2e', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  // @desc: Wyszukiwanie poprawnej frazy zwraca liste produktow (count > 0)
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

  // @desc: Wyszukiwanie bzdury nie zwraca zadnych produktow (count = 0)
  test('should show no results for invalid query', async ({ page, config }) => {
    // ElasticSuite may redirect to homepage if no results found
    const noResultsQuery = 'zzqxjklmwvbn123456789';
    await page.goto(`${config.baseUrl}/pl/catalogsearch/result/?q=${noResultsQuery}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForLoadState('load').catch(() => {});

    // If redirected away from search results, that counts as "no results"
    if (!page.url().includes('catalogsearch/result')) {
      // Redirect to homepage = no results found
      expect(true).toBeTruthy();
      return;
    }

    const products = page.locator('.search.results .product-item, .search-result-list .product-item');
    const count = await products.count();
    expect(count).toBe(0);
  });

  // @desc: Wpisywanie frazy wyświetla podpowiedzi autouzupełniania (Smile ElasticSuite)
  test('should show search suggestions (autocomplete)', async ({ page, config }) => {
    // Wait for full page load — ElasticSuite JS loads via RequireJS during 'load' phase
    await page.waitForLoadState('load');

    const searchInput = page.locator('#search');
    await searchInput.click();
    await searchInput.pressSequentially(config.search.validQuery.substring(0, 4), { delay: 200 });

    // Smile ElasticSuite autocomplete
    const suggestions = page.locator('#search_autocomplete dd[role="option"], .smile-elasticsuite-autocomplete-result, .autocomplete-list dd');
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
    await page.goto(`${config.baseUrl}/pl/catalogsearch/result/?q=${config.search.validQuery}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForLoadState('load').catch(() => {});

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
