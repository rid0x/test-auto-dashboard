import { test, expect } from '../../fixture';
import { skipIfRecaptcha } from '../../../../core/helpers/recaptcha';

test.describe('Pierrerene - Login @login @e2e', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  // @desc: Strona logowania wyswietla pola email, haslo i przycisk logowania
  test('should display login page correctly', async ({ loginPage, page }) => {
    await test.step('Verify login page loaded', async () => {
      expect(await loginPage.isOnLoginPage()).toBeTruthy();
    });

    await test.step('Verify email field visible', async () => {
      await expect(page.locator('#email, input[name="login[username]"]').first()).toBeVisible();
    });

    await test.step('Verify password field visible', async () => {
      await expect(page.locator('#pass, input[name="login[password]"]').first()).toBeVisible();
    });

    await test.step('Verify login button visible', async () => {
      await expect(page.locator('#bnt-social-login-authentication, button:has-text("Zaloguj"), button.action.login').first()).toBeVisible();
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Login page', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Logowanie poprawnymi danymi konczy sie sukcesem (przekierowanie na konto)
  test('should login with valid credentials', async ({ loginPage, page, config }) => {
    test.skip(!config.credentials.valid.email, 'BRAK DANYCH: Ustaw PIERRERENE_USER_EMAIL i PIERRERENE_USER_PASSWORD w .env');
    await skipIfRecaptcha(page, test.info());

    await test.step('Fill login form', async () => {
      await loginPage.loginWithValidCredentials();
    });

    const afterLogin = await page.screenshot();
    await test.info().attach('After login submit', { body: afterLogin, contentType: 'image/png' });

    await test.step('Verify login success', async () => {
      await loginPage.expectLoginSuccess();
    });

    const success = await page.screenshot();
    await test.info().attach('Login success - account page', { body: success, contentType: 'image/png' });
  });

  // @desc: Bledne dane logowania wyswietlaja komunikat o bledzie
  test('should show error with invalid credentials', async ({ loginPage, page }) => {
    await skipIfRecaptcha(page, test.info());

    await test.step('Fill invalid credentials', async () => {
      await loginPage.loginWithInvalidCredentials();
    });

    await test.step('Verify error message', async () => {
      await loginPage.expectLoginError();
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Invalid credentials error', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Pusty email nie pozwala na zalogowanie — walidacja blokuje
  test('should show error with empty email', async ({ loginPage, page }) => {
    await skipIfRecaptcha(page, test.info());

    await test.step('Submit with empty email', async () => {
      await loginPage.login('', 'SomePassword123!');
    });

    await test.step('Verify stayed on login page', async () => {
      expect(await loginPage.isOnLoginPage()).toBeTruthy();
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Empty email validation', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Puste haslo nie pozwala na zalogowanie — walidacja blokuje
  test('should show error with empty password', async ({ loginPage, page }) => {
    await skipIfRecaptcha(page, test.info());

    await test.step('Submit with empty password', async () => {
      await loginPage.login('test@pierrerene.pl', '');
    });

    await test.step('Verify stayed on login page', async () => {
      expect(await loginPage.isOnLoginPage()).toBeTruthy();
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Empty password validation', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Link "Nie pamietasz hasla" jest widoczny na stronie logowania
  test('should have forgot password link', async ({ page }) => {
    const forgotLink = page.locator('a[href*="forgotpassword"], a:has-text("Nie pamiętasz"), a:has-text("Forgot")');
    await expect(forgotLink.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Forgot password link visible', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Link "Zaloz konto" / "Zarejestruj sie" jest widoczny
  test('should have create account link', async ({ page }) => {
    // Use getByRole to find visible create account link
    const createLink = page.getByRole('link', { name: /Utwórz konto|Załóż konto|Zarejestruj|utworzyć|Create/i });
    await expect(createLink.first()).toBeVisible({ timeout: 15000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Create account link visible', { body: screenshot, contentType: 'image/png' });
  });
});
