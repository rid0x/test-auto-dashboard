import { expect } from '@playwright/test';
import { CheckoutPage } from '../../../core/pages/CheckoutPage';

export class SzpakiCheckoutPage extends CheckoutPage {
  async continueAsGuest(): Promise<void> {
    const guestBtn = this.page.getByRole('button', { name: 'Zakupy bez logowania' });
    await expect(guestBtn).toBeVisible({ timeout: 30000 });
    await guestBtn.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
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
      await this.page.getByRole('textbox', { name: 'E-mail' }).fill(data.email);
      await this.page.waitForTimeout(500);
    }

    await this.page.getByRole('textbox', { name: 'Telefon' }).fill(data.phone);
    await this.page.getByRole('textbox', { name: 'Imię' }).fill(data.firstName);
    await this.page.getByRole('textbox', { name: 'Nazwisko' }).fill(data.lastName);
    await this.page.locator('input[name="street[0]"]').fill(data.street);
    await this.page.getByRole('textbox', { name: 'Kod pocztowy' }).fill(data.postcode);
    await this.page.waitForTimeout(1000);

    const cityInput = this.page.getByRole('textbox', { name: 'Miasto' });
    const cityValue = await cityInput.inputValue();
    if (!cityValue || cityValue.trim().length === 0) {
      await cityInput.fill(data.city);
    }
  }

  async selectShippingAndProceed(methodName: string = 'DPD  Kurier'): Promise<void> {
    await this.page.getByRole('cell', { name: methodName }).first().click();
    await this.page.waitForTimeout(500);
    await this.page.getByRole('button', { name: 'Przejdź dalej' }).click();
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(2000);
  }
}
