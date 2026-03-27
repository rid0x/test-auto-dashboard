import { test, expect } from '../../fixture';

test.describe('Willsoor - Product Page @product-page @e2e', () => {
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
    // Willsoor prices are in PLN (zl)
    expect(priceText).toContain('zł');

    const screenshot = await page.screenshot();
    await test.info().attach('Product price', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Zdjecie produktu jest widoczne na stronie produktu
  test('should display product image', async ({ page }) => {
    const image = page.locator('.product.media img, .gallery-image');
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

  // @desc: Okruszki nawigacji widoczne po przejsciu z kategorii
  test('should display breadcrumbs when navigating from category', async ({ page, config }) => {
    // Breadcrumbs only appear when navigating via category path, not from direct URL
    // Navigate: category → product to get real breadcrumbs
    await page.goto(`${config.baseUrl}/mezczyzna/akcesoria/plecaki`, { waitUntil: 'load' });
    await page.locator('.product-item-link').first().click();
    await page.waitForLoadState('load');

    const breadcrumbs = page.locator('.breadcrumbs');
    await expect(breadcrumbs).toBeVisible();
    const bcText = await breadcrumbs.textContent();
    expect(bcText?.trim().length).toBeGreaterThan(0);
  });

  // @desc: Sekcja opisu i szczegolow produktu jest widoczna
  test('should display product description/details', async ({ page }) => {
    const details = page.locator(
      '.product.info.detailed, .product.attribute.description, #tab-label-description, .product-info-detailed'
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

  // @desc: Dodanie produktu z iloscia 2 do koszyka dziala poprawnie
  test('should update quantity and add to cart', async ({ productPage }) => {
    await productPage.addToCartWithOptions(2);
    await productPage.expectAddToCartSuccess();
  });

  // @desc: Zakladka opinii o produkcie jest widoczna
  test('should have product reviews tab', async ({ page }) => {
    // Willsoor shows "Opinie" tab with review count — verify it's visible to customer
    const reviewsTab = page.locator('.product-reviews-summary, :has-text("Opinie")').first();
    await expect(reviewsTab).toBeVisible();
  });

  // @desc: Produkty powiazane/polecane sa widoczne (skip jesli brak)
  test.skip('should display related/upsell products if available', async ({ page }) => {
    // Skipped: Willsoor product pages do not display related/upsell product blocks
    const related = page.locator('.block.related, .block.upsell, .block.crosssell');
    await expect(related.first()).toBeVisible();
  });
});

test.describe('Willsoor - Bundle Product (Garnitur) @product-page @e2e', () => {
  test.beforeEach(async ({ page, config }) => {
    await page.goto(`${config.baseUrl}${(config as any).bundleProduct.url}`, { waitUntil: 'load' });
    // Dismiss cookie consent
    await page.locator('.ec-gtm-cookie-directive a.accept-all, a:has-text("ZGODA NA WSZYSTKIE")').first().click({ timeout: 3000 }).catch(() => {});
  });

  // @desc: Strona garnituru bundle wyswietla nazwe, cene i 2 selecty rozmiarow
  test('should display bundle product with size selectors', async ({ page, config }) => {

    await test.step('Nazwa produktu', async () => {
      const h1 = page.locator('h1');
      await expect(h1.first()).toBeVisible();
      const text = await h1.first().textContent();
      expect(text?.toLowerCase()).toContain('garnitur');
    });

    await test.step('Cena produktu', async () => {
      const price = page.locator('.price-box .price');
      await expect(price.first()).toBeVisible();
    });

    await test.step('Select rozmiar marynarki', async () => {
      const marynarkaSelect = page.getByLabel('Rozmiar marynarki');
      await expect(marynarkaSelect).toBeVisible();
      const options = await marynarkaSelect.locator('option').count();
      expect(options).toBeGreaterThan(1);
    });

    await test.step('Select rozmiar spodni', async () => {
      const spodnieSelect = page.getByLabel('Rozmiar spodni');
      await expect(spodnieSelect).toBeVisible();
      const options = await spodnieSelect.locator('option').count();
      expect(options).toBeGreaterThan(1);
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Bundle product page', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Dodanie garnituru bundle do koszyka po wyborze rozmiarow marynarki i spodni
  test('should add bundle product to cart', async ({ page }) => {
    await test.step('Wybierz rozmiar marynarki', async () => {
      const marynarkaSelect = page.getByLabel('Rozmiar marynarki');
      await marynarkaSelect.waitFor({ state: 'visible', timeout: 10000 });
      // Select first available non-empty option
      const firstValue = await marynarkaSelect.locator('option').evaluateAll(opts =>
        opts.filter(o => o.value && o.value !== '').map(o => o.value)[0]
      );
      await marynarkaSelect.selectOption(firstValue);
    });

    await test.step('Wybierz rozmiar spodni', async () => {
      const spodnieSelect = page.getByLabel('Rozmiar spodni');
      const firstValue = await spodnieSelect.locator('option').evaluateAll(opts =>
        opts.filter(o => o.value && o.value !== '').map(o => o.value)[0]
      );
      await spodnieSelect.selectOption(firstValue);
    });

    await test.step('Kliknij Dodaj do koszyka', async () => {
      await page.getByRole('button', { name: /Dodaj do koszyka/i }).click();
    });

    await test.step('Weryfikuj sukces dodania', async () => {
      const successMsg = page.locator('.message-success, :has-text("Dodałeś")');
      await expect(successMsg.first()).toBeVisible({ timeout: 15000 });
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Bundle added to cart', { body: screenshot, contentType: 'image/png' });
  });
});
