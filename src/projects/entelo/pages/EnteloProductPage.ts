import { expect } from '@playwright/test';
import { ProductPage } from '../../../core/pages/ProductPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class EnteloProductPage extends ProductPage {
  protected get productPrice(): HealableLocator {
    return healable('Entelo product price',
      '.product-info-price .price-wrapper',
      '.product-info-price .price',
      '.price-box .price-wrapper',
      '.price-box .price',
      '[data-price-type="finalPrice"] .price-wrapper',
      '.price-final_price .price',
      '.product-info-main .price'
    );
  }

  protected get addToCartButton(): HealableLocator {
    return healable('Entelo add to cart',
      '#product-addtocart-button',
      'button:has-text("Dodaj do koszyka")',
      'button.action.tocart.primary',
      'button.tocart'
    );
  }

  private async dismissCookiebot(): Promise<void> {
    try {
      const btn = this.page.locator('#CookiebotDialogBodyLevelButtonLevelOptinAllowAll');
      if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await btn.click();
        await this.page.waitForTimeout(500);
      }
      await this.page.evaluate(() => {
        document.querySelectorAll('#CybotCookiebotDialog, #CybotCookiebotDialogBodyUnderlay, .CybotCookiebotDialogActive').forEach(e => (e as HTMLElement).style.display = 'none');
      }).catch(() => {});
    } catch {}
  }

  async selectFirstAvailableOption(): Promise<void> {
    await this.dismissCookiebot();
    await this.page.waitForTimeout(1000);

    try {
      // Entelo products have MULTIPLE swatch attributes (e.g., door color + body color)
      const attributes = this.page.locator('.swatch-attribute');
      const attrCount = await attributes.count();

      for (let i = 0; i < attrCount; i++) {
        const attr = attributes.nth(i);
        const options = attr.locator('.swatch-option:not(.disabled)');
        if (await options.count() > 0) {
          await this.dismissCookiebot();
          await options.first().click({ force: true });
          await this.page.waitForTimeout(1000);
        }
      }
    } catch {}
  }

  async addToCartWithOptions(qty: number = 1): Promise<void> {
    await this.dismissCookiebot();
    await this.selectFirstAvailableOption();

    // Set qty via JS
    await this.page.evaluate((q) => {
      const input = document.querySelector('#qty') as HTMLInputElement;
      if (input) { input.value = q.toString(); }
    }, qty);

    await this.addToCart();
  }

  async addToCart(): Promise<void> {
    await this.dismissCookiebot();

    // Entelo's RequireJS catalogAddToCart widget doesn't work in headless.
    // Workaround: submit form data via in-page fetch (uses page cookies/session).
    const formData = await this.page.evaluate(() => {
      const form = document.querySelector('#product_addtocart_form') as HTMLFormElement;
      if (!form) return null;
      const fd = new FormData(form);
      const data: Record<string, string> = {};
      fd.forEach((v, k) => { data[k] = v.toString(); });
      return { action: form.action, data };
    });

    if (formData) {
      // POST via in-page fetch (shares cookies)
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
    // Navigate to cart page and verify items
    await this.page.goto(this.config.baseUrl + '/checkout/cart/', { waitUntil: 'networkidle' });
    await expect(
      this.page.locator('#shopping-cart-table, .cart.items, .cart-container .cart.item').first()
    ).toBeVisible({ timeout: 10000 });
  }
}
