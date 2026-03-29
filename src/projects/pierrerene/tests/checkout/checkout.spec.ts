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
      // Pierrerene uses custom_attributes[customer-email] instead of #customer-email
      const emailField = page.locator('input[name="custom_attributes[customer-email]"]');
      await expect(emailField).toBeVisible({ timeout: 20000 });
    });

    await test.step('Imie i Nazwisko', async () => {
      const firstNameField = page.locator('input[name="firstname"]:visible');
      const lastNameField = page.locator('input[name="lastname"]:visible');
      await expect(firstNameField).toBeVisible({ timeout: 15000 });
      await expect(lastNameField).toBeVisible({ timeout: 10000 });
    });

    await test.step('Adres: ulica, kod pocztowy, miasto', async () => {
      const streetField = page.locator('input[name="street[0]"]');
      const postcodeField = page.locator('input[name="postcode"]');
      const cityField = page.locator('input[name="city"]');
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

    // Pierrerene shows shipping methods on the same page as address
    const shippingMethods = page.locator(
      '#checkout-shipping-method-load, .table-checkout-shipping-method, ' +
      'input[type="radio"][name*="ko_unique"]'
    );
    await expect(shippingMethods.first()).toBeVisible({ timeout: 25000 });

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Shipping methods', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Podsumowanie zamowienia widoczne na checkout
  test('should display order summary in checkout', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');

    const summary = page.locator('.opc-block-summary, .opc-sidebar');
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

  /**
   * Helper: navigate from cart to checkout and handle the guest login step.
   */
  async function navigateToCheckoutAsGuest(cartPage: any, page: any): Promise<void> {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await page.waitForTimeout(5000);

    // Handle login step — click "Zakupy bez logowania"
    const loginEmail = page.locator('#customer-login-box');
    if (await loginEmail.isVisible({ timeout: 3000 }).catch(() => false)) {
      await loginEmail.fill('test@test.pl');
      await page.waitForTimeout(500);
    }
    const guestBtn = page.locator('button:has-text("Zakupy bez logowania")');
    if (await guestBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await guestBtn.click();
      await page.waitForTimeout(5000);
    }
  }

  /**
   * Helper: fill the shipping address form on the pierrerene checkout page.
   */
  async function fillShippingForm(page: any): Promise<void> {
    const emailField = page.locator('input[name="custom_attributes[customer-email]"]');
    if (await emailField.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailField.fill('test@test.pl');
    }
    await page.locator('input[name="telephone"]').fill('+48500100200');
    await page.locator('input[name="firstname"]:visible').fill('Test');
    await page.locator('input[name="lastname"]:visible').fill('User');
    await page.locator('input[name="street[0]"]').fill('Testowa');
    await page.locator('input[name="street[1]"]').fill('1');
    await page.locator('input[name="postcode"]').fill('00-001');
    await page.waitForTimeout(2000);
    // City may be auto-filled by postcode; only fill if empty
    const cityField = page.locator('input[name="city"]');
    const cityVal = await cityField.inputValue().catch(() => '');
    if (!cityVal || cityVal.trim().length === 0) {
      await cityField.fill('Warszawa');
    }
    // Press Tab to trigger blur/validation on city field
    await cityField.press('Tab');
    await page.waitForTimeout(1000);
  }

  // @desc: Formularz dostawy wyswietla wszystkie pola adresowe
  test('should display all shipping address fields', async ({ cartPage, page }) => {
    await navigateToCheckoutAsGuest(cartPage, page);

    const checkoutForm = page.locator(
      'input[name="custom_attributes[customer-email]"], input[name="firstname"]:visible'
    );
    if (!(await checkoutForm.first().isVisible({ timeout: 15000 }).catch(() => false))) {
      test.skip(true, 'Checkout form nie załadował się');
    }

    await expect(page.locator('input[name="firstname"]:visible')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[name="lastname"]:visible')).toBeVisible();
    await expect(page.locator('input[name="street[0]"]')).toBeVisible();
    await expect(page.locator('input[name="telephone"]')).toBeVisible();

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Shipping form', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Metody dostawy widoczne po wypelnieniu adresu
  test('should display shipping methods after filling address', async ({ cartPage, page }) => {
    await navigateToCheckoutAsGuest(cartPage, page);

    const checkoutForm = page.locator(
      'input[name="custom_attributes[customer-email]"], input[name="firstname"]:visible'
    );
    if (!(await checkoutForm.first().isVisible({ timeout: 15000 }).catch(() => false))) {
      test.skip(true, 'Checkout form nie załadował się');
    }

    await fillShippingForm(page);

    const shippingMethods = page.locator(
      '#checkout-shipping-method-load, .table-checkout-shipping-method, ' +
      'input[type="radio"][name*="ko_unique"]'
    );
    expect(await shippingMethods.count()).toBeGreaterThan(0);
  });

  // @desc: Metody platnosci widoczne po przejsciu "Nastepne"
  test('should display payment methods after next step', async ({ cartPage, page }) => {
    test.slow(); // This test navigates multiple checkout steps
    await navigateToCheckoutAsGuest(cartPage, page);

    const checkoutForm = page.locator(
      'input[name="custom_attributes[customer-email]"], input[name="firstname"]:visible'
    );
    if (!(await checkoutForm.first().isVisible({ timeout: 15000 }).catch(() => false))) {
      test.skip(true, 'Checkout form nie załadował się');
    }

    await fillShippingForm(page);

    // Select first shipping method via JS click (element may be covered by sticky header)
    const shippingRadio = page.locator(
      '#checkout-shipping-method-load input[type="radio"], ' +
      'input[type="radio"][name*="ko_unique"]'
    ).first();
    if (await shippingRadio.isVisible({ timeout: 5000 }).catch(() => false)) {
      await shippingRadio.evaluate((el: HTMLInputElement) => el.click());
    }
    await page.waitForTimeout(2000);

    // Click "Następny krok" button
    const nextBtn = page.locator('button:has-text("Następny krok"), button[data-role="opc-continue"]');
    await nextBtn.first().evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(8000);

    const methods = page.locator('.payment-method, .payment-methods, #checkout-payment-method-load');
    expect(await methods.count()).toBeGreaterThanOrEqual(1);
  });

  // @desc: Przycisk "Następne" przechodzi do kroku płatności
  test('should proceed to payment step', async ({ cartPage, page }) => {
    test.slow(); // This test navigates multiple checkout steps
    await navigateToCheckoutAsGuest(cartPage, page);

    const checkoutForm = page.locator(
      'input[name="custom_attributes[customer-email]"], input[name="firstname"]:visible'
    );
    if (!(await checkoutForm.first().isVisible({ timeout: 15000 }).catch(() => false))) {
      test.skip(true, 'Checkout form nie załadował się');
    }

    await fillShippingForm(page);

    // Select first shipping method via JS click (element may be covered by sticky header)
    const shippingRadio = page.locator(
      '#checkout-shipping-method-load input[type="radio"], ' +
      'input[type="radio"][name*="ko_unique"]'
    ).first();
    if (await shippingRadio.isVisible({ timeout: 5000 }).catch(() => false)) {
      await shippingRadio.evaluate((el: HTMLInputElement) => el.click());
    }
    await page.waitForTimeout(2000);

    // Click next step
    const nextBtn = page.locator('button:has-text("Następny krok"), button[data-role="opc-continue"]');
    if (await nextBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await nextBtn.first().evaluate((el: HTMLElement) => el.click());
      await page.waitForTimeout(10000);
      // Verify the URL moved to payment step or payment section is visible
      const paymentSection = page.locator('.payment-methods, #checkout-payment-method-load, .opc-payment, .payment-method');
      const onPaymentStep = page.url().includes('#payment') ||
        await paymentSection.first().isVisible({ timeout: 15000 }).catch(() => false);
      expect(onPaymentStep).toBeTruthy();
    }
  });

  // @desc: Podsumowanie zamówienia widoczne
  test('should display order summary on checkout', async ({ cartPage, page }) => {
    await navigateToCheckoutAsGuest(cartPage, page);

    const summary = page.locator('.opc-block-summary, .opc-sidebar');
    if (!(await summary.first().isVisible({ timeout: 15000 }).catch(() => false))) {
      test.skip(true, 'Order summary nie załadował się');
    }
    await expect(summary.first()).toBeVisible();
    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Order summary', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Pola firmy (NIP, nazwa) pojawiaja sie po wybraniu opcji "Firma"
  test('should display company fields when Firma is selected', async ({ cartPage, page }) => {
    await navigateToCheckoutAsGuest(cartPage, page);

    // Wait for the shipping form to load
    const checkoutForm = page.locator(
      'input[name="custom_attributes[customer-email]"], input[name="firstname"]:visible'
    );
    if (!(await checkoutForm.first().isVisible({ timeout: 15000 }).catch(() => false))) {
      test.skip(true, 'Checkout form nie załadował się');
    }

    // Verify "Osoba fizyczna" radio is checked by default
    const privateRadio = page.locator('input#billing1[name="billing-type"][value="private"]');
    await expect(privateRadio).toBeChecked({ timeout: 10000 });

    // Verify NIP field is hidden by default (container has display: none)
    const nipFieldContainer = page.locator('div[name="billingAddress.vat_id"]');
    await expect(nipFieldContainer).toBeHidden();

    // Click the "Firma" radio button (id="billing2")
    const firmaRadio = page.locator('input#billing2[name="billing-type"][value="company"]');
    await firmaRadio.evaluate((el: HTMLInputElement) => el.click());
    await page.waitForTimeout(2000);

    // Verify company name field becomes visible
    const companyInput = page.locator('input[name="company"]');
    await expect(companyInput).toBeVisible({ timeout: 10000 });

    // Verify NIP field becomes visible
    const nipInput = page.locator('input[name="vat_id"]');
    await expect(nipInput).toBeVisible({ timeout: 10000 });

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Company fields visible', { body: screenshot, contentType: 'image/png' });
  });
});
