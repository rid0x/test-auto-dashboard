import { CartPage } from '../../../core/pages/CartPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class PierrereneCartPage extends CartPage {
  protected get removeItemButton(): HealableLocator {
    return healable('Pierrerene remove item button',
      '.action.action-delete',
      'a.action.delete',
      'a[title="Usuń produkt"]',
      'a[title="Usuń"]',
      'a[title="Remove item"]',
      'div[class*="remove"]',
      '.action-delete'
    );
  }

  async goto(): Promise<void> {
    await this.navigate('/pl/checkout/cart/');
  }

  async removeFirstItem(): Promise<void> {
    const btn = await this.findWithHealing(this.removeItemButton, { timeout: 10000 });
    await btn.click({ force: true });

    // Handle confirmation modal if present
    const confirmBtn = this.page.locator('button.action-accept, button.action-primary, button:has-text("OK"), button:has-text("Tak")');
    if (await confirmBtn.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmBtn.first().click();
    }

    await this.page.waitForLoadState('load');
  }
}
