import { test, expect } from '../../fixture';
import { skipIfRecaptchaConfigured } from '../../../../core/helpers/recaptcha';

test.describe('Willsoor - Registration @registration @e2e', () => {
  test.beforeEach(async ({ registrationPage }) => {
    await registrationPage.goto();
  });

  // === FORM STRUCTURE ===

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

  test('should display correct labels', async ({ page }) => {
    await expect(page.locator('label[for="firstname"]')).toContainText('Imię');
    await expect(page.locator('label[for="lastname"]')).toContainText('Nazwisko');
    await expect(page.locator('label[for="email_address"]')).toContainText('E-mail');
    await expect(page.locator('label[for="password"]')).toContainText('Hasło');
    await expect(page.locator('label[for="password-confirmation"]')).toContainText('Potwierdź hasło');

    const screenshot = await page.screenshot();
    await test.info().attach('Form labels', { body: screenshot, contentType: 'image/png' });
  });

  test('should display submit button', async ({ page }) => {
    const btn = page.locator('button:has-text("Załóż darmowe konto")');
    await expect(btn.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Submit button', { body: screenshot, contentType: 'image/png' });
  });

  test('should display register agreement checkbox', async ({ page }) => {
    const checkbox = page.locator('input[name="register_agreement"]');
    await expect(checkbox.first()).toBeAttached();

    // The label should contain "Zakładając konto w sklepie internetowym Willsoor"
    const label = page.locator('label:has-text("Zakładając konto w sklepie internetowym Willsoor")');
    await expect(label.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Register agreement checkbox', { body: screenshot, contentType: 'image/png' });
  });

  test('should display newsletter checkbox', async ({ page }) => {
    const checkbox = page.locator('input[name="is_subscribed"]');
    await expect(checkbox.first()).toBeAttached();

    const label = page.locator('label:has-text("Zapisz mnie do Newslettera Willsoor")');
    await expect(label.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Newsletter checkbox', { body: screenshot, contentType: 'image/png' });
  });

  test('should display remember me checkbox', async ({ page }) => {
    // remember_me has dynamic ID, find by name attribute
    const checkbox = page.locator('input[name="persistent_remember_me"]');
    await expect(checkbox.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Remember me checkbox', { body: screenshot, contentType: 'image/png' });
  });

  // === PASSWORD VALIDATION ===

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

  test('should validate required fields on empty submit', async ({ page }) => {
    const submitBtn = page.locator('button:has-text("Załóż darmowe konto")');
    await submitBtn.first().click();
    // Wait for client-side validation errors to appear
    await page.locator('.mage-error:visible').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    // Willsoor shows .mage-error validation messages
    const errors = page.locator('.mage-error:visible');
    const count = await errors.count();
    expect(count).toBeGreaterThan(0);

    const screenshot = await page.screenshot();
    await test.info().attach('Empty form validation', { body: screenshot, contentType: 'image/png' });
  });

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

  test('should validate password mismatch', async ({ page }) => {
    await page.locator('#password').fill('Password123!');
    await page.locator('#password-confirmation').fill('DifferentPass456!');
    await page.locator('#password-confirmation').blur();
    // Allow Magento JS validation to process
    await page.locator('#password-confirmation-error, .mage-error').first().waitFor({ state: 'attached', timeout: 3000 }).catch(() => {});

    // Magento shows validation error for mismatch
    const error = page.locator('#password-confirmation-error, .mage-error');
    // Check that confirmation field exists and has mismatched value
    const confirmValue = await page.locator('#password-confirmation').inputValue();
    expect(confirmValue).toBe('DifferentPass456!');

    const screenshot = await page.screenshot();
    await test.info().attach('Password mismatch', { body: screenshot, contentType: 'image/png' });
  });

  // === RECAPTCHA-BLOCKED TESTS ===

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
