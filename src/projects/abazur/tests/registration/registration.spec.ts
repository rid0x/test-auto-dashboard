import { test, expect } from '../../fixture';

test.describe('Abazur - Registration @registration @e2e', () => {
  test.beforeEach(async ({ registrationPage }) => {
    await registrationPage.goto();
  });

  // === FORM STRUCTURE ===

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

  // @desc: Przycisk rejestracji jest widoczny na formularzu
  test('should display submit button', async ({ page }) => {
    await expect(page.locator('.form-create-account button[type="submit"], button.action.submit.primary').first()).toBeVisible();
  });

  // === PASSWORD VALIDATION ===

  // @desc: Rozne hasla w polach haslo/potwierdzenie wyswietlaja blad walidacji
  test('should validate password mismatch', async ({ page }) => {
    await page.locator('#password').fill('Password123!');
    await page.locator('#password-confirmation').fill('DifferentPass!');
    await page.locator('.form-create-account button[type="submit"]').first().click();

    // Different Magento locales may show different validation messages
    const errorMsg = page.locator('#password-confirmation-error, .mage-error, .field-error, div.mage-error[for="password-confirmation"]')
      .or(page.getByText('Wpisz ponownie tę samą wartość'))
      .or(page.getByText('Please enter the same value again'))
      .or(page.getByText('ta sama wartość'));
    await expect(errorMsg.first()).toBeVisible({ timeout: 10000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Password mismatch', { body: screenshot, contentType: 'image/png' });
  });

  // === FIELD VALIDATION ===

  // @desc: Wymagane pola formularza sa widoczne i mają walidacje
  test('should have required fields that prevent empty submit', async ({ page }) => {
    const requiredFields = ['#firstname', '#lastname', '#email_address', '#password', '#password-confirmation'];
    for (const selector of requiredFields) {
      const field = page.locator(selector);
      await expect(field).toBeVisible();
      const hasRequired = await field.getAttribute('required') !== null;
      const hasAriaRequired = (await field.getAttribute('aria-required')) === 'true';
      const hasRequiredClass = (await field.getAttribute('class'))?.includes('required') || false;
      const hasDataValidate = (await field.getAttribute('data-validate')) !== null;
      expect(hasRequired || hasAriaRequired || hasRequiredClass || hasDataValidate).toBeTruthy();
    }

    const screenshot = await page.screenshot();
    await test.info().attach('Required fields', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Wszystkie pola akceptuja tekst i przechowuja wpisane wartosci
  test('should accept input in all fields', async ({ page }) => {
    await page.locator('#firstname').fill('Aurora');
    await page.locator('#lastname').fill('Bot');
    await page.locator('#email_address').fill('test@test.com');
    await page.locator('#password').fill('StrongP@ss123!');
    await page.locator('#password-confirmation').fill('StrongP@ss123!');

    expect(await page.locator('#firstname').inputValue()).toBe('Aurora');
    expect(await page.locator('#lastname').inputValue()).toBe('Bot');

    const screenshot = await page.screenshot();
    await test.info().attach('All fields filled', { body: screenshot, contentType: 'image/png' });
  });

  // === RECAPTCHA-BLOCKED TESTS ===

  // @desc: Rejestracja poprawnymi danymi (skip — reCAPTCHA v3 blokuje)
  test('should register with valid data', async ({ registrationPage, page, config }) => {
    test.skip(true, 'reCAPTCHA v3 blokuje rejestracje na abazur.pl');
  });

  // @desc: Rejestracja na istniejacy email (skip — reCAPTCHA v3 blokuje)
  test('should show error for existing email', async ({ registrationPage, page, config }) => {
    test.skip(true, 'reCAPTCHA v3 blokuje rejestracje na abazur.pl');
  });
});
