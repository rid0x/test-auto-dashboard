import { test, expect } from '../../fixture';
import { skipIfRecaptcha } from '../../../../core/helpers/recaptcha';

/**
 * SMOKE TESTS - Elakiernik
 * Minimalna sciezka krytyczna: homepage → login → search → kategoria → produkt → koszyk → checkout
 * ~12 testow, ~2-3 min zamiast 15 min pelnego suite
 */
test.describe('Elakiernik - Smoke Tests @smoke', () => {

  // === HOMEPAGE ===
  test('smoke: homepage loads', async ({ homePage, page, config }) => {
    await homePage.goto();
    await expect(page).toHaveURL(new RegExp(config.baseUrl.replace('https://', '').replace('www.', '')));
    await homePage.expectLogoVisible();
    await homePage.expectSearchVisible();
    const screenshot = await page.screenshot();
    await test.info().attach('Homepage', { body: screenshot, contentType: 'image/png' });
  });

  // === LOGIN ===
  test('smoke: login page displays', async ({ loginPage, page }) => {
    await loginPage.goto();
    expect(await loginPage.isOnLoginPage()).toBeTruthy();
    await expect(page.locator('#email, input[name="login[username]"]').first()).toBeVisible();
    await expect(page.locator('#pass, #password, input[name="login[password]"]').first()).toBeVisible();
    const screenshot = await page.screenshot();
    await test.info().attach('Login page', { body: screenshot, contentType: 'image/png' });
  });

  test('smoke: login with valid credentials', async ({ loginPage, page, config }) => {
    test.skip(!config.credentials.valid.email, 'Brak credentials');
    await loginPage.goto();
    await skipIfRecaptcha(page, test.info());
    await loginPage.loginWithValidCredentials();
    await loginPage.expectLoginSuccess();
    const screenshot = await page.screenshot();
    await test.info().attach('Login success', { body: screenshot, contentType: 'image/png' });
  });

  // === REGISTRATION ===
  test('smoke: register new account', async ({ registrationPage, page, config }) => {
    await registrationPage.goto();
    await skipIfRecaptcha(page, test.info());

    await registrationPage.register({
      firstName: config.registration.firstName,
      lastName: config.registration.lastName,
      email: config.registration.testEmail,
      password: config.registration.testPassword,
    });

    const screenshot = await page.screenshot();
    await test.info().attach('After registration', { body: screenshot, contentType: 'image/png' });
  });

  // === SEARCH ===
  test('smoke: search returns results', async ({ homePage, page, config }) => {
    await homePage.goto();
    await page.locator('#search, .js-search-input, input[name="q"]').first().fill(config.search.validQuery);
    await page.locator('#search, .js-search-input, input[name="q"]').first().press('Enter');
    await page.waitForLoadState('load');
    const products = page.locator('.product-item, .product-item-info');
    await expect(products.first()).toBeVisible({ timeout: 15000 });
    expect(await products.count()).toBeGreaterThan(0);
    const screenshot = await page.screenshot();
    await test.info().attach('Search results', { body: screenshot, contentType: 'image/png' });
  });

  // === CATEGORY → PRODUCT ===
  test('smoke: category shows products', async ({ categoryPage, config }) => {
    await categoryPage.goto(config.category.url);
    await categoryPage.expectProductsVisible();
    await categoryPage.expectMinProducts(config.category.expectedMinProducts);
  });

  test('smoke: navigate from category to product', async ({ categoryPage, page, config }) => {
    await categoryPage.goto(config.category.url);
    await categoryPage.expectProductsVisible();
    const urlBefore = page.url();
    await categoryPage.clickFirstProduct();
    expect(page.url()).not.toBe(urlBefore);
  });

  // === PRODUCT PAGE ===
  test('smoke: product page displays correctly', async ({ productPage }) => {
    await productPage.gotoDefaultProduct();
    await productPage.expectProductNameVisible();
    await productPage.expectProductPriceVisible();
  });

  // === ADD TO CART ===
  test('smoke: add product to cart', async ({ productPage }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();
  });

  // === CART ===
  test('smoke: cart shows added product', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();
    await cartPage.goto();
    await cartPage.expectCartNotEmpty();
    const screenshot = await page.screenshot();
    await test.info().attach('Cart with product', { body: screenshot, contentType: 'image/png' });
  });

  // === CHECKOUT ===
  test('smoke: proceed to checkout from cart', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    expect(page.url()).toContain('checkout');
  });

  test('smoke: checkout form displays', async ({ productPage, checkoutPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    const formField = page.locator('#customer-email, input[name="username"], input[name="firstname"], input[name="custom_attributes[customer-email]"]').first();
    await expect(formField).toBeVisible({ timeout: 20000 });
    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Checkout form', { body: screenshot, contentType: 'image/png' });
  });

  // === PLACE ORDER (ZABLOKOWANY) ===
  test.skip('smoke: place order', async () => {
    // TODO: Odblokować gdy będzie gotowe
    // Caly flow: adres → dostawa → platnosc → "Kupuję i płacę"
    // Zablokowany zeby nie skladac prawdziwych zamowien
  });
});
