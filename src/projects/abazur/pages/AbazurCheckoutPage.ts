import { expect } from '@playwright/test';
import { CheckoutPage } from '../../../core/pages/CheckoutPage';

export class AbazurCheckoutPage extends CheckoutPage {
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
      await this.page.locator('#customer-email').fill(data.email);
      await this.page.waitForTimeout(1000);
    }

    await this.page.getByRole('textbox', { name: 'Imię' }).first().fill(data.firstName);
    await this.page.getByRole('textbox', { name: 'Nazwisko' }).first().fill(data.lastName);
    await this.page.locator('input[name="street[0]"]').fill(data.street);
    await this.page.getByRole('textbox', { name: 'Kod pocztowy' }).first().fill(data.postcode);
    await this.page.waitForTimeout(1000);

    const cityInput = this.page.getByRole('textbox', { name: 'Miasto' }).first();
    const cityValue = await cityInput.inputValue();
    if (!cityValue || cityValue.trim().length === 0) {
      await cityInput.fill(data.city);
    }

    await this.page.getByRole('textbox', { name: 'Telefon' }).first().fill(data.phone);
  }
}
