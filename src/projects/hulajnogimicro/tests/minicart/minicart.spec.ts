import { test, expect } from '../../fixture';

test.describe('Hulajnogimicro - Minicart @minicart @e2e', () => {

  // @desc: Ikona minicart jest widoczna w headerze
  test('should display minicart icon in header', async ({ homePage, page }) => {
    await homePage.goto();
    const minicart = page.locator('a[href*="checkout/cart"], .minicart-wrapper, .showcart');
    await expect(minicart.first()).toBeVisible();
  });

  // @desc: Minicart pokazuje komunikat o pustym koszyku
  test('should show empty cart message in minicart', async ({ homePage, page }) => {
    await homePage.goto();
    // Hulajnogimicro has a minicart link; click it to navigate to cart page
    const cartLink = page.locator('a[href*="checkout/cart"]').first();
    await cartLink.click();
    await page.waitForLoadState('load');

    // Verify empty cart message on cart page
    const emptyMsg = page.locator('.cart-empty, :has-text("Nie posiadasz produktów")');
    await expect(emptyMsg.first()).toBeVisible({ timeout: 10000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Empty minicart', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Po dodaniu produktu do koszyka - weryfikacja przez cart page
  test('should have product in cart after adding', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);

    // Go to cart page to verify
    await cartPage.goto();
    await cartPage.expectCartNotEmpty();

    const screenshot = await page.screenshot();
    await test.info().attach('Cart with product', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Po dodaniu 2x tego samego produktu - ilosc w koszyku >= 2
  test('should accumulate quantity for same product', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await page.waitForTimeout(2000);
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);

    await cartPage.goto();
    await cartPage.expectCartNotEmpty();

    // Check qty input value
    const qtyInput = page.locator('input.qty, input[name*="qty"]').first();
    if (await qtyInput.isVisible().catch(() => false)) {
      const qty = await qtyInput.inputValue().catch(() => '0');
      expect(Number(qty)).toBeGreaterThanOrEqual(2);
    }
  });

  // @desc: Link ikony koszyka prowadzi do /checkout/cart/
  test('should have cart link pointing to checkout/cart', async ({ homePage, page }) => {
    await homePage.goto();
    const cartLink = page.locator('a[href*="checkout/cart"]').first();
    await expect(cartLink).toBeAttached();
    const href = await cartLink.getAttribute('href').catch(() => '');
    expect(href).toContain('cart');
  });

  // @desc: Kliknięcie ikony koszyka rozwija minicart lub przenosi do koszyka
  test('should open minicart or navigate to cart on click', async ({ productPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();

    // Navigate to homepage
    await page.goto(page.url().split('/').slice(0, 3).join('/'), { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const toggle = page.locator('a[href*="checkout/cart"]').first();
    if (await toggle.isVisible().catch(() => false)) {
      await toggle.click({ force: true });
      await page.waitForTimeout(3000);

      // Hulajnogimicro cart icon opens an offcanvas minicart dialog
      // OR navigates to /checkout/cart/ page
      const isCartPage = page.url().includes('checkout/cart');
      const offcanvasDialog = page.locator('dialog, .cs-offcanvas, .block-minicart');
      const dialogVisible = await offcanvasDialog.first().isVisible().catch(() => false);
      const hasItems = await page.locator('tbody.cart.item, .cart.item, .cs-minicart-product').first().isVisible().catch(() => false);
      expect(isCartPage || dialogVisible || hasItems).toBeTruthy();

      const screenshot = await page.screenshot();
      await test.info().attach('Minicart expanded or cart page', { body: screenshot, contentType: 'image/png' });
    } else {
      test.skip(true, 'Brak toggle minicart w headerze');
    }
  });

  // @desc: Nazwa produktu widoczna w koszyku po dodaniu
  test('should show product name in cart', async ({ productPage, cartPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);

    await cartPage.goto();
    await cartPage.expectCartNotEmpty();
    // Use broad selector that works across standard Magento and custom themes
    const productName = page.locator('.product-item-name, .product-item-details a, td.col.item a').first();
    const fallback = page.locator('strong a, .cart.table a[href*="/"]').first();
    const target = await productName.isVisible({ timeout: 3000 }).catch(() => false) ? productName : fallback;
    await expect(target).toBeVisible({ timeout: 10000 });
  });
});
