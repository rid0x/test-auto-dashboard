import { expect } from '@playwright/test';
import { HomePage } from '../../../core/pages/HomePage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class HulajnogimicroHomePage extends HomePage {
  // Hulajnogimicro uses a hidden #search input in header (cs-header-search__input)
  // The search icon opens a search overlay — input is hidden by default
  protected get searchInput(): HealableLocator {
    return healable('Hulajnogimicro search input',
      '#search',
      'input.cs-header-search__input',
      'input[name="q"]',
      'input[placeholder*="Szukaj"]'
    );
  }

  /** The search icon/trigger that reveals the search input */
  protected get searchIcon(): HealableLocator {
    return healable('Hulajnogimicro search icon',
      'li:has-text("Szukaj")',
      '.cs-header__search',
      'img[alt="search"]'
    );
  }

  protected get searchButton(): HealableLocator {
    return healable('Hulajnogimicro search button',
      'button.cs-header-search__button',
      'button.action.search',
      'button[title="Szukaj"]'
    );
  }

  protected get logo(): HealableLocator {
    return healable('Hulajnogimicro logo',
      '.cs-logo__image',
      'img[alt*="Micro"]',
      '.cs-header__logo img',
      'a.logo'
    );
  }

  protected get cartIcon(): HealableLocator {
    return healable('Hulajnogimicro cart icon',
      'a[href*="checkout/cart"]',
      'a:has-text("Toggle offcanvas minicart")',
      '.minicart-wrapper',
      '.showcart'
    );
  }

  protected get navigationMenu(): HealableLocator {
    return healable('Hulajnogimicro navigation',
      'nav[aria-label="Main Navigation"]',
      'nav.cs-navigation',
      '.nav-sections',
      'nav.navigation'
    );
  }

  /**
   * On hulajnogimicro.pl the search input is hidden behind a search icon.
   * We verify the search icon is visible instead of the hidden input.
   */
  async expectSearchVisible(): Promise<void> {
    const el = await this.findWithHealing(this.searchIcon);
    await this.assertVisible(el, 'Search icon');
  }
}
