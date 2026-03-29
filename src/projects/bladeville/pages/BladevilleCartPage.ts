import { expect } from '@playwright/test';
import { CartPage } from '../../../core/pages/CartPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class BladevilleCartPage extends CartPage {
  protected get emptyCartMessage(): HealableLocator {
    return healable('Bladeville empty cart message',
      '.cart-empty',
      ':has-text("Nie posiadasz produktów w koszyku")',
      ':has-text("Koszyk jest pusty")',
      '.empty-cart'
    );
  }

  protected get removeItemButton(): HealableLocator {
    return healable('Bladeville remove item',
      'a.action.action-delete',
      '.action-delete',
      'a[title="Usuń"]',
      'a:has-text("Usuń")'
    );
  }

  protected get proceedToCheckoutButton(): HealableLocator {
    return healable('Bladeville checkout button',
      'button.action.primary.checkout',
      'button[data-role="proceed-to-checkout"]',
      'button:has-text("Przejdź do kasy")',
      'button:has-text("Do kasy")'
    );
  }

  protected get cartSubtotal(): HealableLocator {
    return healable('Bladeville subtotal',
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
    const btn = await this.findWithHealing(this.removeItemButton);
    await btn.click();

    // Wait for confirm modal
    const confirmBtn = this.page.locator('button.action-primary.action-accept, button.action-accept');
    await confirmBtn.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    if (await confirmBtn.first().isVisible().catch(() => false)) {
      await confirmBtn.first().click();
    }

    // Wait for page to reload after delete
    await this.page.waitForLoadState('load');
    // Verify cart updated
    await this.page.locator('.cart-empty, #shopping-cart-table').first().waitFor({ state: 'visible', timeout: 10000 });
  }
}
