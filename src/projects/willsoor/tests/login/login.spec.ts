import { test, expect } from '../../fixture';
import { skipIfRecaptcha } from '../../../../core/helpers/recaptcha';

test.describe('Willsoor - Login @login @e2e', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('should display login page correctly', async ({ loginPage }) => {
    expect(await loginPage.isOnLoginPage()).toBeTruthy();
  });

  test('should login with valid credentials', async ({ loginPage, page }) => {
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
    // Should stay on login page — form validation
    expect(await loginPage.isOnLoginPage()).toBeTruthy();
  });

  test('should show error with empty password', async ({ loginPage, page }) => {
    await skipIfRecaptcha(page, test.info());
    await loginPage.login('test@willsoor.pl', '');
    expect(await loginPage.isOnLoginPage()).toBeTruthy();
  });

  test('should have forgot password link', async ({ page }) => {
    const forgotLink = page.locator('a[href*="forgotpassword"]:visible, a:has-text("Nie pamiętasz hasła"):visible');
    await expect(forgotLink.first()).toBeVisible();
  });

  test('should have create account link', async ({ page }) => {
    const createLink = page.locator('a[href*="account/create"]:visible, a:has-text("Załóż darmowe konto"):visible');
    await expect(createLink.first()).toBeVisible();
  });
});
