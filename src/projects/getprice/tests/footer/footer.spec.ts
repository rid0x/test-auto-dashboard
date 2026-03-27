import { test, expect } from '../../fixture';

test.describe('Getprice - Footer & Newsletter @footer @e2e', () => {
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
    const newsletterInput = page.locator('#newsletter-subscribe');
    await newsletterInput.scrollIntoViewIfNeeded();
    await expect(newsletterInput).toBeVisible();
    await expect(newsletterInput).toHaveAttribute('type', 'email');

    const screenshot = await page.screenshot();
    await test.info().attach('Newsletter form', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Przycisk zapisu na newsletter jest widoczny
  test('should have newsletter submit button', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: 'Zapisz' });
    await submitBtn.scrollIntoViewIfNeeded();
    await expect(submitBtn).toBeVisible();
  });

  // @desc: Linki do mediow spolecznosciowych sa widoczne w stopce
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
