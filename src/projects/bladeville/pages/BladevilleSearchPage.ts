import { SearchPage } from '../../../core/pages/SearchPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class BladevilleSearchPage extends SearchPage {
  // Bladeville uses standard Magento search with #search
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

  protected get searchSuggestions(): HealableLocator {
    return healable('Bladeville search suggestions',
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
