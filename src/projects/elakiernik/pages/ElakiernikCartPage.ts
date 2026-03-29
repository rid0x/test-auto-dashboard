import { CartPage } from '../../../core/pages/CartPage';

export class ElakiernikCartPage extends CartPage {
  async updateQuantity(index: number, qty: number): Promise<void> {
    // Elakiernik uses +/- buttons, no separate update button
    const qtyInput = this.page.getByRole('spinbutton', { name: 'Ilość' }).nth(index);
    const currentVal = Number(await qtyInput.inputValue().catch(() => '1'));
    const diff = qty - currentVal;

    if (diff > 0) {
      const plusBtn = qtyInput.locator('..').locator('button:has-text("+")');
      for (let i = 0; i < diff; i++) {
        await plusBtn.click();
        await this.page.waitForTimeout(300);
      }
    } else if (diff < 0) {
      const minusBtn = qtyInput.locator('..').locator('button:has-text("-")');
      for (let i = 0; i < Math.abs(diff); i++) {
        await minusBtn.click();
        await this.page.waitForTimeout(300);
      }
    }
    await this.page.waitForLoadState('load').catch(() => {});
  }
}
