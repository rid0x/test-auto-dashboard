import { test, expect } from '../../fixture';
import { skipIfRecaptchaConfigured } from '../../../../core/helpers/recaptcha';

test.describe('4szpaki - Registration @registration @e2e', () => {
  test.beforeEach(async ({ registrationPage }) => {
    await registrationPage.goto();
  });

  // === FORM STRUCTURE ===

  // @desc: Formularz rejestracji wyswietla pola: imie, nazwisko, email, haslo, potwierdzenie
  test('should display all required form fields', async ({ page }) => {
    await test.step('Imie', async () => {
      await expect(page.getByRole('textbox', { name: 'Imię' })).toBeVisible();
    });
    await test.step('Nazwisko', async () => {
      await expect(page.getByRole('textbox', { name: 'Nazwisko' })).toBeVisible();
    });
    await test.step('Email', async () => {
      await expect(page.getByRole('textbox', { name: 'E-mail' })).toBeVisible();
    });
    await test.step('Haslo', async () => {
      await expect(page.getByRole('textbox', { name: 'Hasło' }).first()).toBeVisible();
    });
    await test.step('Potwierdz haslo', async () => {
      await expect(page.getByRole('textbox', { name: 'Potwierdź hasło' })).toBeVisible();
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Registration form fields', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Przycisk "Zarejestruj sie" jest widoczny na formularzu
  test('should display submit button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Zarejestruj się' })).toBeVisible();
  });

  // @desc: Checkbox "Zaznacz wszystko" z regulaminem jest widoczny
  test('should display consent checkboxes', async ({ page }) => {
    await expect(page.locator('label').filter({ hasText: 'Zaznacz wszystko' })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'Akceptuję warunki regulaminu' })).toBeVisible();
  });

  // === PASSWORD VALIDATION ===

  // @desc: Rozne hasla w polach haslo/potwierdzenie wyswietlaja blad walidacji
  test('should validate password mismatch', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Hasło' }).first().fill('Password123!');
    await page.getByRole('textbox', { name: 'Potwierdź hasło' }).fill('DifferentPass!');
    await page.getByRole('button', { name: 'Zarejestruj się' }).click();

    await expect(page.getByText('Wpisz ponownie tę samą wartość')).toBeVisible({ timeout: 5000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Password mismatch', { body: screenshot, contentType: 'image/png' });
  });

  // === FIELD VALIDATION ===

  // @desc: Pusty formularz po kliknieciu submit wyswietla bledy walidacji
  test('should validate required fields on empty submit', async ({ page }) => {
    // Accept consents first so submit attempts validation
    await page.locator('label').filter({ hasText: 'Zaznacz wszystko' }).click();
    await page.getByRole('button', { name: 'Zarejestruj się' }).click();

    // 4szpaki shows #firstname-error, #lastname-error etc.
    await expect(page.locator('#firstname-error, #lastname-error, #email_address-error').first()).toBeVisible({ timeout: 5000 });

    const screenshot = await page.screenshot();
    await test.info().attach('Empty form validation', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Wszystkie pola akceptuja tekst i przechowuja wpisane wartosci
  test('should accept input in all fields', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Imię' }).fill('Aurora');
    await page.getByRole('textbox', { name: 'Nazwisko' }).fill('Bot');
    await page.getByRole('textbox', { name: 'E-mail' }).fill('test@test.com');
    await page.getByRole('textbox', { name: 'Hasło' }).first().fill('StrongP@ss123!');
    await page.getByRole('textbox', { name: 'Potwierdź hasło' }).fill('StrongP@ss123!');

    expect(await page.getByRole('textbox', { name: 'Imię' }).inputValue()).toBe('Aurora');
    expect(await page.getByRole('textbox', { name: 'Nazwisko' }).inputValue()).toBe('Bot');

    const screenshot = await page.screenshot();
    await test.info().attach('All fields filled', { body: screenshot, contentType: 'image/png' });
  });

  // === RECAPTCHA-BLOCKED TESTS ===

  // @desc: Rejestracja poprawnymi danymi (skip — reCAPTCHA blokuje)
  test('should register with valid data', async ({ registrationPage, page, config }) => {
    // 4szpaki has reCAPTCHA on registration
    test.skip(true, 'reCAPTCHA blokuje rejestracje na 4szpaki');
  });

  // @desc: Rejestracja na istniejacy email (skip — reCAPTCHA blokuje)
  test('should show error for existing email', async ({ registrationPage, page, config }) => {
    test.skip(true, 'reCAPTCHA blokuje rejestracje na 4szpaki');
  });
});
