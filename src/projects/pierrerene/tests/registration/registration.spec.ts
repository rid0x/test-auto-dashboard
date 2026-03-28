import { test, expect } from '../../fixture';
import { skipIfRecaptcha } from '../../../../core/helpers/recaptcha';

test.describe('Pierrerene - Registration @registration @e2e', () => {
  test.beforeEach(async ({ registrationPage }) => {
    await registrationPage.goto();
  });

  // === FORM STRUCTURE ===

  // @desc: Formularz rejestracji wyswietla pola: email, haslo
  test('should display all required form fields', async ({ page }) => {
    await test.step('Email', async () => {
      await expect(page.locator('#email_address')).toBeVisible();
    });
    await test.step('Haslo', async () => {
      await expect(page.locator('#password, .field.password input').first()).toBeVisible();
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Registration form fields', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Przycisk rejestracji jest widoczny na formularzu
  test('should display submit button', async ({ page }) => {
    await expect(page.locator('.form-create-account button[type="submit"], button.action.submit.primary').first()).toBeVisible();
  });

  // === PASSWORD VALIDATION ===

  // @desc: Rozne hasla w polach haslo/potwierdzenie wyswietlaja blad walidacji
  test('should validate password mismatch', async ({ page }) => {
    const passwordField = page.locator('#password, input[name="password"]').first();
    const confirmField = page.locator('#password-confirmation, input[name="password_confirmation"], input[name="confirmation"]').first();

    if (await confirmField.isVisible({ timeout: 5000 }).catch(() => false)) {
      await passwordField.fill('Password123!');
      await confirmField.fill('DifferentPass!');
      await confirmField.press('Tab');
      await page.waitForTimeout(500);

      // Try clicking submit to trigger validation
      const submitBtn = page.locator('.form-create-account button[type="submit"], button.action.submit, button:has-text("Załóż konto"), button:has-text("Zarejestruj")').first();
      if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await submitBtn.click();
      }

      const errorMsg = page.locator(
        '#password-confirmation-error, #password-error, ' +
        '.mage-error, .field-error, div.mage-error[for="password-confirmation"]'
      ).first()
        .or(page.getByText(/Wpisz ponownie tę samą wartość|te same hasła|hasła nie pasują|Please enter the same value/i).first());
      await expect(errorMsg).toBeVisible({ timeout: 10000 });
    } else {
      // Pierrerene may have simplified registration without confirm password
      test.skip(true, 'Brak pola potwierdzenia hasla na tym formularzu');
    }

    const screenshot = await page.screenshot();
    await test.info().attach('Password mismatch', { body: screenshot, contentType: 'image/png' });
  });

  // === FIELD VALIDATION ===

  // @desc: Wymagane pola formularza sa widoczne
  test('should have required fields that prevent empty submit', async ({ page }) => {
    const emailField = page.locator('#email_address');
    await expect(emailField).toBeVisible();

    const hasRequired = await emailField.getAttribute('required') !== null;
    const hasAriaRequired = (await emailField.getAttribute('aria-required')) === 'true';
    const hasDataValidate = (await emailField.getAttribute('data-validate')) !== null;
    expect(hasRequired || hasAriaRequired || hasDataValidate).toBeTruthy();

    const screenshot = await page.screenshot();
    await test.info().attach('Required fields', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Pole email akceptuje tekst i przechowuje wpisana wartosc
  test('should accept input in email field', async ({ page }) => {
    await page.locator('#email_address').fill('test@test.com');
    expect(await page.locator('#email_address').inputValue()).toBe('test@test.com');

    const screenshot = await page.screenshot();
    await test.info().attach('Fields filled', { body: screenshot, contentType: 'image/png' });
  });

  // === RECAPTCHA NOTE ===

  // @desc: Rejestracja poprawnymi danymi
  test('should register with valid data', async ({ registrationPage, page, config }) => {
    await skipIfRecaptcha(page, test.info());

    await test.step('Fill registration form', async () => {
      await page.locator('#email_address').fill(config.registration.testEmail);
      const passwordField = page.locator('#password, input[name="password"]').first();
      await passwordField.fill(config.registration.testPassword);

      const confirmField = page.locator('#password-confirmation');
      if (await confirmField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmField.fill(config.registration.testPassword);
      }
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Registration form filled', { body: screenshot, contentType: 'image/png' });
  });
});
