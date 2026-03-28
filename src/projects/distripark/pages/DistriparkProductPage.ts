import { expect } from '@playwright/test';
import { ProductPage } from '../../../core/pages/ProductPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class DistriparkProductPage extends ProductPage {
  protected get addToCartButton(): HealableLocator {
    return healable('Distripark add to cart',
      '#product-addtocart-button',
      'button:has-text("Dodaj do koszyka")',
      'button.action.tocart.primary'
    );
  }

  async addToCart(): Promise<void> {
    const btn = this.page.locator('#product-addtocart-button');
    await expect(btn).toBeEnabled({ timeout: 15000 });
    await btn.click();
    await this.page.waitForTimeout(3000);
  }

  async expectAddToCartSuccess(): Promise<void> {
    await expect(async () => {
      const stdMsg = await this.page.locator('.message-success').first().isVisible().catch(() => false);
      const cartHasItems = await this.page.locator('.counter-number, .minicart-wrapper .counter').first().textContent()
        .then(t => Number(t?.trim()) > 0).catch(() => false);
      expect(stdMsg || cartHasItems).toBeTruthy();
    }).toPass({
      intervals: [500, 1000, 2000],
      timeout: 15000,
    });
  }
}
