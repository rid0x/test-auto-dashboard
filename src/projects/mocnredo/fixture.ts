import { createProjectFixture } from '../../core/fixtures/base.fixture';
import { MocnredoLoginPage } from './pages/MocnredoLoginPage';
import { MocnredoRegistrationPage } from './pages/MocnredoRegistrationPage';
import { MocnredoHomePage } from './pages/MocnredoHomePage';
import { MocnredoSearchPage } from './pages/MocnredoSearchPage';
import { MocnredoCartPage } from './pages/MocnredoCartPage';
import { MocnredoCheckoutPage } from './pages/MocnredoCheckoutPage';
import { MocnredoProductPage } from './pages/MocnredoProductPage';
import { MocnredoCategoryPage } from './pages/MocnredoCategoryPage';

export const test = createProjectFixture('mocnredo', {
  loginPage: MocnredoLoginPage,
  registrationPage: MocnredoRegistrationPage,
  homePage: MocnredoHomePage,
  searchPage: MocnredoSearchPage,
  cartPage: MocnredoCartPage,
  checkoutPage: MocnredoCheckoutPage,
  productPage: MocnredoProductPage,
  categoryPage: MocnredoCategoryPage,
});

export { expect } from '@playwright/test';
