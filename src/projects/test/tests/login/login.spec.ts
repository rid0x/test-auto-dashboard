import { test, expect } from '../../fixture';

test.describe('Test - Login @login @e2e', () => {
  // Add tests here



// @desc: Sprawdza czy na stronie logowania wyświetla się nagłówek "Logowanie"
test('should display login header on login page', async ({ page, config }) => {
  await test.step('Navigate to login page', async () => {
    await page.goto(`${config.baseUrl}/customer/account/login/`);
  });

  await test.step('Check for login header', async () => {
    const loginHeader = page.locator('h1:has-text("Logowanie"), h2:has-text("Logowanie"), .page-title:has-text("Logowanie"), .login-container h1, .customer-login h1');
    await expect(loginHeader).toBeVisible();
  });

  await test.step('Take screenshot', async () => {
    await page.screenshot({ path: 'login-page-header.png', fullPage: true });
  });
});


// @desc: Podstawowy test przykładowy
test('basic test', async ({ page }) => {
  await test.step('Navigate to example page', async () => {
    await page.goto('https://example.com');
  });

  await test.step('Click login button', async () => {
    await page.click('button:text("Login")');
  });

  await test.step('Check page title', async () => {
    await expect(page).toHaveTitle(/Dashboard/);
  });

  await test.step('Take screenshot', async () => {
    await page.screenshot({ path: 'basic-test.png', fullPage: true });
  });
});


"sh-cmt">// @desc: Sprawdza czy strona logowania zwraca status 200
test("sh-str">'should return 200 status for login page', async ({ page, config }) => {
  await test.step("sh-str">'Navigate to login page and check status', async () => {
    const response = await page.goto(`${config.baseUrl}/customer/account/login/`);
    expect(response?.status()).toBe(200);
  });

  await test.step("sh-str">'Take screenshot', async () => {
    await page.screenshot({ path: "sh-str">'login-page-status-200.png', fullPage: true });
  });
});

});