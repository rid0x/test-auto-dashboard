import { CheckoutPage, ShippingAddress } from '../../../core/pages/CheckoutPage';

export class CornetteCheckoutPage extends CheckoutPage {
  async continueAsGuest(): Promise<void> {
    const guestBtn = this.page.getByRole('link', { name: /Zakupy bez logowania/i })
      .or(this.page.getByText('Zakupy bez logowania'));
    if (await guestBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      // Remove CookieYes overlay if it blocks
      await this.page.evaluate(() => {
        document.querySelectorAll('[id*="cookie"], .cky-consent-container').forEach(el => (el as HTMLElement).style.display = 'none');
      }).catch(() => {});
      await guestBtn.first().click({ force: true });
      await this.page.waitForLoadState('load');
      await this.page.waitForTimeout(3000);
    }
  }

  async fillShippingAddress(address: ShippingAddress): Promise<void> {
    // Cornette custom checkout uses placeholder-based textboxes
    const fill = async (name: RegExp, value: string) => {
      const field = this.page.getByRole('textbox', { name }).first();
      if (await field.isVisible({ timeout: 3000 }).catch(() => false)) {
        await field.fill(value);
      }
    };
    await fill(/e-mail/i, address.email);
    await fill(/Numer telefonu/i, address.phone);
    await fill(/Imię/i, address.firstName);
    await fill(/Nazwisko/i, address.lastName);
    await fill(/Ulica/i, address.street);
    await fill(/Nr domu/i, '1');
    await fill(/Kod pocztowy/i, address.postcode);
    await fill(/Miasto/i, address.city);
    await this.page.waitForTimeout(2000);
  }
}
