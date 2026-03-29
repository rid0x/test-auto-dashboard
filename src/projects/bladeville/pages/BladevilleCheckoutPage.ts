import { expect } from '@playwright/test';
import { CheckoutPage } from '../../../core/pages/CheckoutPage';

export class BladevilleCheckoutPage extends CheckoutPage {
  /**
   * Bladeville checkout redirects to cart if empty.
   * When cart has items, it goes directly to shipping form (no login gate).
   */
  async waitForCheckoutReady(): Promise<void> {
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(3000);
    // Wait for KO.js checkout to render
    await this.page.locator('#customer-email, input[name="firstname"], .opc-wrapper').first()
      .waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});
  }

  /**
   * Fill shipping address fields.
   * Bladeville uses standard Magento 2 checkout with street[0] (single street field).
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
      const emailField = this.page.locator('#customer-email, input[name="username"]').first();
      await emailField.fill(data.email);
      await this.page.waitForTimeout(1500);
    }

    await this.page.locator('input[name="firstname"]').first().fill(data.firstName);
    await this.page.locator('input[name="lastname"]').first().fill(data.lastName);
    await this.page.locator('input[name="street[0]"]').first().fill(data.street);
    await this.page.locator('input[name="postcode"]').first().fill(data.postcode);
    await this.page.waitForTimeout(1500); // Wait for city auto-fill

    const cityInput = this.page.locator('input[name="city"]').first();
    const cityValue = await cityInput.inputValue();
    if (!cityValue || cityValue.trim().length === 0) {
      await cityInput.fill(data.city);
    }

    await this.page.locator('input[name="telephone"]').first().fill(data.phone);
  }

  /**
   * Select a shipping method by visible text label and click Next.
   */
  async selectShippingAndProceed(methodName?: string): Promise<void> {
    if (methodName) {
      await this.page.getByText(methodName).click();
    } else {
      // Select first available shipping method radio
      const firstRadio = this.page.locator('#checkout-shipping-method-load input[type="radio"]').first();
      await firstRadio.check();
    }
    await this.page.waitForTimeout(500);

    const nextBtn = this.page.locator('button:has-text("Następne"), button:has-text("Dalej"), button[data-role="opc-continue"]');
    await nextBtn.first().click();
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(3000);
  }

  /**
   * Select payment method by radio button name.
   */
  async selectPayment(methodName: string): Promise<void> {
    await this.page.getByRole('radio', { name: methodName }).check();
  }
}
