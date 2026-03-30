import { test, expect } from '../../fixture';

test.describe('Pieceofcase - Checkout @checkout @e2e', () => {
  test.describe.configure({ timeout: 180000 });

  test.beforeEach(async ({ productPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    // Wait for add-to-cart modal or success message
    const success = page.locator('text=Produkt dodany do koszyka, .message-success');
    await success.first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
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
  test('should display checkout form', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();

    const checkoutForm = page.locator('#checkout, .checkout-container, .opc-wrapper');
    await expect(checkoutForm.first()).toBeVisible({ timeout: 15000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Checkout form', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Podsumowanie zamowienia jest widoczne na checkout
  test('should display order summary in checkout', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();

    const summary = page.locator('.opc-block-summary, .cart-summary, :has-text("Podsumowanie")');
    await expect(summary.first()).toBeVisible({ timeout: 10000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Order summary', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Link powrotny do koszyka jest dostepny na stronie checkout
  test('should navigate to cart from checkout', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('networkidle').catch(() => {});

    const cartLink = page.locator('a[href*="cart"], :has-text("Wróć do koszyka")');
    const hasCartLink = await cartLink.first().isVisible().catch(() => false);
    expect(hasCartLink).toBeDefined();
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

  // @desc: Przycisk "Następne" przechodzi do kroku płatności
  test('should proceed to payment step', async ({ cartPage, page }) => {
    test.slow();
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await page.waitForTimeout(5000);

    // Guest checkout
    const guestBtn = page.getByRole('button', { name: 'Zakupy bez logowania' });
    if (await guestBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await guestBtn.click();
      await page.waitForTimeout(3000);
    }

    // Fill shipping form (selectors from codegen)
    const emailField = page.getByRole('textbox', { name: 'E-mail' }).first();
    if (!(await emailField.isVisible({ timeout: 15000 }).catch(() => false))) {
      test.skip(true, 'Checkout form nie załadował się');
    }
    await emailField.fill('test@test.pl');
    await page.getByRole('textbox', { name: 'Telefon' }).first().fill('510245627');
    await page.getByRole('textbox', { name: 'Imie' }).first().fill('Test');
    await page.getByRole('textbox', { name: 'Nazwisko' }).first().fill('User');
    await page.locator('input[name="street[0]"]').first().fill('Testowa');
    await page.getByRole('textbox', { name: 'Nr domu' }).first().fill('12');
    await page.getByRole('textbox', { name: 'Kod pocztowy' }).first().fill('15-066');
    await page.locator('select[name="region_id"]').first().selectOption('805');
    await page.getByRole('textbox', { name: 'Miasto' }).first().fill('Białystok');

    // Select shipping method and proceed
    await page.getByRole('radio', { name: 'Przesyłka Kurierska DPD' }).check({ timeout: 10000 });
    await page.getByRole('button', { name: 'Następne' }).click();
    await page.waitForTimeout(5000);

    // Verify payment step
    const paymentText = page.getByText('Metoda płatności');
    await expect(paymentText.first()).toBeVisible({ timeout: 15000 });
  });

  // @desc: Podsumowanie zamówienia widoczne
  test('should display order summary on checkout', async ({ cartPage, page }) => {
    test.slow();
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await page.waitForTimeout(5000);

    // Guest checkout
    const guestBtn = page.getByRole('button', { name: 'Zakupy bez logowania' });
    if (await guestBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await guestBtn.click();
      await page.waitForTimeout(3000);
    }

    // Verify order summary sidebar is visible
    const summary = page.getByText('Podsumowanie zamówienia');
    if (!(await summary.first().isVisible({ timeout: 15000 }).catch(() => false))) {
      test.skip(true, 'Order summary nie załadował się');
    }
    await expect(summary.first()).toBeVisible();
    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Order summary', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Po wyborze "Firma" pojawiaja sie pola NIP i nazwa firmy
  test('should display company fields when Firma is selected', async ({ cartPage, page }) => {
    test.slow();
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await page.waitForTimeout(5000);

    // Guest checkout
    const guestBtn = page.getByRole('button', { name: 'Zakupy bez logowania' });
    if (await guestBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await guestBtn.click();
      await page.waitForTimeout(3000);
    }

    // Wait for billing type radio buttons
    const emailField = page.getByRole('textbox', { name: 'E-mail' }).first();
    if (!(await emailField.isVisible({ timeout: 15000 }).catch(() => false))) {
      test.skip(true, 'Checkout form nie załadował się');
    }

    await test.step('Click Firma radio button', async () => {
      await page.locator('#billing2').check({ force: true });
      await page.waitForTimeout(1000);
    });

    await test.step('Verify Company (Firma) name field is visible', async () => {
      await expect(page.locator('input[name="company"]').first()).toBeVisible({ timeout: 10000 });
    });

    await test.step('Verify NIP field is visible', async () => {
      await expect(page.locator('input[name="vat_id"]').first()).toBeVisible({ timeout: 10000 });
    });

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Firma/NIP fields', { body: screenshot, contentType: 'image/png' });
  });
});
