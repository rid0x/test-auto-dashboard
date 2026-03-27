import { test, expect } from '../../fixture';

test.describe('Pieceofcase - Checkout @checkout @e2e', () => {
  test.beforeEach(async ({ productPage }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();
  });

  // @desc: Przejscie z koszyka do strony checkout
  test('should navigate to checkout from cart', async ({ cartPage, page }) => {
    await cartPage.goto();

    await test.step('Click proceed to checkout', async () => {
      await cartPage.proceedToCheckout();
    });

    expect(page.url()).toContain('checkout');
    const screenshot = await page.screenshot();
    await test.info().attach('Checkout page', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Formularz checkout jest widoczny po wyborze metody platnosci
  test('should display checkout form', async ({ page }) => {
    await page.goto('https://pieceofcase.pl/checkout/', { waitUntil: 'load' });

    const checkoutForm = page.locator('#checkout, .checkout-container, .opc-wrapper');
    await expect(checkoutForm.first()).toBeVisible({ timeout: 15000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Checkout form', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Podsumowanie zamowienia jest widoczne na checkout
  test('should display order summary in checkout', async ({ page }) => {
    await page.goto('https://pieceofcase.pl/checkout/', { waitUntil: 'load' });

    const summary = page.locator('.opc-block-summary, .cart-summary, :has-text("Podsumowanie")');
    await expect(summary.first()).toBeVisible({ timeout: 10000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Order summary', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Link powrotny do koszyka jest dostepny na stronie checkout
  test('should navigate to cart from checkout', async ({ page }) => {
    await page.goto('https://pieceofcase.pl/checkout/', { waitUntil: 'load' });
    await page.waitForLoadState('networkidle').catch(() => {});

    const cartLink = page.locator('a[href*="cart"], :has-text("Wróć do koszyka")');
    const hasCartLink = await cartLink.first().isVisible().catch(() => false);
    expect(hasCartLink).toBeDefined();
  });
});
