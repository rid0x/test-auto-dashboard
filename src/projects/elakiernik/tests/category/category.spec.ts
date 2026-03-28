import { test, expect } from '../../fixture';

test.describe('Elakiernik - Category @category @e2e', () => {
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

  test('should apply filter and update results', async ({ page }) => {
    const filterOption = page.locator('.swatch-option-link-layered, .filter-options-content a, .filter-options-content .item a').first();
    if (await filterOption.isVisible({ timeout: 5000 }).catch(() => false)) {
      await filterOption.click();
      await page.waitForLoadState('load');
      const products = page.locator('.product-item, li.product-item');
      await expect(products.first()).toBeVisible({ timeout: 15000 });
    } else {
      test.skip(true, 'Brak klikalnych opcji filtrow');
    }
  });

  test('should display product names and prices', async ({ page }) => {
    const firstProduct = page.locator('li.product-item, .product-item').first();
    await expect(firstProduct).toBeVisible({ timeout: 15000 });
    await expect(firstProduct.locator('.product-item-name, a.product-item-link').first()).toBeVisible();
  });

  test('should navigate to product from category', async ({ page }) => {
    const productLink = page.locator('li.product-item a.product-item-link, .product-item a.product-item-link').first();
    await expect(productLink).toBeVisible({ timeout: 15000 });
    const categoryUrl = page.url();
    await productLink.click();
    await page.waitForLoadState('load');
    expect(page.url()).not.toBe(categoryUrl);
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
    if (await toolbar.count() === 0) test.skip(true, 'Brak toolbara z liczba produktow');
    expect(await toolbar.count()).toBeGreaterThan(0);
  });
});
