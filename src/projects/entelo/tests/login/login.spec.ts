import { test, expect } from '../../fixture';
import { skipIfRecaptcha } from '../../../../core/helpers/recaptcha';

test.describe('Entelo - Login @login @e2e', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('should display login page correctly', async ({ loginPage, page }) => {
    expect(await loginPage.isOnLoginPage()).toBeTruthy();
    // Entelo has TWO login forms (popup + page). Scope to visible form.
    const visibleForm = page.locator('form[action*="loginPost"]:visible, form.form-login:visible').first();
    await expect(visibleForm.locator('input[type="email"], #email').first()).toBeVisible();
    await expect(visibleForm.locator('input[type="password"]').first()).toBeVisible();
    await expect(visibleForm.locator('button[type="submit"]').first()).toBeVisible();
    const screenshot = await page.screenshot();
    await test.info().attach('Login page', { body: screenshot, contentType: 'image/png' });
  });

  test('should login with valid credentials', async ({ loginPage, page, config }) => {
    test.skip(!config.credentials.valid.email, 'BRAK DANYCH');
    await skipIfRecaptcha(page, test.info());
    await loginPage.loginWithValidCredentials();
    await loginPage.expectLoginSuccess();
    const screenshot = await page.screenshot();
    await test.info().attach('Login success', { body: screenshot, contentType: 'image/png' });
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
    await loginPage.login('test@entelo.pl', '');
    expect(await loginPage.isOnLoginPage()).toBeTruthy();
  });

  test('should have forgot password link', async ({ page }) => {
    // Use getByRole to find the visible link
    await expect(page.getByRole('link', { name: /Nie pamiętasz/ }).first()).toBeVisible({ timeout: 10000 });
  });

  test('should have create account link', async ({ page }) => {
    await expect(page.locator('a[href*="account/create"], a:has-text("Załóż konto"), a:has-text("Zarejestruj")').first()).toBeVisible();
  });
});
