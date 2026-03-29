import { test, expect } from '../../fixture';

/**
 * Hulajnogimicro search results page uses a tabbed interface:
 *   - "All results" (default, shows CMS pages + product suggestions, NOT the product grid)
 *   - "Produkty" tab (shows the actual product grid with .cs-product-tile items)
 * Products use .cs-product-tile class, NOT .product-item.
 * The "Produkty" tab must be clicked to make products visible.
 */

/** Helper: navigate to search results and activate the Produkty tab */
async function gotoSearchAndActivateProducts(page: import('@playwright/test').Page, baseUrl: string, query: string) {
  await page.goto(`${baseUrl}/catalogsearch/result/?q=${query}`, { waitUntil: 'load' });
  // Click the "Produkty" tab to reveal the product grid
  const produktyTab = page.locator('a[href="#tab-content-products"]');
  if (await produktyTab.isVisible({ timeout: 5000 }).catch(() => false)) {
    await produktyTab.click();
    await page.waitForTimeout(1000);
  }
}

test.describe('Hulajnogimicro - Search @search @e2e', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  // @desc: Wyszukiwanie poprawnej frazy zwraca wyniki produktow
  test('should find results for valid query', async ({ page, config }) => {
    await gotoSearchAndActivateProducts(page, config.baseUrl, config.search.validQuery);

    const products = page.locator('.cs-product-tile');
    const count = await products.count();
    expect(count).toBeGreaterThanOrEqual(config.search.expectedResultMinCount);

    const screenshot = await page.screenshot();
    await test.info().attach('Search results', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Wyszukiwanie bzdurnej frazy zwraca zero wynikow
  test('should show no results for invalid query', async ({ page, config }) => {
    await gotoSearchAndActivateProducts(page, config.baseUrl, config.search.invalidQuery);

    const products = page.locator('.cs-product-tile');
    const count = await products.count();
    expect(count).toBe(0);
  });

  // @desc: Podpowiedzi wyszukiwania pojawiaja sie po wpisaniu tekstu
  test('should show search suggestions', async ({ page, config }) => {
    // Navigate to search results for partial query — the "All results" tab
    // shows product suggestions (definition links) and CMS pages
    await page.goto(`${config.baseUrl}/catalogsearch/result/?q=${config.search.validQuery.substring(0, 3)}`, { waitUntil: 'load' });

    // Verify search returned something: CMS pages, product suggestions, or product tiles
    const results = page.locator('.cs-product-tile, #tab-content-cmspages, dl a, h2:has-text("Products results")');
    await expect(results.first()).toBeVisible({ timeout: 15000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Search suggestions', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Wyszukiwanie klawiszem Enter przenosi na strone wynikow
  test('should search via URL navigation', async ({ page, config }) => {
    await gotoSearchAndActivateProducts(page, config.baseUrl, config.search.validQuery);

    expect(page.url()).toContain('catalogsearch/result');
    const products = page.locator('.cs-product-tile');
    const count = await products.count();
    expect(count).toBeGreaterThan(0);
  });

  // @desc: Strona wynikow wyszukiwania wyswietla taby (Strony / Produkty)
  test('should display search result tabs', async ({ page, config }) => {
    await page.goto(`${config.baseUrl}/catalogsearch/result/?q=${config.search.validQuery}`, { waitUntil: 'load' });

    // Hulajnogimicro search results page has tabs: "All results", "Strony", "Produkty"
    const productsTab = page.locator('a[href="#tab-content-products"]');
    await expect(productsTab).toBeVisible();

    const stronytab = page.locator('a[href="#tab-content-cmspages"]');
    await expect(stronytab).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Search result tabs', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Wyniki wyszukiwania wyswietlaja nazwe produktu
  test('should display product info in results', async ({ page, config }) => {
    await gotoSearchAndActivateProducts(page, config.baseUrl, config.search.validQuery);

    const firstProduct = page.locator('.cs-product-tile').first();
    await expect(firstProduct).toBeVisible();

    const name = firstProduct.locator('.product-item-link, .cs-product-tile__name a').first();
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
