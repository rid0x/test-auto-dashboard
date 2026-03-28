import { createProjectFixture } from '../../core/fixtures/base.fixture';
import { ElakiernikLoginPage } from './pages/ElakiernikLoginPage';
import { ElakiernikRegistrationPage } from './pages/ElakiernikRegistrationPage';
import { ElakiernikHomePage } from './pages/ElakiernikHomePage';
import { ElakiernikSearchPage } from './pages/ElakiernikSearchPage';
import { ElakiernikCartPage } from './pages/ElakiernikCartPage';
import { ElakiernikCheckoutPage } from './pages/ElakiernikCheckoutPage';
import { ElakiernikProductPage } from './pages/ElakiernikProductPage';
import { ElakiernikCategoryPage } from './pages/ElakiernikCategoryPage';

export const test = createProjectFixture('elakiernik', {
  loginPage: ElakiernikLoginPage,
  registrationPage: ElakiernikRegistrationPage,
  homePage: ElakiernikHomePage,
  searchPage: ElakiernikSearchPage,
  cartPage: ElakiernikCartPage,
  checkoutPage: ElakiernikCheckoutPage,
  productPage: ElakiernikProductPage,
  categoryPage: ElakiernikCategoryPage,
});

export { expect } from '../../core/helpers/custom-expect';
