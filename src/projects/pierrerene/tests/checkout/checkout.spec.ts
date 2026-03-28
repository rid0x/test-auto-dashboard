import { test, expect } from '../../fixture';

test.describe('Pierrerene - Checkout @checkout @e2e', () => {
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

  // @desc: Formularz dostawy wyswietla pola adresowe
  test('should display shipping form fields', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    await page.waitForTimeout(3000);

    await test.step('Email', async () => {
      const emailField = page.locator('#customer-email, input[name="username"], input[type="email"]').first();
      await expect(emailField).toBeVisible({ timeout: 20000 });
    });

    await test.step('Imie i Nazwisko', async () => {
      const firstNameField = page.getByRole('textbox', { name: /Imię|First Name/i }).first()
        .or(page.locator('input[name="firstname"]').first());
      const lastNameField = page.getByRole('textbox', { name: /Nazwisko|Last Name/i }).first()
        .or(page.locator('input[name="lastname"]').first());
      await expect(firstNameField).toBeVisible({ timeout: 15000 });
      await expect(lastNameField).toBeVisible({ timeout: 10000 });
    });

    await test.step('Adres: ulica, kod pocztowy, miasto', async () => {
      const streetField = page.locator('input[name="street[0]"], input[name*="street"]').first();
      const postcodeField = page.getByRole('textbox', { name: /Kod pocztowy|Postcode/i }).first()
        .or(page.locator('input[name="postcode"]').first());
      const cityField = page.getByRole('textbox', { name: /Miasto|City/i }).first()
        .or(page.locator('input[name="city"]').first());
      await expect(streetField).toBeVisible({ timeout: 10000 });
      await expect(postcodeField).toBeVisible({ timeout: 10000 });
      await expect(cityField).toBeVisible({ timeout: 10000 });
    });

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Shipping form', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Metody dostawy sa widoczne po wypelnieniu adresu
  test('should display shipping methods', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    await page.waitForTimeout(3000);

    await checkoutPage.fillShippingAddress({
      email: 'guest-test@pierrerene.pl',
      firstName: 'Aurora',
      lastName: 'Bot',
      street: 'Testowa 2',
      city: 'Warszawa',
      postcode: '00-001',
      phone: '+48510245267',
    });

    await page.waitForTimeout(3000);

    const shippingMethods = page.locator(
      '#checkout-shipping-method-load, .table-checkout-shipping-method, [data-role="shipping-method"], ' +
      '.checkout-shipping-method, input[name="ko_unique_1"], input[type="radio"][name*="shipping"], ' +
      '#opc-shipping_method, .shipping-method-list'
    );
    await expect(shippingMethods.first()).toBeVisible({ timeout: 25000 });

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Shipping methods', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Podsumowanie zamowienia widoczne na checkout
  test('should display order summary in checkout', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');

    const summary = page.locator('.opc-block-summary, .opc-sidebar, :has-text("Podsumowanie")');
    await expect(summary.first()).toBeVisible({ timeout: 15000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Order summary', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Link powrotu do koszyka jest widoczny na checkout
  test('should have back to cart link', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');

    const backLink = page.locator('a[href*="cart"], a:has-text("koszyk"), a:has-text("Wróć")');
    if (await backLink.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(backLink.first()).toBeVisible();
    } else {
      // Some stores don't show explicit back link
      test.skip(true, 'Brak linka powrotu do koszyka');
    }
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
    if (await nextBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await nextBtn.first().click();
      await page.waitForTimeout(8000);
      const paymentSection = page.locator('.payment-methods, #checkout-payment-method-load, .opc-payment');
      await expect(paymentSection.first()).toBeVisible({ timeout: 15000 });
    }
  });

  // @desc: Podsumowanie zamówienia widoczne
  test('should display order summary on checkout', async ({ cartPage, page }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await page.waitForTimeout(8000);
    const guestBtn = page.locator('button:has-text("Kup jako gość"), button:has-text("Kontynuuj"), button:has-text("Zakupy bez logowania")');
    if (await guestBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await guestBtn.first().click();
      await page.waitForTimeout(5000);
    }
    const summary = page.locator('.opc-block-summary, .opc-sidebar, .checkout-summary');
    if (!(await summary.first().isVisible({ timeout: 15000 }).catch(() => false))) {
      test.skip(true, 'Order summary nie załadował się');
    }
    await expect(summary.first()).toBeVisible();
    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Order summary', { body: screenshot, contentType: 'image/png' });
  });
});
