import { test, expect } from '../../fixture';

test.describe('Entelo - Registration @registration @e2e', () => {
  test.beforeEach(async ({ registrationPage }) => {
    await registrationPage.goto();
  });

  test('should display all required form fields', async ({ page }) => {
    await expect(page.locator('#firstname')).toBeVisible();
    await expect(page.locator('#lastname')).toBeVisible();
    await expect(page.locator('#email_address')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#password-confirmation')).toBeVisible();
    const screenshot = await page.screenshot();
    await test.info().attach('Registration form fields', { body: screenshot, contentType: 'image/png' });
  });

  test('should display submit button', async ({ page }) => {
    await expect(page.locator('.form-create-account button[type="submit"], button.action.submit.primary').first()).toBeVisible();
  });

  test('should validate password mismatch', async ({ page }) => {
    await page.locator('#password').fill('Password123!');
    await page.locator('#password-confirmation').fill('DifferentPass!');
    await page.locator('.form-create-account button[type="submit"]').first().click();
    await expect(page.getByText('Wpisz ponownie tę samą wartość')).toBeVisible({ timeout: 5000 });
  });

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

  test('should accept input in all fields', async ({ page }) => {
    await page.locator('#firstname').fill('Aurora');
    await page.locator('#lastname').fill('Bot');
    await page.locator('#email_address').fill('test@test.com');
    await page.locator('#password').fill('StrongP@ss123!');
    await page.locator('#password-confirmation').fill('StrongP@ss123!');
    expect(await page.locator('#firstname').inputValue()).toBe('Aurora');
    expect(await page.locator('#lastname').inputValue()).toBe('Bot');
  });

  test('should register with valid data', async () => {
    test.skip(true, 'reCAPTCHA v2 blokuje rejestracje na entelo.pl');
  });

  test('should show error for existing email', async () => {
    test.skip(true, 'reCAPTCHA v2 blokuje rejestracje na entelo.pl');
  });
});
