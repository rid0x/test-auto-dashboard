import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { healable, HealableLocator } from '../helpers/auto-healing';

export abstract class ProductPage extends BasePage {
  protected get productName(): HealableLocator {
    return healable('Product name',
      '.page-title span',
      'h1.page-title',
      '.product-info-main .page-title',
      '[data-ui-id="page-title-wrapper"]'
    );
  }

  protected get productPrice(): HealableLocator {
    return healable('Product price',
      '.product-info-price .price',
      '.price-box .price',
      '[data-price-type="finalPrice"] .price',
      '.product-info-main .price'
    );
  }

  protected get addToCartButton(): HealableLocator {
    return healable('Add to cart button',
      '#product-addtocart-button',
      'button[title="Dodaj do koszyka"]',
      'button:has-text("Add to Cart")',
      'button:has-text("Dodaj do koszyka")',
      'button.action.tocart'
    );
  }

  protected get quantityInput(): HealableLocator {
    return healable('Quantity input',
      '#qty',
      'input[name="qty"]',
      'input.qty'
    );
  }

  protected get productImage(): HealableLocator {
    return healable('Product image',
      '.fotorama__stage',
      '.product.media img',
      '.gallery-placeholder img',
      '.product-image-photo'
    );
  }

  protected get productDescription(): HealableLocator {
    return healable('Product description',
      '#description .description',
      '.product.attribute.description',
      '#tab-label-description',
      '.product.info.detailed'
    );
  }

  protected get successMessage(): HealableLocator {
    return healable('Add to cart success message',
      '.message-success',
      '[data-ui-id="message-success"]',
      '.page.messages .success'
    );
  }

  protected get miniCartCount(): HealableLocator {
    return healable('Mini cart counter',
      '.counter.qty',
      '.minicart-wrapper .counter',
      '.counter-number'
    );
  }

  // Configurable product options (e.g., size, color)
  protected get configurableOptions(): HealableLocator {
    return healable('Configurable options',
      '.swatch-opt',
      '#product-options-wrapper',
      '.product-options-wrapper',
      '.fieldset[data-role="swatch-options"]'
    );
  }

  async goto(productUrl: string): Promise<void> {
    await this.navigate(productUrl);
  }

  async gotoDefaultProduct(): Promise<void> {
    await this.goto(this.config.product.url);
  }

  async expectProductNameVisible(): Promise<void> {
    const el = await this.findWithHealing(this.productName);
    await expect(el).toBeVisible();
  }

  async expectProductPriceVisible(): Promise<void> {
    const el = await this.findWithHealing(this.productPrice);
    await expect(el).toBeVisible();
  }

  async getProductName(): Promise<string> {
    const el = await this.findWithHealing(this.productName);
    return (await el.textContent())?.trim() ?? '';
  }

  async getProductPrice(): Promise<string> {
    const el = await this.findWithHealing(this.productPrice);
    return (await el.textContent())?.trim() ?? '';
  }

  async setQuantity(qty: number): Promise<void> {
    const input = await this.findWithHealing(this.quantityInput);
    await input.fill(qty.toString());
  }

  async addToCart(): Promise<void> {
    const btn = await this.findWithHealing(this.addToCartButton);
    await btn.click();
    await this.page.waitForLoadState('load');
  }

  async expectAddToCartSuccess(): Promise<void> {
    const msg = await this.findWithHealing(this.successMessage, { timeout: 15000 });
    await expect(msg).toBeVisible();
  }

  async selectFirstAvailableOption(): Promise<void> {
    try {
      // Quick check — if no swatch options exist, skip immediately
      const swatches = this.page.locator('.swatch-attribute, .swatch-opt, select.super-attribute-select');
      const count = await swatches.count();
      if (count === 0) return; // Simple product, no options needed

      // Click first available swatch for each attribute
      for (let i = 0; i < count; i++) {
        const firstOption = swatches.nth(i).locator('.swatch-option:not(.disabled), option:not([disabled])').first();
        if (await firstOption.isVisible({ timeout: 1000 }).catch(() => false)) {
          await firstOption.click();
        }
      }
    } catch {
      // Product is not configurable — that's OK
    }
  }

  async addToCartWithOptions(qty: number = 1): Promise<void> {
    await this.selectFirstAvailableOption();
    await this.setQuantity(qty);
    await this.addToCart();
  }
}
