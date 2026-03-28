import { createProjectFixture } from '../../core/fixtures/base.fixture';
import { CornetteLoginPage } from './pages/CornetteLoginPage';
import { CornetteRegistrationPage } from './pages/CornetteRegistrationPage';
import { CornetteHomePage } from './pages/CornetteHomePage';
import { CornetteSearchPage } from './pages/CornetteSearchPage';
import { CornetteCartPage } from './pages/CornetteCartPage';
import { CornetteCheckoutPage } from './pages/CornetteCheckoutPage';
import { CornetteProductPage } from './pages/CornetteProductPage';
import { CornetteCategoryPage } from './pages/CornetteCategoryPage';

export const test = createProjectFixture('cornette', {
  loginPage: CornetteLoginPage,
  registrationPage: CornetteRegistrationPage,
  homePage: CornetteHomePage,
  searchPage: CornetteSearchPage,
  cartPage: CornetteCartPage,
  checkoutPage: CornetteCheckoutPage,
  productPage: CornetteProductPage,
  categoryPage: CornetteCategoryPage,
});

export { expect } from '../../core/helpers/custom-expect';
