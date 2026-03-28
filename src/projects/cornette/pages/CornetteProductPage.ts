import { expect } from '@playwright/test';
import { ProductPage } from '../../../core/pages/ProductPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class CornetteProductPage extends ProductPage {
  protected get productPrice(): HealableLocator {
    return healable('Cornette product price',
      '.price-wrapper[data-price-type="finalPrice"]',
      '.product-info-price .price-wrapper',
      '.price-box .price-wrapper',
      '[data-price-type="finalPrice"]'
    );
  }

  protected get addToCartButton(): HealableLocator {
    return healable('Cornette add to cart',
      '#product-addtocart-button',
      'button:has-text("Dodaj do koszyka")',
      'button.button.button-red'
    );
  }

  protected get quantityInput(): HealableLocator {
    return healable('Cornette qty input',
      '#custom-qty input',
      'input[name="qty"]',
      '#qty'
    );
  }

  /**
   * Force-remove CookieYes overlay that intercepts pointer events.
   */
  private async dismissCookieOverlay(): Promise<void> {
    await this.page.evaluate(() => {
      document.querySelectorAll('.cky-overlay, .cky-consent-container, .cky-consent-bar').forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });
    }).catch(() => {});

    const acceptBtn = this.page.locator('.cky-btn-accept, [data-cky-tag="accept-button"]').first();
    if (await acceptBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await acceptBtn.click().catch(() => {});
      await this.page.waitForTimeout(500);
    }

    // Final force-remove
    await this.page.evaluate(() => {
      document.querySelectorAll('.cky-overlay, .cky-consent-container, .cky-consent-bar').forEach(el => el.remove());
    }).catch(() => {});
  }

  async selectFirstAvailableOption(): Promise<void> {
    await this.dismissCookieOverlay();

    // Wait for page JS (RequireJS + Magento Swatches) to fully initialize
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(2000);

    // Try to find swatch options (JS-rendered by Magento_Swatches)
    try {
      const swatchExists = await this.page.locator('.swatch-option').first().isVisible({ timeout: 10000 }).catch(() => false);
      if (swatchExists) {
        await this.dismissCookieOverlay();
        const swatch = this.page.locator('.swatch-option:not(.disabled):not(.selected)').first();
        await swatch.click({ force: true });
        await this.page.waitForTimeout(1000);
      } else {
        // Fallback: try via JS evaluation
        const clicked = await this.page.evaluate(() => {
          const opt = document.querySelector('.swatch-option:not(.disabled)') as HTMLElement;
          if (opt) { opt.click(); return true; }
          return false;
        });
        if (clicked) await this.page.waitForTimeout(1000);
      }
    } catch {
      // Simple product - no swatches needed
    }
  }

  async addToCart(): Promise<void> {
    await this.dismissCookieOverlay();
    await this.selectFirstAvailableOption();
    await this.dismissCookieOverlay();

    const btn = this.page.locator('#product-addtocart-button');
    await expect(btn).toBeEnabled({ timeout: 15000 });
    await btn.click({ force: true });
    await this.page.waitForTimeout(5000);
  }

  async expectAddToCartSuccess(): Promise<void> {
    await expect(async () => {
      const stdMsg = await this.page.locator('.message-success').first().isVisible().catch(() => false);
      const cartHasItems = await this.page.locator('.counter-number, .minicart-wrapper .counter').first().textContent()
        .then(t => Number(t?.trim()) > 0).catch(() => false);
      expect(stdMsg || cartHasItems).toBeTruthy();
    }).toPass({
      intervals: [500, 1000, 2000],
      timeout: 15000,
    });
  }
}
