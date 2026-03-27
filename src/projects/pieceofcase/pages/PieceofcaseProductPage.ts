import { ProductPage } from '../../../core/pages/ProductPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class PieceofcaseProductPage extends ProductPage {
  protected get productPrice(): HealableLocator {
    return healable('Product price',
      '[data-price-type="finalPrice"]',
      '.price-wrapper',
      '.price-box .price',
      'span.price'
    );
  }

  async navigate(path: string = ''): Promise<void> {
    await super.navigate(path);
    // Force-remove cookie overlay + any popup overlays
    await this.page.evaluate(() => {
      document.querySelectorAll('[id^="__pb"]').forEach(el => el.remove());
      document.querySelectorAll('[data-gr="popup-container"]').forEach(el => el.remove());
    }).catch(() => {});
    await this.page.addStyleTag({
      content: '[data-gr="popup-container"] { display: none !important; pointer-events: none !important; }'
    }).catch(() => {});
  }

  async selectFirstAvailableOption(): Promise<void> {
    // Pieceofcase uses dependent <select> dropdowns for configurable products
    // e.g., select#attribute215 (Marka) → select#attribute217 (Model)
    // Selecting the first triggers AJAX that populates the second
    const selects = this.page.locator('select.super-attribute-select');
    const count = await selects.count();
    if (count === 0) return; // Simple product

    for (let i = 0; i < count; i++) {
      const select = selects.nth(i);
      await select.waitFor({ state: 'visible', timeout: 5000 });

      // Wait for real options to load (index 0 is always the placeholder)
      await this.page.waitForFunction(
        (idx: number) => {
          const els = document.querySelectorAll('select.super-attribute-select');
          const el = els[idx] as HTMLSelectElement;
          return el && el.options.length > 1;
        },
        i,
        { timeout: 10000 }
      );

      // Select the first non-placeholder option
      const options = select.locator('option:not([value=""])');
      const firstValue = await options.first().getAttribute('value');
      if (firstValue) {
        await select.selectOption(firstValue);
        // Wait for dependent dropdown to populate via AJAX
        await this.page.waitForLoadState('networkidle').catch(() => {});
      }
    }
  }
}
