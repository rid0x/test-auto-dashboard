import { expect } from '@playwright/test';
import { ProductPage } from '../../../core/pages/ProductPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class SzpakiProductPage extends ProductPage {
  protected get addToCartButton(): HealableLocator {
    return healable('4szpaki add to cart',
      '#product-addtocart-button',
      'button:has-text("Dodaj do koszyka")'
    );
  }

  async selectFirstAvailableOption(): Promise<void> {
    // 4szpaki simple products — no swatch needed
  }

  async setQuantity(qty: number): Promise<void> {
    // 4szpaki uses +/- buttons for qty, input may be readonly
    if (qty <= 1) return; // Default qty is already 1
    // Use + button to increase qty
    for (let i = 1; i < qty; i++) {
      const plusBtn = this.page.locator('button[data-bind*="increaseQty"], .qty-increase, button:near(input[name="qty"]):has-text("+")').first();
      if (await plusBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await plusBtn.click();
      }
    }
  }

  async addToCart(): Promise<void> {
    // Dismiss cookie/salesmanago if they reappeared
    try {
      const cookie = this.page.getByText('Zaakceptuj wszystkie');
      if (await cookie.isVisible({ timeout: 1000 }).catch(() => false)) {
        await cookie.click();
        await this.page.waitForTimeout(500);
      }
    } catch { /* already dismissed */ }

    const btn = this.page.locator('#product-addtocart-button');
    await expect(btn).toBeEnabled({ timeout: 15000 });
    await btn.click();
    await this.page.waitForTimeout(3000);
  }

  async expectAddToCartSuccess(): Promise<void> {
    await expect(async () => {
      const customMsg = await this.page.getByText('Produkt dodany do Twojego').first().isVisible().catch(() => false);
      const addedMsg = await this.page.getByText('Dodane').first().isVisible().catch(() => false);
      const stdMsg = await this.page.locator('.message-success').first().isVisible().catch(() => false);
      const cartHasItems = await this.page.locator('.counter-number, .minicart-wrapper .counter').first().textContent()
        .then(t => Number(t?.trim()) > 0).catch(() => false);
      expect(customMsg || addedMsg || stdMsg || cartHasItems).toBeTruthy();
    }).toPass({
      intervals: [500, 1000, 2000],
      timeout: 15000,
    });
  }
}
