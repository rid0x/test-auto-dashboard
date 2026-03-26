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
      '.checkout-methods-items a.btn-primary',
      'a:has-text("Do kasy")',
      '.checkout-methods-items a[href*="checkout"]'
    );
  }

  protected get cartSubtotal(): HealableLocator {
    return healable('Cart subtotal',
      '.cart-summary .cart-price',
      '.cart-summary .price',
      '.grand.totals .price'
    );
  }
}
