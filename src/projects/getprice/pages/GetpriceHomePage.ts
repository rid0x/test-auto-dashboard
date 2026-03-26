import { HomePage } from '../../../core/pages/HomePage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class GetpriceHomePage extends HomePage {
  // Getprice uses custom Tailwind frontend — different selectors than standard Magento

  protected get logo(): HealableLocator {
    return healable('Getprice logo',
      '.header-second-bar a[href*="/"] img',
      'header a img',
      '.page-header a img'
    );
  }

  protected get searchInput(): HealableLocator {
    return healable('Search input',
      '#search',
      'input[name="q"]',
      '#search_mini_form input'
    );
  }

  protected get cartIcon(): HealableLocator {
    return healable('Cart icon',
      '#menu-cart-icon',
      'button[title="Koszyk"]',
      '#cart-drawer',
      '.minicart-section'
    );
  }

  protected get navigationMenu(): HealableLocator {
    return healable('Navigation menu',
      '.header-third-bar .navigation',
      '.header-third-bar',
      'nav.navigation'
    );
  }

  protected get heroSlider(): HealableLocator {
    return healable('Hero slider',
      '.homepage-top-slider-section',
      '.swiper',
      '.homepage-top-banner',
      '[class*="slider"]'
    );
  }

  async goto(): Promise<void> {
    // Getprice redirects / to /pl/
    await this.navigate('/');
  }
}
