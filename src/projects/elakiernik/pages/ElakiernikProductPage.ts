import { expect } from '@playwright/test';
import { ProductPage } from '../../../core/pages/ProductPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class ElakiernikProductPage extends ProductPage {
  protected get addToCartButton(): HealableLocator {
    return healable('Elakiernik add to cart',
      '#product-addtocart-button',
      'button:has-text("Dodaj do koszyka")',
      'button:has-text("Do koszyka")',
      'button.action.tocart'
    );
  }

  protected get quantityInput(): HealableLocator {
    return healable('Elakiernik qty input',
      '#qty',
      'input[name="qty"]',
      'input.qty'
    );
  }

  private async dismissCookiebot(): Promise<void> {
    try {
      const acceptBtn = this.page.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll, #CybotCookiebotDialogBodyButtonDecline');
      if (await acceptBtn.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await acceptBtn.first().click();
        await this.page.waitForTimeout(500);
      }
      // Force remove overlay
      await this.page.evaluate(() => {
        document.querySelectorAll('#CybotCookiebotDialog, #CybotCookiebotDialogBodyUnderlay, .CybotCookiebotDialogActive').forEach(el => el.remove());
      }).catch(() => {});
    } catch {}
  }

  async selectFirstAvailableOption(): Promise<void> {
    await this.dismissCookiebot();
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(1000);

    try {
      // Handle select-based options (e-lakiernik may have configurable products)
      const selects = this.page.locator('.product-options-wrapper select, select.super-attribute-select, select.product-custom-option');
      const count = await selects.count();
      for (let i = 0; i < count; i++) {
        const sel = selects.nth(i);
        if (await sel.isVisible().catch(() => false)) {
          const options = await sel.locator('option').evaluateAll(opts =>
            opts.filter(o => o.value && o.value !== '' && o.value !== '0' && !o.disabled).map(o => o.value)
          );
          if (options.length > 0) {
            await sel.selectOption(options[0]);
            await this.page.waitForTimeout(300);
          }
        }
      }
    } catch {}
  }

  async addToCart(): Promise<void> {
    await this.dismissCookiebot();
    await this.selectFirstAvailableOption();
    await this.dismissCookiebot();

    const btn = this.page.locator('#product-addtocart-button');
    await expect(btn).toBeEnabled({ timeout: 15000 });
    await btn.click({ force: true });
    await this.page.waitForTimeout(5000);
  }

  async expectAddToCartSuccess(): Promise<void> {
    await expect(async () => {
      const stdMsg = await this.page.locator('.message-success').first().isVisible().catch(() => false);
      const cartHasItems = await this.page.locator('.counter-number, .minicart-wrapper .counter, .counter.qty').first().textContent()
        .then(t => Number(t?.trim()) > 0).catch(() => false);
      expect(stdMsg || cartHasItems).toBeTruthy();
    }).toPass({
      intervals: [500, 1000, 2000],
      timeout: 15000,
    });
  }
}
