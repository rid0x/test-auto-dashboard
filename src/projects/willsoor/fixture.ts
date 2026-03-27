import { createProjectFixture } from '../../core/fixtures/base.fixture';
import { WillsoorLoginPage } from './pages/WillsoorLoginPage';
import { WillsoorRegistrationPage } from './pages/WillsoorRegistrationPage';
import { WillsoorHomePage } from './pages/WillsoorHomePage';
import { WillsoorSearchPage } from './pages/WillsoorSearchPage';
import { WillsoorCartPage } from './pages/WillsoorCartPage';
import { WillsoorCheckoutPage } from './pages/WillsoorCheckoutPage';
import { WillsoorProductPage } from './pages/WillsoorProductPage';
import { WillsoorCategoryPage } from './pages/WillsoorCategoryPage';

export const test = createProjectFixture('willsoor', {
  loginPage: WillsoorLoginPage,
  registrationPage: WillsoorRegistrationPage,
  homePage: WillsoorHomePage,
  searchPage: WillsoorSearchPage,
  cartPage: WillsoorCartPage,
  checkoutPage: WillsoorCheckoutPage,
  productPage: WillsoorProductPage,
  categoryPage: WillsoorCategoryPage,
});

export { expect } from '../../core/helpers/custom-expect';
