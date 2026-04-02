import { createProjectFixture } from '../../core/fixtures/base.fixture';
import { SzklaneczkiLoginPage } from './pages/SzklaneczkiLoginPage';
import { SzklaneczkiRegistrationPage } from './pages/SzklaneczkiRegistrationPage';
import { SzklaneczkiHomePage } from './pages/SzklaneczkiHomePage';
import { SzklaneczkiSearchPage } from './pages/SzklaneczkiSearchPage';
import { SzklaneczkiProductPage } from './pages/SzklaneczkiProductPage';
import { SzklaneczkiCartPage } from './pages/SzklaneczkiCartPage';
import { SzklaneczkiCategoryPage } from './pages/SzklaneczkiCategoryPage';
import { SzklaneczkiCheckoutPage } from './pages/SzklaneczkiCheckoutPage';

export const test = createProjectFixture('szklaneczki', {
  loginPage: SzklaneczkiLoginPage,
  registrationPage: SzklaneczkiRegistrationPage,
  homePage: SzklaneczkiHomePage,
  searchPage: SzklaneczkiSearchPage,
  cartPage: SzklaneczkiCartPage,
  checkoutPage: SzklaneczkiCheckoutPage,
  productPage: SzklaneczkiProductPage,
  categoryPage: SzklaneczkiCategoryPage,
});

export { expect } from '../../core/helpers/custom-expect';
