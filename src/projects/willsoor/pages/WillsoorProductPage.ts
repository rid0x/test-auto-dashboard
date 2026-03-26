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
   * Select first available size using JS.
   * Waits for select to be present in DOM before attempting.
   */
  async selectFirstAvailableOption(): Promise<void> {
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

  /**
   * Add to cart using form.submit() + waitForResponse.
   * Waits for the actual server response instead of guessing timing.
   */
  async addToCart(): Promise<void> {
    const form = this.page.locator('#product_addtocart_form');

    // Wait for the cart add response from server
    const responsePromise = this.page.waitForResponse(
      resp => resp.url().includes('/checkout/cart/add') || resp.url().includes('/cart/add'),
      { timeout: 15000 }
    ).catch(() => null);

    await form.evaluate(f => (f as HTMLFormElement).submit());

    // Wait for server response OR page load — whichever comes first
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
