import { CategoryPage } from '../../../core/pages/CategoryPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class GetpriceCategoryPage extends CategoryPage {
  // Getprice has Amasty-style filters with custom Tailwind UI

  protected get filterBlock(): HealableLocator {
    return healable('Getprice filter block',
      '.block-filter',
      '.block.filter',
      '[class*="block-filter"]'
    );
  }

  protected get sortByDropdown(): HealableLocator {
    return healable('Getprice sort dropdown',
      '.sorter-options',
      '.toolbar-sorter select',
      'select[data-role="sorter"]'
    );
  }

  protected get sortDirection(): HealableLocator {
    return healable('Getprice sort direction',
      '.action.sorter-action',
      'a.sort-asc, a.sort-desc'
    );
  }
}
