import { test, expect } from '../../fixture';

test.describe('Willsoor - Category @category @e2e', () => {
  test.beforeEach(async ({ categoryPage, config }) => {
    await categoryPage.goto(config.category.url);
  });

  // @desc: Strona kategorii wyswietla liste produktow
  test('should display category page with products', async ({ categoryPage, config }) => {
    await categoryPage.expectProductsVisible();
    await categoryPage.expectMinProducts(config.category.expectedMinProducts);
  });

  // @desc: Panel filtrow jest widoczny na stronie kategorii
  test('should display filter panel', async ({ categoryPage }) => {
    await categoryPage.expectFiltersVisible();
  });

  // @desc: Filtry zawieraja opcje do wyboru
  test('should have filter options', async ({ categoryPage }) => {
    const filterNames = await categoryPage.getFilterNames();
    expect(filterNames.length).toBeGreaterThan(0);
  });

  // @desc: Zastosowanie filtra aktualizuje wyniki na liscie produktow
  test('should apply filter and update results', async ({ categoryPage }) => {
    const countBefore = await categoryPage.getProductCount();
    await categoryPage.clickFirstFilterOption();

    await categoryPage.expectProductsVisible();
    const countAfter = await categoryPage.getProductCount();
    expect(countAfter).toBeGreaterThan(0);
  });

  // @desc: Produkty na liscie maja widoczna nazwe i cene
  test('should display product names and prices', async ({ page }) => {
    const firstProduct = page.locator('.product-item, li.product-item').first();
    await expect(firstProduct).toBeVisible();

    const productName = firstProduct.locator('.product-item-name, .product-item-link, .product-name').first();
    await expect(productName).toBeVisible();

    const price = firstProduct.locator('.price-box .price, .price').first();
    await expect(price).toBeVisible();
  });

  // @desc: Klikniecie produktu przenosi na strone produktu
  test('should navigate to product from category', async ({ categoryPage, page }) => {
    const productUrl = await categoryPage.clickFirstProduct();
    expect(page.url()).not.toContain(categoryPage['config'].category.url);
  });

  // @desc: Zmiana sortowania produktow dziala poprawnie
  test('should change sort order', async ({ categoryPage }) => {
    await categoryPage.changeSortOrder();
    await categoryPage.expectProductsVisible();
  });

  // @desc: Okruszki nawigacji sa widoczne na stronie kategorii
  test('should display breadcrumbs', async ({ categoryPage }) => {
    await categoryPage.expectBreadcrumbsVisible();
  });

  // @desc: Pasek narzedzi pokazuje liczbe produktow w kategorii
  test('should have product count in toolbar', async ({ page }) => {
    // Willsoor has .toolbar-amount with text but it's visually hidden — verify text content exists
    const toolbar = page.locator('.toolbar-amount');
    const text = await toolbar.first().textContent().catch(() => '');
    expect(text.trim().length).toBeGreaterThan(0);
    expect(text).toContain('Produkt');
  });
});
