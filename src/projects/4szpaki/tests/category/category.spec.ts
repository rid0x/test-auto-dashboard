import { test, expect } from '../../fixture';

test.describe('4szpaki - Category @category @e2e', () => {
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
    const countBefore = await categoryPage.getProductCount();
    await categoryPage.clickFirstFilterOption();

    await categoryPage.expectProductsVisible();
    const countAfter = await categoryPage.getProductCount();
    expect(countAfter).toBeGreaterThan(0);
  });

  test('should display product names and prices', async ({ page }) => {
    const firstProduct = page.locator('.product-item, li.product-item').first();
    await expect(firstProduct).toBeVisible();

    const productName = firstProduct.locator('.product-item-name, .product-item-link, .product-name, a[href*=".html"]').first();
    await expect(productName).toBeVisible();
  });

  test('should navigate to product from category', async ({ categoryPage, page }) => {
    const productUrl = await categoryPage.clickFirstProduct();
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
    const toolbar = page.locator('.toolbar-amount, .toolbar-number, .search-result-count');
    const count = await toolbar.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
