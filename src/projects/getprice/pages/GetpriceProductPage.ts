import { expect } from '@playwright/test';
import { ProductPage } from '../../../core/pages/ProductPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class GetpriceProductPage extends ProductPage {
  protected get productName(): HealableLocator {
    return healable('Getprice product name',
      'h1',
      '.page-title span',
      'h1.text-2xl'
    );
  }

  protected get productPrice(): HealableLocator {
    return healable('Getprice product price',
      '.price-box .price',
      '.price-final_price .price',
      '.price'
    );
  }

  protected get addToCartButton(): HealableLocator {
    return healable('Getprice add to cart',
      '#product-addtocart-button',
      'button:has-text("Dodaj do koszyka")',
      'form#product_addtocart_form button[type="submit"]'
    );
  }

  protected get quantityInput(): HealableLocator {
    return healable('Getprice qty input',
      'input[name="qty"]',
      '#qty',
      'input.qty'
    );
  }

  /**
   * Add to cart with waitForResponse — waits for actual server response.
   */
  async addToCart(): Promise<void> {
    const btn = await this.findWithHealing(this.addToCartButton);

    const responsePromise = this.page.waitForResponse(
      resp => resp.url().includes('/checkout/cart/add') || resp.url().includes('/cart/add'),
      { timeout: 15000 }
    ).catch(() => null);

    await btn.click();

    await Promise.race([
      responsePromise,
      this.page.waitForLoadState('networkidle').catch(() => {}),
    ]);
  }

  /**
   * Verify add to cart using expect().toPass() — intelligent retry.
   */
  async expectAddToCartSuccess(): Promise<void> {
    await expect(async () => {
      const msgVisible = await this.page.locator('.message.success, .message:has-text("Dodałeś")').first().isVisible().catch(() => false);
      const cartCount = await this.page.locator('#menu-cart-icon').textContent().then(t => Number(t?.trim()) > 0).catch(() => false);
      expect(msgVisible || cartCount).toBeTruthy();
    }).toPass({
      intervals: [500, 1000, 2000],
      timeout: 10000,
    });
  }
}
