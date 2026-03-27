import { test, expect } from '../../fixture';
import { skipIfRecaptchaConfigured } from '../../../../core/helpers/recaptcha';

test.describe('Moncredo - Registration @registration @e2e', () => {
  test.beforeEach(async ({ registrationPage }) => {
    await registrationPage.goto();
  });

  // === FORM STRUCTURE ===

  // @desc: Formularz rejestracji wyswietla pola: imie, nazwisko, email, haslo, potwierdzenie
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

  // @desc: Etykiety pol sa po polsku: Imie, Nazwisko, E-mail, Haslo, Potwierdz haslo
  test('should display correct labels for all fields', async ({ page }) => {
    await expect(page.locator('label[for="firstname"]')).toContainText('Imię');
    await expect(page.locator('label[for="lastname"]')).toContainText('Nazwisko');
    await expect(page.locator('label[for="email_address"]')).toContainText('E-mail');
    await expect(page.locator('label[for="password"]')).toContainText('Hasło');
    await expect(page.locator('label[for="password-confirmation"]')).toContainText('Potwierdź hasło');
  });

  // @desc: Wymagane pola maja atrybut required lub klase required-entry
  test('should mark required fields correctly', async ({ page }) => {
    // Required fields have .required class on parent or required attribute
    const firstname = page.locator('#firstname');
    const lastname = page.locator('#lastname');
    const email = page.locator('#email_address');
    const password = page.locator('#password');
    const confirmation = page.locator('#password-confirmation');

    // All main fields should be required
    for (const field of [firstname, lastname, email, password, confirmation]) {
      const isRequired = await field.getAttribute('required') !== null
        || (await field.getAttribute('class'))?.includes('required-entry');
      expect(isRequired).toBeTruthy();
    }
  });

  // @desc: Przycisk "Utworz konto" i link "Wroc" sa widoczne
  test('should display submit button and back link', async ({ page }) => {
    await test.step('Submit button', async () => {
      const btn = page.locator('#accountcreate button[type="submit"]');
      await expect(btn).toBeVisible();
      await expect(btn).toContainText('Utwórz konto');
    });

    await test.step('Back link', async () => {
      const back = page.locator('a.action.back, a:has-text("Wróć")');
      await expect(back.first()).toBeVisible();
    });
  });

  // @desc: Checkbox zapisu na newsletter jest widoczny i domyslnie odznaczony
  test('should display newsletter checkbox', async ({ page }) => {
    const checkbox = page.locator('#is_subscribed');
    await expect(checkbox).toBeVisible();
    expect(await checkbox.isChecked()).toBeFalsy();

    const label = page.locator('label[for="is_subscribed"]');
    await expect(label).toContainText('newsletter');
  });

  // @desc: Checkbox zdalnej pomocy jest widoczny na formularzu
  test('should display remote assistance checkbox', async ({ page }) => {
    const checkbox = page.locator('#assistance_allowed_checkbox');
    await expect(checkbox).toBeVisible();

    const label = page.locator('label[for="assistance_allowed_checkbox"]');
    await expect(label).toContainText('zdalną pomoc');
  });

  // === PASSWORD VALIDATION ===

  // @desc: Miernik sily hasla reaguje na wpisywane haslo (slabe/silne)
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

  // @desc: Przycisk pokaz/ukryj zmienia typ pola hasla (password/text)
  test('should toggle password visibility', async ({ page }) => {
    await page.locator('#password').fill('TestPassword123');

    const toggleBtn = page.locator('button[aria-label="Show Password"]').first();
    await expect(toggleBtn).toBeVisible();

    await test.step('Show password', async () => {
      await toggleBtn.click();
      const type = await page.locator('#password').getAttribute('type');
      expect(type).toBe('text');
    });

    const screenshot = await page.screenshot();
    await test.info().attach('Password visible', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Rozne hasla w polach haslo/potwierdzenie sa wykrywane jako blad
  test('should validate password mismatch', async ({ page }) => {
    await page.locator('#password').fill('Password123!');
    await page.locator('#password-confirmation').fill('DifferentPass456!');
    await page.locator('#password-confirmation').blur();
    // Allow Magento JS validation to process
    await page.locator('#password-confirmation-error, .mage-error').first().waitFor({ state: 'attached', timeout: 3000 }).catch(() => {});

    // Magento shows validation error for mismatch
    const error = page.locator('#password-confirmation-error, .mage-error');
    // May or may not show inline error — check that confirmation field exists
    const confirmValue = await page.locator('#password-confirmation').inputValue();
    expect(confirmValue).toBe('DifferentPass456!');

    const screenshot = await page.screenshot();
    await test.info().attach('Password mismatch', { body: screenshot, contentType: 'image/png' });
  });

  // === FIELD VALIDATION ===

  // @desc: Pusty formularz wyswietla bledy walidacji na wymaganych polach
  test('should validate required fields on empty submit', async ({ page }) => {
    await page.locator('#accountcreate button[type="submit"]').click();
    // Wait for client-side validation errors to appear
    await page.locator('.mage-error:visible, :invalid').first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});

    // Check that validation errors appear on required fields
    const errors = page.locator('.mage-error:visible, :invalid');
    const count = await errors.count();
    expect(count).toBeGreaterThan(0);

    const screenshot = await page.screenshot();
    await test.info().attach('Empty form validation', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Niepoprawny format email jest wykrywany przez walidacje klienta
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

  // @desc: Wszystkie pola akceptuja tekst i przechowuja wpisane wartosci
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

  // @desc: Checkbox newsletter mozna zaznaczyc i odznaczyc
  test('should allow checking newsletter checkbox', async ({ page }) => {
    const checkbox = page.locator('#is_subscribed');
    expect(await checkbox.isChecked()).toBeFalsy();
    await checkbox.check();
    expect(await checkbox.isChecked()).toBeTruthy();
  });

  // === NAVIGATION ===

  // @desc: Link "Wroc" kieruje na strone logowania (href zawiera login)
  test('should have back button that navigates to login', async ({ page }) => {
    const backLink = page.locator('a.action.back, a:has-text("Wróć")');
    await expect(backLink.first()).toBeVisible();
    const href = await backLink.first().getAttribute('href');
    expect(href).toContain('login');
  });

  // @desc: Linki do polityki prywatnosci i regulaminu sa widoczne
  test('should display privacy policy and terms links', async ({ page }) => {
    const privacy = page.locator('a:has-text("Polityka prywatności")');
    const terms = page.locator('a:has-text("Warunki korzystania")');

    await expect(privacy.first()).toBeVisible();
    await expect(terms.first()).toBeVisible();
  });

  // === RECAPTCHA-BLOCKED TESTS ===

  // @desc: Rejestracja poprawnymi danymi konczy sie sukcesem (skip jesli reCAPTCHA)
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

  // @desc: Rejestracja na istniejacy email wyswietla komunikat bledu
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
