import { test, expect } from '../../fixture';

test.describe('4szpaki - Cart @cart @e2e', () => {
  // @desc: Pusty koszyk wyswietla komunikat o braku produktow
  test('should display empty cart', async ({ cartPage, page }) => {
    await cartPage.goto();
    await cartPage.expectCartEmpty();

    const screenshot = await page.screenshot();
    await test.info().attach('Empty cart', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Dodanie produktu do koszyka ze strony produktu i weryfikacja koszyka
  test('should add product to cart from product page', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();

    await cartPage.goto();
    await cartPage.expectCartNotEmpty();

    const screenshot = await page.screenshot();
    await test.info().attach('Cart with product', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Koszyk wyswietla szczegoly produktu: nazwe, cene, pole ilosci
  test('should display cart item details', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();

    await cartPage.goto();

    await test.step('Verify product in cart', async () => {
      const cartItem = page.locator('.cart.item, #shopping-cart-table tbody tr').first();
      await expect(cartItem).toBeVisible();
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Cart item details', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Zmiana ilosci produktu w koszyku aktualizuje koszyk
  test('should update quantity in cart', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();

    await cartPage.goto();
    await cartPage.updateQuantity(0, 2);
    await cartPage.expectCartNotEmpty();

    const screenshot = await page.screenshot();
    await test.info().attach('Updated quantity', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Usuniecie produktu z koszyka powoduje pusty koszyk
  test('should remove item from cart', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();

    await cartPage.goto();
    await cartPage.removeFirstItem();
    await cartPage.expectCartEmpty();

    const screenshot = await page.screenshot();
    await test.info().attach('Empty cart after remove', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Koszyk wyswietla podsumowanie z kwota do zaplaty
  test('should display cart subtotal', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();

    await cartPage.goto();
    const summary = page.locator('.cart-summary, .cart-totals');
    await expect(summary.first()).toBeVisible();
  });

  // @desc: Przycisk "Przejdz do kasy" jest widoczny w koszyku
  test('should have proceed to checkout button', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();

    await cartPage.goto();
    const checkoutBtn = page.getByRole('button', { name: /Przejdź do kasy/i }).or(
      page.locator('button.checkout, a[href*="checkout"]')
    );
    await checkoutBtn.first().scrollIntoViewIfNeeded();
    await expect(checkoutBtn.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Checkout button', { body: screenshot, contentType: 'image/png' });
  });
});
