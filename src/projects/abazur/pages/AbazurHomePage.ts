import { HomePage } from '../../../core/pages/HomePage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class AbazurHomePage extends HomePage {
  protected get searchInput(): HealableLocator {
    return healable('Abazur search input',
      '#search',
      'input#mobile_search',
      'input[name="q"]',
      '.minisearch input[type="text"]'
    );
  }
}
