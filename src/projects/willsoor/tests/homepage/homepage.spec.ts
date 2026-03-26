import { test, expect } from '../../fixture';

test.describe('Willsoor - Homepage @homepage @e2e', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveURL(/willsoor\.pl/);

    const screenshot = await page.screenshot();
    await test.info().attach('Homepage loaded', { body: screenshot, contentType: 'image/png' });
  });

  test('should display logo', async ({ homePage, page }) => {
    await homePage.expectLogoVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Logo visible', { body: screenshot, contentType: 'image/png' });
  });

  test('should display search bar', async ({ page }) => {
    // Willsoor uses Amasty search with .amsearch-input
    const searchInput = page.locator('.amsearch-input');
    await expect(searchInput.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Search bar', { body: screenshot, contentType: 'image/png' });
  });

  test('should display navigation menu', async ({ page }) => {
    const nav = page.locator('.nav-sections, nav.navigation').first();
    await expect(nav).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Navigation menu', { body: screenshot, contentType: 'image/png' });
  });

  test('should display cart icon', async ({ page }) => {
    const cart = page.locator('.minicart-wrapper .showcart');
    await expect(cart.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Cart icon', { body: screenshot, contentType: 'image/png' });
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
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(config.baseUrl, { waitUntil: 'load' });

    // Filter out known/acceptable errors
    const criticalErrors = errors.filter(
      e => !e.includes('favicon') && !e.includes('analytics') && !e.includes('gtm')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('should be responsive - mobile viewport', async ({ page, config }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(config.baseUrl, { waitUntil: 'domcontentloaded' });

    // Mobile hamburger menu or nav toggle should be visible
    const mobileNav = page.locator(
      '.nav-toggle, .action.nav-toggle, button[aria-label="Menu"], .hamburger-menu'
    );
    // On mobile, either hamburger or nav should be present
    const isDesktop = await page.locator('.nav-sections, nav.navigation').first().isVisible().catch(() => false);
    const isMobile = await mobileNav.first().isVisible().catch(() => false);
    expect(isDesktop || isMobile).toBeTruthy();

    const screenshot = await page.screenshot();
    await test.info().attach('Mobile viewport', { body: screenshot, contentType: 'image/png' });
  });
});
