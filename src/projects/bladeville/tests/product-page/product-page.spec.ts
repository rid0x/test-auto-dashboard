import { test, expect } from '../../fixture';

test.describe('Bladeville - Product Page @product-page @e2e', () => {
  test.beforeEach(async ({ productPage }) => {
    await productPage.gotoDefaultProduct();
  });

  // @desc: Nazwa produktu jest widoczna na stronie produktu
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

  // @desc: Cena produktu w zlotowkach jest widoczna
  test('should display product price', async ({ page }) => {
    const price = page.locator('.price-box .price');
    await expect(price.first()).toBeVisible();

    const priceText = await price.first().textContent();
    expect(priceText).toBeTruthy();
    expect(priceText).toContain('zł');

    const screenshot = await page.screenshot();
    await test.info().attach('Product price', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Zdjecie produktu jest widoczne na stronie produktu
  test('should display product image', async ({ page }) => {
    const image = page.locator('.product.media img, .gallery-placeholder img, .fotorama__stage img');
    await expect(image.first()).toBeVisible({ timeout: 10000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Product image', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Przycisk "Dodaj do koszyka" jest widoczny na stronie produktu
  test('should display add to cart button', async ({ page }) => {
    const addToCartBtn = page.locator('#product-addtocart-button');
    await expect(addToCartBtn).toBeVisible();
    const btnText = await addToCartBtn.textContent();
    expect(btnText?.toLowerCase()).toContain('dodaj');

    const screenshot = await page.screenshot();
    await test.info().attach('Add to cart button', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Okruszki nawigacji widoczne na stronie produktu
  test('should display breadcrumbs', async ({ page }) => {
    const breadcrumbs = page.locator('.breadcrumbs, nav[aria-label="breadcrumb"]');
    await expect(breadcrumbs.first()).toBeVisible();
    const bcText = await breadcrumbs.first().textContent();
    expect(bcText?.trim().length).toBeGreaterThan(0);
  });

  // @desc: Sekcja opisu i szczegolow produktu jest widoczna
  test('should display product description/details', async ({ page }) => {
    const details = page.locator(
      '.product.info.detailed, .product.attribute.description, #tab-label-description, .product-info-detailed, h3:has-text("Opis")'
    );
    await expect(details.first()).toBeVisible({ timeout: 10000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Product details', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Dodanie produktu do koszyka konczy sie sukcesem
  test('should add product to cart', async ({ productPage }) => {
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();
  });

  // @desc: Symbol/SKU produktu jest widoczny
  test('should display product SKU', async ({ page }) => {
    const sku = page.locator('.product.attribute.sku, :has-text("Symbol")');
    await expect(sku.first()).toBeVisible();
  });

  // @desc: Zakladka opinii/ocen produktu jest widoczna
  test('should have product reviews section', async ({ page }) => {
    const reviewsTab = page.locator('.product-reviews-summary, :has-text("Oceń ten produkt"), a[href*="review-form"]').first();
    await expect(reviewsTab).toBeVisible();
  });

  // @desc: Informacja o dostepnosci produktu jest widoczna (W magazynie)
  test('should display stock availability', async ({ page }) => {
    const stock = page.locator('.stock.available, :has-text("W magazynie"), :has-text("Dostępne")');
    await expect(stock.first()).toBeVisible();
  });
});

test.describe('Bladeville - Configurable Product (Rolki z rozmiarem) @product-page @e2e', () => {
  test.beforeEach(async ({ page, config }) => {
    // Navigate to a configurable product (rolki with size selection)
    await page.goto(`${config.baseUrl}/in-line/skates/fr-fr2-310-v-2-czarne`, { waitUntil: 'load' });
    // Dismiss cookie consent
    await page.locator('.amgdprcookie-button.-allow').first().click({ timeout: 3000 }).catch(() => {});
  });

  // @desc: Strona produktu konfigurowalnego wyswietla opcje rozmiaru
  test('should display size options for configurable product', async ({ page }) => {
    // Bladeville shows sizes as clickable list items
    const sizeText = page.locator(':has-text("Wybierz rozmiar")');
    await expect(sizeText.first()).toBeVisible({ timeout: 10000 });

    const sizeOptions = page.locator('ul li:has-text("36"), ul li:has-text("37"), ul li:has-text("38")');
    const count = await sizeOptions.count();
    expect(count).toBeGreaterThan(0);

    const screenshot = await page.screenshot();
    await test.info().attach('Size options', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Dostepne warianty kolorystyczne produktu sa wyswietlane
  test('should display product variants', async ({ page }) => {
    const variants = page.locator(':has-text("Dostępne wersje")');
    await expect(variants.first()).toBeVisible({ timeout: 10000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Product variants', { body: screenshot, contentType: 'image/png' });
  });
});
