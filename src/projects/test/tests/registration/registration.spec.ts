import { test, expect } from '../../fixture';

test.describe('Test - Registration @registration @e2e', () => {
  // Add tests here

// @desc: Sprawdza czy strona rejestracji zwraca status 200
test('should return 200 status for registration page', async ({ page, registrationPage }) => {
  await test.step('Navigate to registration page and check status', async () => {
    const response = await page.goto('/customer/account/create/');
    expect(response?.status()).toBe(200);
  });

  await test.step('Take screenshot', async () => {
    await page.screenshot({ path: 'test-results/registration-status-200.png', fullPage: true });
  });
});

});
