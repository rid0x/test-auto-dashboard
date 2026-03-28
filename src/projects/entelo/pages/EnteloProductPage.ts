import { expect } from '@playwright/test';
import { ProductPage } from '../../../core/pages/ProductPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class EnteloProductPage extends ProductPage {
  protected get productPrice(): HealableLocator {
    return healable('Entelo product price',
      '.product-info-price .price-wrapper',
      '.product-info-price .price',
      '.price-box .price-wrapper',
      '.price-box .price',
      '[data-price-type="finalPrice"] .price-wrapper',
      '.price-final_price .price',
      '.product-info-main .price'
    );
  }

  protected get addToCartButton(): HealableLocator {
    return healable('Entelo add to cart',
      '#product-addtocart-button',
      'button:has-text("Dodaj do koszyka")',
      'button.action.tocart.primary',
      'button.tocart'
    );
  }

  async addToCart(): Promise<void> {
    const btn = this.page.locator('#product-addtocart-button, button.action.tocart, button:has-text("Dodaj do koszyka")').first();
    await expect(btn).toBeEnabled({ timeout: 15000 });
    await btn.click();
    await this.page.waitForTimeout(3000);
  }

  async expectAddToCartSuccess(): Promise<void> {
    await expect(async () => {
      const stdMsg = await this.page.locator('.message-success').first().isVisible().catch(() => false);
      const cartHasItems = await this.page.locator('.counter-number, .minicart-wrapper .counter, .counter.qty').first().textContent()
        .then(t => Number(t?.trim()) > 0).catch(() => false);
      expect(stdMsg || cartHasItems).toBeTruthy();
    }).toPass({
      intervals: [500, 1000, 2000],
      timeout: 15000,
    });
  }
}
