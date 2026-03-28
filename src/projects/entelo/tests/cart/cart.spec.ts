import { test, expect } from '../../fixture';

test.describe('Entelo - Cart @cart @e2e', () => {
  test('should display empty cart', async ({ cartPage, page }) => {
    await cartPage.goto();
    await cartPage.expectCartEmpty();
  });

  test('should add product to cart from product page', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();
    await cartPage.goto();
    await cartPage.expectCartNotEmpty();
  });

  test('should display cart item details', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();
    await cartPage.goto();
    await expect(page.locator('.cart.item, #shopping-cart-table tbody tr').first()).toBeVisible();
  });

  test('should update quantity in cart', async ({ productPage, cartPage }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();
    await cartPage.goto();
    await cartPage.updateQuantity(0, 2);
    await cartPage.expectCartNotEmpty();
  });

  test('should remove item from cart', async ({ productPage, cartPage }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();
    await cartPage.goto();
    await cartPage.removeFirstItem();
    await cartPage.expectCartEmpty();
  });

  test('should display cart subtotal', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();
    await cartPage.goto();
    await expect(page.locator('.cart-summary, .cart-totals').first()).toBeVisible();
  });

  test('should have proceed to checkout button', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();
    await cartPage.goto();
    const checkoutBtn = page.getByRole('button', { name: /Przejdź do kasy|Zamawiam/i }).or(page.locator('button.checkout, a[href*="checkout"]'));
    await expect(checkoutBtn.first()).toBeVisible();
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

  // @desc: Przycisk "Do kasy" prowadzi do checkout
  test('should navigate to checkout from cart', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    expect(page.url()).toContain('checkout');
  });
});
