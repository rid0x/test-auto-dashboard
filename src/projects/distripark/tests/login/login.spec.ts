import { test, expect } from '../../fixture';
import { skipIfRecaptcha } from '../../../../core/helpers/recaptcha';

test.describe('Distripark - Login @login @e2e', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('should display login page correctly', async ({ loginPage, page }) => {
    expect(await loginPage.isOnLoginPage()).toBeTruthy();
    await expect(page.locator('#email, input[name="login[username]"]').first()).toBeVisible();
    await expect(page.locator('#password, #pass, input[name="login[password]"]').first()).toBeVisible();
    await expect(page.locator('button.action.login.primary, #send2, button:has-text("Zaloguj")').first()).toBeVisible();
  });

  test('should login with valid credentials', async ({ loginPage, page, config }) => {
    test.skip(!config.credentials.valid.email, 'BRAK DANYCH');
    await skipIfRecaptcha(page, test.info());
    await loginPage.loginWithValidCredentials();
    await loginPage.expectLoginSuccess();
  });

  test('should show error with invalid credentials', async ({ loginPage, page }) => {
    await skipIfRecaptcha(page, test.info());
    await loginPage.loginWithInvalidCredentials();
    await loginPage.expectLoginError();
  });

  test('should show error with empty email', async ({ loginPage, page }) => {
    await skipIfRecaptcha(page, test.info());
    await loginPage.login('', 'SomePassword123!');
    expect(await loginPage.isOnLoginPage()).toBeTruthy();
  });

  test('should show error with empty password', async ({ loginPage, page }) => {
    await skipIfRecaptcha(page, test.info());
    await loginPage.login('test@distripark.com', '');
    expect(await loginPage.isOnLoginPage()).toBeTruthy();
  });

  test('should have forgot password link', async ({ page }) => {
    await expect(page.locator('a[href*="forgotpassword"], a:has-text("Nie pamiętasz")').first()).toBeVisible();
  });

  test('should have create account link', async ({ page }) => {
    await expect(page.locator('a[href*="account/create"], a:has-text("Zarejestruj")').first()).toBeVisible();
  });
});
