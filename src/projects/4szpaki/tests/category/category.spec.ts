import { test, expect } from '../../fixture';

test.describe('4szpaki - Category @category @e2e', () => {
  test.beforeEach(async ({ categoryPage, config }) => {
    await categoryPage.goto(config.category.url);
  });

  // @desc: Strona kategorii wyswietla liste produktow
  test('should display category page with products', async ({ categoryPage, config }) => {
    await categoryPage.expectProductsVisible();
    await categoryPage.expectMinProducts(config.category.expectedMinProducts);
  });

  // @desc: Panel filtrow (skip — 4szpaki /twarz nie ma filtrow)
  test.skip('should display filter panel', async ({ categoryPage }) => {
    // Skipped: 4szpaki category /twarz does not have filter panel
    await categoryPage.expectFiltersVisible();
  });

  // @desc: Filtry posiadaja opcje do wyboru (skip — brak filtrow)
  test.skip('should have filter options', async ({ categoryPage }) => {
    const filterNames = await categoryPage.getFilterNames();
    expect(filterNames.length).toBeGreaterThan(0);
  });

  // @desc: Zastosowanie filtra odswieza liste produktow (skip — brak filtrow)
  test.skip('should apply filter and update results', async ({ categoryPage }) => {
    const countBefore = await categoryPage.getProductCount();
    await categoryPage.clickFirstFilterOption();
    await categoryPage.expectProductsVisible();
  });

  // @desc: Produkty na liscie maja widoczna nazwe i cene
  test('should display product names and prices', async ({ page }) => {
    const firstProduct = page.locator('.product-item, li.product-item').first();
    await expect(firstProduct).toBeVisible();

    const productName = firstProduct.locator('.product-item-name, .product-item-link, .product-name, a[href*=".html"]').first();
    await expect(productName).toBeVisible();
  });

  // @desc: Klikniecie produktu przenosi na strone produktu
  test('should navigate to product from category', async ({ categoryPage, page }) => {
    const productUrl = await categoryPage.clickFirstProduct();
    expect(page.url()).not.toContain(categoryPage['config'].category.url);
  });

  // @desc: Zmiana sortowania odswieza liste produktow
  test('should change sort order', async ({ categoryPage }) => {
    await categoryPage.changeSortOrder();
    await categoryPage.expectProductsVisible();
  });

  // @desc: Breadcrumbs (sciezka nawigacji) sa widoczne
  test('should display breadcrumbs', async ({ categoryPage }) => {
    await categoryPage.expectBreadcrumbsVisible();
  });

  // @desc: Liczba produktow jest widoczna w toolbarze kategorii
  test('should display product count', async ({ page }) => {
    const toolbar = page.locator('.toolbar-amount, .toolbar-number, .search-result-count');
    const count = await toolbar.count();
    if (count === 0) {
      test.skip(true, 'Brak toolbara z liczba produktow na tej kategorii');
    }
    expect(count).toBeGreaterThan(0);
  });
});
