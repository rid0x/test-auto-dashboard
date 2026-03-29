import { CartPage } from '../../../core/pages/CartPage';

export class PieceofcaseCartPage extends CartPage {
  async navigate(path: string = ''): Promise<void> {
    await super.navigate(path);
    await this.page.evaluate(() => {
      document.querySelectorAll('[id^="__pb"]').forEach(el => el.remove());
      document.querySelectorAll('[data-gr="popup-container"]').forEach(el => el.remove());
    }).catch(() => {});
    // Permanently block any popup overlays that appear via JS after page load
    await this.page.addStyleTag({
      content: '[data-gr="popup-container"] { display: none !important; pointer-events: none !important; }'
    }).catch(() => {});
  }

  async goto(): Promise<void> {
    await this.navigate('/pl/checkout/cart/');
  }

  async removeFirstItem(): Promise<void> {
    // Remove overlays first
    await this.page.evaluate(() => {
      document.querySelectorAll('[data-gr="popup-container"], [id^="__pb"]').forEach(el => el.remove());
    }).catch(() => {});

    const deleteBtn = this.page.locator('a:has-text("Usuń"), .action-delete, .action.action-delete').first();
    await deleteBtn.click({ force: true });
    await this.page.waitForTimeout(2000);

    // Pieceofcase shows a Magento confirmation modal — click OK
    const okBtn = this.page.locator('button.action-accept, button.action-primary.action-accept, button:has-text("OK")');
    if (await okBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await okBtn.first().click({ force: true });
    }

    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(2000);
  }
}
