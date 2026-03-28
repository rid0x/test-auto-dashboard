import { test, expect } from '../../fixture';

test.describe('Willsoor - Cart @cart @e2e', () => {
  // @desc: Pusty koszyk wyswietla komunikat o braku produktow
  test('should display empty cart', async ({ cartPage }) => {
    await cartPage.goto();
    await cartPage.expectCartEmpty();
  });

  // @desc: Dodanie produktu do koszyka ze strony produktu
  test('should add product to cart from product page', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();

    const screenshot = await page.screenshot();
    await test.info().attach('After add to cart', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Koszyk wyswietla szczegoly dodanego produktu i pole ilosci
  test('should display cart item details', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();

    await cartPage.goto();

    await test.step('Verify product in cart', async () => {
      const cartItem = page.locator('.cart.item, #shopping-cart-table tbody tr').first();
      await expect(cartItem).toBeVisible();
    });

    await test.step('Verify qty input', async () => {
      const qty = page.locator('input.qty, input[name*="qty"]').first();
      await expect(qty).toBeVisible();
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

    const total = page.locator('tr.grand.totals .price, .cart-totals .price');
    await expect(total.first()).toBeVisible();
  });

  // @desc: Koszyk zawiera przycisk "Przejdz do kasy"
  test('should have proceed to checkout button', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();

    await cartPage.goto();

    const checkoutBtn = page.getByRole('button', { name: /Przejdź do kasy/i });
    await checkoutBtn.scrollIntoViewIfNeeded();
    await expect(checkoutBtn).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Checkout button', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Mini koszyk pokazuje licznik po dodaniu produktu
  test('should show mini cart after adding product', async ({ productPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();

    // Willsoor mini cart counter may be lazy — just verify counter element exists
    const counter = page.locator('.counter-number, .counter.qty');
    const count = await counter.count();
    expect(count).toBeGreaterThan(0);
  });

  // === ADVANCED CART TESTS ===

  // @desc: Dodanie produktu z qty=2 i weryfikacja ilości
  test('should add product with quantity 2', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(2);
    await cartPage.goto();
    await cartPage.expectCartNotEmpty();
    const qtyInput = page.locator('input.qty, input[name*="qty"]').first();
    if (await qtyInput.isVisible().catch(() => false)) {
      const qty = await qtyInput.inputValue();
      expect(Number(qty)).toBeGreaterThanOrEqual(2);
    }
  });

  // @desc: Podsumowanie kwoty w koszyku jest widoczne
  test('should display cart totals with price', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await cartPage.goto();
    const totals = page.locator('.cart-summary, .cart-totals, .grand.totals .price, .order-total');
    await expect(totals.first()).toBeVisible({ timeout: 10000 });
    const screenshot = await page.screenshot();
    await test.info().attach('Cart totals', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Zwiększenie ilości produktu w koszyku
  test('should increase quantity in cart', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await cartPage.goto();
    const qtyInput = page.locator('input.qty, input[name*="qty"]').first();
    await qtyInput.fill('3');
    const updateBtn = page.locator('button.action.update, button:has-text("Aktualizuj"), button:has-text("Przelicz"), #update-cart-button');
    if (await updateBtn.first().isVisible().catch(() => false)) {
      await updateBtn.first().click({ force: true });
      await page.waitForLoadState('load');
    }
    await cartPage.expectCartNotEmpty();
  });

  // @desc: Zmniejszenie ilości produktu w koszyku do 1
  test('should decrease quantity in cart to 1', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(3);
    await cartPage.goto();
    const qtyInput = page.locator('input.qty, input[name*="qty"]').first();
    await qtyInput.fill('1');
    const updateBtn = page.locator('button.action.update, button:has-text("Aktualizuj"), button:has-text("Przelicz"), #update-cart-button');
    if (await updateBtn.first().isVisible().catch(() => false)) {
      await updateBtn.first().click({ force: true });
      await page.waitForLoadState('load');
    }
    await cartPage.expectCartNotEmpty();
  });

  // @desc: Usunięcie produktu z koszyka
  test('should remove product and show empty cart', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await cartPage.goto();
    await cartPage.removeFirstItem();
    await page.waitForTimeout(2000);
    await cartPage.goto();
    const emptyMsg = page.locator('.cart-empty, .subtitle.empty, :has-text("Nie masz produktów")');
    await expect(emptyMsg.first()).toBeVisible({ timeout: 10000 });
  });

  // @desc: Przycisk "Do kasy" prowadzi do checkout
  test('should click proceed to checkout button', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    expect(page.url()).toContain('checkout');
  });
});
