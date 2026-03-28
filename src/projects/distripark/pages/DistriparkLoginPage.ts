import { expect } from '@playwright/test';
import { LoginPage } from '../../../core/pages/LoginPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class DistriparkLoginPage extends LoginPage {
  // Distripark HAS dual login forms:
  // Hidden: form[action*="/login/"] with #email(hidden), #pass(hidden), #send2(hidden)
  // Visible: form[action*="loginPost"] with #email(vis), #password(vis), #send2(vis)

  protected get emailInput(): HealableLocator {
    return healable('Distripark email input',
      'form[action*="loginPost"] #email',
      'form[action*="loginPost"] input[name="login[username]"]',
      '#email'
    );
  }

  protected get passwordInput(): HealableLocator {
    return healable('Distripark password input',
      '#password',
      'form[action*="loginPost"] input[type="password"]',
      'input[name="login[password]"]'
    );
  }

  protected get loginButton(): HealableLocator {
    return healable('Distripark login button',
      'form[action*="loginPost"] #send2',
      'form[action*="loginPost"] button[type="submit"]',
      'button.action.login.primary',
      'button:has-text("Zaloguj się")'
    );
  }

  protected get loggedInIndicator(): HealableLocator {
    return healable('Distripark logged in',
      '.block.account-nav',
      '.greet.welcome',
      '.page-title:has-text("Moje konto")',
      '.customer-welcome',
      ':has-text("Dane konta")'
    );
  }

  async expectLoginSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(/customer\/account/, { timeout: 15000 });
  }
}
