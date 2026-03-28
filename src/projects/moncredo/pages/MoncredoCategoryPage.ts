import { CategoryPage } from '../../../core/pages/CategoryPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class MoncredoCategoryPage extends CategoryPage {
  protected get breadcrumbs(): HealableLocator {
    return healable('Breadcrumbs',
      '.cs-breadcrumbs',
      '.breadcrumbs',
      'nav[aria-label="breadcrumb"]'
    );
  }

  protected get filterBlock(): HealableLocator {
    return healable('Filter block',
      '#layered-filter-block',
      '.cs-aftersearch-nav',
      '.block.filter',
      '.cs-page-category__sidebar'
    );
  }

  protected get filterOptionTitles(): HealableLocator {
    return healable('Filter option titles',
      '.cs-aftersearch-nav__filter-title',
      '.filter-options-title',
      '.filter-options-item .filter-options-title'
    );
  }

  protected get productItems(): HealableLocator {
    return healable('Product items',
      '.product-items .product-item-info',
      '.cs-product-tile',
      '.product-item-link',
      'li.product-item',
      '.product-item'
    );
  }

  protected get sortByDropdown(): HealableLocator {
    return healable('Sort by dropdown',
      'select#sorter',
      '.sorter-options',
      '.cs-sorter__select',
      'select[data-role="sorter"]'
    );
  }

  protected get toolbarAmount(): HealableLocator {
    return healable('Toolbar product count',
      '.toolbar-amount',
      '.toolbar-number',
      '.cs-toolbar .toolbar-amount'
    );
  }

  async getProductCount(): Promise<number> {
    // Moncredo uses product-item-info inside product-items list
    const items = this.page.locator('.product-items .product-item-info, .product-item-link, li.product-item');
    return await items.count();
  }

  async getFilterNames(): Promise<string[]> {
    // Moncredo uses cs-aftersearch-nav filter structure
    const titles = this.page.locator('.cs-aftersearch-nav__filter-title:visible, .filter-options-title:visible');
    const count = await titles.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await titles.nth(i).textContent();
      if (text?.trim()) names.push(text.trim());
    }
    return names;
  }

  async clickFirstFilterOption(): Promise<void> {
    // Moncredo filters: click a filter link inside the filter content
    const filterLinks = this.page.locator('.cs-aftersearch-nav__filter-content a, .filter-options-content a').first();
    if (await filterLinks.isVisible({ timeout: 5000 }).catch(() => false)) {
      await filterLinks.click();
      await this.page.waitForLoadState('load');
    }
  }

  async clickFirstProduct(): Promise<string> {
    const firstLink = this.page.locator('.product-item-link, .cs-product-tile__name-link, a[href*=".html"]').first();
    const href = await firstLink.getAttribute('href') ?? '';
    await firstLink.click();
    await this.page.waitForLoadState('load');
    return href;
  }
}
