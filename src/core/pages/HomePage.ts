import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { healable, HealableLocator } from '../helpers/auto-healing';

export abstract class HomePage extends BasePage {
  protected get logo(): HealableLocator {
    return healable('Logo',
      '.logo img',
      'a.logo',
      '.header .logo',
      '[data-role="logo"]'
    );
  }

  protected get searchInput(): HealableLocator {
    return healable('Search input',
      '#search',
      'input[name="q"]',
      '.search-field input',
      'input[placeholder*="Szukaj"]',
      'input[placeholder*="Search"]'
    );
  }

  protected get cartIcon(): HealableLocator {
    return healable('Cart icon',
      '.minicart-wrapper .action.showcart',
      '.minicart-wrapper',
      'a[href*="checkout/cart"]',
      '.showcart'
    );
  }

  protected get navigationMenu(): HealableLocator {
    return healable('Navigation menu',
      '.nav-sections',
      'nav.navigation',
      '#store\\.menu',
      '.menu-items'
    );
  }

  protected get heroSlider(): HealableLocator {
    return healable('Hero slider/banner',
      '.widget.slider',
      '.home-slider',
      '.pagebuilder-slide-wrapper',
      '.banner-slider',
      '.slick-slider'
    );
  }

  async goto(): Promise<void> {
    await this.navigate('/');
  }

  async expectLogoVisible(): Promise<void> {
    const el = await this.findWithHealing(this.logo);
    await this.assertVisible(el, 'Logo');
  }

  async expectSearchVisible(): Promise<void> {
    const el = await this.findWithHealing(this.searchInput);
    await this.assertVisible(el, 'Search input');
  }

  async expectNavigationVisible(): Promise<void> {
    const el = await this.findWithHealing(this.navigationMenu);
    await this.assertVisible(el, 'Navigation menu');
  }

  async expectCartIconVisible(): Promise<void> {
    const el = await this.findWithHealing(this.cartIcon);
    await this.assertVisible(el, 'Cart icon');
  }

  async getNavigationLinks(): Promise<string[]> {
    const nav = await this.findWithHealing(this.navigationMenu);
    return nav.locator('a').allInnerTexts();
  }
}
