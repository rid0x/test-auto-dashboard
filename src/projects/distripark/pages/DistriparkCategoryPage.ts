import { CategoryPage } from '../../../core/pages/CategoryPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class DistriparkCategoryPage extends CategoryPage {
  // Distripark uses a "Filtry" button that opens a side panel

  protected get filterBlock(): HealableLocator {
    return healable('Distripark filter block',
      '.block.filter',
      '#layered-filter-block',
      '.sidebar-filter',
      '.filter-content'
    );
  }

  async expectFiltersVisible(): Promise<void> {
    // Distripark: click "Filtry" button to open filter panel
    const filtersBtn = this.page.locator('button.button-filters, button:has-text("Filtry")');
    if (await filtersBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await filtersBtn.click();
      await this.page.waitForTimeout(1000);
    }
    const filter = this.page.locator('.block.filter, #layered-filter-block, .filter-options');
    await filter.first().waitFor({ state: 'visible', timeout: 10000 });
  }

  async getFilterNames(): Promise<string[]> {
    // Open filter panel first
    const filtersBtn = this.page.locator('button.button-filters, button:has-text("Filtry")');
    if (await filtersBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await filtersBtn.click();
      await this.page.waitForTimeout(1000);
    }
    const titles = this.page.locator('.filter-options-title:visible');
    const count = await titles.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await titles.nth(i).textContent();
      if (text?.trim()) names.push(text.trim());
    }
    return names;
  }

  async clickFirstFilterOption(): Promise<void> {
    // Open filter panel
    const filtersBtn = this.page.locator('button.button-filters, button:has-text("Filtry")');
    if (await filtersBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await filtersBtn.click();
      await this.page.waitForTimeout(1000);
    }

    // Click first filter title to expand it
    const firstTitle = this.page.locator('.filter-options-title:visible').first();
    await firstTitle.click();
    await this.page.waitForTimeout(500);

    // Click first checkbox in the expanded filter (e.g., "Tak" for ADR)
    const checkbox = this.page.locator('.filter-options-content:visible input[type="checkbox"], input[data-bind*="is_selected"]').first();
    if (await checkbox.isVisible({ timeout: 3000 }).catch(() => false)) {
      await checkbox.click({ force: true });
      await this.page.waitForTimeout(500);
    }

    // Click "Zastosuj" button
    const applyBtn = this.page.locator('button:has-text("Zastosuj"), .action.apply, button.action.apply-filters');
    if (await applyBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await applyBtn.click();
      await this.page.waitForLoadState('load');
    } else {
      await this.page.waitForLoadState('load');
    }
  }
}
