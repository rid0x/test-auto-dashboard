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

  protected get searchButton(): HealableLocator {
    return healable('Hulajnogimicro search button',
      'button.action.search',
      'button[title="Szukaj"]',
      '.cs-header-search__button'
    );
  }

  protected get logo(): HealableLocator {
    return healable('Hulajnogimicro logo',
      'img[alt*="Micro"]',
      '.page-header img',
      'header img',
      'a.logo'
    );
  }

  protected get cartIcon(): HealableLocator {
    return healable('Hulajnogimicro cart icon',
      'a[href*="checkout/cart"]',
      '.minicart-wrapper',
      'a:has-text("Toggle offcanvas minicart")',
      '.showcart'
    );
  }

  protected get navigationMenu(): HealableLocator {
    return healable('Hulajnogimicro navigation',
      '.nav-sections',
      'nav.navigation',
      'nav[aria-label="Main Navigation"]',
      '.navigation'
    );
  }
}
