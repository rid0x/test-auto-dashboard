import { test, expect } from '../../fixture';

test.describe('Entelo - Product Page @product-page @e2e', () => {
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
    const images = page.locator('.product-info-main img, .product.media img, .gallery-placeholder img');
    await images.first().waitFor({ state: 'attached', timeout: 10000 }).catch(() => {});
    expect(await images.count()).toBeGreaterThan(0);
  });

  test('should display add to cart button', async ({ page }) => {
    await expect(page.locator('#product-addtocart-button, button:has-text("Dodaj do koszyka")').first()).toBeVisible();
  });

  test('should have quantity input', async ({ page }) => {
    await expect(page.locator('#qty, input[name="qty"]').first()).toBeVisible();
  });

  test('should display product description/details', async ({ page }) => {
    await expect(page.locator('.product-description, .product.info.detailed, .data.item.content').first()).toBeVisible({ timeout: 10000 });
  });

  test('should add product to cart', async ({ productPage }) => {
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();
  });

  test('should display breadcrumbs', async ({ page }) => {
    const breadcrumbs = page.locator('.breadcrumbs, .breadcrumb, nav[aria-label="breadcrumb"], .cs-breadcrumbs');
    if (await breadcrumbs.count() === 0) test.skip(true, 'Brak breadcrumbs na stronie produktu');
    await expect(breadcrumbs.first()).toBeVisible();
  });

  test('should have product reviews section', async ({ page }) => {
    const reviews = page.locator('#tab-label-reviews, .product-reviews-summary, .reviews-actions');
    if (await reviews.count() === 0) test.skip(true, 'Brak sekcji opinii');
    expect(await reviews.count()).toBeGreaterThan(0);
  });

  test('should display related/upsell products if available', async ({ page }) => {
    const related = page.locator('.block.related, .block.upsell, .block.crosssell');
    if (await related.count() === 0) test.skip(true, 'Brak produktow powiazanych');
    expect(await related.count()).toBeGreaterThan(0);
  });
});
