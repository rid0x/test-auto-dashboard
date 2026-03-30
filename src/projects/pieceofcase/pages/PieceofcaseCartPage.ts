import { CartPage } from '../../../core/pages/CartPage';
import { setupPbPopupAutoDismiss } from '../../../core/helpers/cookie-consent';

export class PieceofcaseCartPage extends CartPage {
  async navigate(path: string = ''): Promise<void> {
    await super.navigate(path);
    await setupPbPopupAutoDismiss(this.page);
  }

  private async dismissOverlays(): Promise<void> {
    await this.page.evaluate(() => {
      document.querySelectorAll('[data-gr="popup-container"], [id^="__pb"]:not(.cookie-status-message), [role="dialog"][aria-label="Popup"]').forEach(el => el.remove());
    }).catch(() => {});
  }

  async goto(): Promise<void> {
    await this.navigate('/pl/checkout/cart/');
  }

  async proceedToCheckout(): Promise<void> {
    await this.dismissOverlays();
    const btn = await this.findWithHealing(this.proceedToCheckoutButton);
    await btn.click();
    await this.page.waitForLoadState('load');
  }

  async removeFirstItem(): Promise<void> {
    await this.dismissOverlays();

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
