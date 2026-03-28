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

    // Handle confirmation modal if it appears
    const confirmBtn = this.page.locator('button.action-accept, button.action-primary, .modal-footer button.action-accept, button:has-text("OK")');
    const modalVisible = await confirmBtn.first().isVisible({ timeout: 3000 }).catch(() => false);
    if (modalVisible) {
      await confirmBtn.first().click({ force: true });
    }

    await this.page.waitForLoadState('load');
  }
}
