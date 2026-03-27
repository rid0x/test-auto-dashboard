import { CartPage } from '../../../core/pages/CartPage';

export class SzpakiCartPage extends CartPage {
  /**
   * 4szpaki uses qty +/- buttons, not direct input fill.
   */
  async updateQuantity(index: number, qty: number): Promise<void> {
    // Click + button to increase quantity
    const qtyInput = this.page.getByRole('spinbutton', { name: 'Ilość' }).nth(index);
    const currentVal = Number(await qtyInput.inputValue().catch(() => '1'));
    const diff = qty - currentVal;

    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        // + button is after the input
        await qtyInput.locator('..').locator('button').last().click();
        await this.page.waitForTimeout(300);
      }
    }
    await this.page.waitForLoadState('load').catch(() => {});
  }

  /**
   * 4szpaki shows confirm dialog "OK" after clicking remove.
   */
  async removeFirstItem(): Promise<void> {
    await this.page.getByRole('link', { name: 'Usuń produkt' }).first().click();
    await this.page.getByRole('button', { name: 'OK' }).click();
    await this.page.waitForLoadState('load');
  }

  /**
   * 4szpaki checkout button
   */
  async proceedToCheckout(): Promise<void> {
    const btn = this.page.getByRole('button', { name: /Przejdź do kasy/i });
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await this.page.waitForLoadState('load');
  }
}
