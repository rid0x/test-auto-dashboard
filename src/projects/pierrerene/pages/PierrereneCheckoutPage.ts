import { expect } from '@playwright/test';
import { CheckoutPage } from '../../../core/pages/CheckoutPage';

export class PierrereneCheckoutPage extends CheckoutPage {
  async goto(): Promise<void> {
    await this.navigate('/pl/checkout/');
    await this.page.waitForTimeout(3000);

    // Pierrerene has a login step first — handle guest checkout
    await this.handleLoginStep();
  }

  /**
   * Pierrerene checkout starts with a login/guest step (#step-login).
   * Fill email in login box and click "Zakupy bez logowania" (guest checkout).
   */
  private async handleLoginStep(): Promise<void> {
    const guestBtn = this.page.locator('button:has-text("Zakupy bez logowania")');
    if (await guestBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Optionally fill the login-step email
      const loginEmail = this.page.locator('#customer-login-box');
      if (await loginEmail.isVisible({ timeout: 2000 }).catch(() => false)) {
        await loginEmail.fill('guest-test@pierrerene.pl');
        await this.page.waitForTimeout(500);
      }
      await guestBtn.click();
      await this.page.waitForTimeout(5000);
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
    // Pierrerene uses custom_attributes[customer-email] instead of #customer-email
    if (data.email) {
      const emailField = this.page.locator('input[name="custom_attributes[customer-email]"]');
      await emailField.waitFor({ state: 'visible', timeout: 20000 });
      await emailField.fill(data.email);
      await this.page.waitForTimeout(1000);
    }

    // There are hidden duplicates from login step — use :visible
    const firstNameField = this.page.locator('input[name="firstname"]:visible');
    await firstNameField.waitFor({ state: 'visible', timeout: 15000 });
    await firstNameField.fill(data.firstName);

    const lastNameField = this.page.locator('input[name="lastname"]:visible');
    await lastNameField.fill(data.lastName);

    // Street field (Ulica); street[1] = Nr domu (optional in data)
    const streetField = this.page.locator('input[name="street[0]"]');
    await streetField.fill(data.street);

    const postcodeField = this.page.locator('input[name="postcode"]');
    await postcodeField.fill(data.postcode);
    await this.page.waitForTimeout(1500);

    const cityField = this.page.locator('input[name="city"]');
    const cityValue = await cityField.inputValue().catch(() => '');
    if (!cityValue || cityValue.trim().length === 0) {
      await cityField.fill(data.city);
    }

    const phoneField = this.page.locator('input[name="telephone"]');
    await phoneField.fill(data.phone);
  }
}
