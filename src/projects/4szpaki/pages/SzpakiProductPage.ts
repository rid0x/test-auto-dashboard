import { expect } from '@playwright/test';
import { ProductPage } from '../../../core/pages/ProductPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class SzpakiProductPage extends ProductPage {
  // 4szpaki has multiple "Dodaj" buttons per variant, no #product-addtocart-button
  protected get addToCartButton(): HealableLocator {
    return healable('4szpaki add to cart',
      'button.action.tocart.primary',
      'button:has-text("Dodaj")',
      '#product-addtocart-button'
    );
  }

  async selectFirstAvailableOption(): Promise<void> {
    // 4szpaki has variant buttons — no global swatch needed
  }

  async setQuantity(qty: number): Promise<void> {
    const qtyInput = this.page.locator('#qty, input[name="qty"]');
    if (await qtyInput.first().isVisible({ timeout: 1000 }).catch(() => false)) {
      await qtyInput.first().fill(qty.toString());
    }
  }

  async addToCart(): Promise<void> {
    const btn = this.page.locator('button.action.tocart.primary').first();
    await btn.click();
    // Wait for AJAX add-to-cart response
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async expectAddToCartSuccess(): Promise<void> {
    const msg = this.page.locator('.message-success');
    const hasMsgNow = await msg.first().isVisible({ timeout: 5000 }).catch(() => false);
    if (hasMsgNow) return;

    // Fallback: check cart
    await this.page.goto(`${this.config.baseUrl}/checkout/cart/`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('load');
    const items = await this.page.locator('.cart.item, #shopping-cart-table tbody tr').count();
    expect(items).toBeGreaterThan(0);
  }
}
