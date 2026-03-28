import { expect } from '@playwright/test';
import { LoginPage } from '../../../core/pages/LoginPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class ElakiernikLoginPage extends LoginPage {
  // e-lakiernik has TWO login forms (popup hidden + page visible) with duplicate IDs
  protected get emailInput(): HealableLocator {
    return healable('Elakiernik email input',
      'form[action*="loginPost"] #email',
      '#email',
      'input[name="login[username]"]'
    );
  }

  protected get passwordInput(): HealableLocator {
    return healable('Elakiernik password input',
      'form[action*="loginPost"] input[name="login[password]"]',
      '#pass',
      'input[name="login[password]"]'
    );
  }

  protected get loginButton(): HealableLocator {
    return healable('Elakiernik login button',
      'button.action.login.primary',
      'form[action*="loginPost"] button[type="submit"]',
      '#send2',
      'button:has-text("Zaloguj się")'
    );
  }

  protected get errorMessage(): HealableLocator {
    return healable('Elakiernik error message',
      '.message-error',
      '.page.messages .message-error',
      '[data-ui-id="message-error"]',
      '.messages .error-msg',
      '.message.error'
    );
  }

  protected get loggedInIndicator(): HealableLocator {
    return healable('Elakiernik logged in',
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
