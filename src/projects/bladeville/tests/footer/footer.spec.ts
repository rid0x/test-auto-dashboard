import { test, expect } from '../../fixture';

test.describe('Bladeville - Footer & Newsletter @footer @e2e', () => {
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

  // @desc: Stopka zawiera dane kontaktowe (email, telefon lub slowo kontakt)
  test('should have contact information in footer', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer');
    await footer.first().scrollIntoViewIfNeeded();
    const text = await footer.first().textContent() || '';

    // Bladeville footer has phone +48 (32) 247 81 16 and email info@bladeville.pl
    const hasContact = text.includes('@') || text.toLowerCase().includes('kontakt') || text.includes('+48');
    expect(hasContact).toBeTruthy();
  });

  // @desc: Formularz zapisu do newslettera jest widoczny
  test('should display newsletter form', async ({ page }) => {
    // Bladeville has newsletter section above footer with "Wprowadz swoj adres e-mail" textbox
    const newsletterInput = page.locator('input[placeholder*="Wprowadź swój adres e-mail"], input[type="email"][placeholder*="e-mail"], #newsletter');
    await newsletterInput.first().scrollIntoViewIfNeeded();
    await expect(newsletterInput.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Newsletter form', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Przycisk wysylki newslettera jest widoczny obok pola email
  test('should have newsletter submit button', async ({ page }) => {
    // Bladeville subscribe button has text "Subskrybuj"
    const submitBtn = page.locator('button:has-text("Subskrybuj"), button[title="Subscribe"]');
    await submitBtn.first().scrollIntoViewIfNeeded();
    await expect(submitBtn.first()).toBeVisible();
  });

  // @desc: Stopka zawiera linki do mediow spolecznosciowych (Facebook, YouTube, Instagram)
  test('should have social media links', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer');
    await footer.first().scrollIntoViewIfNeeded();

    const socialLinks = footer.locator(
      'a[href*="facebook"], a[href*="instagram"], a[href*="youtube"]'
    );
    await expect(socialLinks.first()).toBeVisible();
    const count = await socialLinks.count();
    // Bladeville has Facebook, YouTube, Instagram
    expect(count).toBeGreaterThanOrEqual(3);
  });

  // @desc: Stopka zawiera sekcje akordeonowe (Kontakt, Informacje, Obsluga klienta, Nasza oferta)
  test('should have footer accordion sections', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer');
    await footer.first().scrollIntoViewIfNeeded();

    // Bladeville uses tablist/accordion with sections: Kontakt, Informacje, Obsługa klienta, Nasza oferta
    await expect(page.locator('button:has-text("Kontakt")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Informacje")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Obsługa klienta")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Nasza oferta")').first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Footer sections', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Informacje prawne firmy sa widoczne w stopce
  test('should display company legal info', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer');
    await footer.first().scrollIntoViewIfNeeded();
    const text = await footer.first().textContent() || '';

    // Bladeville: "SPOKO BRAND Sp. z o.o" with KRS, NIP, REGON
    expect(text).toContain('SPOKO BRAND');
    expect(text).toContain('NIP');
  });
});
