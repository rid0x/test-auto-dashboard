import { test, expect } from '../../fixture';
import { SzpakiCheckoutPage } from '../../pages/SzpakiCheckoutPage';

test.describe('4szpaki - Checkout @checkout @e2e', () => {
  test.beforeEach(async ({ productPage }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();
  });

  // @desc: Przejscie z koszyka do strony checkout
  test('should navigate to checkout from cart', async ({ cartPage, page }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    expect(page.url()).toContain('checkout');

    const screenshot = await page.screenshot();
    await test.info().attach('Checkout page', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Checkout wyswietla wybor logowania lub zakupow bez konta
  test('should display login/guest choice', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');

    const guestBtn = page.getByRole('button', { name: /Zakupy bez logowania/i });
    await expect(guestBtn).toBeVisible({ timeout: 15000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Checkout login/guest', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Formularz dostawy jest widoczny po wyborze zakupow bez logowania
  test('should display shipping form after guest selection', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    await (checkoutPage as SzpakiCheckoutPage).continueAsGuest();

    await expect(page.getByRole('textbox', { name: /E-mail/i }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('textbox', { name: /Imię/i }).first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Shipping form', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Podsumowanie zamowienia z produktem widoczne na checkout
  test('should display order summary in checkout', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');

    // Order summary should be visible even on login/guest step
    const summary = page.locator('.opc-block-summary, .opc-sidebar, :has-text("Podsumowanie")');
    await expect(summary.first()).toBeVisible({ timeout: 15000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Order summary', { body: screenshot, contentType: 'image/png' });
  });
});
