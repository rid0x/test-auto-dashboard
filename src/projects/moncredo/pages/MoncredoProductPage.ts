import { expect } from '@playwright/test';
import { ProductPage } from '../../../core/pages/ProductPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class MoncredoProductPage extends ProductPage {
  protected get addToCartButton(): HealableLocator {
    return healable('Add to cart button',
      'button.tocart.primary',
      'button.cs-addtocart__button',
      'button:has-text("Dodaj do koszyka")',
      '#product_addtocart_form button.tocart',
      'button.cs-buybox__addtocart-button'
    );
  }

  protected get productImage(): HealableLocator {
    return healable('Product image',
      '.fotorama__img',
      'img.fotorama__img',
      '.fotorama__stage',
      '.gallery-placeholder img',
      '.cs-page-product__gallery img'
    );
  }

  protected get productDescription(): HealableLocator {
    return healable('Product description',
      '.cs-product-details',
      '.cs-product-details__item',
      '.product.info.detailed',
      '#tab-label-description'
    );
  }

  protected get successMessage(): HealableLocator {
    return healable('Add to cart success message',
      '.message-success',
      '[data-ui-id="message-success"]',
      '.page.messages .success',
      '.messages .message-success'
    );
  }

  protected get miniCartCount(): HealableLocator {
    return healable('Mini cart counter',
      '.counter.qty',
      '.cs-header-user-nav__qty-counter',
      '.cs-addtocart__minicart-qty-badge',
      '.minicart-wrapper .counter'
    );
  }

  protected get breadcrumbs(): HealableLocator {
    return healable('Breadcrumbs',
      '.cs-breadcrumbs',
      '.breadcrumbs',
      'nav[aria-label="breadcrumb"]'
    );
  }

  async selectFirstAvailableOption(): Promise<void> {
    try {
      // Moncredo uses swatch text options (e.g., volume: 100ml, 2ml Sample)
      const swatchOpt = this.page.locator('.swatch-opt');
      if (await swatchOpt.count() === 0) return; // Simple product

      // Click first available (non-disabled) swatch option for each attribute
      const attributes = this.page.locator('.swatch-attribute');
      const attrCount = await attributes.count();

      for (let i = 0; i < attrCount; i++) {
        const options = attributes.nth(i).locator('.swatch-option:not(.disabled)');
        const optCount = await options.count();
        if (optCount > 0) {
          await options.first().click();
          await this.page.waitForTimeout(500);
        }
      }
    } catch {
      // Product is not configurable
    }
  }

  async addToCart(): Promise<void> {
    const btn = await this.findWithHealing(this.addToCartButton);

    // Wait for network response to cart add
    const responsePromise = this.page.waitForResponse(
      resp => (resp.url().includes('/checkout/cart/add') || resp.url().includes('/cart/add')) && resp.status() === 200,
      { timeout: 15000 }
    ).catch(() => null);

    await btn.click();

    await responsePromise;
    // Wait for DOM to update after AJAX response
    await this.page.waitForTimeout(2000);
  }

  async expectAddToCartSuccess(): Promise<void> {
    // Use expect().toPass() for intelligent retry
    const page = this.page;
    await expect(async () => {
      const successVisible = await page.locator('.message-success').isVisible().catch(() => false);
      const counterHasItems = await page.locator('.counter.qty.cs-header-user-nav__qty-counter--have-items, .counter.qty:not(.empty)').isVisible().catch(() => false);
      expect(successVisible || counterHasItems).toBeTruthy();
    }).toPass({ intervals: [500, 1000, 2000], timeout: 15000 });
  }
}
