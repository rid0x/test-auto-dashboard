import { expect } from '@playwright/test';
import { ProductPage } from '../../../core/pages/ProductPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class WillsoorProductPage extends ProductPage {
  protected get addToCartButton(): HealableLocator {
    return healable('Willsoor add to cart',
      '#product-addtocart-button',
      'button.action.tocart',
      'button:has-text("Dodaj do koszyka")'
    );
  }

  /**
   * Select first available size using JS (Playwright selectOption doesn't trigger Magento/KO).
   * Waits for select to be present in DOM before attempting.
   */
  async selectFirstAvailableOption(): Promise<void> {
    // Wait for select to appear in DOM (no hard timeout)
    const sizeSelect = this.page.locator('select.super-attribute-select');
    try {
      await sizeSelect.first().waitFor({ state: 'attached', timeout: 10000 });
    } catch {
      return; // No size select — simple product
    }

    await this.page.evaluate(() => {
      const select = document.querySelector('select.super-attribute-select') as HTMLSelectElement;
      if (!select) return;
      for (const opt of Array.from(select.options)) {
        const text = opt.text || '';
        if (text.trim().length > 2 && !text.includes('Rozmiar') && !text.includes('Powiadom') && !text.includes('dostępności')) {
          select.value = opt.value;
          return;
        }
      }
      if (select.options.length > 1) {
        select.value = select.options[1].value;
      }
    });
  }

  async addToCart(): Promise<void> {
    // Submit form directly — Playwright selectOption doesn't trigger Magento/KO
    const form = this.page.locator('#product_addtocart_form');
    await form.evaluate(f => (f as HTMLFormElement).submit());
    await this.page.waitForLoadState('load');
  }

  async setQuantity(qty: number): Promise<void> {
    const qtyInput = this.page.locator('#qty, input[name="qty"]');
    const isVisible = await qtyInput.first().isVisible().catch(() => false);
    if (isVisible) {
      await qtyInput.first().fill(qty.toString());
    }
  }

  async addToCartWithOptions(qty: number = 1): Promise<void> {
    await this.selectFirstAvailableOption();
    if (qty > 1) await this.setQuantity(qty);
    await this.addToCart();
  }

  async expectAddToCartSuccess(): Promise<void> {
    // Use web-first assertion with retry — no hard waits
    const msg = this.page.locator('.message-success');
    try {
      await expect(msg.first()).toBeVisible({ timeout: 5000 });
      return;
    } catch {
      // Fallback: check cart has items
      await this.page.goto(`${this.config.baseUrl}/checkout/cart/`);
      await expect(this.page.locator('.cart.item, #shopping-cart-table tbody tr').first()).toBeVisible({ timeout: 10000 });
    }
  }
}
