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
}
