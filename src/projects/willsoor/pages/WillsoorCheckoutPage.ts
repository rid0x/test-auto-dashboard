import { expect } from '@playwright/test';
import { CheckoutPage } from '../../../core/pages/CheckoutPage';

export class WillsoorCheckoutPage extends CheckoutPage {
  /**
   * Step 1: Click "Zakupy bez logowania" to proceed to shipping.
   */
  async continueAsGuest(): Promise<void> {
    const guestBtn = this.page.getByRole('button', { name: 'Zakupy bez logowania' });
    await expect(guestBtn).toBeVisible({ timeout: 30000 });
    await guestBtn.click();
    await this.page.waitForURL(/checkout.*shipping/, { timeout: 30000 }).catch(() => {});
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * Step 2: Fill shipping address using exact Codegen selectors.
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
      await this.page.getByRole('textbox', { name: 'Adres email' }).fill(data.email);
      await this.page.waitForTimeout(1000);
    }

    await this.page.getByRole('textbox', { name: 'Imię' }).fill(data.firstName);
    await this.page.getByRole('textbox', { name: 'Nazwisko' }).fill(data.lastName);

    // Willsoor splits: Ulica, Numer domu, Numer mieszkania
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
   * Select shipping method by visible text and click NASTĘPNE.
   */
  async selectShippingAndProceed(methodName: string = 'Kurier DPD - przedpłata'): Promise<void> {
    await this.page.getByText(methodName).click();
    await this.page.waitForTimeout(500);
    await this.page.getByRole('button', { name: 'Następne' }).click();
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(2000);
  }

  /**
   * Select payment method by radio button name.
   */
  async selectPayment(methodName: string = 'Zwykły przelew bankowy'): Promise<void> {
    await this.page.getByRole('radio', { name: methodName }).check();
  }

  /**
   * Check all consent checkboxes.
   */
  async acceptAllConsents(): Promise<void> {
    await this.page.getByText('Zaznacz wszystkie zgody').click();
  }

  /**
   * Add order comment.
   */
  async addComment(text: string): Promise<void> {
    await this.page.getByText('Dodaj komentarz').click();
    await this.page.getByRole('textbox', { name: 'Wprowadź komentarz' }).fill(text);
  }
}
