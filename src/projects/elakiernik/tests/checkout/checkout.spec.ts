import { test, expect } from '../../fixture';

test.describe('Elakiernik - Checkout @checkout @e2e', () => {
  test.beforeEach(async ({ productPage }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();
  });

  test('should navigate to checkout from cart', async ({ cartPage, page }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    expect(page.url()).toContain('checkout');
  });

  test('should display shipping form fields', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    await expect(page.locator('#customer-email, input[name="username"]').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('textbox', { name: /Imię/i }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('textbox', { name: /Nazwisko/i }).first()).toBeVisible();
    await expect(page.locator('input[name="street[0]"]')).toBeVisible();
    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Shipping form', { body: screenshot, contentType: 'image/png' });
  });

  test('should display shipping methods', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    await checkoutPage.fillShippingAddress({
      email: 'guest-test@e-lakiernik.net', firstName: 'Aurora', lastName: 'Bot',
      street: 'Testowa 2', city: 'Warszawa', postcode: '00-001', phone: '+48510245267',
    });
    const shippingMethods = page.locator('#checkout-shipping-method-load, .table-checkout-shipping-method');
    await expect(shippingMethods.first()).toBeVisible({ timeout: 15000 });
  });

  test('should display order summary in checkout', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    const summary = page.locator('.opc-block-summary, .opc-sidebar');
    await expect(summary.first()).toBeVisible({ timeout: 15000 });
  });
});
