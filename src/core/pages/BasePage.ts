import { Page, Locator, test, expect } from '@playwright/test';
import { findElement, HealableLocator } from '../helpers/auto-healing';
import { dismissCookiesIfPresent, setupSalesmanagoAutoDismiss } from '../helpers/cookie-consent';
import { ProjectConfig } from '../types/project.types';

export abstract class BasePage {
  constructor(
    protected page: Page,
    protected config: ProjectConfig
  ) {}

  async navigate(path: string = ''): Promise<void> {
    await this.page.goto(`${this.config.baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
    // Wait for body to be stable (no hard timeout — Playwright auto-waits)
    await this.page.locator('body').waitFor({ state: 'visible' });
    if (this.config.features.hasCookieConsent) {
      await dismissCookiesIfPresent(this.page, this.config.features.cookieConsentSelector);
    }
    // Auto-dismiss salesmanago popup (appears after 15-30s on some stores)
    setupSalesmanagoAutoDismiss(this.page);
  }

  async findWithHealing(locator: HealableLocator, options?: { timeout?: number }): Promise<Locator> {
    return findElement(this.page, locator, options);
  }

  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('load');
  }

  async screenshot(name: string): Promise<Buffer> {
    return this.page.screenshot({ path: `reports/screenshots/${name}.png`, fullPage: true });
  }

  async highlightAndScreenshot(element: Locator, label: string, color: string = '#00e676'): Promise<void> {
    try {
      await element.evaluate((el, c) => {
        el.style.setProperty('outline', `3px solid ${c}`, 'important');
        el.style.setProperty('outline-offset', '2px', 'important');
        el.style.setProperty('box-shadow', `0 0 10px ${c}80`, 'important');
      }, color);
      const screenshot = await this.page.screenshot();
      const status = color === '#ff1744' ? 'FAIL' : 'PASS';
      await test.info().attach(`${status}: ${label}`, { body: screenshot, contentType: 'image/png' });
      await element.evaluate((el) => {
        el.style.removeProperty('outline');
        el.style.removeProperty('outline-offset');
        el.style.removeProperty('box-shadow');
      });
    } catch {
      // Element detached or page navigated — take plain screenshot
      try {
        const screenshot = await this.page.screenshot();
        await test.info().attach(`FAIL: ${label} (element not found)`, { body: screenshot, contentType: 'image/png' });
      } catch {
        // Page gone — nothing to screenshot
      }
    }
  }

  async assertVisible(element: Locator, label: string): Promise<void> {
    try {
      await expect(element).toBeVisible();
      await this.highlightAndScreenshot(element, label, '#00e676');
    } catch (error) {
      await this.highlightAndScreenshot(element, label, '#ff1744');
      throw error;
    }
  }
}
