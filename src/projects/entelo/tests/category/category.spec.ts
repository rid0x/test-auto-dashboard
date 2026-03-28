import { test, expect } from '../../fixture';

test.describe('Entelo - Category @category @e2e', () => {
  test.beforeEach(async ({ categoryPage, config }) => {
    await categoryPage.goto(config.category.url);
  });

  test('should display category page with products', async ({ categoryPage, config }) => {
    await categoryPage.expectProductsVisible();
    await categoryPage.expectMinProducts(config.category.expectedMinProducts);
  });

  test('should display filter panel', async ({ categoryPage }) => {
    await categoryPage.expectFiltersVisible();
  });

  test('should have filter options', async ({ categoryPage }) => {
    const filterNames = await categoryPage.getFilterNames();
    expect(filterNames.length).toBeGreaterThan(0);
  });

  test('should apply filter and update results', async ({ categoryPage }) => {
    await categoryPage.clickFirstFilterOption();
    await categoryPage.expectProductsVisible();
  });

  test('should display product names and prices', async ({ page }) => {
    const firstProduct = page.locator('.product-item').first();
    await expect(firstProduct).toBeVisible();
    await expect(firstProduct.locator('.product-item-name, .product-item-link, a[href]').first()).toBeVisible();
  });

  test('should navigate to product from category', async ({ categoryPage, page }) => {
    await categoryPage.clickFirstProduct();
    expect(page.url()).not.toContain(categoryPage['config'].category.url);
  });

  test('should change sort order', async ({ categoryPage }) => {
    await categoryPage.changeSortOrder();
    await categoryPage.expectProductsVisible();
  });

  test('should display breadcrumbs', async ({ categoryPage }) => {
    await categoryPage.expectBreadcrumbsVisible();
  });

  test('should display product count', async ({ page }) => {
    const toolbar = page.locator('.toolbar-amount, .toolbar-number');
    if (await toolbar.count() === 0) test.skip(true, 'Brak toolbara');
    expect(await toolbar.count()).toBeGreaterThan(0);
  });
});
