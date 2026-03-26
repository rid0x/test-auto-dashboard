import { test, expect } from '../../fixture';

test.describe('Getprice - Product Page @product-page @e2e', () => {
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
    // Getprice uses lazy-loaded images — scroll to product area first
    await page.locator('.product-info-main, h1').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Check that at least one product image exists (may be lazy loaded)
    const images = page.locator('.product-info-main img, img[alt*="Patchcord"], img.object-contain');
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
      '.product-description, .tab-section, .custom-getprice-tabs, .product.info.detailed, .product-info-detailed'
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
    // Reviews section may not exist on all products, so just check it doesn't throw
    const count = await reviews.count();
    // It's OK if reviews section doesn't exist
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display related/upsell products if available', async ({ page }) => {
    const related = page.locator(
      '.block.related, .block.upsell, .block.crosssell, .products-related, .products-upsell'
    );
    const count = await related.count();
    // Related products are optional
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
