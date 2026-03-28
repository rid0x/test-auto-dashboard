import { expect } from '@playwright/test';
import { CheckoutPage } from '../../../core/pages/CheckoutPage';

export class PierrereneCheckoutPage extends CheckoutPage {
  async goto(): Promise<void> {
    await this.navigate('/pl/checkout/');
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
    if (data.email) {
      const emailField = this.page.locator('#customer-email, input[name="username"], input[type="email"]').first();
      await emailField.waitFor({ state: 'visible', timeout: 20000 });
      await emailField.fill(data.email);
      await this.page.waitForTimeout(1500);
    }

    const firstNameField = this.page.getByRole('textbox', { name: /Imię|First Name/i }).first()
      .or(this.page.locator('input[name="firstname"]').first());
    await firstNameField.waitFor({ state: 'visible', timeout: 15000 });
    await firstNameField.fill(data.firstName);

    const lastNameField = this.page.getByRole('textbox', { name: /Nazwisko|Last Name/i }).first()
      .or(this.page.locator('input[name="lastname"]').first());
    await lastNameField.fill(data.lastName);

    const streetField = this.page.locator('input[name="street[0]"], input[name*="street"]').first();
    await streetField.fill(data.street);

    const postcodeField = this.page.getByRole('textbox', { name: /Kod pocztowy|Postcode/i }).first()
      .or(this.page.locator('input[name="postcode"]').first());
    await postcodeField.fill(data.postcode);
    await this.page.waitForTimeout(1500);

    const cityField = this.page.getByRole('textbox', { name: /Miasto|City/i }).first()
      .or(this.page.locator('input[name="city"]').first());
    const cityValue = await cityField.inputValue().catch(() => '');
    if (!cityValue || cityValue.trim().length === 0) {
      await cityField.fill(data.city);
    }

    const phoneField = this.page.getByRole('textbox', { name: /Telefon|Phone/i }).first()
      .or(this.page.locator('input[name="telephone"]').first());
    await phoneField.fill(data.phone);
  }
}
