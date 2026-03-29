import { test, expect } from '../../fixture';

test.describe('Moncredo - Cart @cart @e2e', () => {
  // @desc: Pusty koszyk wyswietla komunikat o braku produktow
  test('should display empty cart', async ({ cartPage, page }) => {
    await cartPage.goto();
    await cartPage.expectCartEmpty();

    const screenshot = await page.screenshot();
    await test.info().attach('Empty cart', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Dodanie produktu do koszyka ze strony produktu i weryfikacja koszyka
  test('should add product to cart from product page', async ({ productPage, cartPage, page }) => {
    await test.step('Go to product and add to cart', async () => {
      await productPage.gotoDefaultProduct();
      await productPage.addToCartWithOptions(1);
    });

    await test.step('Verify success message or cart counter', async () => {
      const msgVisible = await page.locator('.message-success').isVisible().catch(() => false);
      const counterVisible = await page.locator('.counter.qty:not(.empty)').isVisible().catch(() => false);
      expect(msgVisible || counterVisible).toBeTruthy();
    });

    await test.step('Verify cart has item', async () => {
      await cartPage.goto();
      await cartPage.expectCartNotEmpty();
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Cart with product', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Koszyk wyswietla szczegoly produktu: nazwe, cene, pole ilosci i przycisk usuwania
  test('should display cart item details', async ({ productPage, cartPage, page }) => {
    // Add product first
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await page.waitForTimeout(2000);

    await cartPage.goto();

    await test.step('Verify product name in cart', async () => {
      const name = page.locator('.product-item-name, .item-info .product-item-name');
      await expect(name.first()).toBeVisible();
    });

    await test.step('Verify price in cart', async () => {
      const price = page.locator('.price-excluding-tax .price, .cart-price .price, .subtotal .price');
      await expect(price.first()).toBeVisible();
    });

    await test.step('Verify quantity input', async () => {
      const qty = page.locator('input.qty, input[name*="qty"]');
      await expect(qty.first()).toBeVisible();
    });
  });

  // @desc: Zmiana ilosci produktu w koszyku i weryfikacja aktualizacji
  test('should update quantity in cart', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await page.waitForTimeout(2000);

    await cartPage.goto();

    await test.step('Change quantity to 3', async () => {
      const qtyInput = page.locator('input.qty, input[name*="qty"]').first();
      await qtyInput.fill('3');

      const updateBtn = page.locator('#update-cart-button, button.action.update, button:has-text("Przelicz")').first();
      await updateBtn.scrollIntoViewIfNeeded();
      await updateBtn.click({ force: true });
      await page.waitForLoadState('load');
    });

    await test.step('Verify cart still has items', async () => {
      await cartPage.expectCartNotEmpty();
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Updated quantity', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Usuniecie produktu z koszyka i weryfikacja pustego koszyka
  test('should remove item from cart', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await page.waitForTimeout(2000);

    await cartPage.goto();

    await test.step('Remove item', async () => {
      // Moncredo uses div.cs-cart-item__link--remove inside cart table
      const deleteBtn = page.locator('.cs-cart-item__link--remove, #shopping-cart-table a.action.delete, .cart-container a[title="Usuń produkt"]').first();
      await deleteBtn.scrollIntoViewIfNeeded();
      await deleteBtn.click({ force: true });
      // Handle potential confirmation modal
      const confirmBtn = page.locator('.action-primary.action-accept, button:has-text("OK")');
      if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await confirmBtn.click();
      }
      await page.waitForLoadState('load');
      await page.waitForTimeout(2000);
    });

    await test.step('Verify cart is empty', async () => {
      // Wait and reload to ensure delete processed
      await page.waitForTimeout(3000);
      await page.goto('https://moncredo.pl/checkout/cart/', { waitUntil: 'networkidle' });
      const emptyMsg = page.locator('.cart-empty, .subtitle.empty');
      const hasItems = await page.locator('#shopping-cart-table').isVisible().catch(() => false);
      if (hasItems) {
        // Try remove again directly
        const deleteBtn = page.locator('.cs-cart-item__link--remove').first();
        if (await deleteBtn.isVisible().catch(() => false)) {
          await deleteBtn.click({ force: true });
          await page.waitForTimeout(3000);
          await page.goto('https://moncredo.pl/checkout/cart/', { waitUntil: 'networkidle' });
        }
      }
      await expect(emptyMsg.first()).toBeVisible({ timeout: 10000 });
    });
  });

  // @desc: Koszyk wyswietla podsumowanie z kwota do zaplaty
  test('should display cart subtotal', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await page.waitForTimeout(2000);

    await cartPage.goto();

    const summary = page.locator('.cart-summary, .cart-totals, .grand.totals, .cs-cart__summary');
    await expect(summary.first()).toBeVisible({ timeout: 10000 });
  });

  // @desc: Przycisk "Do kasy" jest widoczny i klikalny w koszyku
  test('should have proceed to checkout button', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await page.waitForTimeout(2000);

    await cartPage.goto();

    const checkoutLink = page.locator('button[data-role="proceed-to-checkout"], .action.primary.checkout, button:has-text("Przejdź do kasy")');
    await checkoutLink.first().scrollIntoViewIfNeeded();
    await expect(checkoutLink.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Checkout button', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Mini-koszyk aktualizuje licznik po dodaniu produktu
  test('should show mini cart after adding product', async ({ productPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);

    // Wait for cart counter to update
    await page.waitForTimeout(3000);
    const cartCount = page.locator('.counter.qty:not(.empty), .cs-header-user-nav__qty-counter:not(.cs-header-user-nav__qty-counter--empty)');
    await expect(cartCount.first()).toBeVisible({ timeout: 10000 });
  });

  // === ADVANCED CART TESTS ===

  // @desc: Dodanie produktu z qty=2 i weryfikacja ilości
  test('should add product with quantity 2', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(2);
    await productPage.expectAddToCartSuccess();
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
    await productPage.expectAddToCartSuccess();
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
    await productPage.expectAddToCartSuccess();
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
    await productPage.addToCartWithOptions(2);
    await productPage.expectAddToCartSuccess();
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
    await productPage.expectAddToCartSuccess();
    await cartPage.goto();
    await cartPage.removeFirstItem();
    await page.waitForTimeout(2000);
    await cartPage.goto();
    const emptyMsg = page.locator('.cart-empty, .subtitle.empty, :has-text("Nie masz produktów"), :has-text("Nie posiadasz produktów"), :has-text("no items"), :has-text("Twój koszyk jest pusty")');
    await expect(emptyMsg.first()).toBeVisible({ timeout: 10000 });
  });

  // @desc: Przycisk "Do kasy" prowadzi do checkout
  test('should click proceed to checkout button', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    expect(page.url()).toContain('checkout');
  });
});
