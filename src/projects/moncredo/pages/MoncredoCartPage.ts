import { CartPage } from '../../../core/pages/CartPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class MoncredoCartPage extends CartPage {
  protected get proceedToCheckoutButton(): HealableLocator {
    return healable('Proceed to checkout button',
      'button[data-role="proceed-to-checkout"]',
      '.checkout-methods-items .action.primary.checkout',
      'button:has-text("Przejdź do kasy")',
      'button:has-text("Zamawiam")'
    );
  }

  protected get cartSubtotal(): HealableLocator {
    return healable('Cart subtotal',
      '.grand.totals .price',
      '.cart-summary .subtotal .price',
      '.cart-totals .amount .price',
      '[data-th="Subtotal"]'
    );
  }

  protected get removeItemButton(): HealableLocator {
    return healable('Remove item button',
      'a.action.delete',
      'a[title="Usuń produkt"]',
      '.cs-minicart-product__action--remove',
      'a.action-delete',
      'a[title="Usuń"]'
    );
  }

  async updateQuantity(index: number, qty: number): Promise<void> {
    const inputs = this.page.locator('input.qty, input[name*="qty"]');
    await inputs.nth(index).fill(qty.toString());

    // Press Tab to trigger update, wait for AJAX
    await inputs.nth(index).press('Tab');
    await this.page.waitForResponse(
      resp => resp.url().includes('/cart/') && resp.status() === 200
    ).catch(() => {});
    await this.page.waitForLoadState('load');
  }

  async removeFirstItem(): Promise<void> {
    const btn = await this.findWithHealing(this.removeItemButton);
    await btn.evaluate((el: HTMLElement) => el.click());

    // Handle potential confirmation modal
    try {
      const confirmBtn = this.page.locator('.action-primary.action-accept, button:has-text("OK")');
      if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmBtn.click();
      }
    } catch {}

    await this.page.waitForLoadState('load');
  }
}
