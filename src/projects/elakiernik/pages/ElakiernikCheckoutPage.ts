import { CheckoutPage, ShippingAddress } from '../../../core/pages/CheckoutPage';

export class ElakiernikCheckoutPage extends CheckoutPage {
  async continueAsGuest(): Promise<void> {
    // Elakiernik has 4-step checkout with login gate
    // Dismiss Cookiebot first
    await this.page.evaluate(() => {
      document.querySelectorAll('#CybotCookiebotDialog, #CybotCookiebotDialogBodyUnderlay').forEach(el => el.remove());
    }).catch(() => {});

    const guestBtn = this.page.getByRole('link', { name: /Zakupy bez logowania/i })
      .or(this.page.getByText('Zakupy bez logowania'))
      .or(this.page.locator('a[href*="guest"]'));
    if (await guestBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await guestBtn.first().click({ force: true });
      await this.page.waitForLoadState('load');
      await this.page.waitForTimeout(3000);
    }
  }
}
