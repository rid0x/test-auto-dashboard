import { test, expect } from '../../fixture';

test.describe('Hulajnogimicro - Product Page @product-page @e2e', () => {
  test.beforeEach(async ({ productPage }) => {
    await productPage.gotoDefaultProduct();
  });

  // @desc: Nazwa produktu jest widoczna na stronie produktu
  test('should display product name', async ({ productPage, page }) => {
    await test.step('Product name visible in h1', async () => {
      const name = page.locator('h1');
      await expect(name.first()).toBeVisible();
      const text = await name.first().textContent();
      expect(text!.trim().length).toBeGreaterThan(0);
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Product name', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Cena produktu w zlotowkach jest widoczna
  test('should display product price', async ({ page }) => {
    // Hulajnogimicro displays price as plain text "499,00zł"
    const priceText = await page.locator('.price-box .price, .product-info-main').first().textContent();
    expect(priceText).toBeTruthy();
    expect(priceText).toContain('zł');

    const screenshot = await page.screenshot();
    await test.info().attach('Product price', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Zdjecie produktu jest widoczne na stronie produktu
  test('should display product image', async ({ page }) => {
    const image = page.locator('.product.media img, .gallery-image, img[src*="product"]');
    await expect(image.first()).toBeVisible({ timeout: 10000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Product image', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Przycisk "Dodaj do koszyka" jest widoczny na stronie produktu
  test('should display add to cart button', async ({ page }) => {
    const addToCartBtn = page.locator('button:has-text("Dodaj do koszyka")');
    await expect(addToCartBtn.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Add to cart button', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: SKU produktu jest widoczny na stronie
  test('should display product SKU', async ({ page }) => {
    const skuText = await page.locator('text=SKU').first().textContent().catch(() => '');
    expect(skuText).toContain('SKU');

    const screenshot = await page.screenshot();
    await test.info().attach('Product SKU', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Selektor koloru (swatch) jest widoczny na stronie produktu
  test('should display color swatch options', async ({ page }) => {
    // Hulajnogimicro uses a listbox for color selection
    const colorOptions = page.locator('.swatch-option, [role="option"], listbox');
    await expect(colorOptions.first()).toBeVisible({ timeout: 10000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Color options', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Sekcja opisu produktu jest widoczna
  test('should display product description/details', async ({ page }) => {
    const details = page.locator(
      '.product.info.detailed, .product.attribute.description, a:has-text("Opis"), h2:has-text("Opis")'
    );
    await expect(details.first()).toBeVisible({ timeout: 10000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Product details', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Zakladka opisu technicznego jest widoczna
  test('should display technical description tab', async ({ page }) => {
    const techTab = page.locator('a:has-text("Opis techniczny")');
    await expect(techTab.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Technical description tab', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Dodanie produktu do koszyka konczy sie sukcesem
  test('should add product to cart', async ({ productPage }) => {
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();
  });

  // @desc: Zakladka opinii o produkcie jest widoczna
  test('should have product reviews tab', async ({ page }) => {
    const reviewsTab = page.locator('a:has-text("Opinie")');
    await expect(reviewsTab.first()).toBeVisible();
  });

  // @desc: Link "Porownaj" jest widoczny na stronie produktu
  test('should display compare link', async ({ page }) => {
    const compareLink = page.locator('a:has-text("Porównaj")');
    await expect(compareLink.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Compare link', { body: screenshot, contentType: 'image/png' });
  });
});
