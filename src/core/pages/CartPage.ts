import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { healable, HealableLocator } from '../helpers/auto-healing';

export abstract class CartPage extends BasePage {
  protected get cartTable(): HealableLocator {
    return healable('Cart items table',
      '#shopping-cart-table',
      '.cart.table-wrapper',
      'table.cart.items',
      'table:has(caption)',
      'form#form-validate table',
      '.cart-container'
    );
  }

  protected get cartItems(): HealableLocator {
    return healable('Cart item rows',
      '.cart.item',
      'tbody.cart.item',
      '.item-info',
      '#shopping-cart-table tbody tr'
    );
  }

  protected get emptyCartMessage(): HealableLocator {
    return healable('Empty cart message',
      '.cart-empty',
      'p:has-text("Nie masz produktów")',
      ':has-text("Koszyk jest pusty")',
      ':has-text("You have no items")',
      '.empty-cart'
    );
  }

  protected get removeItemButton(): HealableLocator {
    return healable('Remove item button',
      '.action.action-delete',
      'a.action.delete',
      '.action-delete',
      'a[title="Usuń"]',
      'a[title="Usuń produkt"]',
      'a[title="Remove item"]',
      'a:has-text("Usuń")'
    );
  }

  protected get quantityInput(): HealableLocator {
    return healable('Quantity input',
      'input.qty',
      'input[name*="qty"]',
      '.input-text.qty'
    );
  }

  protected get updateCartButton(): HealableLocator {
    return healable('Update cart button',
      'button.action.update',
      'button[title="Zaktualizuj koszyk"]',
      'button:has-text("Update Shopping Cart")',
      'button:has-text("Zaktualizuj")'
    );
  }

  protected get proceedToCheckoutButton(): HealableLocator {
    return healable('Proceed to checkout button',
      'button[data-role="proceed-to-checkout"]',
      '.checkout-methods-items .action.primary.checkout',
      'button:has-text("Przejdź do kasy")',
      'button:has-text("Proceed to Checkout")'
    );
  }

  protected get cartSubtotal(): HealableLocator {
    return healable('Cart subtotal',
      '.cart-summary .subtotal .price',
      '.grand.totals .price',
      '[data-th="Subtotal"]',
      '.cart-totals .amount .price'
    );
  }

  async goto(): Promise<void> {
    await this.navigate('/checkout/cart/');
  }

  async expectCartNotEmpty(): Promise<void> {
    const table = await this.findWithHealing(this.cartTable, { timeout: 10000 });
    await this.assertVisible(table, 'Cart table');
  }

  async expectCartEmpty(): Promise<void> {
    // Wait for the page to settle after removal
    await this.page.waitForLoadState('networkidle').catch(() => {});
    try {
      const msg = await this.findWithHealing(this.emptyCartMessage, { timeout: 10000 });
      await this.assertVisible(msg, 'Empty cart message');
    } catch {
      // Fallback: reload cart page and check again
      await this.goto();
      await this.page.waitForLoadState('networkidle').catch(() => {});
      const msg = await this.findWithHealing(this.emptyCartMessage, { timeout: 10000 });
      await this.assertVisible(msg, 'Empty cart message');
    }
  }

  async getCartItemCount(): Promise<number> {
    try {
      const items = this.page.locator('.cart.item, #shopping-cart-table tbody tr');
      return await items.count();
    } catch {
      return 0;
    }
  }

  async removeFirstItem(): Promise<void> {
    const btn = await this.findWithHealing(this.removeItemButton);
    await btn.click({ force: true });

    // Handle confirmation modal if it appears
    const confirmBtn = this.page.locator('button.action-accept, button.action-primary, button:has-text("OK")');
    if (await confirmBtn.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmBtn.first().click({ force: true });
    }

    await this.page.waitForLoadState('load');
  }

  async updateQuantity(index: number, qty: number): Promise<void> {
    const inputs = this.page.locator('input.qty, input[name*="qty"]');
    await inputs.nth(index).fill(qty.toString());
    const updateBtn = await this.findWithHealing(this.updateCartButton);
    await updateBtn.click();
    await this.page.waitForLoadState('load');
  }

  async proceedToCheckout(): Promise<void> {
    const btn = await this.findWithHealing(this.proceedToCheckoutButton);
    await btn.click();
    await this.page.waitForLoadState('load');
  }

  async getSubtotal(): Promise<string> {
    const el = await this.findWithHealing(this.cartSubtotal);
    return (await el.textContent()) ?? '';
  }
}
