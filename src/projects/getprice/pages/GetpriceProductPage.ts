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

  protected get successMessage(): HealableLocator {
    return healable('Add to cart success',
      '.message.success',
      '[ui-id="message-success"]',
      '.messages .message.success'
    );
  }

  protected get miniCartCount(): HealableLocator {
    return healable('Mini cart counter',
      '#menu-cart-icon',
      'button[title="Koszyk"]'
    );
  }

  async addToCart(): Promise<void> {
    const btn = await this.findWithHealing(this.addToCartButton);
    await btn.click();
    // Getprice uses AJAX for add to cart — wait for response
    await this.page.waitForTimeout(3000);
  }

  async expectAddToCartSuccess(): Promise<void> {
    // Wait for either success message or cart counter update
    try {
      // Getprice shows ".message.success" with "Dodałeś ... do koszyka"
      const msg = this.page.locator('.message.success:visible, .message:has-text("Dodałeś")');
      await expect(msg.first()).toBeVisible({ timeout: 10000 });
    } catch {
      // Fallback: check cart counter shows > 0
      const cartText = await this.page.locator('#menu-cart-icon').textContent();
      expect(Number(cartText?.trim())).toBeGreaterThan(0);
    }
  }
}
