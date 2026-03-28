import { expect } from '@playwright/test';
import { LoginPage } from '../../../core/pages/LoginPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class EnteloLoginPage extends LoginPage {
  // Entelo has TWO login forms - popup (hidden) and main page (visible)
  // The visible form uses #password instead of #pass, and button.action.login.primary

  protected get emailInput(): HealableLocator {
    return healable('Entelo email input',
      'form[action*="loginPost"] #email',
      '#email',
      'input[name="login[username]"]'
    );
  }

  protected get passwordInput(): HealableLocator {
    return healable('Entelo password input',
      '#password',
      'form[action*="loginPost"] input[type="password"]',
      'input[name="login[password]"]',
      '#pass'
    );
  }

  protected get loginButton(): HealableLocator {
    return healable('Entelo login button',
      'button.action.login.primary',
      'form[action*="loginPost"] button[type="submit"]',
      'button:has-text("Zaloguj się")',
      '#send2'
    );
  }

  protected get loggedInIndicator(): HealableLocator {
    return healable('Entelo logged in',
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
