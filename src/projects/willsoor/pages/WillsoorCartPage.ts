import { expect } from '@playwright/test';
import { CartPage } from '../../../core/pages/CartPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class WillsoorCartPage extends CartPage {
  protected get removeItemButton(): HealableLocator {
    return healable('Willsoor remove item',
      'a.action.action-delete',
      '.action-delete',
      'a:has-text("Usuń")'
    );
  }

  protected get proceedToCheckoutButton(): HealableLocator {
    return healable('Willsoor checkout button',
      'button.action.primary.checkout',
      'button[data-role="proceed-to-checkout"]',
      'button:has-text("Przejdź do kasy")'
    );
  }

  protected get cartSubtotal(): HealableLocator {
    return healable('Willsoor subtotal',
      'tr.grand.totals .price',
      '.cart-totals .price',
      '.grand.totals .amount .price'
    );
  }

  // Willsoor doesn't have a separate update cart button — qty changes auto-update
  async updateQuantity(index: number, qty: number): Promise<void> {
    const inputs = this.page.locator('input.qty, input[name*="qty"]');
    await inputs.nth(index).fill(qty.toString());
    // Willsoor auto-updates — just wait
    await inputs.nth(index).press('Tab');
    await this.page.waitForTimeout(2000);
    await this.page.waitForLoadState('load');
  }

  async removeFirstItem(): Promise<void> {
    const btn = await this.findWithHealing(this.removeItemButton);
    await btn.click();
    // Willsoor may show confirmation dialog
    try {
      const confirmBtn = this.page.locator('button.action-accept, button:has-text("OK"), button.action.primary.btn-danger');
      if (await confirmBtn.first().isVisible({ timeout: 2000 })) {
        await confirmBtn.first().click();
      }
    } catch {}
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(2000);
  }
}
