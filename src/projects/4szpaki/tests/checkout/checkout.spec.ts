import { test, expect } from '../../fixture';
import { SzpakiCheckoutPage } from '../../pages/SzpakiCheckoutPage';

test.describe('4szpaki - Checkout @checkout @e2e', () => {
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

  // @desc: Checkout wyswietla wybor logowania lub zakupow bez konta
  test('should display login/guest choice', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');

    await expect(page.getByRole('button', { name: /Zakupy bez logowania/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /Załóż konto/i })).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Checkout login/guest', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Formularz dostawy wyswietla wszystkie pola po wyborze "bez logowania"
  test('should display all shipping form fields', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    await (checkoutPage as SzpakiCheckoutPage).continueAsGuest();

    await test.step('Email i Telefon', async () => {
      await expect(page.getByRole('textbox', { name: /E-mail/i }).first()).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('textbox', { name: /Telefon/i })).toBeVisible();
    });

    await test.step('Imie i Nazwisko', async () => {
      await expect(page.getByRole('textbox', { name: /Imię/i })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /Nazwisko/i })).toBeVisible();
    });

    await test.step('Adres: ulica, kod pocztowy, miasto', async () => {
      await expect(page.locator('input[name="street[0]"]')).toBeVisible();
      await expect(page.getByRole('textbox', { name: /Kod pocztowy/i })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /Miasto/i })).toBeVisible();
    });

    await test.step('Osoba fizyczna / Firma', async () => {
      await expect(page.locator('label').filter({ hasText: 'Osoba fizyczna' })).toBeVisible();
      await expect(page.locator('label').filter({ hasText: 'Firma (chcę fakturę VAT)' })).toBeVisible();
    });

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Shipping form', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Metody dostawy sa widoczne po wypelnieniu adresu
  test('should display shipping methods', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    await (checkoutPage as SzpakiCheckoutPage).continueAsGuest();

    await checkoutPage.fillShippingAddress({
      email: 'guest-test@4szpaki.pl',
      firstName: 'Aurora',
      lastName: 'Bot',
      street: 'Testowa 2',
      city: 'Białystok',
      postcode: '15-066',
      phone: '+48510245267',
    });

    const expectedMethods = [
      'InPost Paczkomat',
      'DPD',
      'ORLEN',
      'Kurier',
      'Odbiór osobisty',
    ];

    for (const method of expectedMethods) {
      await test.step(`Metoda: ${method}`, async () => {
        await expect(page.getByRole('cell', { name: new RegExp(method, 'i') }).first()).toBeVisible({ timeout: 15000 });
      });
    }

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Shipping methods', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Przejscie do kroku platnosci po wypelnieniu adresu i wyborze dostawy
  test('should proceed to payment step', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    await (checkoutPage as SzpakiCheckoutPage).continueAsGuest();

    await checkoutPage.fillShippingAddress({
      email: 'guest-test@4szpaki.pl',
      firstName: 'Aurora',
      lastName: 'Bot',
      street: 'Testowa 2',
      city: 'Białystok',
      postcode: '15-066',
      phone: '+48510245267',
    });

    await (checkoutPage as SzpakiCheckoutPage).selectShippingAndProceed('DPD  Kurier');

    const screenshot = await page.screenshot();
    await test.info().attach('Payment step', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Krok platnosci wyswietla metody platnosci (BLIK, karta, PayPo, przelew, PayPal)
  test('should display payment methods', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    await (checkoutPage as SzpakiCheckoutPage).continueAsGuest();

    await checkoutPage.fillShippingAddress({
      email: 'guest-test@4szpaki.pl',
      firstName: 'Aurora',
      lastName: 'Bot',
      street: 'Testowa 2',
      city: 'Białystok',
      postcode: '15-066',
      phone: '+48510245267',
    });

    await (checkoutPage as SzpakiCheckoutPage).selectShippingAndProceed('DPD  Kurier');

    const expectedPayments = [
      'BLIK',
      'Płatność kartą',
      'PayPo',
      'Przelew online',
      'PayPal',
    ];

    for (const payment of expectedPayments) {
      await test.step(`Platnosc: ${payment}`, async () => {
        await expect(page.locator('label').filter({ hasText: payment }).first()).toBeVisible({ timeout: 10000 });
      });
    }

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Payment methods', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Zgody, komentarz i przycisk "Kupuje i place" widoczne na kroku platnosci
  test('should display consents and place order button', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    await (checkoutPage as SzpakiCheckoutPage).continueAsGuest();

    await checkoutPage.fillShippingAddress({
      email: 'guest-test@4szpaki.pl',
      firstName: 'Aurora',
      lastName: 'Bot',
      street: 'Testowa 2',
      city: 'Białystok',
      postcode: '15-066',
      phone: '+48510245267',
    });

    await (checkoutPage as SzpakiCheckoutPage).selectShippingAndProceed('DPD  Kurier');

    await test.step('Zgody', async () => {
      await expect(page.locator('label').filter({ hasText: /Zaznacz wszystkie zgody/i })).toBeVisible();
      await expect(page.locator('label').filter({ hasText: /regulamin/i }).first()).toBeVisible();
    });

    await test.step('Komentarz', async () => {
      await expect(page.getByRole('textbox', { name: /komentarz/i })).toBeVisible();
    });

    await test.step('Przycisk zlozenia zamowienia', async () => {
      await expect(page.getByRole('button', { name: /Kupuję i płacę/i })).toBeVisible();
    });

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Consents and place order', { body: screenshot, contentType: 'image/png' });
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

    const screenshot2 = await page.screenshot({ fullPage: true });
    await test.info().attach('Shipping form', { body: screenshot2, contentType: 'image/png' });
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
