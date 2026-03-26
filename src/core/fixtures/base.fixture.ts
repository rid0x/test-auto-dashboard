import { test as base } from '@playwright/test';
import { ProjectConfig, ProjectName } from '../types/project.types';
import { getProjectConfig, getActiveProject } from '../../../config';

// Import all page types (will be extended per project)
import { LoginPage } from '../pages/LoginPage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { HomePage } from '../pages/HomePage';
import { SearchPage } from '../pages/SearchPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { ProductPage } from '../pages/ProductPage';
import { CategoryPage } from '../pages/CategoryPage';

export interface ProjectPages {
  loginPage: LoginPage;
  registrationPage: RegistrationPage;
  homePage: HomePage;
  searchPage: SearchPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  productPage: ProductPage;
  categoryPage: CategoryPage;
  config: ProjectConfig;
  projectName: ProjectName;
}

/**
 * Creates a project-specific test fixture.
 * Each project calls this with its own page implementations.
 */
export function createProjectFixture(
  projectName: ProjectName,
  pageFactories: {
    loginPage: new (page: any, config: ProjectConfig) => LoginPage;
    registrationPage: new (page: any, config: ProjectConfig) => RegistrationPage;
    homePage: new (page: any, config: ProjectConfig) => HomePage;
    searchPage: new (page: any, config: ProjectConfig) => SearchPage;
    cartPage: new (page: any, config: ProjectConfig) => CartPage;
    checkoutPage: new (page: any, config: ProjectConfig) => CheckoutPage;
    productPage: new (page: any, config: ProjectConfig) => ProductPage;
    categoryPage: new (page: any, config: ProjectConfig) => CategoryPage;
  }
) {
  const config = getProjectConfig(projectName);

  return base.extend<ProjectPages>({
    config: async ({}, use) => {
      await use(config);
    },

    projectName: async ({}, use) => {
      await use(projectName);
    },

    loginPage: async ({ page }, use) => {
      await use(new pageFactories.loginPage(page, config));
    },

    registrationPage: async ({ page }, use) => {
      await use(new pageFactories.registrationPage(page, config));
    },

    homePage: async ({ page }, use) => {
      await use(new pageFactories.homePage(page, config));
    },

    searchPage: async ({ page }, use) => {
      await use(new pageFactories.searchPage(page, config));
    },

    cartPage: async ({ page }, use) => {
      await use(new pageFactories.cartPage(page, config));
    },

    checkoutPage: async ({ page }, use) => {
      await use(new pageFactories.checkoutPage(page, config));
    },

    productPage: async ({ page }, use) => {
      await use(new pageFactories.productPage(page, config));
    },

    categoryPage: async ({ page }, use) => {
      await use(new pageFactories.categoryPage(page, config));
    },
  });
}
