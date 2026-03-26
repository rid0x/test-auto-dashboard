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
}
