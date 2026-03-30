import { ProductPage } from '../../../core/pages/ProductPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';
import { setupPbPopupAutoDismiss } from '../../../core/helpers/cookie-consent';

export class PieceofcaseProductPage extends ProductPage {
  protected get successMessage(): HealableLocator {
    return healable('Add to cart success message',
      'text=Produkt dodany do koszyka',
      '.message-success',
      '[data-ui-id="message-success"]'
    );
  }

  protected get productPrice(): HealableLocator {
    return healable('Product price',
      '[data-price-type="finalPrice"]',
      '.price-wrapper',
      '.price-box .price',
      'span.price'
    );
  }

  async navigate(path: string = ''): Promise<void> {
    // Block GetResponse popup scripts to prevent iframe overlay on product page
    await this.page.route(url => url.hostname.includes('gr-cdn.com'), route => route.abort()).catch(() => {});
    await super.navigate(path);
    await setupPbPopupAutoDismiss(this.page);
  }

  async setQuantity(qty: number): Promise<void> {
    if (qty === 1) return; // Default is already 1, skip
    // Pieceofcase uses +/- buttons instead of standard #qty input
    const input = this.page.locator('input[type="number"], input.qty, input[name="qty"]').first();
    if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
      await input.fill(qty.toString());
    }
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
