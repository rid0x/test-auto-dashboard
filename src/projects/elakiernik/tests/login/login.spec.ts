import { test, expect } from '../../fixture';
import { skipIfRecaptcha } from '../../../../core/helpers/recaptcha';

test.describe('Elakiernik - Login @login @e2e', () => {
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
      await expect(page.locator('#send2, button:has-text("Zaloguj"), button.action.login').first()).toBeVisible();
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Login page', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Logowanie poprawnymi danymi konczy sie sukcesem
  test('should login with valid credentials', async ({ loginPage, page, config }) => {
    test.skip(!config.credentials.valid.email, 'BRAK DANYCH: Ustaw ELAKIERNIK_USER_EMAIL w .env');
    await skipIfRecaptcha(page, test.info());

    await test.step('Fill login form', async () => {
      await loginPage.loginWithValidCredentials();
    });

    await test.step('Verify login success', async () => {
      await loginPage.expectLoginSuccess();
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Login success', { body: screenshot, contentType: 'image/png' });
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

  // @desc: Pusty email nie pozwala na zalogowanie
  test('should show error with empty email', async ({ loginPage, page }) => {
    await skipIfRecaptcha(page, test.info());
    await loginPage.login('', 'SomePassword123!');
    expect(await loginPage.isOnLoginPage()).toBeTruthy();
  });

  // @desc: Puste haslo nie pozwala na zalogowanie
  test('should show error with empty password', async ({ loginPage, page }) => {
    await skipIfRecaptcha(page, test.info());
    await loginPage.login('test@e-lakiernik.net', '');
    expect(await loginPage.isOnLoginPage()).toBeTruthy();
  });

  // @desc: Link "Nie pamietasz hasla" jest widoczny
  test('should have forgot password link', async ({ page }) => {
    const forgotLink = page.locator('a[href*="forgotpassword"], a:has-text("Nie pamiętasz"), a:has-text("Forgot")');
    await expect(forgotLink.first()).toBeVisible();
  });

  // @desc: Link "Zaloz konto" jest widoczny
  test('should have create account link', async ({ page }) => {
    const createLink = page.getByRole('link', { name: /Utwórz konto|Załóż konto|Zarejestruj|Create/i });
    await expect(createLink.first()).toBeVisible({ timeout: 10000 });
  });
});
