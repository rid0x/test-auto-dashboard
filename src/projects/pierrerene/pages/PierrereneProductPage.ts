import { expect } from '@playwright/test';
import { ProductPage } from '../../../core/pages/ProductPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class PierrereneProductPage extends ProductPage {
  protected get productPrice(): HealableLocator {
    return healable('Pierrerene product price',
      '.product-info-price .price-wrapper',
      '.product-info-price .price',
      '.price-box .price-wrapper',
      '.price-box .price',
      '[data-price-type="finalPrice"] .price-wrapper',
      '.product-info-main .price-wrapper',
      '.price-final_price .price',
      '.special-price .price'
    );
  }

  protected get addToCartButton(): HealableLocator {
    return healable('Pierrerene add to cart',
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
      const addedMsg = await this.page.getByText('dodano').first().isVisible().catch(() => false);
      expect(stdMsg || cartHasItems || addedMsg).toBeTruthy();
    }).toPass({
      intervals: [500, 1000, 2000],
      timeout: 15000,
    });
  }
}
