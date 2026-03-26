import { createProjectFixture } from '../../core/fixtures/base.fixture';
import { GetpriceLoginPage } from './pages/GetpriceLoginPage';
import { GetpriceRegistrationPage } from './pages/GetpriceRegistrationPage';
import { GetpriceHomePage } from './pages/GetpriceHomePage';
import { GetpriceSearchPage } from './pages/GetpriceSearchPage';
import { GetpriceCartPage } from './pages/GetpriceCartPage';
import { GetpriceCheckoutPage } from './pages/GetpriceCheckoutPage';
import { GetpriceProductPage } from './pages/GetpriceProductPage';
import { GetpriceCategoryPage } from './pages/GetpriceCategoryPage';

export const test = createProjectFixture('getprice', {
  loginPage: GetpriceLoginPage,
  registrationPage: GetpriceRegistrationPage,
  homePage: GetpriceHomePage,
  searchPage: GetpriceSearchPage,
  cartPage: GetpriceCartPage,
  checkoutPage: GetpriceCheckoutPage,
  productPage: GetpriceProductPage,
  categoryPage: GetpriceCategoryPage,
});

export { expect } from '@playwright/test';
