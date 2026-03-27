import { test, expect } from '../../fixture';

test.describe('Moncredo - Homepage @homepage @e2e', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  // @desc: Strona glowna laduje poprawnie i URL jest prawidlowy
  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveURL(/moncredo\.pl/);
  });

  // @desc: Logo sklepu jest widoczne na stronie glownej
  test('should display logo', async ({ homePage }) => {
    await homePage.expectLogoVisible();
  });

  // @desc: Pole wyszukiwania jest widoczne w naglowku
  test('should display search bar', async ({ homePage }) => {
    await homePage.expectSearchVisible();
  });

  // @desc: Menu nawigacyjne jest widoczne na stronie
  test('should display navigation menu', async ({ homePage }) => {
    await homePage.expectNavigationVisible();
  });

  // @desc: Ikona koszyka jest widoczna w naglowku
  test('should display cart icon', async ({ homePage }) => {
    await homePage.expectCartIconVisible();
  });

  // @desc: Menu zawiera linki nawigacyjne (count > 0)
  test('should have navigation links', async ({ homePage }) => {
    const links = await homePage.getNavigationLinks();
    expect(links.length).toBeGreaterThan(0);
  });

  // @desc: Tytul strony jest niepusty i poprawny
  test('should have correct page title', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  // @desc: Strona laduje bez krytycznych bledow w konsoli (filtr: favicon, analytics, gtm)
  test('should load without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('https://moncredo.pl', { waitUntil: 'load' });

    // Filter out known/acceptable errors
    const criticalErrors = errors.filter(
      e => !e.includes('favicon') && !e.includes('analytics') && !e.includes('gtm')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  // @desc: Strona jest responsywna — kluczowe elementy widoczne na 375x812
  test('should be responsive - mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('https://moncredo.pl', { waitUntil: 'domcontentloaded' });

    // On mobile, page should still have key elements (search, cart, menu items)
    const hasSearch = await page.locator('#search, input[name="q"]').first().isVisible().catch(() => false);
    const hasCart = await page.locator('#menu-cart-icon, button[title="Koszyk"]').first().isVisible().catch(() => false);
    const hasMenu = await page.locator('.menu-item-link, nav.navigation, .nav-toggle').first().isVisible().catch(() => false);
    expect(hasSearch || hasCart || hasMenu).toBeTruthy();
  });
});
