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
   * Select first available (in-stock) size via Playwright selectOption.
   * This properly triggers Magento's JS change event, unlike evaluate().
   */
  async selectFirstAvailableOption(): Promise<void> {
    const sizeSelect = this.page.locator('select.super-attribute-select').first();
    try {
      await sizeSelect.waitFor({ state: 'attached', timeout: 10000 });
    } catch {
      return; // No size select — simple product
    }

    // Find first in-stock option (no "Powiadom o dostępności")
    const availableValue = await sizeSelect.locator('option').evaluateAll(opts =>
      opts
        .filter(o => o.value && o.value !== '' && !o.textContent?.includes('Rozmiar') && !o.textContent?.includes('Powiadom'))
        .map(o => o.value)[0] || null
    );

    if (availableValue) {
      await sizeSelect.selectOption({ value: availableValue });
      // Wait for Magento JS to process the option change (stock check, price update)
      await this.page.waitForTimeout(1000);
      // Verify the correct option is actually selected
      const selected = await sizeSelect.inputValue();
      if (selected !== availableValue) {
        // Re-select if Magento JS reset the value
        await sizeSelect.selectOption({ value: availableValue });
        await this.page.waitForTimeout(500);
      }
    } else {
      // All sizes out of stock — select first non-empty as best effort
      await sizeSelect.selectOption({ index: 1 });
    }
  }

  /**
   * Add to cart by clicking the button (triggers Magento validation).
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
    } else {
      // Hidden or readonly input - set value via JS
      await this.page.evaluate((q) => {
        const input = document.querySelector('#qty, input[name="qty"]') as HTMLInputElement;
        if (input) {
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
          nativeSetter.call(input, String(q));
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, qty);
    }
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
