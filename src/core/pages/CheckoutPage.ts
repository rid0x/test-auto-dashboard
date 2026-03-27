import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { healable, HealableLocator } from '../helpers/auto-healing';

export abstract class CheckoutPage extends BasePage {
  // --- Shipping Step ---
  protected get emailInput(): HealableLocator {
    return healable('Checkout email input',
      '#customer-email',
      'input[name="username"]',
      'input#customer-email-fieldset input[type="email"]',
      '#checkout-step-login input[type="email"]'
    );
  }

  protected get firstNameInput(): HealableLocator {
    return healable('First name input',
      'input[name="firstname"]',
      '#shipping-new-address-form input[name="firstname"]',
      'input[name="shippingAddress.firstname"]'
    );
  }

  protected get lastNameInput(): HealableLocator {
    return healable('Last name input',
      'input[name="lastname"]',
      '#shipping-new-address-form input[name="lastname"]',
      'input[name="shippingAddress.lastname"]'
    );
  }

  protected get streetInput(): HealableLocator {
    return healable('Street input',
      'input[name="street[0]"]',
      '#shipping-new-address-form input[name="street[0]"]',
      'input[name="shippingAddress.street.0"]'
    );
  }

  protected get cityInput(): HealableLocator {
    return healable('City input',
      'input[name="city"]',
      '#shipping-new-address-form input[name="city"]',
      'input[name="shippingAddress.city"]'
    );
  }

  protected get postcodeInput(): HealableLocator {
    return healable('Postcode input',
      'input[name="postcode"]',
      '#shipping-new-address-form input[name="postcode"]',
      'input[name="shippingAddress.postcode"]'
    );
  }

  protected get phoneInput(): HealableLocator {
    return healable('Phone input',
      'input[name="telephone"]',
      '#shipping-new-address-form input[name="telephone"]',
      'input[name="shippingAddress.telephone"]'
    );
  }

  protected get countrySelect(): HealableLocator {
    return healable('Country select',
      'select[name="country_id"]',
      '#shipping-new-address-form select[name="country_id"]',
      'select[name="shippingAddress.country_id"]'
    );
  }

  protected get shippingMethods(): HealableLocator {
    return healable('Shipping methods',
      '#checkout-shipping-method-load',
      '.table-checkout-shipping-method',
      '.methods-shipping'
    );
  }

  protected get nextStepButton(): HealableLocator {
    return healable('Next step button',
      'button.continue',
      'button[data-role="opc-continue"]',
      'button:has-text("Dalej")',
      'button:has-text("Next")'
    );
  }

  // --- Payment Step ---
  protected get paymentMethods(): HealableLocator {
    return healable('Payment methods',
      '#checkout-payment-method-load',
      '.payment-methods',
      '.opc-payment'
    );
  }

  protected get placeOrderButton(): HealableLocator {
    return healable('Place order button',
      'button[title="Złóż zamówienie"]',
      'button:has-text("Place Order")',
      'button:has-text("Złóż zamówienie")',
      'button.action.checkout',
      '.payment-method._active button.action.primary'
    );
  }

  protected get orderSuccessMessage(): HealableLocator {
    return healable('Order success message',
      '.checkout-success',
      '.page-title:has-text("Thank you")',
      '.page-title:has-text("Dziękujemy")',
      '#registration'
    );
  }

  protected get orderNumber(): HealableLocator {
    return healable('Order number',
      '.checkout-success .order-number',
      '.checkout-success a',
      '.order-number strong'
    );
  }

  async goto(): Promise<void> {
    await this.navigate('/checkout/');
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
      const emailEl = await this.findWithHealing(this.emailInput);
      await emailEl.fill(data.email);
      // Wait for Magento's email validation AJAX check to complete
      await this.page.waitForResponse(
        resp => resp.url().includes('customer') && resp.status() === 200
      ).catch(() => {});
      await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    const fnEl = await this.findWithHealing(this.firstNameInput);
    await fnEl.fill(data.firstName);

    const lnEl = await this.findWithHealing(this.lastNameInput);
    await lnEl.fill(data.lastName);

    const streetEl = await this.findWithHealing(this.streetInput);
    await streetEl.fill(data.street);

    const cityEl = await this.findWithHealing(this.cityInput);
    await cityEl.fill(data.city);

    const postcodeEl = await this.findWithHealing(this.postcodeInput);
    await postcodeEl.fill(data.postcode);

    const phoneEl = await this.findWithHealing(this.phoneInput);
    await phoneEl.fill(data.phone);

    if (data.country) {
      const countryEl = await this.findWithHealing(this.countrySelect);
      await countryEl.selectOption(data.country);
    }
  }

  async selectFirstShippingMethod(): Promise<void> {
    const methods = await this.findWithHealing(this.shippingMethods, { timeout: 15000 });
    const firstMethod = methods.locator('input[type="radio"]').first();
    await firstMethod.check();
  }

  async proceedToPayment(): Promise<void> {
    const btn = await this.findWithHealing(this.nextStepButton);
    await btn.click();
    await this.page.waitForLoadState('load');
  }

  async selectFirstPaymentMethod(): Promise<void> {
    const methods = await this.findWithHealing(this.paymentMethods, { timeout: 15000 });
    const firstMethod = methods.locator('input[type="radio"]').first();
    if (await firstMethod.isVisible()) {
      await firstMethod.check();
    }
  }

  async placeOrder(): Promise<void> {
    const btn = await this.findWithHealing(this.placeOrderButton);
    await btn.click();
    await this.page.waitForLoadState('load');
  }

  async expectOrderSuccess(): Promise<void> {
    const msg = await this.findWithHealing(this.orderSuccessMessage, { timeout: 30000 });
    await this.assertVisible(msg, 'Order success');
  }

  async getOrderNumber(): Promise<string> {
    const el = await this.findWithHealing(this.orderNumber);
    return (await el.textContent())?.trim() ?? '';
  }
}
