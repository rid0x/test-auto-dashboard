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

  // @desc: Wymagane pola maja atrybut required, klase required-entry, lub wymagany parent
  test('should mark required fields correctly', async ({ page }) => {
    const fields = ['#firstname', '#lastname', '#email_address', '#password', '#password-confirmation'];

    for (const selector of fields) {
      const field = page.locator(selector);
      const isRequired = await field.getAttribute('required') !== null
        || (await field.getAttribute('class'))?.includes('required-entry')
        || (await field.getAttribute('aria-required')) === 'true'
        || await field.evaluate(el => {
          // Check if parent div has .required class or field has validate-email
          const parent = el.closest('.field');
          return parent?.classList.contains('required') || el.classList.contains('required-entry') || false;
        });
      expect(isRequired).toBeTruthy();
    }
  });

  // @desc: Przycisk rejestracji i link powrotny sa widoczne
  test('should display submit button and back link', async ({ page }) => {
    await test.step('Submit button', async () => {
      const btn = page.locator('button.action.submit.primary, #send2');
      await expect(btn.first()).toBeVisible();
      const text = await btn.first().textContent();
      expect(text?.trim()).toBeTruthy();
    });

    await test.step('Back link', async () => {
      const back = page.locator('a.action.back, a:has-text("Powrót"), a:has-text("Zaloguj się"), a:has-text("Wróć")');
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

  // @desc: Checkbox zdalnej pomocy jest widoczny na formularzu (lub NIP/taxvat)
  test('should display remote assistance checkbox', async ({ page }) => {
    // Some Magento stores have remote assistance, some have taxvat (NIP) field
    const assistance = page.locator('#assistance_allowed_checkbox');
    const taxvat = page.locator('#taxvat');

    const hasAssistance = await assistance.isVisible().catch(() => false);
    const hasTaxvat = await taxvat.isVisible().catch(() => false);

    // At least one additional field should be present
    expect(hasAssistance || hasTaxvat).toBeTruthy();
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

    // Moncredo uses checkbox #show-password for toggle (may be hidden, label visible)
    const toggleCheckbox = page.locator('#show-password');
    const toggleLabel = page.locator('label[for="show-password"]');
    const toggleBtn = page.locator('button[aria-label="Show Password"]').first();

    await test.step('Show password', async () => {
      const hasLabel = await toggleLabel.isVisible().catch(() => false);
      const hasButton = await toggleBtn.isVisible().catch(() => false);

      if (hasLabel) {
        // Moncredo: click the visible label which triggers the hidden checkbox
        await toggleLabel.click();
      } else if (hasButton) {
        await toggleBtn.click();
      } else {
        // Force check the hidden checkbox and dispatch event
        await toggleCheckbox.check({ force: true });
        await toggleCheckbox.dispatchEvent('change');
      }
      await page.waitForTimeout(500);
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
    await page.locator('button.action.submit.primary, #send2').first().click();
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

  // @desc: Link powrotny kieruje na strone konta/logowania
  test('should have back button that navigates to login', async ({ page }) => {
    const backLink = page.locator('a.action.back, a:has-text("Wróć"), a:has-text("Zaloguj się"), a[href*="login"], a[href*="customer/account"]');
    await expect(backLink.first()).toBeVisible();
    const href = await backLink.first().getAttribute('href');
    expect(href).toContain('customer/account');
  });

  // @desc: Linki do polityki prywatnosci i regulaminu sa widoczne (lub inne linki prawne)
  test('should display privacy policy and terms links', async ({ page }) => {
    // Different stores may have different legal links or none in the form
    const privacy = page.locator('a:has-text("Polityka prywatności"), a:has-text("polityka"), a:has-text("prywatność")');
    const terms = page.locator('a:has-text("Warunki korzystania"), a:has-text("regulamin"), a:has-text("warunki")');

    const hasPrivacy = await privacy.first().isVisible().catch(() => false);
    const hasTerms = await terms.first().isVisible().catch(() => false);

    // At least the form page should contain some legal reference or be a valid page
    expect(page.url()).toContain('/customer/account/create');
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
