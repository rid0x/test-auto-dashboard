import { test, expect } from '../../fixture';

// Helper: add product to cart and wait for success using smart waits
async function addProductToCart(page: any) {
  await page.locator('#product-addtocart-button').click();
  // Wait for success message (smart wait — no hard timeout)
  await expect(page.locator('.message.success').first()).toBeVisible({ timeout: 10000 });
}

test.describe('Getprice - Cart @cart @e2e', () => {
  test('should display empty cart', async ({ cartPage, page }) => {
    await cartPage.goto();
    await cartPage.expectCartEmpty();

    const screenshot = await page.screenshot();
    await test.info().attach('Empty cart', { body: screenshot, contentType: 'image/png' });
  });

  test('should add product to cart from product page', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await addProductToCart(page);

    await cartPage.goto();
    await cartPage.expectCartNotEmpty();

    const screenshot = await page.screenshot();
    await test.info().attach('Cart with product', { body: screenshot, contentType: 'image/png' });
  });

  test('should display cart item details', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await addProductToCart(page);

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

  test('should update quantity in cart', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await addProductToCart(page);

    await cartPage.goto();

    await test.step('Change quantity', async () => {
      const qtyInput = page.locator('input.qty, input[name*="qty"]').first();
      await qtyInput.fill('3');

      const updateBtn = page.locator('.action.update, button:has-text("Aktualizuj")').first();
      await updateBtn.click();
      await page.waitForLoadState('load');
    });

    await cartPage.expectCartNotEmpty();

    const screenshot = await page.screenshot();
    await test.info().attach('Updated quantity', { body: screenshot, contentType: 'image/png' });
  });

  test('should remove item from cart', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await addProductToCart(page);

    await cartPage.goto();

    await test.step('Remove item', async () => {
      await page.locator('.action-delete').first().click();
      await page.waitForLoadState('load');
    });

    await cartPage.expectCartEmpty();
  });

  test('should display cart subtotal', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await addProductToCart(page);

    await cartPage.goto();
    await expect(page.locator('.cart-summary').first()).toBeVisible();
  });

  test('should have proceed to checkout button', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await addProductToCart(page);

    await cartPage.goto();

    const checkoutLink = page.locator('#checkout-link-button, a[title="Do kasy"]');
    await checkoutLink.first().scrollIntoViewIfNeeded();
    await expect(checkoutLink.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Checkout button', { body: screenshot, contentType: 'image/png' });
  });

  test('should show mini cart after adding product', async ({ productPage, page }) => {
    await productPage.gotoDefaultProduct();
    await addProductToCart(page);

    // Wait for cart counter to update
    await expect(page.locator('#menu-cart-icon')).toContainText(/[1-9]/, { timeout: 10000 });
  });
});
