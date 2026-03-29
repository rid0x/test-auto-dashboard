import { CheckoutPage } from '../../../core/pages/CheckoutPage';

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

  async fillShippingAddress(data: {
    email?: string;
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    postcode: string;
    phone: string;
    country?: string;
  }): Promise<void> {
    // Elakiernik uses label-based textbox fields (custom 4-step checkout)
    // Some fields have proper ARIA labels, others need CSS fallback
    if (data.email) {
      const emailField = this.page.getByRole('textbox', { name: /E-mail/i }).first();
      await emailField.fill(data.email);
      await this.page.waitForTimeout(1000);
    }

    if (data.phone) {
      const phoneField = this.page.getByRole('textbox', { name: /telefon/i }).first();
      await phoneField.fill(data.phone);
    }

    const firstNameField = this.page.getByRole('textbox', { name: /Imię/i }).first();
    await firstNameField.fill(data.firstName);

    const lastNameField = this.page.getByRole('textbox', { name: /Nazwisko/i }).first();
    await lastNameField.fill(data.lastName);

    // Street field: the textbox inside the "Ulica" group may not have ARIA label
    const streetField = this.page.getByRole('textbox', { name: /Ulica/i }).first()
      .or(this.page.locator('input[name="street[0]"]').first());
    await streetField.fill(data.street);

    // Postcode field
    const postcodeField = this.page.getByRole('textbox', { name: /Kod pocztowy/i }).first()
      .or(this.page.locator('input[name="postcode"]').first());
    await postcodeField.fill(data.postcode);

    // City field
    const cityField = this.page.getByRole('textbox', { name: /Miasto/i }).first()
      .or(this.page.locator('input[name="city"]').first());
    await cityField.fill(data.city);

    await this.page.waitForTimeout(2000);
  }
}
