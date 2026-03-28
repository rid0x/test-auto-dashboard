import { test, expect } from '../../fixture';

test.describe('Elakiernik - Cart @cart @e2e', () => {
  test('should display empty cart', async ({ cartPage, page }) => {
    await cartPage.goto();
    await cartPage.expectCartEmpty();
    const screenshot = await page.screenshot();
    await test.info().attach('Empty cart', { body: screenshot, contentType: 'image/png' });
  });

  test('should add product to cart from product page', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();
    await cartPage.goto();
    await cartPage.expectCartNotEmpty();
    const screenshot = await page.screenshot();
    await test.info().attach('Cart with product', { body: screenshot, contentType: 'image/png' });
  });

  test('should display cart item details', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();
    await cartPage.goto();
    const cartItem = page.locator('.cart.item, #shopping-cart-table tbody tr').first();
    await expect(cartItem).toBeVisible();
  });

  test('should update quantity in cart', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();
    await cartPage.goto();
    await cartPage.updateQuantity(0, 2);
    await cartPage.expectCartNotEmpty();
  });

  test('should remove item from cart', async ({ productPage, cartPage, page }) => {
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
});
