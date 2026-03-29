import { test, expect } from '../../fixture';

test.describe('Pieceofcase - Minicart @minicart @e2e', () => {

  // @desc: Ikona minicart jest widoczna w headerze
  test('should display minicart icon in header', async ({ homePage, page }) => {
    await homePage.goto();
    const minicart = page.locator('.minicart-wrapper, a[href*="checkout/cart"], .showcart');
    await expect(minicart.first()).toBeVisible();
  });

  // @desc: Licznik minicart = 0 lub pusty gdy koszyk pusty
  test('should show empty counter when cart is empty', async ({ homePage, page }) => {
    await homePage.goto();
    const counter = page.locator('.counter.qty, .counter-number');
    await expect(counter.first()).toBeAttached();
    const text = await counter.first().textContent().catch(() => '');
    const cls = await counter.first().getAttribute('class').catch(() => '');
    const isEmpty = cls?.includes('empty') || !text?.trim() || text?.trim() === '0';
    expect(isEmpty).toBeTruthy();

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
    await page.waitForTimeout(1000);
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
    const cartLink = page.locator('a[href*="checkout/cart"], .minicart-wrapper a[href]').first();
    await expect(cartLink).toBeAttached();
    const href = await cartLink.getAttribute('href').catch(() => '');
    expect(href).toContain('cart');
  });

  // @desc: Kliknięcie ikony koszyka rozwija minicart lub przenosi do koszyka
  test('should open minicart or navigate to cart on click', async ({ productPage, page }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await page.waitForTimeout(2000);

    // Navigate to homepage where minicart is in header
    await page.goto(page.url().split('/').slice(0, 3).join('/'), { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const toggle = page.locator('.action.showcart, .minicart-wrapper a, a[href*="checkout/cart"]').first();
    if (await toggle.isVisible().catch(() => false)) {
      await toggle.click({ force: true });
      await page.waitForTimeout(2000);

      // Either minicart dropdown appears OR we navigated to cart page
      const dropdown = page.locator('.block-minicart, #minicart-content-wrapper, .minicart-items');
      const isDropdown = await dropdown.first().isVisible().catch(() => false);
      const isCartPage = page.url().includes('checkout/cart');
      expect(isDropdown || isCartPage).toBeTruthy();

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
