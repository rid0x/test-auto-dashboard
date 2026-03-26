import { expect } from '@playwright/test';
import { ProductPage } from '../../../core/pages/ProductPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class WillsoorProductPage extends ProductPage {
  // Willsoor uses SELECT dropdown for size, not swatch tiles
  // Qty input is hidden by default

  protected get addToCartButton(): HealableLocator {
    return healable('Willsoor add to cart',
      '#product-addtocart-button',
      'button.action.tocart',
      'button:has-text("Dodaj do koszyka")'
    );
  }

  async selectFirstAvailableOption(): Promise<void> {
    // Willsoor uses <select> for size, not swatch tiles
    const sizeSelect = this.page.locator('select.super-attribute-select');
    const count = await sizeSelect.count();
    if (count > 0) {
      // Select first non-empty option
      const options = sizeSelect.first().locator('option:not([value=""])');
      const optCount = await options.count();
      if (optCount > 0) {
        const value = await options.first().getAttribute('value');
        if (value) {
          await sizeSelect.first().selectOption(value);
          await this.page.waitForTimeout(500);
        }
      }
    }
  }

  async addToCart(): Promise<void> {
    const btn = await this.findWithHealing(this.addToCartButton);
    await btn.click();
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(2000);
  }

  async expectAddToCartSuccess(): Promise<void> {
    const msg = this.page.locator('.message-success, .message.success, [data-ui-id="message-success"]');
    await expect(msg.first()).toBeVisible({ timeout: 15000 });
  }
}
