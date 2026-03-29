import { CategoryPage } from '../../../core/pages/CategoryPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class BladevilleCategoryPage extends CategoryPage {
  protected get filterOptionTitles(): HealableLocator {
    return healable('Bladeville filter titles',
      '.filter-options-title',
      '.filter-options-item .filter-options-title',
      '.block-filter .filter-options-title'
    );
  }

  protected get productItems(): HealableLocator {
    return healable('Bladeville product items',
      '.product-item',
      'li.product-item',
      '.products-grid .product-item',
      '.product-items .item'
    );
  }

  protected get sortByDropdown(): HealableLocator {
    return healable('Bladeville sort dropdown',
      '.sorter-options',
      'select#sorter',
      '.toolbar-sorter select',
      'select[data-role="sorter"]'
    );
  }

  /**
   * Click the first filter option to filter products.
   */
  async clickFirstFilterOption(): Promise<void> {
    // Open first filter accordion
    const firstTitle = this.page.locator('.filter-options-title:visible').first();
    await firstTitle.click();
    // Wait for filter accordion content to expand
    await this.page.locator('.filter-options-content:visible').first().waitFor({ state: 'visible', timeout: 5000 });

    // Click first option link within the opened filter
    const firstOption = this.page.locator('.filter-options-content:visible a, .filter-options-content:visible .item a').first();
    await firstOption.click();
    await this.page.waitForLoadState('load');
  }
}
