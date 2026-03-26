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

  protected get successMessage(): HealableLocator {
    return healable('Add to cart success',
      '.message-success',
      '[data-ui-id="message-success"]',
      '.messages .message-success'
    );
  }

  /**
   * Select first AVAILABLE size option.
   * Willsoor marks unavailable sizes with "Powiadom o dostępności".
   * After selecting an unavailable size, the add-to-cart button disappears.
   */
  async selectFirstAvailableOption(): Promise<void> {
    const sizeSelect = this.page.locator('select.super-attribute-select');
    const count = await sizeSelect.count();
    if (count === 0) return;

    const options = await sizeSelect.first().locator('option').allTextContents();

    // Find first available option (not empty, not "Powiadom")
    for (let i = 0; i < options.length; i++) {
      const text = options[i].trim();
      if (text.length > 0 && !text.includes('Rozmiar') && !text.includes('Powiadom')) {
        await sizeSelect.first().selectOption({ index: i });
        await this.page.waitForTimeout(1000);
        return;
      }
    }

    // If no available option found, try selecting the first non-empty one anyway
    await sizeSelect.first().selectOption({ index: 1 });
    await this.page.waitForTimeout(1000);
  }

  async addToCart(): Promise<void> {
    const btn = await this.findWithHealing(this.addToCartButton);
    await btn.click();
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(2000);
  }

  async setQuantity(qty: number): Promise<void> {
    // Willsoor hides qty input — skip if not visible
    const qtyInput = this.page.locator('#qty, input[name="qty"]');
    if (await qtyInput.first().isVisible({ timeout: 1000 }).catch(() => false)) {
      await qtyInput.first().fill(qty.toString());
    }
    // If hidden, default qty is 1 — that's fine
  }

  async addToCartWithOptions(qty: number = 1): Promise<void> {
    await this.selectFirstAvailableOption();
    if (qty > 1) await this.setQuantity(qty);
    await this.addToCart();
  }

  async expectAddToCartSuccess(): Promise<void> {
    const msg = await this.findWithHealing(this.successMessage, { timeout: 10000 });
    await expect(msg).toBeVisible();
  }
}
