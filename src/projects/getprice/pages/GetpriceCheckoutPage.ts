import { expect } from '@playwright/test';
import { CheckoutPage } from '../../../core/pages/CheckoutPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class GetpriceCheckoutPage extends CheckoutPage {
  // Getprice checkout has a login/guest step first

  protected get guestContinueButton(): HealableLocator {
    return healable('Continue as guest',
      'button:has-text("Kontynuuj jako gość")',
      'button:has-text("Kontynuuj")',
      '.action.continue'
    );
  }

  async goto(): Promise<void> {
    await this.navigate('/checkout/');
    // Wait for checkout JS to render
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async continueAsGuest(): Promise<void> {
    try {
      const btn = await this.findWithHealing(this.guestContinueButton, { timeout: 5000 });
      await btn.click();
      await this.page.waitForLoadState('networkidle').catch(() => {});
    } catch {
      // Maybe already past the login step
    }
  }
}
