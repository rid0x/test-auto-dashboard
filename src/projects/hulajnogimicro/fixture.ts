import { createProjectFixture } from '../../core/fixtures/base.fixture';
import { HulajnogimicroLoginPage } from './pages/HulajnogimicroLoginPage';
import { HulajnogimicroRegistrationPage } from './pages/HulajnogimicroRegistrationPage';
import { HulajnogimicroHomePage } from './pages/HulajnogimicroHomePage';
import { HulajnogimicroSearchPage } from './pages/HulajnogimicroSearchPage';
import { HulajnogimicroCartPage } from './pages/HulajnogimicroCartPage';
import { HulajnogimicroCheckoutPage } from './pages/HulajnogimicroCheckoutPage';
import { HulajnogimicroProductPage } from './pages/HulajnogimicroProductPage';
import { HulajnogimicroCategoryPage } from './pages/HulajnogimicroCategoryPage';

export const test = createProjectFixture('hulajnogimicro', {
  loginPage: HulajnogimicroLoginPage,
  registrationPage: HulajnogimicroRegistrationPage,
  homePage: HulajnogimicroHomePage,
  searchPage: HulajnogimicroSearchPage,
  cartPage: HulajnogimicroCartPage,
  checkoutPage: HulajnogimicroCheckoutPage,
  productPage: HulajnogimicroProductPage,
  categoryPage: HulajnogimicroCategoryPage,
});

export { expect } from '../../core/helpers/custom-expect';
