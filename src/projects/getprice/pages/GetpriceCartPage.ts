import { expect } from '@playwright/test';
import { CartPage } from '../../../core/pages/CartPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class GetpriceCartPage extends CartPage {
  protected get cartTable(): HealableLocator {
    return healable('Getprice cart table',
      '#shopping-cart-table',
      '.cart.items',
      '.cart-container'
    );
  }

  protected get emptyCartMessage(): HealableLocator {
    return healable('Empty cart message',
      '.cart-empty',
      ':has-text("Koszyk jest pusty")',
      ':has-text("nie masz żadnych")'
    );
  }

  protected get removeItemButton(): HealableLocator {
    return healable('Remove item',
      '.action.action-delete',
      '.action-delete',
      'a:has-text("Usuń")'
    );
  }

  protected get updateCartButton(): HealableLocator {
    return healable('Update cart',
      '.action.update',
      'button:has-text("Aktualizuj")',
      'button.action.update'
    );
  }

  protected get proceedToCheckoutButton(): HealableLocator {
    return healable('Proceed to checkout',
      'a.btn-primary[href*="checkout"]:not([href*="cart"])',
      '.checkout-methods-items a[href*="checkout"]',
      'a:has-text("Do kasy")'
    );
  }

  async proceedToCheckout(): Promise<void> {
    // Scroll to make the button visible (may be offscreen)
    const btn = this.page.locator('a.btn-primary[href*="checkout"]:not([href*="cart"]), a:has-text("Do kasy")').first();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await this.page.waitForLoadState('load');
  }

  protected get cartSubtotal(): HealableLocator {
    return healable('Cart subtotal',
      '.cart-summary .cart-price',
      '.cart-summary .price',
      '.grand.totals .price'
    );
  }
}
