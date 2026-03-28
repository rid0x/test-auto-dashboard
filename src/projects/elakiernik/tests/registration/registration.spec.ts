import { test, expect } from '../../fixture';
import { skipIfRecaptcha } from '../../../../core/helpers/recaptcha';

test.describe('Elakiernik - Registration @registration @e2e', () => {
  test.beforeEach(async ({ registrationPage }) => {
    await registrationPage.goto();
  });

  // @desc: Formularz rejestracji wyswietla pola: imie, nazwisko, email, haslo, potwierdzenie
  test('should display all required form fields', async ({ page }) => {
    await test.step('Imie', async () => {
      await expect(page.locator('#firstname')).toBeVisible();
    });
    await test.step('Nazwisko', async () => {
      await expect(page.locator('#lastname')).toBeVisible();
    });
    await test.step('Email', async () => {
      await expect(page.locator('#email_address')).toBeVisible();
    });
    await test.step('Haslo', async () => {
      await expect(page.locator('#password')).toBeVisible();
    });
    await test.step('Potwierdz haslo', async () => {
      await expect(page.locator('#password-confirmation')).toBeVisible();
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Registration form fields', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Przycisk rejestracji jest widoczny
  test('should display submit button', async ({ page }) => {
    await expect(page.locator('.form-create-account button[type="submit"], button.action.submit.primary').first()).toBeVisible();
  });

  // @desc: Rozne hasla wyswietlaja blad walidacji
  test('should validate password mismatch', async ({ page }) => {
    await page.locator('#password').fill('Password123!');
    await page.locator('#password-confirmation').fill('DifferentPass!');
    await page.locator('.form-create-account button[type="submit"]').first().click();
    const errorMsg = page.locator('.mage-error, .field-error, div.mage-error[for="password-confirmation"]');
    await expect(errorMsg.first()).toBeVisible({ timeout: 5000 });
  });

  // @desc: Wymagane pola formularza sa widoczne i maja walidacje
  test('should have required fields that prevent empty submit', async ({ page }) => {
    const requiredFields = ['#firstname', '#lastname', '#email_address', '#password', '#password-confirmation'];
    for (const selector of requiredFields) {
      const field = page.locator(selector);
      await expect(field).toBeVisible();
      const hasRequired = await field.getAttribute('required') !== null;
      const hasAriaRequired = (await field.getAttribute('aria-required')) === 'true';
      const hasDataValidate = (await field.getAttribute('data-validate')) !== null;
      expect(hasRequired || hasAriaRequired || hasDataValidate).toBeTruthy();
    }
  });

  // @desc: Wszystkie pola akceptuja tekst
  test('should accept input in all fields', async ({ page }) => {
    await page.locator('#firstname').fill('Aurora');
    await page.locator('#lastname').fill('Bot');
    await page.locator('#email_address').fill('test@test.com');
    await page.locator('#password').fill('StrongP@ss123!');
    await page.locator('#password-confirmation').fill('StrongP@ss123!');
    expect(await page.locator('#firstname').inputValue()).toBe('Aurora');
    expect(await page.locator('#lastname').inputValue()).toBe('Bot');
  });

  // @desc: Rejestracja poprawnymi danymi
  test('should register with valid data', async ({ registrationPage, page, config }) => {
    await skipIfRecaptcha(page, test.info());

    await registrationPage.register({
      firstName: config.registration.firstName,
      lastName: config.registration.lastName,
      email: config.registration.testEmail,
      password: config.registration.testPassword,
    });

    const screenshot = await page.screenshot();
    await test.info().attach('After registration submit', { body: screenshot, contentType: 'image/png' });
    // Should redirect to account page or show success
    await expect(page).toHaveURL(/customer\/account/, { timeout: 15000 });
  });
});
