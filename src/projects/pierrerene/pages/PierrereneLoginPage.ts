import { expect } from '@playwright/test';
import { LoginPage } from '../../../core/pages/LoginPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class PierrereneLoginPage extends LoginPage {
  protected get loginButton(): HealableLocator {
    return healable('Pierrerene login button',
      '#bnt-social-login-authentication',
      'button#send2',
      'button.action.login.primary',
      'button:has-text("Zaloguj")',
      '#login-form button[type="submit"]'
    );
  }

  protected get loggedInIndicator(): HealableLocator {
    return healable('Pierrerene logged in',
      '.greet.welcome',
      ':has-text("Witaj")',
      '.customer-welcome',
      '.page-title:has-text("Moje konto")'
    );
  }

  async goto(): Promise<void> {
    await this.navigate('/pl/customer/account/login/');
  }

  async expectLoginSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(/customer\/account/, { timeout: 15000 });
  }
}
