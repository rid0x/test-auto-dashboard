import { createProjectFixture } from '../../core/fixtures/base.fixture';
import { TestowyLoginPage } from './pages/TestowyLoginPage';
import { TestowyRegistrationPage } from './pages/TestowyRegistrationPage';
import { TestowyHomePage } from './pages/TestowyHomePage';
import { TestowySearchPage } from './pages/TestowySearchPage';
import { TestowyProductPage } from './pages/TestowyProductPage';
import { TestowyCartPage } from './pages/TestowyCartPage';
import { TestowyCategoryPage } from './pages/TestowyCategoryPage';
import { TestowyCheckoutPage } from './pages/TestowyCheckoutPage';

export const test = createProjectFixture('testowy', {
  loginPage: TestowyLoginPage,
  registrationPage: TestowyRegistrationPage,
  homePage: TestowyHomePage,
  searchPage: TestowySearchPage,
  cartPage: TestowyCartPage,
  checkoutPage: TestowyCheckoutPage,
  productPage: TestowyProductPage,
  categoryPage: TestowyCategoryPage,
});

export { expect } from '../../core/helpers/custom-expect';
