import { CategoryPage } from '../../../core/pages/CategoryPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class HulajnogimicroCategoryPage extends CategoryPage {
  protected get productItems(): HealableLocator {
    return healable('Hulajnogimicro product items',
      '.product-item',
      'li.product-item',
      '.products-grid .item',
      '.cs-product-tile'
    );
  }

  protected get productItemName(): HealableLocator {
    return healable('Hulajnogimicro product item name',
      '.product-item-link',
      '.product-item-name',
      '.cs-product-tile__name a'
    );
  }

  protected get sortByDropdown(): HealableLocator {
    return healable('Hulajnogimicro sort dropdown',
      '.sorter-options',
      'select#sorter',
      '.toolbar-sorter select',
      'select[data-role="sorter"]'
    );
  }

  /**
   * Hulajnogimicro category pages use filter-options with clickable titles.
   */
  async clickFirstFilterOption(): Promise<void> {
    // Open first filter accordion
    const firstTitle = this.page.locator('.filter-options-title:visible').first();
    await firstTitle.click();
    // Wait for filter accordion content to expand
    await this.page.locator('.filter-options-content:visible').first().waitFor({ state: 'visible', timeout: 5000 });

    // Click first option within the opened filter
    const firstOption = this.page.locator('.filter-options-content:visible a, .filter-options-content:visible .item a').first();
    await firstOption.click();
    await this.page.waitForLoadState('load');
  }

  /**
   * Hulajnogimicro product links do NOT end with .html — they use clean URLs.
   */
  async clickFirstProduct(): Promise<string> {
    const firstLink = this.page.locator('.product-item-link, .product-item-name a, .product-item a').first();
    const href = await firstLink.getAttribute('href') ?? '';
    await firstLink.click();
    await this.page.waitForLoadState('load');
    return href;
  }
}
