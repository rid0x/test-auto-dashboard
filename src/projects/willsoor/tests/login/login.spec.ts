import { test, expect } from '../../fixture';
import { skipIfRecaptchaConfigured } from '../../../../core/helpers/recaptcha';

test.describe('Willsoor - Login @login @e2e', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('should display login page correctly', async ({ loginPage, page }) => {
    expect(await loginPage.isOnLoginPage()).toBeTruthy();

    await test.step('Verify email and password fields', async () => {
      await expect(page.locator('input[name="login[username]"]').first()).toBeVisible();
      await expect(page.locator('input[name="login[password]"]').first()).toBeVisible();
    });

    await test.step('Verify login button', async () => {
      await expect(page.locator('button.action.login.primary, button.action.login').first()).toBeVisible();
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Login page', { body: screenshot, contentType: 'image/png' });
  });

  test('should login with valid credentials', async ({ loginPage, page, config }) => {
    // Willsoor has reCAPTCHA on login — blocks Playwright
    skipIfRecaptchaConfigured(config.features.hasRecaptchaOnLogin, test.info());

    await loginPage.loginWithValidCredentials();
    await loginPage.expectLoginSuccess();
  });

  test('should show error with invalid credentials', async ({ loginPage, page, config }) => {
    // reCAPTCHA blocks even invalid login attempts
    skipIfRecaptchaConfigured(config.features.hasRecaptchaOnLogin, test.info());

    await loginPage.loginWithInvalidCredentials();
    await loginPage.expectLoginError();
  });

  test('should show error with empty email', async ({ loginPage, page }) => {
    // Front-end validation — no server submit, no reCAPTCHA
    await loginPage.login('', 'SomePassword123!');
    expect(await loginPage.isOnLoginPage()).toBeTruthy();
  });

  test('should show error with empty password', async ({ loginPage, page }) => {
    await loginPage.login('test@willsoor.pl', '');
    expect(await loginPage.isOnLoginPage()).toBeTruthy();
  });

  test('should have forgot password link', async ({ page }) => {
    const forgotLink = page.locator('a[href*="forgotpassword"]:visible');
    await expect(forgotLink.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Forgot password link', { body: screenshot, contentType: 'image/png' });
  });

  test('should have create account link', async ({ page }) => {
    const createLink = page.locator('a[href*="account/create"]:visible');
    await expect(createLink.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Create account link', { body: screenshot, contentType: 'image/png' });
  });
});
