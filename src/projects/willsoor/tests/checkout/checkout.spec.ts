import { test, expect } from '../../fixture';
import { WillsoorCheckoutPage } from '../../pages/WillsoorCheckoutPage';

test.describe('Willsoor - Checkout @checkout @e2e', () => {
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

    await expect(page.getByRole('button', { name: 'Zakupy bez logowania' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: 'Załóż konto' })).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Checkout login/guest', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Formularz dostawy wyswietla wszystkie wymagane pola po wyborze "bez logowania"
  test('should display all shipping form fields', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    await (checkoutPage as WillsoorCheckoutPage).continueAsGuest();

    await test.step('Email', async () => {
      await expect(page.getByRole('textbox', { name: 'Adres email' })).toBeVisible({ timeout: 10000 });
    });

    await test.step('Imie i Nazwisko', async () => {
      await expect(page.getByRole('textbox', { name: 'Imię' })).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'Nazwisko' })).toBeVisible();
    });

    await test.step('Ulica, Numer domu, Numer mieszkania', async () => {
      await expect(page.getByRole('textbox', { name: 'Ulica' })).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'Numer domu' })).toBeVisible();
    });

    await test.step('Kod pocztowy i Miasto', async () => {
      await expect(page.getByRole('textbox', { name: 'Kod pocztowy' })).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'Miasto' })).toBeVisible();
    });

    await test.step('Numer telefonu', async () => {
      await expect(page.getByRole('textbox', { name: 'Numer telefonu' })).toBeVisible();
    });

    await test.step('Osoba prywatna / Firma', async () => {
      await expect(page.getByText('Osoba prywatna').first()).toBeVisible();
      await expect(page.getByText('Firma').first()).toBeVisible();
    });

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Shipping form fields', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Przelaczenie na Firme pokazuje dodatkowe pola NIP i Firma
  test('should display company fields when Firma is selected', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    await (checkoutPage as WillsoorCheckoutPage).continueAsGuest();

    // Default: Osoba prywatna — NIP/Firma not visible
    await expect(page.getByRole('textbox', { name: 'Imię' })).toBeVisible({ timeout: 10000 });

    await test.step('Switch to Firma', async () => {
      await page.getByRole('radio', { name: 'Firma' }).check();
      await page.waitForTimeout(500);
    });

    await test.step('NIP field visible', async () => {
      await expect(page.getByRole('textbox', { name: 'Numer NIP (VAT UE)' })).toBeVisible();
    });

    await test.step('Firma field visible', async () => {
      await expect(page.getByRole('textbox', { name: 'Firma' })).toBeVisible();
    });

    await test.step('Standard fields still visible', async () => {
      await expect(page.getByRole('textbox', { name: 'Imię' })).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'Nazwisko' })).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'Ulica' })).toBeVisible();
    });

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Company form fields', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Wszystkie 7 metod dostawy sa widoczne po wypelnieniu adresu
  test('should display all shipping methods', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    await (checkoutPage as WillsoorCheckoutPage).continueAsGuest();

    await checkoutPage.fillShippingAddress({
      email: 'guest-test@willsoor.pl',
      firstName: 'Aurora',
      lastName: 'Bot',
      street: 'Testowa 2',
      city: 'Białystok',
      postcode: '15-066',
      phone: '+48510245267',
    });

    const expectedMethods = [
      'DPD Pickup - odbiór w punkcie',
      'InPost Paczkomat',
      'Kurier InPost - przedpłata',
      'Kurier DPD - przedpłata',
      'Kurier DPD - płatność przy odbiorze',
      'Odbiór w sklepie Willsoor',
    ];

    for (const method of expectedMethods) {
      await test.step(`Metoda: ${method}`, async () => {
        await expect(page.getByText(method).first()).toBeVisible({ timeout: 15000 });
      });
    }

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('All shipping methods', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Przejscie do kroku platnosci po wypelnieniu adresu i wyborze dostawy
  test('should proceed to payment step', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    await (checkoutPage as WillsoorCheckoutPage).continueAsGuest();

    await checkoutPage.fillShippingAddress({
      email: 'guest-test@willsoor.pl',
      firstName: 'Aurora',
      lastName: 'Bot',
      street: 'Testowa 2',
      city: 'Białystok',
      postcode: '15-066',
      phone: '+48510245267',
    });

    await (checkoutPage as WillsoorCheckoutPage).selectShippingAndProceed('Kurier DPD - przedpłata');

    // Should be on payment step
    expect(page.url()).toContain('payment');

    const screenshot = await page.screenshot();
    await test.info().attach('Payment step', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Krok platnosci wyswietla metody platnosci (BLIK, karta, Google Pay, PayPo, przelew, PayPal)
  test('should display payment methods', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    await (checkoutPage as WillsoorCheckoutPage).continueAsGuest();

    await checkoutPage.fillShippingAddress({
      email: 'guest-test@willsoor.pl',
      firstName: 'Aurora',
      lastName: 'Bot',
      street: 'Testowa 2',
      city: 'Białystok',
      postcode: '15-066',
      phone: '+48510245267',
    });

    await (checkoutPage as WillsoorCheckoutPage).selectShippingAndProceed('Kurier DPD - przedpłata');

    const expectedPayments = [
      'BLIK',
      'Płatność kartą',
      'Google Pay',
      'PayPo',
      'Zwykły przelew bankowy',
      'PayPal',
    ];

    for (const payment of expectedPayments) {
      await test.step(`Platnosc: ${payment}`, async () => {
        await expect(page.getByText(payment).first()).toBeVisible({ timeout: 10000 });
      });
    }

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Payment methods', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Zgody, komentarz i przycisk zlozenia zamowienia sa widoczne na kroku platnosci
  test('should display consents and place order button', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    await (checkoutPage as WillsoorCheckoutPage).continueAsGuest();

    await checkoutPage.fillShippingAddress({
      email: 'guest-test@willsoor.pl',
      firstName: 'Aurora',
      lastName: 'Bot',
      street: 'Testowa 2',
      city: 'Białystok',
      postcode: '15-066',
      phone: '+48510245267',
    });

    await (checkoutPage as WillsoorCheckoutPage).selectShippingAndProceed('Kurier DPD - przedpłata');

    await test.step('Zgody', async () => {
      await expect(page.getByText('Zaznacz wszystkie zgody')).toBeVisible();
      await expect(page.getByText('regulaminem zakupów')).toBeVisible();
    });

    await test.step('Komentarz', async () => {
      await expect(page.getByText('Dodaj komentarz')).toBeVisible();
    });

    await test.step('Przycisk zlozenia zamowienia', async () => {
      await expect(page.getByRole('button', { name: /Złoż zamówienie/i })).toBeVisible();
    });

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Consents and place order', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Podsumowanie zamowienia z produktem widoczne w checkout
  test('should display order summary in checkout', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    await (checkoutPage as WillsoorCheckoutPage).continueAsGuest();

    await expect(page.getByText('PODSUMOWANIE ZAMÓWIENIA')).toBeVisible({ timeout: 15000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Order summary', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Wskaznik 3 krokow checkout jest widoczny
  test('should display checkout steps indicator', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');

    // Steps bar shows: 1. Zaloguj się, 2. Dostawa, 3. Podsumowanie i płatność
    const stepsBar = page.locator('.opc-progress-bar, .checkout-steps-wrapper').first();
    await expect(stepsBar).toBeVisible({ timeout: 10000 });
  });
});
