import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { healable, HealableLocator } from '../helpers/auto-healing';

export abstract class CategoryPage extends BasePage {
  protected get filterBlock(): HealableLocator {
    return healable('Filter block',
      '.block.filter',
      '.block-filter',
      '#layered-filter-block',
      '.sidebar-filter'
    );
  }

  protected get filterOptionTitles(): HealableLocator {
    return healable('Filter option titles',
      '.filter-options-title',
      '.filter-options-item .filter-options-title',
      '.layered-filter dt'
    );
  }

  protected get filterOptionItems(): HealableLocator {
    return healable('Filter option items',
      '.filter-options-item',
      '.filter-options .item'
    );
  }

  protected get activeFilters(): HealableLocator {
    return healable('Active filters',
      '.filter-current',
      '.active-filter',
      '.am-filter-items .active'
    );
  }

  protected get clearAllFilters(): HealableLocator {
    return healable('Clear all filters',
      '.filter-actions a',
      '.action.clear.filter-clear',
      'a:has-text("Wyczyść")',
      'a:has-text("Clear All")'
    );
  }

  protected get productItems(): HealableLocator {
    return healable('Product items',
      '.product-item',
      'li.product-item',
      '.products-grid .item',
      '.product-items .item'
    );
  }

  protected get productItemName(): HealableLocator {
    return healable('Product item name',
      '.product-item-name',
      '.product-item-link',
      '.product-name a'
    );
  }

  protected get productItemPrice(): HealableLocator {
    return healable('Product item price',
      '.price-box .price',
      '.product-item .price',
      '.price-final_price .price'
    );
  }

  protected get sortByDropdown(): HealableLocator {
    return healable('Sort by dropdown',
      '.sorter-options',
      'select#sorter',
      '.toolbar-sorter select',
      'select[data-role="sorter"]'
    );
  }

  protected get sortDirection(): HealableLocator {
    return healable('Sort direction toggle',
      '.sorter-action',
      'a.action.sorter-action',
      '.sort-desc, .sort-asc'
    );
  }

  protected get toolbarAmount(): HealableLocator {
    return healable('Toolbar product count',
      '.toolbar-amount',
      '.toolbar-number',
      '.search-result-count'
    );
  }

  protected get breadcrumbs(): HealableLocator {
    return healable('Breadcrumbs',
      '.breadcrumbs',
      '.breadcrumb',
      'nav[aria-label="breadcrumb"]',
      '.items.breadcrumbs'
    );
  }

  protected get categoryTitle(): HealableLocator {
    return healable('Category title',
      '.page-title span',
      'h1.page-title',
      '.category-view .page-title',
      '[data-ui-id="page-title-wrapper"]'
    );
  }

  async goto(categoryUrl: string): Promise<void> {
    await this.navigate(categoryUrl);
  }

  async expectProductsVisible(): Promise<void> {
    const items = await this.findWithHealing(this.productItems, { timeout: 15000 });
    await expect(items).toBeVisible();
  }

  async getProductCount(): Promise<number> {
    const items = this.page.locator('.product-item, li.product-item, .products-grid .item');
    return await items.count();
  }

  async expectMinProducts(min: number): Promise<void> {
    const count = await this.getProductCount();
    expect(count).toBeGreaterThanOrEqual(min);
  }

  async getFilterNames(): Promise<string[]> {
    const titles = this.page.locator('.filter-options-title:visible');
    const count = await titles.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await titles.nth(i).textContent();
      if (text?.trim()) names.push(text.trim());
    }
    return names;
  }

  async expectFiltersVisible(): Promise<void> {
    const filter = await this.findWithHealing(this.filterBlock, { timeout: 10000 });
    await expect(filter).toBeVisible();
  }

  async clickFirstFilterOption(): Promise<void> {
    // Open first filter accordion
    const firstTitle = this.page.locator('.filter-options-title:visible').first();
    await firstTitle.click();
    await this.page.waitForTimeout(500);

    // Click first option (link or checkbox) within the opened filter
    const firstOption = this.page.locator('.filter-options-content:visible a, .filter-options-content:visible .item a').first();
    await firstOption.click();
    await this.page.waitForLoadState('load');
  }

  async expectActiveFiltersVisible(): Promise<void> {
    const active = await this.findWithHealing(this.activeFilters, { timeout: 10000 });
    await expect(active).toBeVisible();
  }

  async clearFilters(): Promise<void> {
    const clearBtn = await this.findWithHealing(this.clearAllFilters);
    await clearBtn.click();
    await this.page.waitForLoadState('load');
  }

  async clickFirstProduct(): Promise<string> {
    const firstLink = this.page.locator('.product-item-link, .product-item-name a, .product-item a[href*=".html"]').first();
    const href = await firstLink.getAttribute('href') ?? '';
    await firstLink.click();
    await this.page.waitForLoadState('load');
    return href;
  }

  async changeSortOrder(): Promise<void> {
    try {
      const sorter = await this.findWithHealing(this.sortByDropdown, { timeout: 5000 });
      const options = sorter.locator('option');
      const count = await options.count();
      if (count > 1) {
        // Select second option (different from current)
        await sorter.selectOption({ index: 1 });
        await this.page.waitForLoadState('load');
      }
    } catch {
      // Sorting may not be available
    }
  }

  async expectBreadcrumbsVisible(): Promise<void> {
    const bc = await this.findWithHealing(this.breadcrumbs, { timeout: 10000 });
    await expect(bc).toBeVisible();
  }
}
