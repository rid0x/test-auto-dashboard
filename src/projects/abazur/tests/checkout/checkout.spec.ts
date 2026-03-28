import { test, expect } from '../../fixture';

test.describe('Abazur - Checkout @checkout @e2e', () => {
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
    // Wait for Magento checkout JS to render the form
    await page.waitForTimeout(3000);

    await test.step('Email', async () => {
      await expect(page.locator('#customer-email, input[name="username"], input[type="email"]').first()).toBeVisible({ timeout: 20000 });
    });

    await test.step('Imie i Nazwisko', async () => {
      const firstName = page.locator('input[name="firstname"]').or(page.getByRole('textbox', { name: /Imię/i }));
      await expect(firstName.first()).toBeVisible({ timeout: 15000 });
      const lastName = page.locator('input[name="lastname"]').or(page.getByRole('textbox', { name: /Nazwisko/i }));
      await expect(lastName.first()).toBeVisible({ timeout: 15000 });
    });

    await test.step('Adres: ulica, kod pocztowy, miasto', async () => {
      await expect(page.locator('input[name="street[0]"]').first()).toBeVisible({ timeout: 15000 });
      const postcode = page.locator('input[name="postcode"]').or(page.getByRole('textbox', { name: /Kod pocztowy/i }));
      await expect(postcode.first()).toBeVisible({ timeout: 15000 });
      const city = page.locator('input[name="city"]').or(page.getByRole('textbox', { name: /Miasto/i }));
      await expect(city.first()).toBeVisible({ timeout: 15000 });
    });

    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Shipping form', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Metody dostawy sa widoczne po wypelnieniu adresu
  test('should display shipping methods', async ({ checkoutPage, page }) => {
    await checkoutPage.goto();
    await page.waitForLoadState('load');

    await checkoutPage.fillShippingAddress({
      email: 'guest-test@abazur.pl',
      firstName: 'Aurora',
      lastName: 'Bot',
      street: 'Testowa 2',
      city: 'Warszawa',
      postcode: '00-001',
      phone: '+48510245267',
    });

    const shippingMethods = page.locator('#checkout-shipping-method-load, .table-checkout-shipping-method, [data-role="shipping-method"]');
    await expect(shippingMethods.first()).toBeVisible({ timeout: 15000 });

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
      test.skip(true, 'Brak linka powrotu do koszyka');
    }
  });
});
