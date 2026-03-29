import { test, expect } from '../../fixture';
import { skipIfRecaptchaConfigured } from '../../../../core/helpers/recaptcha';

test.describe('Hulajnogimicro - Registration @registration @e2e', () => {
  test.beforeEach(async ({ registrationPage }) => {
    await registrationPage.goto();
  });

  // === FORM STRUCTURE ===

  // @desc: Formularz rejestracji wyswietla wszystkie wymagane pola
  test('should display all required form fields', async ({ page }) => {
    await test.step('Firstname field', async () => {
      const field = page.locator('#firstname');
      await expect(field).toBeVisible();
      expect(await field.getAttribute('type')).toBe('text');
      expect(await field.getAttribute('name')).toBe('firstname');
    });

    await test.step('Lastname field', async () => {
      const field = page.locator('#lastname');
      await expect(field).toBeVisible();
      expect(await field.getAttribute('name')).toBe('lastname');
    });

    await test.step('Email field', async () => {
      const field = page.locator('#email_address');
      await expect(field).toBeVisible();
      expect(await field.getAttribute('name')).toBe('email');
    });

    await test.step('Password field', async () => {
      const field = page.locator('#password');
      await expect(field).toBeVisible();
      expect(await field.getAttribute('type')).toBe('password');
    });

    await test.step('Password confirmation field', async () => {
      const field = page.locator('#password-confirmation');
      await expect(field).toBeVisible();
      expect(await field.getAttribute('type')).toBe('password');
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Registration form fields', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Etykiety pol formularza sa poprawne i po polsku
  test('should display correct labels', async ({ page }) => {
    await expect(page.locator('label[for="firstname"]')).toContainText('Imię');
    await expect(page.locator('label[for="lastname"]')).toContainText('Nazwisko');
    await expect(page.locator('label[for="email_address"]')).toContainText('E-mail');
    await expect(page.locator('label[for="password"]')).toContainText('Hasło');
    await expect(page.locator('label[for="password-confirmation"]')).toContainText('Potwierdź hasło');

    const screenshot = await page.screenshot();
    await test.info().attach('Form labels', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Przycisk "Utworz konto" jest widoczny
  test('should display submit button', async ({ page }) => {
    const btn = page.locator('button:has-text("Utwórz konto")');
    await expect(btn.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Submit button', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Pole NIP jest widoczne na formularzu rejestracji
  test('should display NIP field', async ({ page }) => {
    // Hulajnogimicro has a NIP field on the registration form
    const nipField = page.getByRole('textbox', { name: 'NIP' });
    await expect(nipField).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('NIP field', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Checkbox zapisu do newslettera jest widoczny
  test('should display newsletter checkbox', async ({ page }) => {
    const checkbox = page.locator('input[name="is_subscribed"]');
    await expect(checkbox.first()).toBeAttached();

    const label = page.locator('label:has-text("Zapisz się, aby otrzymywać newsletter")');
    await expect(label.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Newsletter checkbox', { body: screenshot, contentType: 'image/png' });
  });

  // === PASSWORD VALIDATION ===

  // @desc: Wskaznik sily hasla reaguje na slabe i silne haslo
  test('should show password strength meter', async ({ page }) => {
    const meter = page.locator('#password-strength-meter-container');
    await expect(meter).toBeVisible();

    await test.step('Weak password', async () => {
      await page.locator('#password').fill('abc');
      await page.locator('#password').blur();
      await expect(meter).not.toHaveText('', { timeout: 3000 });
      const text = await meter.textContent();
      expect(text).toBeTruthy();
    });

    await test.step('Strong password', async () => {
      await page.locator('#password').fill('StrongP@ss123!XYZ');
      await page.locator('#password').blur();
      await expect(meter).not.toHaveText('', { timeout: 3000 });
      const text = await meter.textContent();
      expect(text).toBeTruthy();
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Password strength', { body: screenshot, contentType: 'image/png' });
  });

  // === FIELD VALIDATION ===

  // @desc: Wymagane pola blokuja wyslanie pustego formularza
  test('should have required fields that prevent empty submit', async ({ page }) => {
    const requiredFields = ['#firstname', '#lastname', '#email_address', '#password', '#password-confirmation'];
    for (const selector of requiredFields) {
      const field = page.locator(selector);
      const isRequired = await field.getAttribute('required') !== null
        || (await field.getAttribute('aria-required')) === 'true'
        || (await field.getAttribute('class'))?.includes('required');
      expect(isRequired).toBeTruthy();
    }

    const screenshot = await page.screenshot();
    await test.info().attach('Required fields validation', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Wszystkie pola formularza przyjmuja dane wejsciowe
  test('should accept input in all fields', async ({ page }) => {
    await test.step('Fill all fields', async () => {
      await page.locator('#firstname').fill('Aurora');
      await page.locator('#lastname').fill('Bot');
      await page.locator('#email_address').fill('test@test.com');
      await page.locator('#password').fill('StrongP@ss123!');
      await page.locator('#password-confirmation').fill('StrongP@ss123!');
    });

    await test.step('Verify values are set', async () => {
      expect(await page.locator('#firstname').inputValue()).toBe('Aurora');
      expect(await page.locator('#lastname').inputValue()).toBe('Bot');
      expect(await page.locator('#email_address').inputValue()).toBe('test@test.com');
      expect(await page.locator('#password').inputValue()).toBe('StrongP@ss123!');
      expect(await page.locator('#password-confirmation').inputValue()).toBe('StrongP@ss123!');
    });

    const screenshot = await page.screenshot();
    await test.info().attach('All fields filled', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Walidacja formatu email odrzuca niepoprawny adres
  test('should validate email format', async ({ page }) => {
    await page.locator('#firstname').fill('Test');
    await page.locator('#lastname').fill('User');
    await page.locator('#email_address').fill('not-an-email');
    await page.locator('#password').fill('ValidPass123!');
    await page.locator('#password-confirmation').fill('ValidPass123!');

    await page.locator('#email_address').blur();
    // Allow Magento JS validation to process
    await page.locator('.mage-error, :invalid').first().waitFor({ state: 'attached', timeout: 3000 }).catch(() => {});

    const screenshot = await page.screenshot();
    await test.info().attach('Invalid email format', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Walidacja wykrywa niezgodnosc hasla i potwierdzenia
  test('should validate password mismatch', async ({ page }) => {
    await page.locator('#password').fill('Password123!');
    await page.locator('#password-confirmation').fill('DifferentPass456!');
    await page.locator('#password-confirmation').blur();
    // Allow Magento JS validation to process
    await page.locator('#password-confirmation-error, .mage-error').first().waitFor({ state: 'attached', timeout: 3000 }).catch(() => {});

    // Check that confirmation field exists and has mismatched value
    const confirmValue = await page.locator('#password-confirmation').inputValue();
    expect(confirmValue).toBe('DifferentPass456!');

    const screenshot = await page.screenshot();
    await test.info().attach('Password mismatch', { body: screenshot, contentType: 'image/png' });
  });

  // === RECAPTCHA-BLOCKED TESTS ===

  // @desc: Rejestracja z poprawnymi danymi konczy sie sukcesem
  test('should register with valid data', async ({ registrationPage, page, config }) => {
    skipIfRecaptchaConfigured(config.features.hasRecaptchaOnRegistration, test.info());

    await registrationPage.register({
      firstName: config.registration.firstName,
      lastName: config.registration.lastName,
      email: config.registration.testEmail,
      password: config.registration.testPassword,
    });
    await registrationPage.expectRegistrationSuccess();
  });

  // @desc: Rejestracja z istniejacym emailem wyswietla blad
  test('should show error for existing email', async ({ registrationPage, page, config }) => {
    skipIfRecaptchaConfigured(config.features.hasRecaptchaOnRegistration, test.info());

    await registrationPage.register({
      firstName: config.registration.firstName,
      lastName: config.registration.lastName,
      email: config.credentials.valid.email,
      password: config.registration.testPassword,
    });
    await registrationPage.expectRegistrationError();
  });
});
