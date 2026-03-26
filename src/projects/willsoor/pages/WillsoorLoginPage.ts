import { LoginPage } from '../../../core/pages/LoginPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class WillsoorLoginPage extends LoginPage {
  // Willsoor has TWO login forms (popup + page form).
  // Target the visible page form specifically to avoid ambiguity.

  protected get emailInput(): HealableLocator {
    return healable('Willsoor email input',
      'input[name="login[username]"]',
      '.login-container #email',
      '#email'
    );
  }

  protected get passwordInput(): HealableLocator {
    return healable('Willsoor password input',
      'input[name="login[password]"]',
      '.login-container #pass',
      '#pass'
    );
  }

  protected get loginButton(): HealableLocator {
    // #send2 is hidden in the popup form — use button.action.login.primary for the page form
    return healable('Willsoor login button',
      'button.action.login.primary',
      'button.action.login',
      '.login-container button[type="submit"]',
      'button[type="submit"]:has-text("Zaloguj się")',
      'button[type="submit"]:has-text("Zaloguj")'
    );
  }

  protected get forgotPasswordLink(): HealableLocator {
    return healable('Forgot password link',
      'a[href*="forgotpassword"]',
      '.action.remind',
      ':has-text("Nie pamiętasz hasła")'
    );
  }

  protected get createAccountLink(): HealableLocator {
    return healable('Create account link',
      'a:has-text("Załóż darmowe konto")',
      '.action.create',
      'a[href*="customer/account/create"]'
    );
  }
}
