import { test, expect } from '../../fixture';
import { skipIfRecaptcha } from '../../../../core/helpers/recaptcha';

/**
 * SMOKE TESTS - Szklaneczki
 * Wygenerowane automatycznie z istniejacych testow w projekcie.
 * Minimalna sciezka: homepage → login → search → kategoria → produkt → koszyk → checkout
 */
test.describe('Szklaneczki - Smoke Tests @smoke', () => {

  // @desc: Strona glowna laduje poprawnie i URL jest prawidlowy
  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveURL(/Szklaneczki\.pl/);
  });

  // @desc: Strona logowania wyswietla pola email, haslo i przycisk logowania
  test('should display login page correctly', async ({ loginPage, page }) => {
    await test.step('Verify login page loaded', async () => {
      expect(await loginPage.isOnLoginPage()).toBeTruthy();
    });

    await test.step('Verify email field visible', async () => {
      await expect(page.locator('#email, input[name="login[username]"]').first()).toBeVisible();
    });

    await test.step('Verify password field visible', async () => {
      await expect(page.locator('#pass, input[name="login[password]"]').first()).toBeVisible();
    });

    await test.step('Verify login button visible', async () => {
      await expect(page.locator('button:has-text("Zaloguj"), button.action.login').first()).toBeVisible();
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Login page', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Wyszukiwanie poprawnej frazy zwraca liste produktow (count > 0)
  test('should find results for valid query', async ({ page, config }) => {
    await test.step('Submit search form', async () => {
      await page.locator('#search').fill(config.search.validQuery);
      await page.locator('#search').press('Enter');
      await page.waitForLoadState('load');
    });

    await test.step('Verify results page', async () => {
      expect(page.url()).toContain('catalogsearch/result');
      const products = page.locator('.product-item');
      const count = await products.count();
      expect(count).toBeGreaterThan(0);
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Search results', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Strona kategorii wyswietla liste produktow
  test('should display category page with products', async ({ categoryPage, config }) => {
    await categoryPage.expectProductsVisible();
    await categoryPage.expectMinProducts(config.category.expectedMinProducts);
  });

  // @desc: Nazwa produktu (h1) jest widoczna na stronie produktu
  test('should display product name', async ({ productPage }) => {
    await productPage.expectProductNameVisible();
  });

  // @desc: Pusty koszyk wyswietla komunikat o braku produktow
  test('should display empty cart', async ({ cartPage, page }) => {
    await cartPage.goto();
    await cartPage.expectCartEmpty();

    const screenshot = await page.screenshot();
    await test.info().attach('Empty cart', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Przejscie z koszyka do strony checkout
  test('should navigate to checkout from cart', async ({ cartPage, page }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    expect(page.url()).toContain('checkout');
  });

});
