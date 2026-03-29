import { SearchPage } from '../../../core/pages/SearchPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class HulajnogimicroSearchPage extends SearchPage {
  // Hulajnogimicro has #search input hidden in header — uses cs-header-search
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
      '.cs-header-search__button',
      '.search-form button[type="submit"]'
    );
  }

  protected get searchSuggestions(): HealableLocator {
    return healable('Hulajnogimicro search suggestions',
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
