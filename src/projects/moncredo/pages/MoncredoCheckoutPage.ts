import { CheckoutPage } from '../../../core/pages/CheckoutPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class MoncredoCheckoutPage extends CheckoutPage {
  protected get nextStepButton(): HealableLocator {
    return healable('Next step button',
      'button[data-role="opc-continue"]',
      'button.continue',
      'button:has-text("Dalej")',
      'button:has-text("Następne")',
      'button:has-text("Next")'
    );
  }

  protected get placeOrderButton(): HealableLocator {
    return healable('Place order button',
      'button:has-text("Złóż zamówienie")',
      'button[title="Złóż zamówienie"]',
      'button:has-text("Zamawiam")',
      'button.action.checkout',
      '.payment-method._active button.action.primary'
    );
  }
}
