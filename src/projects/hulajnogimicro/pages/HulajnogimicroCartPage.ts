import { expect } from '@playwright/test';
import { CartPage } from '../../../core/pages/CartPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class HulajnogimicroCartPage extends CartPage {
  protected get emptyCartMessage(): HealableLocator {
    return healable('Hulajnogimicro empty cart',
      '.cart-empty',
      ':has-text("Nie posiadasz produktów w koszyku")',
      ':has-text("Koszyk jest pusty")',
      '.empty-cart'
    );
  }

  protected get removeItemButton(): HealableLocator {
    return healable('Hulajnogimicro remove item',
      'form#form-validate a[title="Usuń produkt"]',
      '.cs-cart-item__link-wrapper[title="Usuń produkt"]',
      'a.action.action-delete',
      '.action-delete',
      'a[title="Usuń"]'
    );
  }

  protected get proceedToCheckoutButton(): HealableLocator {
    return healable('Hulajnogimicro checkout button',
      'button[data-role="proceed-to-checkout"]',
      'button.action.primary.checkout',
      'button:has-text("Przejdź do kasy")',
      'button:has-text("Zamówienie")'
    );
  }

  protected get cartSubtotal(): HealableLocator {
    return healable('Hulajnogimicro subtotal',
      'tr.grand.totals .price',
      '.cart-totals .price',
      '.grand.totals .amount .price'
    );
  }

  async updateQuantity(index: number, qty: number): Promise<void> {
    const inputs = this.page.locator('input.qty, input[name*="qty"]');
    await inputs.nth(index).fill(qty.toString());
    await inputs.nth(index).press('Tab');

    // Wait for AJAX update response
    await this.page.waitForResponse(
      resp => resp.url().includes('/cart/') && resp.status() === 200,
      { timeout: 15000 }
    ).catch(() => {});
    await this.page.waitForLoadState('load');
  }

  async removeFirstItem(): Promise<void> {
    // Hulajnogimicro uses data-post links for delete.
    // The cart-page button is inside form#form-validate.
    const btn = await this.findWithHealing(this.removeItemButton);
    await btn.click();

    // Wait for the cart/delete response and page reload
    await this.page.waitForResponse(
      resp => resp.url().includes('cart/delete') || resp.url().includes('cart'),
      { timeout: 15000 }
    ).catch(() => {});
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(2000);
  }
}
