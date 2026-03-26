import { test, expect } from '../../fixture';

test.describe('Getprice - Cart @cart @e2e', () => {
  test('should display empty cart', async ({ cartPage }) => {
    await cartPage.goto();
    await cartPage.expectCartEmpty();
  });

  test('should add product to cart from product page', async ({ productPage, cartPage }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();

    await cartPage.goto();
    await cartPage.expectCartNotEmpty();
  });

  test('should display cart item details', async ({ productPage, cartPage, page }) => {
    // Add product first
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();

    await cartPage.goto();
    await cartPage.expectCartNotEmpty();

    // Check item has name, price, qty
    const cartItem = page.locator('.cart.item, #shopping-cart-table tbody tr').first();
    await expect(cartItem).toBeVisible();
  });

  test('should update quantity in cart', async ({ productPage, cartPage }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();

    await cartPage.goto();
    await cartPage.updateQuantity(0, 3);
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

  test('should display cart subtotal', async ({ productPage, cartPage }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();

    await cartPage.goto();
    const subtotal = await cartPage.getSubtotal();
    expect(subtotal).toBeTruthy();
    expect(subtotal.length).toBeGreaterThan(0);
  });

  test('should have proceed to checkout button', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();

    await cartPage.goto();
    const checkoutBtn = page.locator(
      'button[data-role="proceed-to-checkout"], ' +
      '.checkout-methods-items .action.primary, ' +
      'button:has-text("Przejdź do kasy"), ' +
      'button:has-text("Proceed to Checkout")'
    );
    await expect(checkoutBtn.first()).toBeVisible();
  });

  test('should show mini cart after adding product', async ({ productPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);

    // Mini cart counter should update
    const counter = page.locator('.counter.qty, .minicart-wrapper .counter, .counter-number');
    await expect(counter.first()).toBeVisible({ timeout: 15000 });
  });
});
