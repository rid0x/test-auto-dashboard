import { expect } from '@playwright/test';
import { LoginPage } from '../../../core/pages/LoginPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class DistriparkLoginPage extends LoginPage {
  // Distripark has TWO login forms (popup hidden + page visible)
  // Visible form uses #password (not #pass) and button.action.login.primary

  protected get passwordInput(): HealableLocator {
    return healable('Distripark password input',
      '#password',
      'form[action*="loginPost"] input[type="password"]',
      'input[name="login[password]"]',
      '#pass'
    );
  }

  protected get loginButton(): HealableLocator {
    return healable('Distripark login button',
      'button.action.login.primary',
      'form[action*="loginPost"] button[type="submit"]',
      'button:has-text("Zaloguj się")',
      '#send2'
    );
  }

  protected get loggedInIndicator(): HealableLocator {
    return healable('Distripark logged in',
      '.greet.welcome',
      ':has-text("Witaj")',
      '.customer-welcome',
      '.page-title:has-text("Moje konto")'
    );
  }

  async expectLoginSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(/customer\/account/, { timeout: 15000 });
  }
}
