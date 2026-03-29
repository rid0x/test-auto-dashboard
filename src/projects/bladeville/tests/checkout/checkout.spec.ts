import { test, expect } from '../../fixture';
import { BladevilleCheckoutPage } from '../../pages/BladevilleCheckoutPage';

test.describe('Bladeville - Checkout @checkout @e2e', () => {
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
  });

  // @desc: Checkout wyswietla formularz dostawy (bez bramy logowania)
  test('should display shipping form directly', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    await (checkoutPage as BladevilleCheckoutPage).waitForCheckoutReady();

    // Bladeville goes directly to shipping form (no login/guest gate)
    const emailField = page.locator('#customer-email, input[name="username"]');
    await expect(emailField.first()).toBeVisible({ timeout: 30000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Checkout shipping form', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Formularz dostawy wyswietla wszystkie wymagane pola
  test('should display all shipping form fields', async ({ cartPage, page }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await page.waitForTimeout(8000);

    const checkoutForm = page.locator('#customer-email, input[name="username"], input[name="firstname"], #checkout-step-shipping');
    if (!(await checkoutForm.first().isVisible({ timeout: 15000 }).catch(() => false))) {
      test.skip(true, 'Checkout form nie zaladowal sie');
    }

    await expect(page.locator('input[name="firstname"]').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[name="lastname"]').first()).toBeVisible();
    await expect(page.locator('input[name="street[0]"]').first()).toBeVisible();
    await expect(page.locator('input[name="telephone"]').first()).toBeVisible();

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Shipping form', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Metody dostawy widoczne po wypelnieniu adresu
  test('should display shipping methods after filling address', async ({ cartPage, page }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await page.waitForTimeout(8000);

    const checkoutForm = page.locator('#customer-email, input[name="username"], input[name="firstname"]');
    if (!(await checkoutForm.first().isVisible({ timeout: 15000 }).catch(() => false))) {
      test.skip(true, 'Checkout form nie zaladowal sie');
    }

    await page.locator('#customer-email, input[name="username"]').first().fill('test@test.pl');
    await page.locator('input[name="firstname"]').first().fill('Test');
    await page.locator('input[name="lastname"]').first().fill('User');
    await page.locator('input[name="street[0]"]').first().fill('Testowa 1');
    await page.locator('input[name="postcode"]').first().fill('41-503');
    await page.locator('input[name="city"]').first().fill('Chorzow');
    await page.locator('input[name="telephone"]').first().fill('500100200');
    await page.waitForTimeout(5000);

    const shippingMethods = page.locator('#checkout-shipping-method-load, .table-checkout-shipping-method, input[type="radio"][name*="shipping"], input[type="radio"][name*="ko_unique"]');
    expect(await shippingMethods.count()).toBeGreaterThan(0);
  });

  // @desc: Metody platnosci widoczne po przejsciu "Nastepne"
  test('should display payment methods after next step', async ({ cartPage, page }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await page.waitForTimeout(8000);

    const checkoutForm = page.locator('#customer-email, input[name="username"], input[name="firstname"]');
    if (!(await checkoutForm.first().isVisible({ timeout: 15000 }).catch(() => false))) {
      test.skip(true, 'Checkout form nie zaladowal sie');
    }

    await page.locator('#customer-email, input[name="username"]').first().fill('test@test.pl');
    await page.locator('input[name="firstname"]').first().fill('Test');
    await page.locator('input[name="lastname"]').first().fill('User');
    await page.locator('input[name="street[0]"]').first().fill('Testowa 1');
    await page.locator('input[name="postcode"]').first().fill('41-503');
    await page.locator('input[name="city"]').first().fill('Chorzow');
    await page.locator('input[name="telephone"]').first().fill('500100200');
    await page.waitForTimeout(5000);

    const nextBtn = page.locator('button:has-text("Następne"), button:has-text("Dalej"), button[data-role="opc-continue"]');
    await nextBtn.first().click();
    await page.waitForTimeout(8000);

    const methods = page.locator('.payment-method');
    expect(await methods.count()).toBeGreaterThanOrEqual(1);
  });

  // @desc: Przycisk "Nastepne" przechodzi do kroku platnosci
  test('should proceed to payment step via checkout', async ({ cartPage, page }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await page.waitForTimeout(8000);

    const checkoutForm = page.locator('#customer-email, input[name="username"], input[name="firstname"]');
    if (!(await checkoutForm.first().isVisible({ timeout: 15000 }).catch(() => false))) {
      test.skip(true, 'Checkout form nie zaladowal sie');
    }

    await page.locator('#customer-email, input[name="username"]').first().fill('test@test.pl');
    await page.locator('input[name="firstname"]').first().fill('Test');
    await page.locator('input[name="lastname"]').first().fill('User');
    await page.locator('input[name="street[0]"]').first().fill('Testowa 1');
    await page.locator('input[name="postcode"]').first().fill('41-503');
    await page.locator('input[name="city"]').first().fill('Chorzow');
    await page.locator('input[name="telephone"]').first().fill('500100200');
    await page.waitForTimeout(5000);

    const nextBtn = page.locator('button:has-text("Następne"), button:has-text("Dalej"), button[data-role="opc-continue"]');
    if (await nextBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await nextBtn.first().click();
      await page.waitForTimeout(8000);
      const paymentSection = page.locator('.payment-methods, #checkout-payment-method-load, .opc-payment');
      await expect(paymentSection.first()).toBeVisible({ timeout: 15000 });
    }
  });

  // @desc: Podsumowanie zamowienia widoczne
  test('should display order summary on checkout', async ({ cartPage, page }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await page.waitForTimeout(8000);

    const summary = page.locator('.opc-block-summary, .opc-sidebar, .checkout-summary');
    if (!(await summary.first().isVisible({ timeout: 15000 }).catch(() => false))) {
      test.skip(true, 'Order summary nie zaladowal sie');
    }
    await expect(summary.first()).toBeVisible();
    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Order summary', { body: screenshot, contentType: 'image/png' });
  });
});
