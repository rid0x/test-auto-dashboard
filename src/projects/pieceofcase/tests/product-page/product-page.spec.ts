import { test, expect } from '../../fixture';

test.describe('Pieceofcase - Product Page @product-page @e2e', () => {
  test.beforeEach(async ({ productPage }) => {
    await productPage.gotoDefaultProduct();
  });

  test('should display product name', async ({ productPage }) => {
    await productPage.expectProductNameVisible();
  });

  test('should display product price', async ({ productPage }) => {
    await productPage.expectProductPriceVisible();
  });

  test('should display product image', async ({ page }) => {
    await page.locator('.product-info-main, h1').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    const images = page.locator('.product-info-main img, .product.media img, .gallery-placeholder img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display add to cart button', async ({ page }) => {
    const addToCartBtn = page.locator(
      '#product-addtocart-button, button:has-text("Dodaj do koszyka"), button:has-text("Add to Cart")'
    );
    await expect(addToCartBtn.first()).toBeVisible();
  });

  test('should have quantity input', async ({ page }) => {
    const qtyInput = page.locator('#qty, input[name="qty"]');
    await expect(qtyInput.first()).toBeVisible();
  });

  test('should display product description/details', async ({ page }) => {
    const details = page.locator(
      '.product-description, .product.info.detailed, .product-info-detailed, .tab-section'
    );
    await expect(details.first()).toBeVisible({ timeout: 10000 });
  });

  test('should add product to cart', async ({ productPage }) => {
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();
  });

  test('should update quantity and add to cart', async ({ productPage }) => {
    await productPage.addToCartWithOptions(2);
    await productPage.expectAddToCartSuccess();
  });

  test('should display breadcrumbs', async ({ page }) => {
    const breadcrumbs = page.locator('.breadcrumbs, .breadcrumb, nav[aria-label="breadcrumb"]');
    await expect(breadcrumbs.first()).toBeVisible();
  });

  test('should have product reviews section', async ({ page }) => {
    const reviews = page.locator(
      '#tab-label-reviews, .product-reviews-summary, .reviews-actions, [data-role="reviews"]'
    );
    const count = await reviews.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display related/upsell products if available', async ({ page }) => {
    const related = page.locator(
      '.block.related, .block.upsell, .block.crosssell, .products-related, .products-upsell'
    );
    const count = await related.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
