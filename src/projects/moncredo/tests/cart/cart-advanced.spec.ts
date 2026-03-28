import { test, expect } from '../../fixture';

test.describe('Moncredo - Cart Advanced @cart @e2e', () => {

  // @desc: Dodanie produktu z qty > 1 i weryfikacja ilości w koszyku
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

    const screenshot = await page.screenshot();
    await test.info().attach('Cart with qty 2', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Zwiększenie ilości produktu w koszyku
  test('should increase quantity in cart', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);

    await cartPage.goto();

    const qtyInput = page.locator('input.qty, input[name*="qty"]').first();
    await qtyInput.fill('3');

    // Click update button
    const updateBtn = page.locator('button.action.update, button:has-text("Aktualizuj"), button:has-text("Przelicz"), #update-cart-button');
    if (await updateBtn.first().isVisible().catch(() => false)) {
      await updateBtn.first().click({ force: true });
      await page.waitForLoadState('load');
    } else {
      await qtyInput.press('Tab');
      await page.waitForTimeout(2000);
    }

    await cartPage.expectCartNotEmpty();
  });

  // @desc: Zmniejszenie ilości produktu w koszyku do 1
  test('should decrease quantity in cart', async ({ productPage, cartPage, page }) => {
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
    const newQty = await page.locator('input.qty, input[name*="qty"]').first().inputValue().catch(() => '0');
    expect(Number(newQty)).toBe(1);
  });

  // @desc: Podsumowanie kwoty w koszyku jest widoczne
  test('should display cart totals', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);

    await cartPage.goto();

    const totals = page.locator('.cart-summary, .cart-totals, .grand.totals .price, .order-total');
    await expect(totals.first()).toBeVisible({ timeout: 10000 });

    // Price should contain "zł" or a number
    const priceText = await totals.first().textContent().catch(() => '');
    expect(priceText).toBeTruthy();

    const screenshot = await page.screenshot();
    await test.info().attach('Cart totals', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Usunięcie produktu z koszyka powoduje pusty koszyk
  test('should remove product and show empty cart', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);

    await cartPage.goto();
    await cartPage.expectCartNotEmpty();

    await cartPage.removeFirstItem();
    await cartPage.expectCartEmpty();

    const screenshot = await page.screenshot();
    await test.info().attach('Empty cart after remove', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Przycisk "Do kasy" prowadzi do checkout
  test('should proceed to checkout from cart', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);

    await cartPage.goto();
    await cartPage.proceedToCheckout();

    expect(page.url()).toContain('checkout');

    const screenshot = await page.screenshot();
    await test.info().attach('Checkout from cart', { body: screenshot, contentType: 'image/png' });
  });
});
