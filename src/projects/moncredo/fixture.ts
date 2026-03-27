import { createProjectFixture } from '../../core/fixtures/base.fixture';
import { MoncredoLoginPage } from './pages/MoncredoLoginPage';
import { MoncredoRegistrationPage } from './pages/MoncredoRegistrationPage';
import { MoncredoHomePage } from './pages/MoncredoHomePage';
import { MoncredoSearchPage } from './pages/MoncredoSearchPage';
import { MoncredoCartPage } from './pages/MoncredoCartPage';
import { MoncredoCheckoutPage } from './pages/MoncredoCheckoutPage';
import { MoncredoProductPage } from './pages/MoncredoProductPage';
import { MoncredoCategoryPage } from './pages/MoncredoCategoryPage';

export const test = createProjectFixture('moncredo', {
  loginPage: MoncredoLoginPage,
  registrationPage: MoncredoRegistrationPage,
  homePage: MoncredoHomePage,
  searchPage: MoncredoSearchPage,
  cartPage: MoncredoCartPage,
  checkoutPage: MoncredoCheckoutPage,
  productPage: MoncredoProductPage,
  categoryPage: MoncredoCategoryPage,
});

export { expect } from '../../core/helpers/custom-expect';
