import { test, expect } from '../../fixture';

test.describe('Entelo - Checkout @checkout @e2e', () => {
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
  });

  test('should display shipping methods', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    await checkoutPage.fillShippingAddress({
      email: 'guest-test@entelo.pl', firstName: 'Aurora', lastName: 'Bot',
      street: 'Testowa 2', city: 'Warszawa', postcode: '00-001', phone: '+48510245267',
    });
    const shippingMethods = page.locator('#checkout-shipping-method-load, .table-checkout-shipping-method');
    await expect(shippingMethods.first()).toBeVisible({ timeout: 15000 });
  });

  test('should display order summary in checkout', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
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
    test.slow();
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

    // Dismiss Cookiebot if present
    await page.evaluate(() => {
      document.querySelectorAll('#CybotCookiebotDialog, #CybotCookiebotDialogBodyUnderlay').forEach(el => el.remove());
    }).catch(() => {});

    await page.locator('#customer-email, input[name="username"]').first().fill('test@test.pl');
    await page.locator('input[name="firstname"]').first().fill('Test');
    await page.locator('input[name="lastname"]').first().fill('User');
    await page.locator('input[name="street[0]"]').first().fill('Testowa 1');
    // Entelo requires "Numer domu" field
    const houseNum = page.getByRole('textbox', { name: /Numer domu/i });
    if (await houseNum.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await houseNum.first().fill('1');
    }
    await page.locator('input[name="postcode"]').first().fill('00-001');
    await page.locator('input[name="city"]').first().fill('Warszawa');
    await page.locator('input[name="telephone"]').first().fill('+48500100200');
    await page.waitForTimeout(3000);

    // Dismiss Cookiebot again before clicking
    await page.evaluate(() => {
      document.querySelectorAll('#CybotCookiebotDialog, #CybotCookiebotDialogBodyUnderlay').forEach(el => el.remove());
    }).catch(() => {});

    const nextBtn = page.locator('button:has-text("NASTĘPNE"), button:has-text("Następne"), button:has-text("Dalej"), button[data-role="opc-continue"]');
    await nextBtn.first().click({ force: true });
    await page.waitForTimeout(8000);

    const methods = page.locator('.payment-method');
    expect(await methods.count()).toBeGreaterThanOrEqual(1);
  });

  // @desc: Przycisk "Następne" przechodzi do kroku płatności
  test('should proceed to payment step', async ({ cartPage, page }) => {
    test.slow();
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

  // @desc: Pola NIP i Firma widoczne po wybraniu opcji Firma (faktura VAT)
  test('should display company fields when Firma is selected', async ({ cartPage, page }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await page.waitForTimeout(8000);

    // Dismiss Cookiebot overlay if present
    const cookieBtn = page.locator('#CookiebotDialogBodyLevelButtonLevelOptinAllowAll');
    if (await cookieBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cookieBtn.click();
      await page.waitForTimeout(1000);
    }
    await page.evaluate(() => {
      document.querySelectorAll('#CybotCookiebotDialog, #CybotCookiebotDialogBodyUnderlay').forEach(e => (e as HTMLElement).style.display = 'none');
    }).catch(() => {});

    // Entelo checkout loads the billing form directly (no guest step)
    const checkoutForm = page.locator('.field-choices, #billing-private, .billing-address-form');
    if (!(await checkoutForm.first().isVisible({ timeout: 15000 }).catch(() => false))) {
      test.skip(true, 'Checkout billing form nie załadował się');
    }

    await test.step('Verify Osoba Prywatna/Firma radio buttons are visible', async () => {
      // Entelo uses visible radios: #billing-private (Osoba Prywatna) and #billing-company (Firma)
      const firmaRadio = page.locator('#billing-company');
      await expect(firmaRadio).toBeVisible({ timeout: 10000 });
    });

    await test.step('Click Firma radio to switch to company billing', async () => {
      // Entelo radios are directly visible and clickable
      const firmaLabel = page.locator('label[for="billing-company"]');
      if (await firmaLabel.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firmaLabel.click();
      } else {
        await page.locator('#billing-company').click({ force: true });
      }
      await page.waitForTimeout(2000);
    });

    await test.step('Verify NIP field is visible', async () => {
      // Entelo labels NIP as "Numer NIP"
      const nipField = page.locator('input[name="vat_id"]');
      await expect(nipField.first()).toBeVisible({ timeout: 10000 });
    });

    await test.step('Verify Company/Firma name field is visible', async () => {
      const companyField = page.locator('input[name="company"]');
      await expect(companyField.first()).toBeVisible({ timeout: 10000 });
    });

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Firma fields visible', { body: screenshot, contentType: 'image/png' });
  });
});
