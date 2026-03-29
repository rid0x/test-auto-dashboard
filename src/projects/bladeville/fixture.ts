import { createProjectFixture } from '../../core/fixtures/base.fixture';
import { BladevilleLoginPage } from './pages/BladevilleLoginPage';
import { BladevilleRegistrationPage } from './pages/BladevilleRegistrationPage';
import { BladevilleHomePage } from './pages/BladevilleHomePage';
import { BladevilleSearchPage } from './pages/BladevilleSearchPage';
import { BladevilleCartPage } from './pages/BladevilleCartPage';
import { BladevilleCheckoutPage } from './pages/BladevilleCheckoutPage';
import { BladevilleProductPage } from './pages/BladevilleProductPage';
import { BladevilleCategoryPage } from './pages/BladevilleCategoryPage';

export const test = createProjectFixture('bladeville', {
  loginPage: BladevilleLoginPage,
  registrationPage: BladevilleRegistrationPage,
  homePage: BladevilleHomePage,
  searchPage: BladevilleSearchPage,
  cartPage: BladevilleCartPage,
  checkoutPage: BladevilleCheckoutPage,
  productPage: BladevilleProductPage,
  categoryPage: BladevilleCategoryPage,
});

export { expect } from '../../core/helpers/custom-expect';
