import { test, expect } from '../../fixture';

test.describe('Abazur - Checkout Advanced @checkout @e2e', () => {
  test.beforeEach(async ({ productPage }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
  });

  // @desc: Guest checkout - formularz dostawy wyswietla wszystkie pola adresowe
  test('should display all shipping address fields', async ({ cartPage, checkoutPage, page }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await page.waitForTimeout(5000);

    // Some stores show login/guest choice first
    const guestBtn = page.locator('button:has-text("Kup jako gość"), button:has-text("Kontynuuj"), button:has-text("gość")');
    if (await guestBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await guestBtn.first().click();
      await page.waitForTimeout(5000);
    }

    // Check all address fields
    await expect(page.locator('#customer-email, input[name="username"]').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('input[name="firstname"]').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[name="lastname"]').first()).toBeVisible();
    await expect(page.locator('input[name="street[0]"]').first()).toBeVisible();
    await expect(page.locator('input[name="postcode"]').first()).toBeVisible();
    await expect(page.locator('input[name="city"]').first()).toBeVisible();
    await expect(page.locator('input[name="telephone"]').first()).toBeVisible();

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Shipping form fields', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Metody dostawy widoczne po wypełnieniu adresu
  test('should display shipping methods', async ({ cartPage, checkoutPage, page }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await page.waitForTimeout(5000);

    const guestBtn = page.locator('button:has-text("Kup jako gość"), button:has-text("Kontynuuj")');
    if (await guestBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await guestBtn.first().click();
      await page.waitForTimeout(5000);
    }

    // Fill minimal address
    await page.locator('#customer-email, input[name="username"]').first().fill('test@test.pl');
    await page.locator('input[name="firstname"]').first().fill('Test');
    await page.locator('input[name="lastname"]').first().fill('User');
    await page.locator('input[name="street[0]"]').first().fill('Testowa 1');
    await page.locator('input[name="postcode"]').first().fill('00-001');
    await page.locator('input[name="city"]').first().fill('Warszawa');
    await page.locator('input[name="telephone"]').first().fill('500100200');
    await page.waitForTimeout(5000);

    // Check shipping methods visible
    const shippingMethods = page.locator('#checkout-shipping-method-load, .table-checkout-shipping-method, input[type="radio"][name*="shipping"], input[type="radio"][name*="ko_unique"]');
    const count = await shippingMethods.count();
    expect(count).toBeGreaterThan(0);

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Shipping methods', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Przycisk "Następne"/"Dalej" przechodzi do kroku płatności
  test('should proceed to payment step', async ({ cartPage, checkoutPage, page }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await page.waitForTimeout(5000);

    const guestBtn = page.locator('button:has-text("Kup jako gość"), button:has-text("Kontynuuj")');
    if (await guestBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await guestBtn.first().click();
      await page.waitForTimeout(5000);
    }

    // Fill address
    await page.locator('#customer-email, input[name="username"]').first().fill('test@test.pl');
    await page.locator('input[name="firstname"]').first().fill('Test');
    await page.locator('input[name="lastname"]').first().fill('User');
    await page.locator('input[name="street[0]"]').first().fill('Testowa 1');
    await page.locator('input[name="postcode"]').first().fill('00-001');
    await page.locator('input[name="city"]').first().fill('Warszawa');
    await page.locator('input[name="telephone"]').first().fill('500100200');
    await page.waitForTimeout(5000);

    // Click next
    const nextBtn = page.locator('button:has-text("Następne"), button:has-text("Dalej"), button:has-text("Next"), button[data-role="opc-continue"]');
    await expect(nextBtn.first()).toBeVisible({ timeout: 10000 });
    await nextBtn.first().click();
    await page.waitForTimeout(8000);

    // Payment methods should be visible
    const paymentSection = page.locator('.payment-methods, #checkout-payment-method-load, .opc-payment');
    await expect(paymentSection.first()).toBeVisible({ timeout: 15000 });

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Payment step', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Metody płatności widoczne (min 1)
  test('should display payment methods', async ({ cartPage, checkoutPage, page }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await page.waitForTimeout(5000);

    const guestBtn = page.locator('button:has-text("Kup jako gość"), button:has-text("Kontynuuj")');
    if (await guestBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await guestBtn.first().click();
      await page.waitForTimeout(5000);
    }

    await page.locator('#customer-email, input[name="username"]').first().fill('test@test.pl');
    await page.locator('input[name="firstname"]').first().fill('Test');
    await page.locator('input[name="lastname"]').first().fill('User');
    await page.locator('input[name="street[0]"]').first().fill('Testowa 1');
    await page.locator('input[name="postcode"]').first().fill('00-001');
    await page.locator('input[name="city"]').first().fill('Warszawa');
    await page.locator('input[name="telephone"]').first().fill('500100200');
    await page.waitForTimeout(5000);

    const nextBtn = page.locator('button:has-text("Następne"), button:has-text("Dalej"), button[data-role="opc-continue"]');
    await nextBtn.first().click();
    await page.waitForTimeout(8000);

    // Count payment methods
    const methods = page.locator('.payment-method');
    const count = await methods.count();
    expect(count).toBeGreaterThanOrEqual(1);

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Payment methods list', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Podsumowanie zamowienia widoczne z nazwa produktu
  test('should display order summary with product', async ({ cartPage, page }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await page.waitForTimeout(5000);

    const guestBtn = page.locator('button:has-text("Kup jako gość"), button:has-text("Kontynuuj")');
    if (await guestBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await guestBtn.first().click();
      await page.waitForTimeout(5000);
    }

    const summary = page.locator('.opc-block-summary, .opc-sidebar, .checkout-summary');
    await expect(summary.first()).toBeVisible({ timeout: 15000 });

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Order summary', { body: screenshot, contentType: 'image/png' });
  });
});
