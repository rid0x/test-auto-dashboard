import { createProjectFixture } from '../../core/fixtures/base.fixture';
import { DistriparkLoginPage } from './pages/DistriparkLoginPage';
import { DistriparkRegistrationPage } from './pages/DistriparkRegistrationPage';
import { DistriparkHomePage } from './pages/DistriparkHomePage';
import { DistriparkSearchPage } from './pages/DistriparkSearchPage';
import { DistriparkCartPage } from './pages/DistriparkCartPage';
import { DistriparkCheckoutPage } from './pages/DistriparkCheckoutPage';
import { DistriparkProductPage } from './pages/DistriparkProductPage';
import { DistriparkCategoryPage } from './pages/DistriparkCategoryPage';

export const test = createProjectFixture('distripark', {
  loginPage: DistriparkLoginPage,
  registrationPage: DistriparkRegistrationPage,
  homePage: DistriparkHomePage,
  searchPage: DistriparkSearchPage,
  cartPage: DistriparkCartPage,
  checkoutPage: DistriparkCheckoutPage,
  productPage: DistriparkProductPage,
  categoryPage: DistriparkCategoryPage,
});

export { expect } from '../../core/helpers/custom-expect';
