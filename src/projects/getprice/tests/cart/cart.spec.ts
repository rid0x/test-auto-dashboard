import { test, expect } from '../../fixture';

test.describe('Getprice - Cart @cart @e2e', () => {
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

  // @desc: Koszyk wyswietla szczegoly produktu: nazwe, cene, pole ilosci i przycisk usuwania
  test('should display cart item details', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();

    await cartPage.goto();

    await test.step('Verify product name', async () => {
      await expect(page.locator('.product-item-name').first()).toBeVisible({ timeout: 10000 });
    });

    await test.step('Verify price', async () => {
      await expect(page.locator('.cart-price .price').first()).toBeVisible({ timeout: 10000 });
    });

    await test.step('Verify quantity input', async () => {
      await expect(page.locator('input.qty, input[name*="qty"]').first()).toBeVisible({ timeout: 10000 });
    });

    await test.step('Verify remove button', async () => {
      await expect(page.locator('.action-delete').first()).toBeVisible();
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Cart item details', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Zmiana ilosci produktu w koszyku i weryfikacja aktualizacji
  test('should update quantity in cart', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();

    await cartPage.goto();

    await test.step('Change quantity to 3', async () => {
      await cartPage.updateQuantity(0, 3);
    });

    await cartPage.expectCartNotEmpty();

    const screenshot = await page.screenshot();
    await test.info().attach('Updated quantity', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Usuniecie produktu z koszyka i weryfikacja pustego koszyka
  test('should remove item from cart', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();

    await cartPage.goto();

    await test.step('Remove item', async () => {
      await cartPage.removeFirstItem();
    });

    await cartPage.expectCartEmpty();
  });

  // @desc: Koszyk wyswietla podsumowanie z kwota do zaplaty
  test('should display cart subtotal', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();

    await cartPage.goto();
    await expect(page.locator('.cart-summary').first()).toBeVisible();
  });

  // @desc: Przycisk "Do kasy" jest widoczny i klikalny w koszyku
  test('should have proceed to checkout button', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();

    await cartPage.goto();

    const checkoutLink = page.locator('#checkout-link-button, a[title="Do kasy"]');
    await checkoutLink.first().scrollIntoViewIfNeeded();
    await expect(checkoutLink.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Checkout button', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Mini-koszyk aktualizuje licznik po dodaniu produktu
  test('should show mini cart after adding product', async ({ productPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();

    // Wait for cart counter to update
    await expect(page.locator('#menu-cart-icon')).toContainText(/[1-9]/, { timeout: 10000 });
  });
});
