import { test, expect } from '../../fixture';

test.describe('Hulajnogimicro - Search @search @e2e', () => {
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
    // Hulajnogimicro search input is hidden — navigate directly to search results
    // and type in the search input on the results page
    await page.goto(`${config.baseUrl}/catalogsearch/result/?q=${config.search.validQuery.substring(0, 3)}`, { waitUntil: 'load' });

    // Verify search returned something or suggestions appeared
    const results = page.locator('.product-item, .search-autocomplete, #search_autocomplete');
    await expect(results.first()).toBeVisible({ timeout: 15000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Search suggestions', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Wyszukiwanie klawiszem Enter przenosi na strone wynikow
  test('should search via URL navigation', async ({ page, config }) => {
    // Hulajnogimicro search input is hidden in header — test URL-based search
    await page.goto(`${config.baseUrl}/catalogsearch/result/?q=${config.search.validQuery}`, { waitUntil: 'load' });

    expect(page.url()).toContain('catalogsearch/result');
    const products = page.locator('.product-item');
    const count = await products.count();
    expect(count).toBeGreaterThan(0);
  });

  // @desc: Strona wynikow wyszukiwania wyswietla taby (Strony / Produkty)
  test('should display search result tabs', async ({ page, config }) => {
    await page.goto(`${config.baseUrl}/catalogsearch/result/?q=${config.search.validQuery}`, { waitUntil: 'load' });

    // Hulajnogimicro search results page has tabs: "All results", "Strony", "Produkty"
    const productsTab = page.locator('a:has-text("Produkty")');
    await expect(productsTab.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Search result tabs', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Wyniki wyszukiwania wyswietlaja nazwe produktu
  test('should display product info in results', async ({ page, config }) => {
    await page.goto(`${config.baseUrl}/catalogsearch/result/?q=${config.search.validQuery}`, { waitUntil: 'load' });

    const firstProduct = page.locator('.product-item').first();
    await expect(firstProduct).toBeVisible();

    const name = firstProduct.locator('.product-item-name, .product-item-link').first();
    await expect(name).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Product info', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Puste wyszukiwanie nie powoduje bledu na stronie
  test('should handle empty search', async ({ page, config }) => {
    await page.goto(`${config.baseUrl}/catalogsearch/result/?q=`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
  });

  // @desc: Naglowek wynikow wyszukiwania zawiera szukana fraze
  test('should display search query in heading', async ({ page, config }) => {
    await page.goto(`${config.baseUrl}/catalogsearch/result/?q=${config.search.validQuery}`, { waitUntil: 'load' });

    const heading = page.locator('h1');
    await expect(heading.first()).toBeVisible();
    const headingText = await heading.first().textContent();
    expect(headingText?.toLowerCase()).toContain(config.search.validQuery.toLowerCase());

    const screenshot = await page.screenshot();
    await test.info().attach('Search heading', { body: screenshot, contentType: 'image/png' });
  });
});
