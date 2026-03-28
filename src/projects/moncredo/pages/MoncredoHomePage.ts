import { HomePage } from '../../../core/pages/HomePage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class MoncredoHomePage extends HomePage {
  protected get logo(): HealableLocator {
    return healable('Logo',
      'a.logo .cs-logo__image',
      'a.logo',
      '.cs-header__logo .logo',
      '.logo img'
    );
  }

  protected get searchInput(): HealableLocator {
    return healable('Search input',
      '#search',
      'input.cs-header-search__input',
      'input[name="q"]',
      'input[placeholder*="Jakiego produktu szukasz"]'
    );
  }

  protected get cartIcon(): HealableLocator {
    return healable('Cart icon',
      'a.cs-addtocart__minicart-link',
      '.minicart-wrapper',
      'a[href*="checkout/cart"]',
      '.cs-header-user-nav__item--cart'
    );
  }

  protected get navigationMenu(): HealableLocator {
    return healable('Navigation menu',
      '.cs-navigation',
      '.cs-navigation__list',
      'nav.cs-navigation',
      '.cs-container--navigation'
    );
  }

  async getNavigationLinks(): Promise<string[]> {
    const nav = await this.findWithHealing(this.navigationMenu);
    return nav.locator('a').allInnerTexts();
  }
}
