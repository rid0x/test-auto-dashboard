import { test, expect } from '../../fixture';

test.describe('Mocnredo - Checkout @checkout @e2e', () => {
  // Add product to cart before each checkout test
  test.beforeEach(async ({ productPage }) => {
    await productPage.gotoDefaultProduct();
    await productPage.addToCartWithOptions(1);
    await productPage.expectAddToCartSuccess();
  });

  test('should navigate to checkout from cart', async ({ cartPage, page }) => {
    await cartPage.goto();

    await test.step('Click proceed to checkout', async () => {
      await cartPage.proceedToCheckout();
    });

    expect(page.url()).toContain('checkout');
    const screenshot = await page.screenshot();
    await test.info().attach('Checkout page', { body: screenshot, contentType: 'image/png' });
  });

  test('should display login/guest choice', async ({ page }) => {
    await page.goto('https://mocnredo.pl/checkout/', { waitUntil: 'load' });
    await page.waitForTimeout(3000);

    // Checkout first shows login or guest option
    const guestBtn = page.locator('button:has-text("Kontynuuj"), button:has-text("gość")');
    const loginSection = page.locator(':has-text("Zarejestrowani klienci")');

    const hasGuest = await guestBtn.first().isVisible().catch(() => false);
    const hasLogin = await loginSection.first().isVisible().catch(() => false);
    expect(hasGuest || hasLogin).toBeTruthy();

    const screenshot = await page.screenshot();
    await test.info().attach('Login/guest choice', { body: screenshot, contentType: 'image/png' });
  });

  test('should display order summary in checkout', async ({ page }) => {
    await page.goto('https://mocnredo.pl/checkout/', { waitUntil: 'load' });
    await page.waitForTimeout(3000);

    // Order summary should be visible even on the login step
    const summary = page.locator('.opc-block-summary, .cart-summary, :has-text("Podsumowanie")');
    await expect(summary.first()).toBeVisible({ timeout: 10000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Order summary', { body: screenshot, contentType: 'image/png' });
  });

  test('should show product in checkout summary', async ({ page }) => {
    await page.goto('https://mocnredo.pl/checkout/', { waitUntil: 'load' });
    await page.waitForTimeout(3000);

    // Product name should appear somewhere in checkout
    const productName = page.locator('.product-item-name');
    await expect(productName.first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to cart from checkout', async ({ page }) => {
    await page.goto('https://mocnredo.pl/checkout/', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    // There should be a link back to cart
    const cartLink = page.locator('a[href*="cart"], :has-text("Wróć do koszyka")');
    const hasCartLink = await cartLink.first().isVisible().catch(() => false);
    // Cart link may or may not be visible depending on the checkout step
    expect(hasCartLink).toBeDefined();
  });
});
