import { createProjectFixture } from '../../core/fixtures/base.fixture';
import { PierrereneLoginPage } from './pages/PierrereneLoginPage';
import { PierrereneRegistrationPage } from './pages/PierrereneRegistrationPage';
import { PierrereneHomePage } from './pages/PierrereneHomePage';
import { PierrereneSearchPage } from './pages/PierrereneSearchPage';
import { PierrereneCartPage } from './pages/PierrereneCartPage';
import { PierrereneCheckoutPage } from './pages/PierrereneCheckoutPage';
import { PierrereneProductPage } from './pages/PierrereneProductPage';
import { PierrereneCategoryPage } from './pages/PierrereneCategoryPage';

export const test = createProjectFixture('pierrerene', {
  loginPage: PierrereneLoginPage,
  registrationPage: PierrereneRegistrationPage,
  homePage: PierrereneHomePage,
  searchPage: PierrereneSearchPage,
  cartPage: PierrereneCartPage,
  checkoutPage: PierrereneCheckoutPage,
  productPage: PierrereneProductPage,
  categoryPage: PierrereneCategoryPage,
});

export { expect } from '../../core/helpers/custom-expect';
