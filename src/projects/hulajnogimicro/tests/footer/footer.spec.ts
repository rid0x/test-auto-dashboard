import { test, expect } from '../../fixture';

test.describe('Hulajnogimicro - Footer @footer @e2e', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  // @desc: Stopka strony jest widoczna na stronie glownej
  test('should display footer', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer');
    await footer.first().scrollIntoViewIfNeeded();
    await expect(footer.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Footer', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Stopka zawiera linki nawigacyjne
  test('should have footer links', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer');
    await footer.first().scrollIntoViewIfNeeded();

    const links = footer.locator('a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  // @desc: Stopka zawiera dane kontaktowe (email lub telefon)
  test('should have contact information in footer', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer');
    await footer.first().scrollIntoViewIfNeeded();
    const text = await footer.first().textContent() || '';

    // Hulajnogimicro footer contains: SKLEP@HULAJNOGIMICRO.PL and phone +48 504 736 941
    const hasContact = text.includes('@') || text.includes('kontakt') || text.includes('504');
    expect(hasContact).toBeTruthy();
  });

  // @desc: Stopka zawiera sekcje "Bezpieczne zakupy"
  test('should display safe shopping section', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer');
    await footer.first().scrollIntoViewIfNeeded();

    await expect(page.getByText('Bezpieczne zakupy')).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Safe shopping section', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Stopka zawiera link do regulaminu
  test('should have regulamin link', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer');
    await footer.first().scrollIntoViewIfNeeded();

    const regulaminLink = footer.locator('a[href*="regulamin"]');
    await expect(regulaminLink.first()).toBeVisible();
  });

  // @desc: Stopka zawiera link do polityki prywatnosci
  test('should have privacy policy link', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer');
    await footer.first().scrollIntoViewIfNeeded();

    const privacyLink = footer.locator('a[href*="polityka-prywatnosci"]');
    await expect(privacyLink.first()).toBeVisible();
  });

  // @desc: Stopka zawiera sekcje "Dla klienta"
  test('should display customer section', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer');
    await footer.first().scrollIntoViewIfNeeded();

    await expect(page.getByText('Dla klienta')).toBeVisible();
  });

  // @desc: Stopka zawiera sekcje "Micro Polska"
  test('should display Micro Polska section', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer');
    await footer.first().scrollIntoViewIfNeeded();

    await expect(page.getByText('Micro Polska')).toBeVisible();
  });

  // @desc: Stopka zawiera linki do mediow spolecznosciowych
  test('should have social media links', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer, body');

    // Hulajnogimicro has social links at the bottom: Facebook, Instagram, YouTube
    const socialLinks = page.locator(
      'a[href*="facebook.com/hulajnogi"], a[href*="instagram.com/hulajnogi"], a[href*="youtube"]'
    );
    await expect(socialLinks.first()).toBeVisible();
    const count = await socialLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  // @desc: Stopka zawiera link do kontaktu
  test('should have contact link', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer');
    await footer.first().scrollIntoViewIfNeeded();

    const contactLink = footer.locator('a[href*="kontakt"]');
    await expect(contactLink.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Contact link', { body: screenshot, contentType: 'image/png' });
  });
});
