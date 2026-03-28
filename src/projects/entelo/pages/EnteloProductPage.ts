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
      const swatchOptions = this.page.locator('.swatch-option:not(.disabled)');
      if (await swatchOptions.count() > 0) {
        await swatchOptions.first().click({ force: true });
        await this.page.waitForTimeout(1000);
      }
    } catch {}
  }

  async addToCart(): Promise<void> {
    await this.dismissCookiebot();
    await this.selectFirstAvailableOption();
    await this.dismissCookiebot();

    const btn = this.page.locator('#product-addtocart-button');
    await expect(btn).toBeEnabled({ timeout: 15000 });

    // Use AJAX submission via Playwright
    const responsePromise = this.page.waitForResponse(
      resp => resp.url().includes('checkout/cart/add') && resp.status() === 200,
      { timeout: 15000 }
    ).catch(() => null);

    await btn.click({ force: true });

    const resp = await responsePromise;
    if (resp) {
      // Wait for DOM to update after AJAX
      await this.page.waitForTimeout(3000);
    } else {
      // Page might have reloaded (non-AJAX submit)
      await this.page.waitForLoadState('load').catch(() => {});
      await this.page.waitForTimeout(3000);
    }
  }

  async expectAddToCartSuccess(): Promise<void> {
    await expect(async () => {
      const stdMsg = await this.page.locator('.message-success').first().isVisible().catch(() => false);
      const cartHasItems = await this.page.locator('.counter-number, .minicart-wrapper .counter, .counter.qty').first().textContent()
        .then(t => Number(t?.trim()) > 0).catch(() => false);
      expect(stdMsg || cartHasItems).toBeTruthy();
    }).toPass({
      intervals: [500, 1000, 2000, 3000],
      timeout: 20000,
    });
  }
}
