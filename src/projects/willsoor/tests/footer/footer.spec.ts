import { test, expect } from '../../fixture';

test.describe('Willsoor - Footer & Newsletter @footer @e2e', () => {
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

  // @desc: Stopka zawiera dane kontaktowe (email lub slowo kontakt)
  test('should have contact information in footer', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer');
    await footer.first().scrollIntoViewIfNeeded();
    const text = await footer.first().textContent() || '';

    const hasContact = text.includes('@') || text.toLowerCase().includes('kontakt');
    expect(hasContact).toBeTruthy();
  });

  // @desc: Formularz zapisu do newslettera jest widoczny w stopce
  test('should display newsletter form', async ({ page }) => {
    const newsletterInput = page.locator('#footer_newsletter');
    await newsletterInput.scrollIntoViewIfNeeded();
    await expect(newsletterInput).toBeVisible();
    await expect(newsletterInput).toHaveAttribute('type', 'email');

    const screenshot = await page.screenshot();
    await test.info().attach('Newsletter form', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Przycisk wysylki newslettera jest widoczny obok pola email
  test('should have newsletter submit button', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer').first();
    await footer.scrollIntoViewIfNeeded();

    const submitBtn = page.locator('#footer_newsletter ~ button, form:has(#footer_newsletter) button[type="submit"]').first();
    await expect(submitBtn).toBeVisible();
  });

  // @desc: Stopka zawiera linki do mediow spolecznosciowych
  test('should have social media links', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer');
    await footer.first().scrollIntoViewIfNeeded();

    const socialLinks = footer.locator(
      'a[href*="facebook"], a[href*="instagram"], a[href*="linkedin"], ' +
      'a[href*="twitter"], a[href*="youtube"], a[href*="tiktok"]'
    );
    await expect(socialLinks.first()).toBeVisible();
    const count = await socialLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});
