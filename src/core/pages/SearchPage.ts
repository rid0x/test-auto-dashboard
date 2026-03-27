import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { healable, HealableLocator } from '../helpers/auto-healing';

export abstract class SearchPage extends BasePage {
  protected get searchInput(): HealableLocator {
    return healable('Search input',
      '#search',
      'input[name="q"]',
      '.search-field input',
      'input[placeholder*="Szukaj"]'
    );
  }

  protected get searchButton(): HealableLocator {
    return healable('Search button',
      'button.action.search',
      'button[title="Szukaj"]',
      'button[title="Search"]',
      '.search-form button[type="submit"]'
    );
  }

  protected get searchResults(): HealableLocator {
    return healable('Search results list',
      '.search.results',
      '.search-result-list',
      '#search-result-list',
      '.products.wrapper'
    );
  }

  protected get productItems(): HealableLocator {
    return healable('Product items in results',
      '.product-item',
      '.product-items .item',
      '.products-grid .product-item',
      'li.product-item'
    );
  }

  protected get noResultsMessage(): HealableLocator {
    return healable('No results message',
      '.message.notice',
      '.search.no-results',
      ':has-text("brak wyników")',
      ':has-text("no results")'
    );
  }

  protected get searchSuggestions(): HealableLocator {
    return healable('Search suggestions dropdown',
      '#search_autocomplete',
      '.search-autocomplete',
      '.autocomplete-suggestions'
    );
  }

  async searchFor(query: string): Promise<void> {
    const input = await this.findWithHealing(this.searchInput);
    await input.fill(query);
    const btn = await this.findWithHealing(this.searchButton);
    await btn.click();
    await this.page.waitForLoadState('load');
  }

  async searchFromHeader(query: string): Promise<void> {
    const input = await this.findWithHealing(this.searchInput);
    await input.fill(query);
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('load');
  }

  async getResultCount(): Promise<number> {
    try {
      const items = this.page.locator('.product-item, .product-items .item');
      return await items.count();
    } catch {
      return 0;
    }
  }

  async expectResultsVisible(): Promise<void> {
    const results = await this.findWithHealing(this.searchResults, { timeout: 10000 });
    await this.assertVisible(results, 'Search results');
  }

  async expectNoResults(): Promise<void> {
    const msg = await this.findWithHealing(this.noResultsMessage, { timeout: 10000 });
    await this.assertVisible(msg, 'No results message');
  }

  async expectMinResults(min: number): Promise<void> {
    const count = await this.getResultCount();
    expect(count).toBeGreaterThanOrEqual(min);
  }
}
