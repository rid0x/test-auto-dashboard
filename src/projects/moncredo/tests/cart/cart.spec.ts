import { test, expect } from '../../fixture';

test.describe('Moncredo - Cart @cart @e2e', () => {
  test('should display empty cart', async ({ cartPage, page }) => {
    await cartPage.goto();
    await cartPage.expectCartEmpty();

    const screenshot = await page.screenshot();
    await test.info().attach('Empty cart', { body: screenshot, contentType: 'image/png' });
  });

  test('should add product to cart from product page', async ({ productPage, cartPage, page }) => {
    await test.step('Go to product and add to cart', async () => {
      await productPage.gotoDefaultProduct();
      await page.locator('#product-addtocart-button').click();
      await page.waitForTimeout(3000);
    });

    await test.step('Verify success message', async () => {
      const msg = page.locator('.message.success, .message:has-text("Dodałeś")');
      await expect(msg.first()).toBeVisible({ timeout: 10000 });
    });

    await test.step('Verify cart has item', async () => {
      await cartPage.goto();
      await cartPage.expectCartNotEmpty();
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Cart with product', { body: screenshot, contentType: 'image/png' });
  });

  test('should display cart item details', async ({ productPage, cartPage, page }) => {
    // Add product first
    await productPage.gotoDefaultProduct();
    await page.locator('#product-addtocart-button').click();
    await page.waitForTimeout(3000);

    await cartPage.goto();

    await test.step('Verify product name in cart', async () => {
      const name = page.locator('.product-item-name');
      await expect(name.first()).toBeVisible();
    });

    await test.step('Verify price in cart', async () => {
      const price = page.locator('.price-excluding-tax .price, .cart-price .price');
      await expect(price.first()).toBeVisible();
    });

    await test.step('Verify quantity input', async () => {
      const qty = page.locator('input.qty, input[name*="qty"]');
      await expect(qty.first()).toBeVisible();
    });
  });

  test('should update quantity in cart', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await page.locator('#product-addtocart-button').click();
    await page.waitForTimeout(3000);

    await cartPage.goto();

    await test.step('Change quantity to 3', async () => {
      const qtyInput = page.locator('input.qty, input[name*="qty"]').first();
      await qtyInput.fill('3');

      const updateBtn = page.locator('.action.update, button:has-text("Aktualizuj")').first();
      await updateBtn.click();
      await page.waitForLoadState('load');
      await page.waitForTimeout(2000);
    });

    await test.step('Verify cart still has items', async () => {
      await cartPage.expectCartNotEmpty();
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Updated quantity', { body: screenshot, contentType: 'image/png' });
  });

  test('should remove item from cart', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await page.locator('#product-addtocart-button').click();
    await page.waitForTimeout(3000);

    await cartPage.goto();

    await test.step('Remove item', async () => {
      const deleteBtn = page.locator('.action-delete, .action.action-delete').first();
      await deleteBtn.click();
      await page.waitForLoadState('load');
      await page.waitForTimeout(2000);
    });

    await test.step('Verify cart is empty', async () => {
      await cartPage.expectCartEmpty();
    });
  });

  test('should display cart subtotal', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await page.locator('#product-addtocart-button').click();
    await page.waitForTimeout(3000);

    await cartPage.goto();

    const summary = page.locator('.cart-summary');
    await expect(summary.first()).toBeVisible();
  });

  test('should have proceed to checkout button', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await page.locator('#product-addtocart-button').click();
    await page.waitForTimeout(3000);

    await cartPage.goto();

    const checkoutLink = page.locator('#checkout-link-button, a[title="Do kasy"]');
    await checkoutLink.first().scrollIntoViewIfNeeded();
    await expect(checkoutLink.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Checkout button', { body: screenshot, contentType: 'image/png' });
  });

  test('should show mini cart after adding product', async ({ productPage, page }) => {
    await productPage.gotoDefaultProduct();
    await page.locator('#product-addtocart-button').click();
    await page.waitForTimeout(3000);

    const cartCount = page.locator('#menu-cart-icon');
    const text = await cartCount.textContent();
    expect(Number(text?.trim())).toBeGreaterThan(0);
  });
});
