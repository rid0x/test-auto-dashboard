import { createProjectFixture } from '../../core/fixtures/base.fixture';
import { SzpakiLoginPage } from './pages/SzpakiLoginPage';
import { SzpakiRegistrationPage } from './pages/SzpakiRegistrationPage';
import { SzpakiHomePage } from './pages/SzpakiHomePage';
import { SzpakiSearchPage } from './pages/SzpakiSearchPage';
import { SzpakiCartPage } from './pages/SzpakiCartPage';
import { SzpakiCheckoutPage } from './pages/SzpakiCheckoutPage';
import { SzpakiProductPage } from './pages/SzpakiProductPage';
import { SzpakiCategoryPage } from './pages/SzpakiCategoryPage';

export const test = createProjectFixture('4szpaki', {
  loginPage: SzpakiLoginPage,
  registrationPage: SzpakiRegistrationPage,
  homePage: SzpakiHomePage,
  searchPage: SzpakiSearchPage,
  cartPage: SzpakiCartPage,
  checkoutPage: SzpakiCheckoutPage,
  productPage: SzpakiProductPage,
  categoryPage: SzpakiCategoryPage,
});

export { expect } from '@playwright/test';
