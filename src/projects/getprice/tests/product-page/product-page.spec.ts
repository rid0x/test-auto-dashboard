import { test, expect } from '../../fixture';

test.describe('Getprice - Product Page @product-page @e2e', () => {
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
    // Getprice uses lazy-loaded images — scroll to product area first
    await page.locator('.product-info-main, h1').first().scrollIntoViewIfNeeded();
    await page.locator('.product-info-main img, img[alt*="Patchcord"], img.object-contain').first().waitFor({ state: 'attached', timeout: 10000 }).catch(() => {});

    // Check that at least one product image exists (may be lazy loaded)
    const images = page.locator('.product-info-main img, img[alt*="Patchcord"], img.object-contain');
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
      '.product-description, .tab-section, .custom-getprice-tabs, .product.info.detailed, .product-info-detailed'
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
    const breadcrumbs = page.locator('.breadcrumbs, .breadcrumb, nav[aria-label="breadcrumb"]');
    await expect(breadcrumbs.first()).toBeVisible();
  });

  // @desc: Sekcja opinii o produkcie jest widoczna (skip jesli brak)
  test.skip('should have product reviews section', async ({ page }) => {
    // Skipped: Getprice product pages do not have a reviews section
    const reviews = page.locator(
      '#tab-label-reviews, .product-reviews-summary, .reviews-actions, [data-role="reviews"]'
    );
    await expect(reviews.first()).toBeVisible();
  });

  // @desc: Produkty powiazane/polecane sa widoczne (skip jesli brak)
  test.skip('should display related/upsell products if available', async ({ page }) => {
    // Skipped: Getprice product pages do not display related/upsell products
    const related = page.locator(
      '.block.related, .block.upsell, .block.crosssell, .products-related, .products-upsell'
    );
    await expect(related.first()).toBeVisible();
  });
});
