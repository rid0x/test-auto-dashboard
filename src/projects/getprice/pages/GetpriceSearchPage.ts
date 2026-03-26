import { SearchPage } from '../../../core/pages/SearchPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class GetpriceSearchPage extends SearchPage {
  // Getprice search may use Amasty or custom — search input is standard #search

  protected get searchSuggestions(): HealableLocator {
    return healable('Search suggestions',
      '#search_autocomplete',
      '.search-autocomplete',
      '.amsearch-results',
      '.autocomplete-suggestions'
    );
  }

  // Getprice search results may redirect differently
  async searchFromHeader(query: string): Promise<void> {
    const input = await this.findWithHealing(this.searchInput);
    await input.fill(query);
    await this.page.keyboard.press('Enter');
    // Getprice may redirect — wait for navigation
    await this.page.waitForLoadState('load');
    await this.page.locator('.product-item').first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  }
}
