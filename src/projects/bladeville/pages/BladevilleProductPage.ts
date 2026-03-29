import { expect } from '@playwright/test';
import { ProductPage } from '../../../core/pages/ProductPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class BladevilleProductPage extends ProductPage {
  protected get addToCartButton(): HealableLocator {
    return healable('Bladeville add to cart',
      '#product-addtocart-button',
      'button.action.primary.tocart',
      'button[title="Dodaj do koszyka"]',
      'button:has-text("Dodaj do koszyka")'
    );
  }

  /**
   * Bladeville uses clickable size list items (not <select>) for configurable products.
   * For products with size options, click the first available size from the list.
   */
  async selectFirstAvailableOption(): Promise<void> {
    // Check for size list items (Bladeville custom size selector)
    const sizeItems = this.page.locator('.product-size-list li:not(.unavailable), .size-option:not(.disabled)');
    try {
      const count = await sizeItems.count();
      if (count > 0) {
        await sizeItems.first().click();
        await this.page.waitForTimeout(500);
        return;
      }
    } catch {
      // No custom size selector
    }

    // Fallback: check for standard Magento swatch/select
    const sizeSelect = this.page.locator('select.super-attribute-select').first();
    try {
      await sizeSelect.waitFor({ state: 'attached', timeout: 3000 });
      const availableValue = await sizeSelect.locator('option').evaluateAll(opts =>
        opts
          .filter(o => (o as HTMLOptionElement).value && (o as HTMLOptionElement).value !== '' && !o.textContent?.includes('Wybierz'))
          .map(o => (o as HTMLOptionElement).value)[0] || null
      );
      if (availableValue) {
        await sizeSelect.selectOption({ value: availableValue });
        await this.page.waitForTimeout(500);
      }
    } catch {
      // Simple product, no options needed
    }
  }

  /**
   * Add to cart by clicking the button.
   * Waits for the server response to confirm success.
   */
  async addToCart(): Promise<void> {
    const addBtn = this.page.locator('#product-addtocart-button');

    const responsePromise = this.page.waitForResponse(
      resp => resp.url().includes('/checkout/cart/add') || resp.url().includes('/cart/add'),
      { timeout: 15000 }
    ).catch(() => null);

    await addBtn.click();

    await Promise.race([
      responsePromise,
      this.page.waitForLoadState('load'),
    ]);
  }

  async setQuantity(qty: number): Promise<void> {
    const qtyInput = this.page.locator('#qty, input[name="qty"]');
    const isVisible = await qtyInput.first().isVisible().catch(() => false);
    if (isVisible) {
      await qtyInput.first().fill(qty.toString());
    }
    // Bladeville may use hidden qty=1 — if not visible, skip (default qty=1)
  }

  async addToCartWithOptions(qty: number = 1): Promise<void> {
    await this.selectFirstAvailableOption();
    if (qty > 1) await this.setQuantity(qty);
    await this.addToCart();
  }

  /**
   * Verify add to cart succeeded using expect().toPass() for intelligent retry.
   */
  async expectAddToCartSuccess(): Promise<void> {
    await expect(async () => {
      const msgVisible = await this.page.locator('.message-success').first().isVisible().catch(() => false);
      const cartHasItems = await this.page.locator('.counter-number').first().textContent()
        .then(t => Number(t?.trim()) > 0).catch(() => false);
      expect(msgVisible || cartHasItems).toBeTruthy();
    }).toPass({
      intervals: [500, 1000, 2000],
      timeout: 10000,
    });
  }
}
