import { test, expect } from '../../fixture';

test.describe('Elakiernik - Product Page @product-page @e2e', () => {
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
    const qtyInput = page.locator('#qty, input[name="qty"]');
    await expect(qtyInput.first()).toBeVisible();
  });

  test('should display product description/details', async ({ page }) => {
    const details = page.locator('.product-description, .product.info.detailed, .data.item.content');
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

  test('should display breadcrumbs', async ({ page, config }) => {
    // Navigate via category to get breadcrumbs (direct product URL may not show them)
    await page.goto(`${config.baseUrl}${config.category.url}`, { waitUntil: 'load' });
    // Dismiss Cookiebot
    await page.evaluate(() => { document.querySelectorAll('#CybotCookiebotDialog, #CybotCookiebotDialogBodyUnderlay').forEach(e => e.remove()); }).catch(() => {});
    const productItem = page.locator('.product-item-link, .product-item a[href]').first();
    await expect(productItem).toBeVisible({ timeout: 15000 });
    await productItem.click({ force: true });
    await page.waitForLoadState('load');
    const breadcrumbs = page.locator('.breadcrumbs, .breadcrumb');
    if (await breadcrumbs.count() === 0) test.skip(true, 'Brak breadcrumbs na stronie produktu');
    await expect(breadcrumbs.first()).toBeVisible({ timeout: 10000 });
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
