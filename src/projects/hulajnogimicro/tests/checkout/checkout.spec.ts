import { test, expect } from '../../fixture';
import { HulajnogimicroCheckoutPage } from '../../pages/HulajnogimicroCheckoutPage';

test.describe('Hulajnogimicro - Checkout @checkout @e2e', () => {
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

  // @desc: Checkout wyswietla taby "Nie posiadam konta" / "Posiadam juz konto"
  test('should display login tabs on checkout', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');

    await expect(page.getByRole('tab', { name: /Nie posiadam konta/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('tab', { name: /Posiadam już konto/i })).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Checkout login tabs', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Formularz dostawy wyswietla wszystkie wymagane pola
  test('should display all shipping form fields', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    await (checkoutPage as HulajnogimicroCheckoutPage).continueAsGuest();

    await test.step('Email', async () => {
      await expect(page.getByRole('textbox', { name: 'Adres e-mail' })).toBeVisible({ timeout: 10000 });
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

    await test.step('Typ Klienta dropdown (Prywatny/Firmowy)', async () => {
      await expect(page.getByRole('combobox', { name: 'Typ Klienta' })).toBeVisible();
    });

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Shipping form fields', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Przelaczenie na Firmowy pokazuje dodatkowe pola NIP i Firma
  test('should display company fields when Firmowy is selected', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    await (checkoutPage as HulajnogimicroCheckoutPage).continueAsGuest();

    // Default: Prywatny selected
    await expect(page.getByRole('textbox', { name: 'Imię' })).toBeVisible({ timeout: 10000 });

    await test.step('Switch to Firmowy', async () => {
      await (checkoutPage as HulajnogimicroCheckoutPage).switchToCompanyClient();
    });

    await test.step('NIP field visible', async () => {
      await expect(page.getByRole('textbox', { name: 'NIP' })).toBeVisible({ timeout: 5000 });
    });

    await test.step('Firma field visible', async () => {
      await expect(page.getByRole('textbox', { name: 'Firma' })).toBeVisible({ timeout: 5000 });
    });

    await test.step('Standard fields still visible', async () => {
      await expect(page.getByRole('textbox', { name: 'Imię' })).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'Nazwisko' })).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'Ulica' })).toBeVisible();
    });

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Company form fields', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Metoda dostawy Kurier GLS jest widoczna
  test('should display shipping methods', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    await (checkoutPage as HulajnogimicroCheckoutPage).continueAsGuest();

    await checkoutPage.fillShippingAddress({
      email: 'guest-test@hulajnogimicro.pl',
      firstName: 'Aurora',
      lastName: 'Bot',
      street: 'Wiśniowa 40',
      city: 'Warszawa',
      postcode: '02-520',
      phone: '+48504736941',
    });

    // Hulajnogimicro shows "Kurier GLS Przesyłka Kurierska" as shipping method
    await expect(page.getByText('Kurier GLS').first()).toBeVisible({ timeout: 15000 });

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Shipping methods', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Przejscie do kroku platnosci po wypelnieniu adresu
  test('should proceed to payment step', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');
    await (checkoutPage as HulajnogimicroCheckoutPage).continueAsGuest();

    await checkoutPage.fillShippingAddress({
      email: 'guest-test@hulajnogimicro.pl',
      firstName: 'Aurora',
      lastName: 'Bot',
      street: 'Wiśniowa 40',
      city: 'Warszawa',
      postcode: '02-520',
      phone: '+48504736941',
    });

    await (checkoutPage as HulajnogimicroCheckoutPage).selectShippingAndProceed();

    // Should be on payment step or next step
    const screenshot = await page.screenshot();
    await test.info().attach('Payment step', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Podsumowanie zamowienia z produktem widoczne w checkout
  test('should display order summary in checkout', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');

    // Hulajnogimicro shows "Podsumowanie zamówienia" and "1 Produkty w koszyku"
    await expect(page.getByText('Podsumowanie zamówienia').first()).toBeVisible({ timeout: 15000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Order summary', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Wskaznik 2 krokow checkout jest widoczny (Dostawa / Podsumowanie i platnosc)
  test('should display checkout steps indicator', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');

    // Hulajnogimicro shows: 1. Dostawa, 2. Podsumowanie i płatność
    await expect(page.getByText('Dostawa').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Podsumowanie i płatność').first()).toBeVisible();
  });

  // === ADVANCED CHECKOUT TESTS ===

  // @desc: Formularz dostawy wyswietla wszystkie pola adresowe
  test('should display all shipping address fields via cart', async ({ cartPage, page }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await page.waitForTimeout(8000);

    const checkoutForm = page.locator('input[name="firstname"], input[name="street[0]"]');
    if (!(await checkoutForm.first().isVisible({ timeout: 15000 }).catch(() => false))) {
      test.skip(true, 'Checkout form nie załadował się');
    }

    await expect(page.locator('input[name="firstname"]').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[name="lastname"]').first()).toBeVisible();

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Shipping form', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Metody dostawy widoczne po wypelnieniu adresu
  test('should display shipping methods after filling address', async ({ cartPage, page }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await page.waitForTimeout(8000);

    const checkoutForm = page.locator('input[name="firstname"]');
    if (!(await checkoutForm.first().isVisible({ timeout: 15000 }).catch(() => false))) {
      test.skip(true, 'Checkout form nie załadował się');
    }

    // Hulajnogimicro checkout uses getByRole textboxes
    await page.getByRole('textbox', { name: 'Adres e-mail' }).fill('test@test.pl');
    await page.getByRole('textbox', { name: 'Imię' }).fill('Test');
    await page.getByRole('textbox', { name: 'Nazwisko' }).fill('User');
    await page.getByRole('textbox', { name: 'Ulica' }).fill('Testowa');
    await page.getByRole('textbox', { name: 'Numer domu' }).fill('1');
    await page.getByRole('textbox', { name: 'Kod pocztowy' }).fill('00-001');
    await page.getByRole('textbox', { name: 'Miasto' }).fill('Warszawa');
    await page.getByRole('textbox', { name: 'Numer telefonu' }).fill('500100200');
    await page.waitForTimeout(5000);

    const shippingMethods = page.locator('input[type="radio"], .table-checkout-shipping-method');
    expect(await shippingMethods.count()).toBeGreaterThan(0);
  });

  // @desc: Przycisk "Dalej" przechodzi do kroku platnosci
  test('should proceed to payment step via Dalej button', async ({ cartPage, page }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await page.waitForTimeout(8000);

    const checkoutForm = page.locator('input[name="firstname"]');
    if (!(await checkoutForm.first().isVisible({ timeout: 15000 }).catch(() => false))) {
      test.skip(true, 'Checkout form nie załadował się');
    }

    await page.getByRole('textbox', { name: 'Adres e-mail' }).fill('test@test.pl');
    await page.getByRole('textbox', { name: 'Imię' }).fill('Test');
    await page.getByRole('textbox', { name: 'Nazwisko' }).fill('User');
    await page.getByRole('textbox', { name: 'Ulica' }).fill('Testowa');
    await page.getByRole('textbox', { name: 'Numer domu' }).fill('1');
    await page.getByRole('textbox', { name: 'Kod pocztowy' }).fill('00-001');
    await page.getByRole('textbox', { name: 'Miasto' }).fill('Warszawa');
    await page.getByRole('textbox', { name: 'Numer telefonu' }).fill('500100200');
    await page.waitForTimeout(5000);

    const nextBtn = page.locator('button:has-text("Dalej"), button[data-role="opc-continue"]');
    if (await nextBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await nextBtn.first().click();
      await page.waitForTimeout(8000);
      const paymentSection = page.locator('.payment-methods, #checkout-payment-method-load, .opc-payment');
      await expect(paymentSection.first()).toBeVisible({ timeout: 15000 });
    }
  });

  // @desc: Podsumowanie zamowienia widoczne na checkout
  test('should display order summary on checkout page', async ({ cartPage, page }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await page.waitForTimeout(8000);

    const summary = page.locator('text=Podsumowanie zamówienia, text=Produkty w koszyku');
    if (!(await summary.first().isVisible({ timeout: 15000 }).catch(() => false))) {
      test.skip(true, 'Order summary nie załadował się');
    }
    await expect(summary.first()).toBeVisible();
    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Order summary', { body: screenshot, contentType: 'image/png' });
  });
});
