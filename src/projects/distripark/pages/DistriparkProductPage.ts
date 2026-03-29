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
      // Distripark uses radio buttons for packaging options (e.g., 25kg, 300kg, 1000kg)
      // Click the radio input directly, then trigger change for Knockout
      const radioInputs = this.page.locator('input.super-attribute-radio, input[id*="product-option"]');
      if (await radioInputs.count() > 0) {
        await radioInputs.first().check({ force: true });
        await this.page.waitForTimeout(500);
        // Also trigger via JS for Knockout
        await radioInputs.first().evaluate((el: HTMLInputElement) => {
          el.checked = true;
          el.dispatchEvent(new Event('change', { bubbles: true }));
          el.dispatchEvent(new Event('click', { bubbles: true }));
        });
        await this.page.waitForTimeout(1000);
        return;
      }

      // Fallback: swatch options
      const attrs = this.page.locator('.swatch-attribute');
      for (let i = 0; i < await attrs.count(); i++) {
        const options = attrs.nth(i).locator('.swatch-option:not(.disabled)');
        if (await options.count() > 0) {
          await options.first().click({ force: true });
          await this.page.waitForTimeout(500);
        }
      }

      // Fallback: select dropdowns
      const selects = this.page.locator('select.super-attribute-select, .product-options-wrapper select');
      for (let i = 0; i < await selects.count(); i++) {
        const sel = selects.nth(i);
        if (await sel.isVisible().catch(() => false)) {
          const opts = await sel.locator('option').evaluateAll(os =>
            os.filter(o => (o as HTMLOptionElement).value && (o as HTMLOptionElement).value !== '0' && (o as HTMLOptionElement).value !== '' && !(o as HTMLOptionElement).disabled).map(o => (o as HTMLOptionElement).value)
          );
          if (opts.length > 0) await sel.selectOption(opts[0]);
        }
      }
    } catch {}
  }

  async addToCartWithOptions(qty: number = 1): Promise<void> {
    await this.dismissComplianz();
    await this.selectFirstAvailableOption();
    await this.page.evaluate((q) => {
      const input = document.querySelector('#qty') as HTMLInputElement;
      if (input) input.value = q.toString();
    }, qty);
    await this.addToCart();
  }

  async addToCart(): Promise<void> {
    await this.dismissComplianz();

    // Distripark RequireJS may not initialize in headless - use in-page fetch
    // Manually ensure the first radio option is selected in the form
    const formData = await this.page.evaluate(() => {
      const form = document.querySelector('#product_addtocart_form') as HTMLFormElement;
      if (!form) return null;

      // Force-select the first radio option if none is checked
      const radios = form.querySelectorAll<HTMLInputElement>('input.super-attribute-radio, input[name*="super_attribute"]');
      let hasCheckedRadio = false;
      radios.forEach(r => { if (r.checked) hasCheckedRadio = true; });
      if (!hasCheckedRadio && radios.length > 0) {
        radios[0].checked = true;
      }

      const fd = new FormData(form);
      const data: Record<string, string> = {};
      fd.forEach((v, k) => { data[k] = v.toString(); });

      // Double-check: ensure super_attribute is present
      if (!Object.keys(data).some(k => k.startsWith('super_attribute'))) {
        const firstRadio = radios[0];
        if (firstRadio) {
          data[firstRadio.name] = firstRadio.value;
        }
      }

      return { action: form.action, data };
    });

    if (formData) {
      await this.page.evaluate(async (fd: { action: string; data: Record<string, string> }) => {
        const params = new URLSearchParams(fd.data);
        await fetch(fd.action, {
          method: 'POST', body: params,
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
          credentials: 'same-origin',
        });
      }, formData);
      await this.page.waitForTimeout(1000);
    }
  }

  async expectAddToCartSuccess(): Promise<void> {
    await this.page.goto(this.config.baseUrl + '/checkout/cart/', { waitUntil: 'networkidle' });
    await expect(
      this.page.locator('#shopping-cart-table, .cart.items').first()
    ).toBeVisible({ timeout: 10000 });
  }
}
