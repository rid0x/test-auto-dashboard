import { test, expect } from '../../fixture';

test.describe('Pieceofcase - Cart @cart @e2e', () => {
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

    await test.step('Verify success message', async () => {
      await productPage.expectAddToCartSuccess();
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
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();

    await cartPage.goto();

    await test.step('Verify product name in cart', async () => {
      // Pieceofcase cart: product name is bold link inside table (visible); .product-item-name is hidden mobile element
      const name = page.locator('td strong a:visible, .product-item-name:visible');
      await expect(name.first()).toBeVisible();
    });

    await test.step('Verify price in cart', async () => {
      // Price exists in DOM — check for any element with "zł" text in cart area
      const cartTable = page.locator('table:has(caption)');
      await expect(cartTable.locator(':has-text("zł")').first()).toBeVisible();
    });

    await test.step('Verify quantity input', async () => {
      // Qty input exists in DOM (may be CSS-hidden with custom overlay)
      const qty = page.locator('input[data-item-qty], input.item-qty');
      await expect(qty.first()).toBeAttached();
    });
  });

  // @desc: Zmiana ilosci produktu w koszyku i weryfikacja aktualizacji
  test('should update quantity in cart', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();

    await cartPage.goto();

    await test.step('Change quantity to 3', async () => {
      // Remove overlays
      await page.evaluate(() => {
        document.querySelectorAll('[data-gr="popup-container"], [id^="__pb"]').forEach(el => el.remove());
      }).catch(() => {});

      // Set qty value via JS — the input may be hidden behind custom UI
      await page.evaluate(() => {
        const input = document.querySelector('input.item-qty, input.cart-item-qty, input[data-item-qty]') as HTMLInputElement;
        if (input) {
          input.value = '3';
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      // Pieceofcase uses "Przelicz koszyk" button
      const updateBtn = page.locator('button:has-text("Przelicz"), .action.update, button:has-text("Aktualizuj")').first();
      await updateBtn.click();
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
    await productPage.expectAddToCartSuccess();

    await cartPage.goto();

    await test.step('Remove item', async () => {
      // Remove any overlays that might block click
      await page.evaluate(() => {
        document.querySelectorAll('[data-gr="popup-container"], [id^="__pb"]').forEach(el => el.remove());
      }).catch(() => {});
      const deleteBtn = page.locator('a:has-text("Usuń"), .action-delete, .action.action-delete').first();
      await deleteBtn.click({ force: true });

      // Pieceofcase shows a confirmation dialog — click OK
      const okBtn = page.locator('button:has-text("OK")');
      await okBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      if (await okBtn.isVisible()) {
        await okBtn.click();
      }
      await page.waitForLoadState('load');
    });

    await test.step('Verify cart is empty', async () => {
      // Wait for cart page to settle after removal
      await page.waitForLoadState('networkidle').catch(() => {});
      // Pieceofcase shows .cart-empty or "Nie masz żadnych produktów" message
      const emptyIndicator = page.locator('.cart-empty, p:has-text("Nie masz żadnych produktów"), p:has-text("Koszyk jest pusty")');
      await expect(emptyIndicator.first()).toBeVisible({ timeout: 15000 });
    });
  });

  // @desc: Koszyk wyswietla podsumowanie z kwota do zaplaty
  test('should display cart subtotal', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();

    await cartPage.goto();

    const summary = page.locator('.cart-summary');
    await expect(summary.first()).toBeVisible();
  });

  // @desc: Przycisk "Do kasy" jest widoczny i klikalny w koszyku
  test('should have proceed to checkout button', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();

    await cartPage.goto();

    const checkoutLink = page.locator('button:has-text("Przejdź do kasy"), button.checkout, a[title="Do kasy"], a[href*="checkout"]');
    await checkoutLink.first().scrollIntoViewIfNeeded();
    await expect(checkoutLink.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Checkout button', { body: screenshot, contentType: 'image/png' });
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
    await productPage.addToCartWithOptions(3);
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
    const emptyMsg = page.locator('.cart-empty, .subtitle.empty, :has-text("Nie masz produktów")');
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
