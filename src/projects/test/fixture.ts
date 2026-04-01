import { createProjectFixture } from '../../core/fixtures/base.fixture';
import { TestLoginPage } from './pages/TestLoginPage';
import { TestRegistrationPage } from './pages/TestRegistrationPage';
import { TestHomePage } from './pages/TestHomePage';
import { TestSearchPage } from './pages/TestSearchPage';
import { TestProductPage } from './pages/TestProductPage';
import { TestCartPage } from './pages/TestCartPage';
import { TestCategoryPage } from './pages/TestCategoryPage';
import { TestCheckoutPage } from './pages/TestCheckoutPage';

export const test = createProjectFixture('test', {
  loginPage: TestLoginPage,
  registrationPage: TestRegistrationPage,
  homePage: TestHomePage,
  searchPage: TestSearchPage,
  cartPage: TestCartPage,
  checkoutPage: TestCheckoutPage,
  productPage: TestProductPage,
  categoryPage: TestCategoryPage,
});

export { expect } from '../../core/helpers/custom-expect';
