import { expect } from '@playwright/test';
import { CheckoutPage } from '../../../core/pages/CheckoutPage';

export class HulajnogimicroCheckoutPage extends CheckoutPage {
  /**
   * Hulajnogimicro checkout has tabs: "Nie posiadam konta" (default) / "Posiadam już konto"
   * No separate guest button needed — the guest tab is active by default.
   */
  async continueAsGuest(): Promise<void> {
    // The "Nie posiadam konta" tab is open by default
    const emailInput = this.page.getByRole('textbox', { name: 'Adres e-mail' });
    await expect(emailInput).toBeVisible({ timeout: 30000 });
  }

  /**
   * Fill shipping address — Hulajnogimicro splits street into Ulica + Numer domu + Numer mieszkania
   * and has a "Typ Klienta" dropdown (Prywatny/Firmowy).
   */
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
      await this.page.getByRole('textbox', { name: 'Adres e-mail' }).fill(data.email);
      await this.page.waitForTimeout(1000);
    }

    await this.page.getByRole('textbox', { name: 'Imię' }).fill(data.firstName);
    await this.page.getByRole('textbox', { name: 'Nazwisko' }).fill(data.lastName);

    // Split street into name + house number
    const streetParts = data.street.split(' ');
    const streetName = streetParts.length > 1 ? streetParts.slice(0, -1).join(' ') : data.street;
    const houseNumber = streetParts.length > 1 ? streetParts[streetParts.length - 1] : '1';

    await this.page.getByRole('textbox', { name: 'Ulica' }).fill(streetName);
    await this.page.getByRole('textbox', { name: 'Numer domu' }).fill(houseNumber);

    await this.page.getByRole('textbox', { name: 'Kod pocztowy' }).fill(data.postcode);
    await this.page.waitForTimeout(1500); // Wait for city auto-fill

    const cityInput = this.page.getByRole('textbox', { name: 'Miasto' });
    const cityValue = await cityInput.inputValue();
    if (!cityValue || cityValue.trim().length === 0) {
      await cityInput.fill(data.city);
    }

    await this.page.getByRole('textbox', { name: 'Numer telefonu' }).fill(data.phone);
  }

  /**
   * Click "Dalej" to proceed from shipping to payment step.
   */
  async selectShippingAndProceed(methodName?: string): Promise<void> {
    if (methodName) {
      await this.page.getByText(methodName).click();
      await this.page.waitForTimeout(500);
    }
    await this.page.getByRole('button', { name: 'Dalej' }).click();
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(2000);
  }

  /**
   * Switch to "Firmowy" client type to reveal NIP/Company fields.
   */
  async switchToCompanyClient(): Promise<void> {
    const typSelect = this.page.getByRole('combobox', { name: 'Typ Klienta' });
    await typSelect.selectOption('Firmowy');
    await this.page.waitForTimeout(500);
  }

  /**
   * Select payment method by radio button name.
   */
  async selectPayment(methodName: string): Promise<void> {
    await this.page.getByRole('radio', { name: methodName }).check();
  }
}
