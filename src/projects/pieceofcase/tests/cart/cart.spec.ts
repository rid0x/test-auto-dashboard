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
      await page.locator('#product-addtocart-button').click();
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

  // @desc: Koszyk wyswietla szczegoly produktu: nazwe, cene, pole ilosci i przycisk usuwania
  test('should display cart item details', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await page.locator('#product-addtocart-button').click();
    await page.locator('.message.success, .message:has-text("Dodałeś")').first().waitFor({ state: 'visible', timeout: 10000 });

    await cartPage.goto();

    await test.step('Verify product name in cart', async () => {
      const name = page.locator('.product-item-name');
      await expect(name.first()).toBeVisible();
    });

    await test.step('Verify price in cart', async () => {
      const price = page.locator('.price-excluding-tax .price, .cart-price .price, .price');
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
    await page.locator('#product-addtocart-button').click();
    await page.locator('.message.success, .message:has-text("Dodałeś")').first().waitFor({ state: 'visible', timeout: 10000 });

    await cartPage.goto();

    await test.step('Change quantity to 3', async () => {
      const qtyInput = page.locator('input.qty, input[name*="qty"]').first();
      await qtyInput.fill('3');

      const updateBtn = page.locator('.action.update, button:has-text("Aktualizuj")').first();
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
    await page.locator('#product-addtocart-button').click();
    await page.locator('.message.success, .message:has-text("Dodałeś")').first().waitFor({ state: 'visible', timeout: 10000 });

    await cartPage.goto();

    await test.step('Remove item', async () => {
      const deleteBtn = page.locator('.action-delete, .action.action-delete').first();
      await deleteBtn.click();
      await page.waitForLoadState('load');
    });

    await test.step('Verify cart is empty', async () => {
      await cartPage.expectCartEmpty();
    });
  });

  // @desc: Koszyk wyswietla podsumowanie z kwota do zaplaty
  test('should display cart subtotal', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await page.locator('#product-addtocart-button').click();
    await page.locator('.message.success, .message:has-text("Dodałeś")').first().waitFor({ state: 'visible', timeout: 10000 });

    await cartPage.goto();

    const summary = page.locator('.cart-summary');
    await expect(summary.first()).toBeVisible();
  });

  // @desc: Przycisk "Do kasy" jest widoczny i klikalny w koszyku
  test('should have proceed to checkout button', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await page.locator('#product-addtocart-button').click();
    await page.locator('.message.success, .message:has-text("Dodałeś")').first().waitFor({ state: 'visible', timeout: 10000 });

    await cartPage.goto();

    const checkoutLink = page.locator('button.checkout, a[title="Do kasy"], a[href*="checkout"]');
    await checkoutLink.first().scrollIntoViewIfNeeded();
    await expect(checkoutLink.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Checkout button', { body: screenshot, contentType: 'image/png' });
  });
});
