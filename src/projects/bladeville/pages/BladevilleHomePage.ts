import { HomePage } from '../../../core/pages/HomePage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class BladevilleHomePage extends HomePage {
  // Bladeville uses sidebar search panel - must open it first
  protected get searchInput(): HealableLocator {
    return healable('Bladeville search input',
      '#search',
      'input[name="q"]',
      'input[placeholder*="Szukaj"]'
    );
  }

  protected get logo(): HealableLocator {
    return healable('Bladeville logo',
      'a.navbar-logo',
      'div.navbar-logo',
      '.navbar-logo svg',
      'a[href="https://bladeville.pl/"]'
    );
  }

  protected get cartIcon(): HealableLocator {
    return healable('Bladeville cart icon',
      'a.js--show-minicart',
      'li.item-basket a',
      'a[href*="checkout/cart"]',
      '.minicart-wrapper'
    );
  }

  protected get navigationMenu(): HealableLocator {
    return healable('Bladeville navigation menu',
      '.navbar-menu',
      'aside#page-menu ul.menu',
      'nav.navigation'
    );
  }

  async expectSearchVisible(): Promise<void> {
    // Bladeville search is in sidebar - check trigger icon exists
    const searchTrigger = this.page.locator('.navbar-menu a[title="Szukaj"], .icon-search, #search');
    await this.assertVisible(searchTrigger, 'Search trigger');
  }
}
