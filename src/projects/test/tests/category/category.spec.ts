import { test, expect } from '../../fixture';

test.describe('Test - Category @category @e2e', () => {
  // Add tests here

// @desc: Sprawdza czy strona kategorii zwraca status 200
test('should return 200 status code for category page', async ({ page, config }) => {
  await test.step('Navigate to category page and verify response', async () => {
    const response = await page.goto(config.baseUrl + config.category.url);
    expect(response?.status()).toBe(200);
  });

  await test.step('Take screenshot', async () => {
    await page.screenshot({ path: 'test-results/category-200-status.png', fullPage: true });
  });
});

});
