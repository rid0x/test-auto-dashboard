import { CartPage } from '../../../core/pages/CartPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class AbazurCartPage extends CartPage {
  protected get removeItemButton(): HealableLocator {
    return healable('Remove item button',
      '.action.action-delete',
      'a.action.delete',
      'a[title="Usuń produkt"]',
      'a[title="Usuń"]',
      'a[title="Remove item"]',
      '.action-delete',
      'div[class*="remove"]',
      'a.remove'
    );
  }

  async removeFirstItem(): Promise<void> {
    const btn = await this.findWithHealing(this.removeItemButton);
    await btn.click({ force: true });
    await this.page.waitForTimeout(2000);

    // Handle confirmation modal if it appears (Magento 2 custom modal)
    const confirmBtn = this.page.locator('button.action-accept, button.action-primary.action-accept, .modal-footer button.action-accept, button:has-text("OK")');
    if (await confirmBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await confirmBtn.first().click({ force: true });
      await this.page.waitForLoadState('load');
      return;
    }

    // If no modal appeared, maybe the item was removed directly via AJAX
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(2000);
  }
}
