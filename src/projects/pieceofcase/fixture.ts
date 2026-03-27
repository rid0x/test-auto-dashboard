import { createProjectFixture } from '../../core/fixtures/base.fixture';
import { PieceofcaseLoginPage } from './pages/PieceofcaseLoginPage';
import { PieceofcaseRegistrationPage } from './pages/PieceofcaseRegistrationPage';
import { PieceofcaseHomePage } from './pages/PieceofcaseHomePage';
import { PieceofcaseSearchPage } from './pages/PieceofcaseSearchPage';
import { PieceofcaseCartPage } from './pages/PieceofcaseCartPage';
import { PieceofcaseCheckoutPage } from './pages/PieceofcaseCheckoutPage';
import { PieceofcaseProductPage } from './pages/PieceofcaseProductPage';
import { PieceofcaseCategoryPage } from './pages/PieceofcaseCategoryPage';

export const test = createProjectFixture('pieceofcase', {
  loginPage: PieceofcaseLoginPage,
  registrationPage: PieceofcaseRegistrationPage,
  homePage: PieceofcaseHomePage,
  searchPage: PieceofcaseSearchPage,
  cartPage: PieceofcaseCartPage,
  checkoutPage: PieceofcaseCheckoutPage,
  productPage: PieceofcaseProductPage,
  categoryPage: PieceofcaseCategoryPage,
});

export { expect } from '../../core/helpers/custom-expect';
