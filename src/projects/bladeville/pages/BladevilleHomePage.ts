import { HomePage } from '../../../core/pages/HomePage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class BladevilleHomePage extends HomePage {
  // Bladeville uses standard Magento #search input
  protected get searchInput(): HealableLocator {
    return healable('Bladeville search input',
      '#search',
      'input[name="q"]',
      'input[placeholder*="Szukaj w sklepie"]',
      'input[placeholder*="Szukaj"]'
    );
  }

  protected get searchButton(): HealableLocator {
    return healable('Bladeville search button',
      'button.action.search',
      'button[title="Szukaj"]',
      '.block-search button[type="submit"]'
    );
  }

  protected get logo(): HealableLocator {
    return healable('Bladeville logo',
      'a.logo img',
      'a.logo',
      '.page-header .logo',
      'a[href="https://bladeville.pl/"] img'
    );
  }

  protected get cartIcon(): HealableLocator {
    return healable('Bladeville cart icon',
      'a[href*="checkout/cart"]',
      '.minicart-wrapper',
      '[data-block="minicart"]'
    );
  }

  protected get navigationMenu(): HealableLocator {
    return healable('Bladeville navigation menu',
      'nav.navigation',
      '.nav-sections',
      '.navigation'
    );
  }
}
