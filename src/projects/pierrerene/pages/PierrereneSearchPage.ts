import { SearchPage } from '../../../core/pages/SearchPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class PierrereneSearchPage extends SearchPage {
  protected get searchInput(): HealableLocator {
    return healable('Pierrerene search input',
      '.js-search-input',
      '#search',
      'input[name="q"]'
    );
  }
}
