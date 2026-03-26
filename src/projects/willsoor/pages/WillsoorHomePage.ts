import { HomePage } from '../../../core/pages/HomePage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class WillsoorHomePage extends HomePage {
  // Willsoor uses Amasty search — no #search ID exists
  protected get searchInput(): HealableLocator {
    return healable('Willsoor search input',
      '.amsearch-input',
      'input[name="q"]',
      'input[placeholder*="Szukaj"]',
      'input[placeholder*="Search"]'
    );
  }

  protected get searchButton(): HealableLocator {
    return healable('Willsoor search button',
      '.amsearch-button',
      'button[title="Szukaj"]',
      'button.action.search'
    );
  }

  protected get logo(): HealableLocator {
    return healable('Willsoor logo',
      '.page-header .logo',
      'a.logo',
      '.logo img'
    );
  }

  protected get cartIcon(): HealableLocator {
    return healable('Willsoor cart icon',
      '.minicart-wrapper .showcart',
      '.minicart-wrapper',
      'a[href*="checkout/cart"]',
      '.showcart'
    );
  }
}
