import { createProjectFixture } from '../../core/fixtures/base.fixture';
import { AbazurLoginPage } from './pages/AbazurLoginPage';
import { AbazurRegistrationPage } from './pages/AbazurRegistrationPage';
import { AbazurHomePage } from './pages/AbazurHomePage';
import { AbazurSearchPage } from './pages/AbazurSearchPage';
import { AbazurCartPage } from './pages/AbazurCartPage';
import { AbazurCheckoutPage } from './pages/AbazurCheckoutPage';
import { AbazurProductPage } from './pages/AbazurProductPage';
import { AbazurCategoryPage } from './pages/AbazurCategoryPage';

export const test = createProjectFixture('abazur', {
  loginPage: AbazurLoginPage,
  registrationPage: AbazurRegistrationPage,
  homePage: AbazurHomePage,
  searchPage: AbazurSearchPage,
  cartPage: AbazurCartPage,
  checkoutPage: AbazurCheckoutPage,
  productPage: AbazurProductPage,
  categoryPage: AbazurCategoryPage,
});

export { expect } from '../../core/helpers/custom-expect';
