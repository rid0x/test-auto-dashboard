import { test, expect } from '../../fixture';
import { skipIfRecaptcha } from '../../../../core/helpers/recaptcha';

test.describe('Willsoor - Checkout @checkout @e2e', () => {
  // Helper: add product to cart before checkout tests
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

  test('should display shipping form', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();

    // Wait for checkout to load (Magento checkout is JS-heavy)
    await page.waitForLoadState('load');

    const emailField = page.locator('#customer-email, input[name="username"]');
    await expect(emailField.first()).toBeVisible({ timeout: 15000 });
  });

  test('should validate required shipping fields', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle').catch(() => {});

    // Try to proceed without filling form
    const nextBtn = page.locator(
      'button.continue, button[data-role="opc-continue"], button:has-text("Dalej"), button:has-text("Next")'
    );
    if (await nextBtn.first().isVisible()) {
      await nextBtn.first().click();

      // Should show validation errors
      await page.locator('.field-error:visible, ._error:visible, .mage-error:visible').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      const errors = page.locator('.field-error:visible, ._error:visible, .mage-error:visible');
      const count = await errors.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should fill shipping address as guest', async ({ checkoutPage, page }) => {
    await skipIfRecaptcha(page, test.info());

    await checkoutPage.goto();
    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle').catch(() => {});

    await checkoutPage.fillShippingAddress({
      email: 'guest-test@willsoor.pl',
      firstName: 'Test',
      lastName: 'Guest',
      street: 'Testowa 123',
      city: 'Warszawa',
      postcode: '00-001',
      phone: '500600700',
      country: 'PL',
    });

    // Shipping methods should appear
    const methods = page.locator(
      '#checkout-shipping-method-load, .table-checkout-shipping-method, .methods-shipping'
    );
    await expect(methods.first()).toBeVisible({ timeout: 15000 });
  });

  test('should display shipping methods', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle').catch(() => {});

    await checkoutPage.fillShippingAddress({
      email: 'guest-test@willsoor.pl',
      firstName: 'Test',
      lastName: 'Guest',
      street: 'Testowa 123',
      city: 'Warszawa',
      postcode: '00-001',
      phone: '500600700',
      country: 'PL',
    });

    const methods = page.locator('#checkout-shipping-method-load input[type="radio"], .table-checkout-shipping-method input[type="radio"]');
    const count = await methods.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display order summary in checkout', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');

    const summary = page.locator('.opc-block-summary, .checkout-summary, .order-summary');
    await expect(summary.first()).toBeVisible({ timeout: 15000 });
  });
});
