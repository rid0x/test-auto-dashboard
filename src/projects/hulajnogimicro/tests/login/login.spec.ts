import { test, expect } from '../../fixture';
import { skipIfRecaptchaConfigured } from '../../../../core/helpers/recaptcha';

test.describe('Hulajnogimicro - Login @login @e2e', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  // @desc: Widoczne pola email, haslo i przycisk "Zaloguj sie" na stronie logowania
  test('should display login page correctly', async ({ loginPage, page }) => {
    expect(await loginPage.isOnLoginPage()).toBeTruthy();

    await test.step('Verify email and password fields', async () => {
      await expect(page.locator('input[name="login[username]"]').first()).toBeVisible();
      await expect(page.locator('input[name="login[password]"]').first()).toBeVisible();
    });

    await test.step('Verify login button', async () => {
      await expect(page.locator('button:has-text("Zaloguj się")').first()).toBeVisible();
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Login page', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Po wpisaniu poprawnych danych logowanie konczy sie sukcesem (przekierowanie na konto)
  test('should login with valid credentials', async ({ loginPage, page, config }) => {
    skipIfRecaptchaConfigured(config.features.hasRecaptchaOnLogin, test.info());

    await loginPage.loginWithValidCredentials();
    await loginPage.expectLoginSuccess();
  });

  // @desc: Po wpisaniu blednych danych wyswietla sie komunikat o bledzie
  test('should show error with invalid credentials', async ({ loginPage, page, config }) => {
    skipIfRecaptchaConfigured(config.features.hasRecaptchaOnLogin, test.info());

    await loginPage.loginWithInvalidCredentials();
    await loginPage.expectLoginError();
  });

  // @desc: Pusty email blokuje submit — uzytkownik zostaje na stronie logowania
  test('should show error with empty email', async ({ loginPage, page }) => {
    await loginPage.login('', 'SomePassword123!');
    expect(await loginPage.isOnLoginPage()).toBeTruthy();
  });

  // @desc: Puste haslo blokuje submit — uzytkownik zostaje na stronie logowania
  test('should show error with empty password', async ({ loginPage, page }) => {
    await loginPage.login('test@hulajnogimicro.pl', '');
    expect(await loginPage.isOnLoginPage()).toBeTruthy();
  });

  // @desc: Link "Nie pamietasz hasla?" jest widoczny i klikalny
  test('should have forgot password link', async ({ page }) => {
    const forgotLink = page.locator('a[href*="forgotpassword"]:visible');
    await expect(forgotLink.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Forgot password link', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Link "Utworz konto" jest widoczny i prowadzi do rejestracji
  test('should have create account link', async ({ page }) => {
    const createLink = page.locator('a[href*="account/create"]:visible');
    await expect(createLink.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Create account link', { body: screenshot, contentType: 'image/png' });
  });
});
