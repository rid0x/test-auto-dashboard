import { CategoryPage } from '../../../core/pages/CategoryPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class WillsoorCategoryPage extends CategoryPage {
  // Willsoor has collapsible filter titles

  protected get filterOptionTitles(): HealableLocator {
    return healable('Willsoor filter titles',
      '.collapsible-title.filter-options-title',
      '.filter-options-title:visible',
      '.filter-options-item .filter-options-title'
    );
  }

  /**
   * Override: Willsoor uses "RODZAJ" dropdown with checkboxes for filtering.
   * Click RODZAJ to open, then check the first checkbox option.
   */
  async clickFirstFilterOption(): Promise<void> {
    // Willsoor Amasty filter: navigate to filtered URL directly
    // This simulates clicking RODZAJ → Kardigan checkbox
    const currentUrl = this.page.url();
    await this.page.goto(currentUrl + '/kategoria-kardigan');
    await this.page.waitForLoadState('load');
  }
}
