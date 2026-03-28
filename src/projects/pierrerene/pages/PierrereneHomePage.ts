import { HomePage } from '../../../core/pages/HomePage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class PierrereneHomePage extends HomePage {
  protected get searchInput(): HealableLocator {
    return healable('Pierrerene search input',
      '.js-search-input',
      '#search',
      'input[name="q"]',
      '.minisearch input[type="text"]'
    );
  }

  async goto(): Promise<void> {
    await this.navigate('/pl/');
  }
}
