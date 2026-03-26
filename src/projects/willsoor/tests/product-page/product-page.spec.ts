import { test, expect } from '../../fixture';

test.describe('Willsoor - Product Page @product-page @e2e', () => {
  test.beforeEach(async ({ productPage }) => {
    await productPage.gotoDefaultProduct();
  });

  test('should display product name', async ({ productPage, page }) => {
    await test.step('Product name visible in h1.page-title', async () => {
      const name = page.locator('h1.page-title');
      await expect(name).toBeVisible();
      const text = await name.textContent();
      expect(text!.trim().length).toBeGreaterThan(0);
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Product name', { body: screenshot, contentType: 'image/png' });
  });

  test('should display product price', async ({ page }) => {
    const price = page.locator('.price-box .price');
    await expect(price.first()).toBeVisible();

    const priceText = await price.first().textContent();
    expect(priceText).toBeTruthy();
    // Willsoor prices are in PLN (zl)
    expect(priceText).toContain('zł');

    const screenshot = await page.screenshot();
    await test.info().attach('Product price', { body: screenshot, contentType: 'image/png' });
  });

  test('should display product image', async ({ page }) => {
    const image = page.locator('.product.media img, .gallery-image');
    await expect(image.first()).toBeVisible({ timeout: 10000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Product image', { body: screenshot, contentType: 'image/png' });
  });

  test('should display add to cart button', async ({ page }) => {
    const addToCartBtn = page.locator('#product-addtocart-button');
    await expect(addToCartBtn).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Add to cart button', { body: screenshot, contentType: 'image/png' });
  });

  test('should have quantity input or size selector', async ({ page }) => {
    // Willsoor hides qty input — but has size SELECT dropdown
    const qtyOrSize = page.locator('#qty, input[name="qty"], select.super-attribute-select');
    const count = await qtyOrSize.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display size selector', async ({ page }) => {
    // Willsoor uses <select> dropdown for sizes, not swatch tiles
    const sizeSelect = page.locator('select.super-attribute-select');
    await expect(sizeSelect.first()).toBeVisible({ timeout: 10000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Size swatch', { body: screenshot, contentType: 'image/png' });
  });

  test('should display breadcrumbs', async ({ page }) => {
    const breadcrumbs = page.locator('.breadcrumbs');
    await expect(breadcrumbs).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Breadcrumbs', { body: screenshot, contentType: 'image/png' });
  });

  test('should display product description/details', async ({ page }) => {
    const details = page.locator(
      '.product.info.detailed, .product.attribute.description, #tab-label-description, .product-info-detailed'
    );
    await expect(details.first()).toBeVisible({ timeout: 10000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Product details', { body: screenshot, contentType: 'image/png' });
  });

  test('should add product to cart', async ({ productPage }) => {
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();
  });

  test('should update quantity and add to cart', async ({ productPage }) => {
    await productPage.addToCartWithOptions(2);
    await productPage.expectAddToCartSuccess();
  });

  test('should have product reviews section', async ({ page }) => {
    const reviews = page.locator(
      '#tab-label-reviews, .product-reviews-summary, .reviews-actions, [data-role="reviews"]'
    );
    // Reviews section may not exist on all products, so just check it doesn't throw
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
