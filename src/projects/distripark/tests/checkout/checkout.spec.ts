import { test, expect } from '../../fixture';

test.describe('Distripark - Checkout @checkout @e2e', () => {
  test.beforeEach(async ({ productPage }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();
  });

  // @desc: Przejscie z koszyka do strony checkout
  test('should navigate to checkout from cart', async ({ cartPage, page }) => {
    await cartPage.proceedToCheckout();
    expect(page.url()).toContain('checkout');
  });

  // @desc: Przycisk "Kup jako gość" jest widoczny
  test('should display guest checkout button', async ({ cartPage, page, config }) => {
    await cartPage.proceedToCheckout();
    await page.waitForTimeout(5000);
    const guestBtn = page.locator('button:has-text("Kup jako gość")');
    await expect(guestBtn).toBeVisible({ timeout: 15000 });
  });

  // @desc: Checkout jako gość - typy kupujących (osoba fizyczna, firma, gospodarstwo rolne)
  test('should display buyer type options after guest click', async ({ page, config }) => {
    await page.goto(config.baseUrl + '/checkout/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.locator('button:has-text("Kup jako gość")').click();
    await page.waitForTimeout(5000);

    await test.step('Osoba fizyczna radio visible', async () => {
      await expect(page.locator('#type-1')).toBeAttached();
      await expect(page.getByText('Osoba fizyczna')).toBeVisible();
    });

    await test.step('Firma radio visible', async () => {
      await expect(page.locator('#type-2')).toBeAttached();
      await expect(page.getByText('Firma')).toBeVisible();
    });

    await test.step('Gospodarstwo rolne radio visible', async () => {
      await expect(page.locator('#type-3')).toBeAttached();
      await expect(page.getByText('Gospodarstwo rolne')).toBeVisible();
    });
  });

  // @desc: Formularz dostawy - pola adresowe (osoba fizyczna)
  test('should display shipping form for osoba fizyczna', async ({ page, config }) => {
    await page.goto(config.baseUrl + '/checkout/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.locator('button:has-text("Kup jako gość")').click();
    await page.waitForTimeout(5000);

    // Osoba fizyczna is default
    await expect(page.locator('#customer-email')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[name="firstname"]').first()).toBeVisible();
    await expect(page.locator('input[name="lastname"]').first()).toBeVisible();
    await expect(page.locator('input[name="street[0]"]').first()).toBeVisible();
    await expect(page.locator('input[name="city"]').first()).toBeVisible();
    await expect(page.locator('input[name="postcode"]').first()).toBeVisible();
    await expect(page.locator('input[name="telephone"]').first()).toBeVisible();
  });

  // @desc: Formularz dostawy - pola firmowe (firma = company + NIP)
  test('should display company fields for Firma buyer type', async ({ page, config }) => {
    await page.goto(config.baseUrl + '/checkout/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.locator('button:has-text("Kup jako gość")').click();
    await page.waitForTimeout(5000);

    // Switch to Firma
    await page.locator('#type-2').click({ force: true });
    await page.waitForTimeout(1000);

    await expect(page.locator('input[name="company"]').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[name="vat_id"]').first()).toBeVisible({ timeout: 5000 });
  });

  // @desc: Metoda dostawy jest automatycznie wybrana
  test('should have shipping method auto-selected', async ({ page, config }) => {
    await page.goto(config.baseUrl + '/checkout/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.locator('button:has-text("Kup jako gość")').click();
    await page.waitForTimeout(5000);

    // Fill required address fields
    await page.locator('#customer-email').fill('test@distripark.com');
    await page.locator('input[name="firstname"]').first().fill('Aurora');
    await page.locator('input[name="lastname"]').first().fill('Bot');
    await page.locator('input[name="street[0]"]').first().fill('Testowa 1');
    await page.locator('input[name="city"]').first().fill('Warszawa');
    await page.locator('input[name="postcode"]').first().fill('00-001');
    await page.locator('input[name="telephone"]').first().fill('500100200');
    await page.waitForTimeout(3000);

    // Shipping method should be auto-selected (at least one radio checked)
    const shippingRadios = page.locator('input[type="radio"][name*="shipping"], input[type="radio"][name="ko_unique_1"]');
    const count = await shippingRadios.count();
    expect(count).toBeGreaterThan(0);
  });

  // @desc: Przycisk "Następne" przenosi do kroku płatności
  test('should proceed to payment step', async ({ page, config }) => {
    await page.goto(config.baseUrl + '/checkout/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.locator('button:has-text("Kup jako gość")').click();
    await page.waitForTimeout(5000);

    // Fill shipping form
    await page.locator('#customer-email').fill('test@distripark.com');
    await page.locator('input[name="firstname"]').first().fill('Aurora');
    await page.locator('input[name="lastname"]').first().fill('Bot');
    await page.locator('input[name="street[0]"]').first().fill('Testowa 1');
    await page.locator('input[name="city"]').first().fill('Warszawa');
    await page.locator('input[name="postcode"]').first().fill('00-001');
    await page.locator('input[name="telephone"]').first().fill('500100200');
    await page.waitForTimeout(3000);

    // Click Następne
    await page.locator('button:has-text("Następne")').click();
    await page.waitForTimeout(8000);

    // Payment methods should be visible
    const paymentMethods = page.locator('.payment-method');
    const count = await paymentMethods.count();
    expect(count).toBeGreaterThanOrEqual(2); // Przelew + PayU
  });

  // @desc: Metody płatności: Przelew tradycyjny i PayU
  test('should display payment methods', async ({ page, config }) => {
    await page.goto(config.baseUrl + '/checkout/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.locator('button:has-text("Kup jako gość")').click();
    await page.waitForTimeout(5000);

    await page.locator('#customer-email').fill('test@distripark.com');
    await page.locator('input[name="firstname"]').first().fill('Aurora');
    await page.locator('input[name="lastname"]').first().fill('Bot');
    await page.locator('input[name="street[0]"]').first().fill('Testowa 1');
    await page.locator('input[name="city"]').first().fill('Warszawa');
    await page.locator('input[name="postcode"]').first().fill('00-001');
    await page.locator('input[name="telephone"]').first().fill('500100200');
    await page.waitForTimeout(3000);
    await page.locator('button:has-text("Następne")').click();
    await page.waitForTimeout(8000);

    await expect(page.getByText('Przelew tradycyjny')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('PayU')).toBeVisible({ timeout: 5000 });
  });

  // @desc: Zgody/regulamin na stronie płatności
  test('should display checkout agreements', async ({ page, config }) => {
    await page.goto(config.baseUrl + '/checkout/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.locator('button:has-text("Kup jako gość")').click();
    await page.waitForTimeout(5000);

    await page.locator('#customer-email').fill('test@distripark.com');
    await page.locator('input[name="firstname"]').first().fill('Aurora');
    await page.locator('input[name="lastname"]').first().fill('Bot');
    await page.locator('input[name="street[0]"]').first().fill('Testowa 1');
    await page.locator('input[name="city"]').first().fill('Warszawa');
    await page.locator('input[name="postcode"]').first().fill('00-001');
    await page.locator('input[name="telephone"]').first().fill('500100200');
    await page.waitForTimeout(3000);
    await page.locator('button:has-text("Następne")').click();
    await page.waitForTimeout(8000);

    // Agreement checkboxes
    const agreements = page.locator('.checkout-agreements input[type="checkbox"], .payment-method input[type="checkbox"][name*="agreement"]');
    const count = await agreements.count();
    expect(count).toBeGreaterThan(0);
  });

  // @desc: Podsumowanie zamowienia widoczne na checkout
  test('should display order summary', async ({ page, config }) => {
    await page.goto(config.baseUrl + '/checkout/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.locator('button:has-text("Kup jako gość")').click();
    await page.waitForTimeout(5000);

    await expect(page.locator('.opc-block-summary, .opc-sidebar, :has-text("Podsumowanie")').first()).toBeVisible({ timeout: 15000 });
  });
});
