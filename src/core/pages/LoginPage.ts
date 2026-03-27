import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { healable, HealableLocator } from '../helpers/auto-healing';

export abstract class LoginPage extends BasePage {
  // Default Magento locators — override in project-specific pages if needed
  protected get emailInput(): HealableLocator {
    return healable('Email input',
      '#email',
      'input[name="login[username]"]',
      'input[type="email"]',
      'input[autocomplete="email"]'
    );
  }

  protected get passwordInput(): HealableLocator {
    return healable('Password input',
      '#pass',
      'input[name="login[password]"]',
      'input[type="password"]',
      'input[autocomplete="current-password"]'
    );
  }

  protected get loginButton(): HealableLocator {
    return healable('Login button',
      '#send2',
      'button[type="submit"]:has-text("Zaloguj")',
      'button[type="submit"]:has-text("Login")',
      'button.action.login',
      '.action.login.primary'
    );
  }

  protected get errorMessage(): HealableLocator {
    return healable('Error message',
      '.message-error',
      '[data-ui-id="message-error"]',
      '.messages .error-msg',
      '.page.messages .message.error'
    );
  }

  protected get loggedInIndicator(): HealableLocator {
    return healable('Logged in indicator',
      '.logged-in',
      '.greet.welcome',
      '.customer-welcome',
      '.header .welcome'
    );
  }

  async goto(): Promise<void> {
    await this.navigate('/customer/account/login/');
  }

  async login(email: string, password: string): Promise<void> {
    const emailEl = await this.findWithHealing(this.emailInput);
    await emailEl.fill(email);

    const passEl = await this.findWithHealing(this.passwordInput);
    await passEl.fill(password);

    const btn = await this.findWithHealing(this.loginButton);
    await btn.click();

    await this.page.waitForLoadState('load');
  }

  async loginWithValidCredentials(): Promise<void> {
    await this.login(this.config.credentials.valid.email, this.config.credentials.valid.password);
  }

  async loginWithInvalidCredentials(): Promise<void> {
    await this.login(this.config.credentials.invalid.email, this.config.credentials.invalid.password);
  }

  async expectLoginSuccess(): Promise<void> {
    const indicator = await this.findWithHealing(this.loggedInIndicator, { timeout: 10000 });
    await this.assertVisible(indicator, 'Logged in indicator');
  }

  async expectLoginError(): Promise<void> {
    const error = await this.findWithHealing(this.errorMessage, { timeout: 10000 });
    await this.assertVisible(error, 'Login error message');
  }

  async isOnLoginPage(): Promise<boolean> {
    return this.page.url().includes('/customer/account/login');
  }
}
