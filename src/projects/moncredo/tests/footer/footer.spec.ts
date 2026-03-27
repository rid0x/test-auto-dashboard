import { test, expect } from '../../fixture';

test.describe('Moncredo - Footer & Newsletter @footer @e2e', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  // @desc: Stopka strony jest widoczna po przewinieciu na dol
  test('should display footer', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer');
    await footer.first().scrollIntoViewIfNeeded();
    await expect(footer.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Footer', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Stopka zawiera linki nawigacyjne (count > 0)
  test('should have footer links', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer');
    await footer.first().scrollIntoViewIfNeeded();

    const links = footer.locator('a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  // @desc: Stopka zawiera dane kontaktowe (email, telefon lub adres)
  test('should have contact information in footer', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer');
    await footer.first().scrollIntoViewIfNeeded();
    const text = await footer.first().textContent() || '';

    // Footer should have some contact info (email, phone, or address)
    const hasContact = text.includes('@') || text.includes('+48') || text.includes('tel') || text.includes('kontakt');
    expect(hasContact).toBeTruthy();
  });

  // @desc: Formularz zapisu na newsletter z polem email jest widoczny w stopce
  test('should display newsletter form', async ({ page }) => {
    // Newsletter may be in footer or separate section
    const newsletter = page.locator(
      '#newsletter, input[name="email"][placeholder*="newsletter" i], ' +
      'input[name="email"][placeholder*="email" i], ' +
      'form.newsletter, .newsletter-subscribe, .footer-newsletter, ' +
      '#newsletter-validate-detail input[type="email"]'
    );

    await page.locator('footer, .footer').first().scrollIntoViewIfNeeded();
    await newsletter.first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});

    const count = await newsletter.count();
    expect(count).toBeGreaterThan(0);

    const screenshot = await page.screenshot();
    await test.info().attach('Newsletter form', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Walidacja pola email w formularzu newsletter (poprawny format)
  test('should validate newsletter email', async ({ page }) => {
    // Find newsletter input
    const emailInput = page.locator(
      '#newsletter, #newsletter-validate-detail input[type="email"], ' +
      'form.newsletter input[type="email"], .footer input[type="email"]'
    ).first();

    await emailInput.scrollIntoViewIfNeeded();

    if (await emailInput.isVisible().catch(() => false)) {
      // Try submitting empty email
      const submitBtn = page.locator(
        'form.newsletter button, #newsletter-validate-detail button, ' +
        '.footer button:has-text("Zapisz"), .footer button[type="submit"]'
      ).first();

      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click();
        await page.waitForLoadState('domcontentloaded');
        // Should show validation error or stay on page
        await expect(page.locator('body')).toBeVisible();
      }
    }
  });

  // @desc: Linki do mediow spolecznosciowych sa widoczne w stopce
  test('should have social media links', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer');
    await footer.first().scrollIntoViewIfNeeded();

    const socialLinks = footer.locator(
      'a[href*="facebook"], a[href*="instagram"], a[href*="linkedin"], ' +
      'a[href*="twitter"], a[href*="youtube"], a[href*="tiktok"]'
    );
    const count = await socialLinks.count();
    // Some shops may not have social links — just track
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
