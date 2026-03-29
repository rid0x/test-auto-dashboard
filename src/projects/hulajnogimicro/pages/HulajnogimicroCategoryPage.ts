import { CategoryPage } from '../../../core/pages/CategoryPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class HulajnogimicroCategoryPage extends CategoryPage {
  protected get productItems(): HealableLocator {
    return healable('Hulajnogimicro product items',
      '.cs-product-tile',
      '.cs-grid-layout__brick',
      '.product-item',
      'li.product-item'
    );
  }

  protected get productItemName(): HealableLocator {
    return healable('Hulajnogimicro product item name',
      '.product-item-link',
      '.cs-product-tile__name a',
      '.product-item-name'
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
   * Override product count to use hulajnogimicro-specific selectors.
   */
  async getProductCount(): Promise<number> {
    const items = this.page.locator('.cs-product-tile, .cs-grid-layout__brick');
    return await items.count();
  }

  /**
   * Hulajnogimicro category pages use filter-options with clickable titles.
   * Filters are below the product grid. The "Kolor" filter (index 2) has
   * color swatch links that trigger a page redirect via JS POST.
   * Must scroll into view before clicking because filters are below viewport.
   */
  async clickFirstFilterOption(): Promise<void> {
    // Use the "Kolor" filter item which has clickable swatch links
    const kolorItem = this.page.locator('.filter-options-item').nth(2);
    const kolorTitle = kolorItem.locator('.filter-options-title');

    // Scroll into view first — filters are below the product grid
    await kolorTitle.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
    await kolorTitle.click();
    await this.page.waitForTimeout(1500);

    // Click first color link within the expanded filter content
    const kolorContent = kolorItem.locator('.filter-options-content');
    const isVisible = await kolorContent.isVisible().catch(() => false);

    if (!isVisible) {
      // Retry: scroll and click again (sometimes first click doesn't register)
      await kolorTitle.scrollIntoViewIfNeeded();
      await kolorTitle.click();
      await this.page.waitForTimeout(1500);
    }

    await kolorContent.waitFor({ state: 'visible', timeout: 10000 });

    const firstColorLink = kolorContent.locator('a').first();
    await firstColorLink.click();
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(1000);
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
