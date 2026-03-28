import { SearchPage } from '../../../core/pages/SearchPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class MoncredoSearchPage extends SearchPage {
  protected get searchInput(): HealableLocator {
    return healable('Search input',
      '#search',
      'input.cs-header-search__input',
      'input[name="q"]',
      'input[placeholder*="Jakiego produktu szukasz"]'
    );
  }

  protected get searchButton(): HealableLocator {
    return healable('Search button',
      '.cs-header-search__button',
      '#search_mini_form button',
      'button.action.search',
      'button[title="Szukaj"]'
    );
  }

  protected get searchSuggestions(): HealableLocator {
    return healable('Search suggestions dropdown',
      '#search_autocomplete',
      '.cs-autocomplete',
      '.search-autocomplete',
      '.cs-header-search__autocomplete'
    );
  }

  protected get searchResults(): HealableLocator {
    return healable('Search results list',
      '.search.results',
      '.products.wrapper',
      '.products-grid',
      '.cs-page-category__products-wrapper'
    );
  }

  protected get productItems(): HealableLocator {
    return healable('Product items in results',
      '.product-items .product-item-info',
      '.product-item-link',
      '.cs-product-tile',
      'li.product-item'
    );
  }
}
