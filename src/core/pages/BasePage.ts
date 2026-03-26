import { Page, Locator } from '@playwright/test';
import { findElement, HealableLocator } from '../helpers/auto-healing';
import { dismissCookiesIfPresent } from '../helpers/cookie-consent';
import { ProjectConfig } from '../types/project.types';

export abstract class BasePage {
  constructor(
    protected page: Page,
    protected config: ProjectConfig
  ) {}

  async navigate(path: string = ''): Promise<void> {
    await this.page.goto(`${this.config.baseUrl}${path}`, { waitUntil: 'load' });
    if (this.config.features.hasCookieConsent) {
      await dismissCookiesIfPresent(this.page, this.config.features.cookieConsentSelector);
    }
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
}
