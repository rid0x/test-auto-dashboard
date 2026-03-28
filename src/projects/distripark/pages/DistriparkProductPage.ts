import { expect } from '@playwright/test';
import { ProductPage } from '../../../core/pages/ProductPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class DistriparkProductPage extends ProductPage {
  protected get addToCartButton(): HealableLocator {
    return healable('Distripark add to cart',
      '#product-addtocart-button',
      'button:has-text("Dodaj do koszyka")',
      'button.action.tocart.primary'
    );
  }

  private async dismissComplianz(): Promise<void> {
    try {
      const btn = this.page.locator('button:has-text("Akceptuj wszystko"), .cmplz-accept');
      if (await btn.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.first().click();
        await this.page.waitForTimeout(500);
      }
    } catch {}
  }

  async selectFirstAvailableOption(): Promise<void> {
    await this.dismissComplianz();
    await this.page.waitForTimeout(1000);

    try {
      const selects = this.page.locator('.product-options-wrapper select, select.super-attribute-select');
      for (let i = 0; i < await selects.count(); i++) {
        const sel = selects.nth(i);
        if (await sel.isVisible().catch(() => false)) {
          const opts = await sel.locator('option').evaluateAll(os =>
            os.filter(o => (o as HTMLOptionElement).value && (o as HTMLOptionElement).value !== '0' && (o as HTMLOptionElement).value !== '' && !(o as HTMLOptionElement).disabled).map(o => (o as HTMLOptionElement).value)
          );
          if (opts.length > 0) {
            await sel.selectOption(opts[0]);
            await this.page.waitForTimeout(500);
          }
        }
      }

      const attrs = this.page.locator('.swatch-attribute');
      for (let i = 0; i < await attrs.count(); i++) {
        const options = attrs.nth(i).locator('.swatch-option:not(.disabled)');
        if (await options.count() > 0) {
          await options.first().click({ force: true });
          await this.page.waitForTimeout(500);
        }
      }
    } catch {}
  }

  async addToCartWithOptions(qty: number = 1): Promise<void> {
    await this.dismissComplianz();
    await this.selectFirstAvailableOption();
    await this.page.evaluate((q) => {
      const input = document.querySelector('#qty') as HTMLInputElement;
      if (input) { input.value = q.toString(); }
    }, qty);
    await this.addToCart();
  }

  async addToCart(): Promise<void> {
    await this.dismissComplianz();

    // RequireJS catalogAddToCart may not initialize in headless.
    // Workaround: submit form data via in-page fetch.
    const formData = await this.page.evaluate(() => {
      const form = document.querySelector('#product_addtocart_form') as HTMLFormElement;
      if (!form) return null;
      const fd = new FormData(form);
      const data: Record<string, string> = {};
      fd.forEach((v, k) => { data[k] = v.toString(); });
      return { action: form.action, data };
    });

    if (formData) {
      await this.page.evaluate(async (fd: { action: string; data: Record<string, string> }) => {
        const params = new URLSearchParams(fd.data);
        await fetch(fd.action, {
          method: 'POST',
          body: params,
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
          credentials: 'same-origin',
        });
      }, formData);
      await this.page.waitForTimeout(1000);
    }
  }

  async expectAddToCartSuccess(): Promise<void> {
    // Navigate to cart and verify
    await this.page.goto(this.config.baseUrl + '/checkout/cart/', { waitUntil: 'networkidle' });
    await expect(
      this.page.locator('#shopping-cart-table, .cart.items, .cart-container .cart.item').first()
    ).toBeVisible({ timeout: 10000 });
  }
}
