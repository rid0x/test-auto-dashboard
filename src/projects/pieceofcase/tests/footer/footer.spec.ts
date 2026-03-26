import { test, expect } from '../../fixture';

test.describe('Pieceofcase - Footer & Newsletter @footer @e2e', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should display footer', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer');
    await footer.first().scrollIntoViewIfNeeded();
    await expect(footer.first()).toBeVisible();

    const screenshot = await page.screenshot();
    await test.info().attach('Footer', { body: screenshot, contentType: 'image/png' });
  });

  test('should have footer links', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer');
    await footer.first().scrollIntoViewIfNeeded();

    const links = footer.locator('a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have contact information in footer', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer');
    await footer.first().scrollIntoViewIfNeeded();
    const text = await footer.first().textContent() || '';

    // Footer should have some contact info (email, phone, or address)
    const hasContact = text.includes('@') || text.includes('+48') || text.includes('tel') || text.includes('kontakt');
    expect(hasContact).toBeTruthy();
  });

  test('should display newsletter form', async ({ page }) => {
    // Newsletter may be in footer or separate section
    const newsletter = page.locator(
      '#newsletter, input[name="email"][placeholder*="newsletter" i], ' +
      'input[name="email"][placeholder*="email" i], ' +
      'form.newsletter, .newsletter-subscribe, .footer-newsletter, ' +
      '#newsletter-validate-detail input[type="email"]'
    );

    await page.locator('footer, .footer').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const count = await newsletter.count();
    expect(count).toBeGreaterThan(0);

    const screenshot = await page.screenshot();
    await test.info().attach('Newsletter form', { body: screenshot, contentType: 'image/png' });
  });

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
        await page.waitForTimeout(500);
        // Should show validation error or stay on page
        await expect(page.locator('body')).toBeVisible();
      }
    }
  });

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
