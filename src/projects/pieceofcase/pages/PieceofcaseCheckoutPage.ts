import { CheckoutPage } from '../../../core/pages/CheckoutPage';
import { setupPbPopupAutoDismiss } from '../../../core/helpers/cookie-consent';

export class PieceofcaseCheckoutPage extends CheckoutPage {
  async navigate(path: string = ''): Promise<void> {
    await super.navigate(path);
    await setupPbPopupAutoDismiss(this.page);
  }
}
