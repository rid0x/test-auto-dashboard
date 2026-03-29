import { expect } from '@playwright/test';
import { ProductPage } from '../../../core/pages/ProductPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class HulajnogimicroProductPage extends ProductPage {
  protected get addToCartButton(): HealableLocator {
    return healable('Hulajnogimicro add to cart',
      'button:has-text("Dodaj do koszyka")',
      '#product-addtocart-button',
      'button.action.tocart'
    );
  }

  protected get productName(): HealableLocator {
    return healable('Hulajnogimicro product name',
      'h1',
      '.page-title span',
      'h1.page-title'
    );
  }

  protected get productPrice(): HealableLocator {
    return healable('Hulajnogimicro product price',
      '.price-box .price',
      '.product-info-main .price',
      '[data-price-type="finalPrice"] .price'
    );
  }

  protected get productImage(): HealableLocator {
    return healable('Hulajnogimicro product image',
      '.product.media img',
      '.fotorama__stage img',
      '.gallery-placeholder img',
      '.product-image-photo'
    );
  }

  /**
   * Select first available color option from the swatch listbox.
   * Hulajnogimicro uses a listbox with role=option for color selection.
   *
   * IMPORTANT: The first option is visually pre-selected (aria-checked=true)
   * but the hidden super_attribute input is empty until a JS click event fires.
   * To ensure the input gets a value, we click a different option first, then
   * click back to the first option. This triggers the Magento swatch JS properly.
   */
  async selectFirstAvailableOption(): Promise<void> {
    const swatchOptions = this.page.locator('.swatch-option');
    try {
      await swatchOptions.first().waitFor({ state: 'visible', timeout: 5000 });
      const count = await swatchOptions.count();
      if (count >= 2) {
        // Click 2nd option first to trigger JS initialization, then click 1st
        await swatchOptions.nth(1).click();
        await this.page.waitForTimeout(1000);
        await swatchOptions.first().click();
        await this.page.waitForTimeout(1000);
      } else if (count === 1) {
        // Only one option — click it to trigger JS
        await swatchOptions.first().click();
        await this.page.waitForTimeout(1000);
      }
    } catch {
      // No swatch options — simple product
    }
  }

  /**
   * Add to cart — Hulajnogimicro submits via AJAX form post.
   * Wait for the customer/section/load response which confirms cart update.
   */
  async addToCart(): Promise<void> {
    const addBtn = this.page.locator('button:has-text("Dodaj do koszyka")').first();

    const sectionPromise = this.page.waitForResponse(
      resp => resp.url().includes('customer/section/load') && resp.status() === 200,
      { timeout: 20000 }
    ).catch(() => null);

    await addBtn.click();

    await sectionPromise;
    // Extra settle time for UI to update (Dziękujemy! text, minicart counter)
    await this.page.waitForTimeout(2000);
  }

  async setQuantity(qty: number): Promise<void> {
    // Hulajnogimicro product pages do not show a qty input
    // Quantity is controlled on the cart page
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
    // For qty > 1 without qty input, add multiple times
    if (qty > 1) {
      const qtyInput = this.page.locator('#qty, input[name="qty"]');
      const hasQty = await qtyInput.first().isVisible().catch(() => false);
      if (!hasQty) {
        for (let i = 1; i < qty; i++) {
          await this.page.waitForTimeout(2000);
          // Dismiss the offcanvas minicart overlay that opens after first add-to-cart
          await this.dismissOffcanvasOverlay();
          await this.addToCart();
        }
      }
    }
  }

  /**
   * Dismiss the offcanvas minicart overlay that blocks clicks.
   * Clicks the overlay or the close button to close it.
   */
  private async dismissOffcanvasOverlay(): Promise<void> {
    const overlay = this.page.locator('.cs-offcanvas__overlay.overlay--visible, .overlay--visible');
    if (await overlay.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await overlay.first().click({ force: true });
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Verify add to cart succeeded — Hulajnogimicro shows "Dziękujemy!" text on button
   * or updates the minicart counter.
   */
  async expectAddToCartSuccess(): Promise<void> {
    await expect(async () => {
      const thankYouVisible = await this.page.locator('strong:has-text("Dziękujemy!")').first().isVisible().catch(() => false);
      const msgVisible = await this.page.locator('.message-success').first().isVisible().catch(() => false);
      const cartHasItems = await this.page.locator('.minicart-wrapper, a[href*="checkout/cart"]').first()
        .textContent().then(t => t?.includes('1') || t?.includes('2') || t?.includes('3')).catch(() => false);
      // Also check the offcanvas minicart
      const minicartNotEmpty = await this.page.locator('dialog:has-text("Mój koszyk")').first()
        .textContent().then(t => !t?.includes('Nie posiadasz produktów')).catch(() => false);
      expect(thankYouVisible || msgVisible || cartHasItems || minicartNotEmpty).toBeTruthy();
    }).toPass({
      intervals: [500, 1000, 2000, 3000],
      timeout: 15000,
    });
  }
}
