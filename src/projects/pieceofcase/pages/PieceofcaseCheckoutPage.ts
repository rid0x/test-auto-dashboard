import { CheckoutPage } from '../../../core/pages/CheckoutPage';

export class PieceofcaseCheckoutPage extends CheckoutPage {
  async navigate(path: string = ''): Promise<void> {
    await super.navigate(path);
    await this.page.evaluate(() => document.querySelectorAll('[id^="__pb"]').forEach(el => el.remove())).catch(() => {});
  }
}
