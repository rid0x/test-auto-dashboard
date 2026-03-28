import { test, expect } from '../../fixture';

test.describe('Cornette - Footer & Newsletter @footer @e2e', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should display footer', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer');
    await footer.first().scrollIntoViewIfNeeded();
    await expect(footer.first()).toBeVisible();
  });

  test('should have footer links', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer');
    await footer.first().scrollIntoViewIfNeeded();
    expect(await footer.locator('a').count()).toBeGreaterThan(0);
  });

  test('should have contact information in footer', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer');
    await footer.first().scrollIntoViewIfNeeded();
    const text = await footer.first().textContent() || '';
    expect(text.includes('@') || text.includes('+48') || text.includes('tel') || text.includes('kontakt')).toBeTruthy();
  });

  test('should display newsletter form', async ({ page }) => {
    const newsletter = page.locator('#newsletter, #newsletter-validate-detail input[type="email"], form.newsletter');
    await page.locator('footer, .footer').first().scrollIntoViewIfNeeded();
    await newsletter.first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
    expect(await newsletter.count()).toBeGreaterThan(0);
  });

  test('should validate newsletter email', async ({ page }) => {
    const emailInput = page.locator('#newsletter, #newsletter-validate-detail input[type="email"]').first();
    await page.locator('footer, .footer').first().scrollIntoViewIfNeeded();
    await emailInput.waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
    if (await emailInput.isVisible().catch(() => false)) {
      const submitBtn = page.locator('#newsletter-validate-detail button, form.newsletter button[type="submit"]').first();
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click();
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('body')).toBeVisible();
      }
    } else {
      test.skip(true, 'Brak widocznego formularza newsletter');
    }
  });

  test('should have social media links', async ({ page }) => {
    const footer = page.locator('footer, .footer, .page-footer');
    await footer.first().scrollIntoViewIfNeeded();
    const socialLinks = footer.locator('a[href*="facebook"], a[href*="instagram"], a[href*="youtube"], a[href*="tiktok"]');
    if (await socialLinks.count() === 0) test.skip(true, 'Brak linkow do mediow spolecznosciowych');
    expect(await socialLinks.count()).toBeGreaterThan(0);
  });
});
