import { test, expect } from '../../fixture';

test.describe('Distripark - Homepage @homepage @e2e', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveURL(/distripark\.com/);
  });

  test('should display logo', async ({ homePage }) => {
    await homePage.expectLogoVisible();
  });

  test('should display search bar', async ({ homePage }) => {
    await homePage.expectSearchVisible();
  });

  test('should display navigation menu', async ({ homePage }) => {
    await homePage.expectNavigationVisible();
  });

  test('should display cart icon', async ({ homePage }) => {
    await homePage.expectCartIconVisible();
  });

  test('should have navigation links', async ({ homePage }) => {
    const links = await homePage.getNavigationLinks();
    expect(links.length).toBeGreaterThan(0);
  });

  test('should have correct page title', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should load without console errors', async ({ page, config }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto(`${config.baseUrl}`, { waitUntil: 'load' });
    const criticalErrors = errors.filter(e => !e.includes('favicon') && !e.includes('analytics') && !e.includes('gtm'));
    expect(criticalErrors).toHaveLength(0);
  });

  test('should be responsive - mobile viewport', async ({ page, config }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${config.baseUrl}`, { waitUntil: 'domcontentloaded' });
    const hasSearch = await page.locator('#search, input[name="q"]').first().isVisible().catch(() => false);
    const hasCart = await page.locator('.minicart-wrapper, a.showcart').first().isVisible().catch(() => false);
    const hasMenu = await page.locator('nav.navigation, .nav-toggle').first().isVisible().catch(() => false);
    expect(hasSearch || hasCart || hasMenu).toBeTruthy();
  });
});
