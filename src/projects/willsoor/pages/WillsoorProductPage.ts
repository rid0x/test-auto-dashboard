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
   * Select first available size and add to cart via form submit.
   * Willsoor's Magento/KnockoutJS doesn't respond to Playwright's selectOption properly.
   * Direct form.submit() with JS-set value works reliably.
   */
  async selectFirstAvailableOption(): Promise<void> {
    const sizeSelect = this.page.locator('select.super-attribute-select');
    const count = await sizeSelect.count();
    if (count === 0) return;

    // Set value via JS and submit — Playwright selectOption doesn't trigger Magento JS
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
      // Fallback: select first non-empty option
      if (select.options.length > 1) {
        select.value = select.options[1].value;
      }
    });
    await this.page.waitForTimeout(500);
  }

  async addToCart(): Promise<void> {
    // Submit form directly — more reliable than button click on Willsoor
    await this.page.evaluate(() => {
      const form = document.querySelector('#product_addtocart_form') as HTMLFormElement;
      form?.submit();
    });
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(1000);
  }

  async setQuantity(qty: number): Promise<void> {
    // Willsoor may hide qty input
    const qtyInput = this.page.locator('#qty, input[name="qty"]');
    if (await qtyInput.first().isVisible({ timeout: 1000 }).catch(() => false)) {
      await qtyInput.first().fill(qty.toString());
    }
  }

  async addToCartWithOptions(qty: number = 1): Promise<void> {
    await this.selectFirstAvailableOption();
    if (qty > 1) await this.setQuantity(qty);
    await this.addToCart();
  }

  async expectAddToCartSuccess(): Promise<void> {
    // Try success message first
    const msg = this.page.locator('.message-success');
    const hasMsgNow = await msg.first().isVisible({ timeout: 3000 }).catch(() => false);
    if (hasMsgNow) return;

    // Fallback: check cart has items
    await this.page.goto(`${this.config.baseUrl}/checkout/cart/`, { waitUntil: 'load' });
    await this.page.waitForTimeout(1000);
    const cartItems = await this.page.locator('.cart.item, #shopping-cart-table tbody tr').count();
    expect(cartItems).toBeGreaterThan(0);
  }
}
