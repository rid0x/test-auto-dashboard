import { SearchPage } from '../../../core/pages/SearchPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class AbazurSearchPage extends SearchPage {
  protected get searchInput(): HealableLocator {
    return healable('Abazur search input',
      '#search',
      'input#mobile_search',
      'input[name="q"]'
    );
  }
}
