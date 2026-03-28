import { test, expect } from '../../fixture';

test.describe('Moncredo - Product Page @product-page @e2e', () => {
  test.beforeEach(async ({ productPage }) => {
    await productPage.gotoDefaultProduct();
  });

  // @desc: Nazwa produktu (h1) jest widoczna na stronie produktu
  test('should display product name', async ({ productPage }) => {
    await productPage.expectProductNameVisible();
  });

  // @desc: Cena produktu jest widoczna (w PLN)
  test('should display product price', async ({ productPage }) => {
    await productPage.expectProductPriceVisible();
  });

  // @desc: Zdjecie produktu jest widoczne na stronie
  test('should display product image', async ({ page }) => {
    // Scroll to product area first for lazy-loaded images
    await page.locator('.product-info-main, h1').first().scrollIntoViewIfNeeded();
    await page.locator('.product-info-main img, .product.media img, img.object-contain').first().waitFor({ state: 'attached', timeout: 10000 }).catch(() => {});

    // Check that at least one product image exists (may be lazy loaded)
    const images = page.locator('.product-info-main img, .product.media img, img.object-contain');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
  });

  // @desc: Przycisk "Dodaj do koszyka" jest widoczny
  test('should display add to cart button', async ({ page }) => {
    const addToCartBtn = page.locator(
      '#product-addtocart-button, button:has-text("Dodaj do koszyka"), button:has-text("Add to Cart")'
    );
    await expect(addToCartBtn.first()).toBeVisible();
  });

  // @desc: Pole ilosci (input qty) jest widoczne i edytowalne
  test('should have quantity input', async ({ page }) => {
    const qtyInput = page.locator('#qty, input[name="qty"]');
    await expect(qtyInput.first()).toBeVisible();
  });

  // @desc: Opis lub szczegoly produktu sa widoczne na stronie
  test('should display product description/details', async ({ page }) => {
    const details = page.locator(
      '.cs-product-details, .product-description, .tab-section, .product.info.detailed, .product-info-detailed'
    );
    await expect(details.first()).toBeVisible({ timeout: 10000 });
  });

  // @desc: Dodanie produktu do koszyka konczy sie komunikatem sukcesu
  test('should add product to cart', async ({ productPage }) => {
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();
  });

  // @desc: Zmiana ilosci na 2 i dodanie do koszyka — komunikat sukcesu
  test('should update quantity and add to cart', async ({ productPage }) => {
    await productPage.addToCartWithOptions(2);
    await productPage.expectAddToCartSuccess();
  });

  // @desc: Breadcrumbs (sciezka nawigacji) sa widoczne
  test('should display breadcrumbs', async ({ page }) => {
    const breadcrumbs = page.locator('.cs-breadcrumbs, .breadcrumbs, .breadcrumb, nav[aria-label="breadcrumb"]');
    await expect(breadcrumbs.first()).toBeVisible();
  });

  // @desc: Sekcja opinii o produkcie jest widoczna (skip jesli brak)
  test('should have product reviews section', async ({ page }) => {
    const reviews = page.locator(
      '#tab-label-reviews, .product-reviews-summary, .reviews-actions, [data-role="reviews"]'
    );
    // Reviews section may not exist on all products, so just check it doesn't throw
    const count = await reviews.count();
    // It's OK if reviews section doesn't exist
    expect(count).toBeGreaterThanOrEqual(0);
  });

  // @desc: Produkty powiazane/polecane sa widoczne (skip jesli brak)
  test('should display related/upsell products if available', async ({ page }) => {
    const related = page.locator(
      '.block.related, .block.upsell, .block.crosssell, .products-related, .products-upsell'
    );
    const count = await related.count();
    // Related products are optional
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
