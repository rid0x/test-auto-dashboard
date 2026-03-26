import { SearchPage } from '../../../core/pages/SearchPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class WillsoorSearchPage extends SearchPage {
  // Willsoor uses Amasty search — no #search ID exists
  protected get searchInput(): HealableLocator {
    return healable('Willsoor search input',
      '.amsearch-input',
      'input[name="q"]',
      'input[placeholder*="Szukaj"]'
    );
  }

  protected get searchButton(): HealableLocator {
    return healable('Willsoor search button',
      '.amsearch-button',
      'button[title="Szukaj"]',
      'button.action.search',
      '.search-form button[type="submit"]'
    );
  }

  protected get searchSuggestions(): HealableLocator {
    return healable('Willsoor search suggestions',
      '.amsearch-results',
      '#search_autocomplete',
      '.search-autocomplete',
      '.autocomplete-suggestions'
    );
  }

  protected get searchResults(): HealableLocator {
    return healable('Search results list',
      '.search.results',
      '.products-grid',
      '.products.wrapper'
    );
  }

  protected get productItems(): HealableLocator {
    return healable('Product items in results',
      '.product-item',
      '.products-grid .product-item',
      'li.product-item',
      '.product-items .item'
    );
  }
}
