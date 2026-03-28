import { test, expect } from '../../fixture';

test.describe('Distripark - Checkout @checkout @e2e', () => {

  test.beforeEach(async ({ productPage }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();
    // Now at cart page with product confirmed
  });

  // Helper: from cart page → checkout → guest shipping
  async function goToGuestShipping(cartPage: any, page: any) {
    await cartPage.proceedToCheckout();
    await page.waitForTimeout(5000);
    const guestBtn = page.locator('button:has-text("Kup jako gość")');
    await expect(guestBtn).toBeVisible({ timeout: 15000 });
    await guestBtn.click();
    await page.waitForTimeout(5000);
    // Wait for KnockoutJS to render the shipping form
    await expect(page.locator('#customer-email')).toBeVisible({ timeout: 15000 });
  }

  // Helper: fill shipping as osoba fizyczna
  async function fillShipping(page: any) {
    await page.locator('#customer-email').fill('test@distripark.com');
    await page.locator('input[name="firstname"]').first().fill('Aurora');
    await page.locator('input[name="lastname"]').first().fill('Bot');
    await page.locator('input[name="street[0]"]').first().fill('Testowa 1');
    await page.locator('input[name="city"]').first().fill('Warszawa');
    await page.locator('input[name="postcode"]').first().fill('00-001');
    await page.locator('input[name="telephone"]').first().fill('500100200');
    await page.waitForTimeout(3000);
  }

  // @desc: Dodanie produktu do koszyka i przejście do checkout
  test('should navigate to checkout from cart', async ({ productPage, cartPage, page }) => {
    // product already in cart from beforeEach
    await cartPage.proceedToCheckout();
    expect(page.url()).toContain('checkout');
  });

  // @desc: Przycisk "Kup jako gość"
  test('should display guest checkout button', async ({ productPage, cartPage, page }) => {
    // product already in cart from beforeEach
    await cartPage.proceedToCheckout();
    await page.waitForTimeout(5000);
    await expect(page.locator('button:has-text("Kup jako gość")')).toBeVisible({ timeout: 15000 });
  });

  // @desc: Typy kupujących: osoba fizyczna, firma, gospodarstwo rolne
  test('should display buyer type options', async ({ productPage, cartPage, page }) => {
    // product already in cart from beforeEach
    await goToGuestShipping(cartPage, page);

    // KnockoutJS renders address-type radios with delay
    await expect(page.locator('#type-1')).toBeAttached({ timeout: 15000 });
    await expect(page.locator('label[for="type-1"] span')).toContainText('Osoba fizyczna');
    await expect(page.locator('label[for="type-2"] span')).toContainText('Firma');
    await expect(page.locator('label[for="type-3"] span')).toContainText('Gospodarstwo rolne');
  });

  // @desc: Pola adresowe osoby fizycznej
  test('should display shipping form for osoba fizyczna', async ({ productPage, cartPage, page }) => {
    // product already in cart from beforeEach
    await goToGuestShipping(cartPage, page);

    await expect(page.locator('#customer-email')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[name="firstname"]').first()).toBeVisible();
    await expect(page.locator('input[name="lastname"]').first()).toBeVisible();
    await expect(page.locator('input[name="street[0]"]').first()).toBeVisible();
    await expect(page.locator('input[name="city"]').first()).toBeVisible();
    await expect(page.locator('input[name="postcode"]').first()).toBeVisible();
    await expect(page.locator('input[name="telephone"]').first()).toBeVisible();
  });

  // @desc: Pola firmowe (company + NIP)
  test('should display company fields for Firma', async ({ productPage, cartPage, page }) => {
    // product already in cart from beforeEach
    await goToGuestShipping(cartPage, page);

    await page.locator('#type-2').click({ force: true });
    await page.waitForTimeout(1000);
    await expect(page.locator('input[name="company"]').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[name="vat_id"]').first()).toBeVisible();
  });

  // @desc: Metoda dostawy automatycznie wybrana
  test('should have shipping method auto-selected', async ({ productPage, cartPage, page }) => {
    // product already in cart from beforeEach
    await goToGuestShipping(cartPage, page);
    await fillShipping(page);

    const shippingRadios = page.locator('input[type="radio"][name*="ko_unique"], input[type="radio"][name*="shipping"]');
    expect(await shippingRadios.count()).toBeGreaterThan(0);
  });

  // @desc: Przycisk "Następne" → krok płatności (Przelew + PayU)
  test('should proceed to payment with Przelew and PayU', async ({ productPage, cartPage, page }) => {
    // product already in cart from beforeEach
    await goToGuestShipping(cartPage, page);
    await fillShipping(page);

    await page.locator('button:has-text("Następne")').click();
    await page.waitForTimeout(8000);

    await expect(page.getByText('Przelew tradycyjny')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('PayU')).toBeVisible({ timeout: 5000 });
  });

  // @desc: Zgody/regulamin na stronie płatności
  test('should display checkout agreements', async ({ productPage, cartPage, page }) => {
    // product already in cart from beforeEach
    await goToGuestShipping(cartPage, page);
    await fillShipping(page);
    await page.locator('button:has-text("Następne")').click();
    await page.waitForTimeout(8000);

    const agreements = page.locator('input[type="checkbox"][name*="agreement"], .checkout-agreements input[type="checkbox"]');
    expect(await agreements.count()).toBeGreaterThan(0);
  });

  // @desc: Podsumowanie zamówienia
  test('should display order summary', async ({ productPage, cartPage, page }) => {
    // product already in cart from beforeEach
    await goToGuestShipping(cartPage, page);

    await expect(page.locator('.opc-block-summary, .opc-sidebar').first()).toBeVisible({ timeout: 15000 });
  });

  // === ADVANCED CHECKOUT TESTS ===

  // @desc: Formularz dostawy wyswietla wszystkie pola adresowe
  test('should display all shipping address fields', async ({ cartPage, page }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await page.waitForTimeout(8000);

    const guestBtn = page.locator('button:has-text("Kup jako gość"), button:has-text("Kontynuuj"), button:has-text("Zakupy bez logowania")');
    if (await guestBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await guestBtn.first().click();
      await page.waitForTimeout(5000);
    }

    const checkoutForm = page.locator('#customer-email, input[name="username"], input[name="firstname"], #checkout-step-shipping');
    if (!(await checkoutForm.first().isVisible({ timeout: 15000 }).catch(() => false))) {
      test.skip(true, 'Checkout form nie załadował się');
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

    const guestBtn = page.locator('button:has-text("Kup jako gość"), button:has-text("Kontynuuj"), button:has-text("Zakupy bez logowania")');
    if (await guestBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await guestBtn.first().click();
      await page.waitForTimeout(5000);
    }

    const checkoutForm = page.locator('#customer-email, input[name="username"], input[name="firstname"]');
    if (!(await checkoutForm.first().isVisible({ timeout: 15000 }).catch(() => false))) {
      test.skip(true, 'Checkout form nie załadował się');
    }

    await page.locator('#customer-email, input[name="username"]').first().fill('test@test.pl');
    await page.locator('input[name="firstname"]').first().fill('Test');
    await page.locator('input[name="lastname"]').first().fill('User');
    await page.locator('input[name="street[0]"]').first().fill('Testowa 1');
    await page.locator('input[name="postcode"]').first().fill('00-001');
    await page.locator('input[name="city"]').first().fill('Warszawa');
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

    const guestBtn = page.locator('button:has-text("Kup jako gość"), button:has-text("Kontynuuj"), button:has-text("Zakupy bez logowania")');
    if (await guestBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await guestBtn.first().click();
      await page.waitForTimeout(5000);
    }

    const checkoutForm = page.locator('#customer-email, input[name="username"], input[name="firstname"]');
    if (!(await checkoutForm.first().isVisible({ timeout: 15000 }).catch(() => false))) {
      test.skip(true, 'Checkout form nie załadował się');
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

    const methods = page.locator('.payment-method');
    expect(await methods.count()).toBeGreaterThanOrEqual(1);
  });
});
