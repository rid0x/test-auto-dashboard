import { createProjectFixture } from '../../core/fixtures/base.fixture';
import { EnteloLoginPage } from './pages/EnteloLoginPage';
import { EnteloRegistrationPage } from './pages/EnteloRegistrationPage';
import { EnteloHomePage } from './pages/EnteloHomePage';
import { EnteloSearchPage } from './pages/EnteloSearchPage';
import { EnteloCartPage } from './pages/EnteloCartPage';
import { EnteloCheckoutPage } from './pages/EnteloCheckoutPage';
import { EnteloProductPage } from './pages/EnteloProductPage';
import { EnteloCategoryPage } from './pages/EnteloCategoryPage';

export const test = createProjectFixture('entelo', {
  loginPage: EnteloLoginPage,
  registrationPage: EnteloRegistrationPage,
  homePage: EnteloHomePage,
  searchPage: EnteloSearchPage,
  cartPage: EnteloCartPage,
  checkoutPage: EnteloCheckoutPage,
  productPage: EnteloProductPage,
  categoryPage: EnteloCategoryPage,
});

export { expect } from '../../core/helpers/custom-expect';
