import { LoginPage } from '../../../core/pages/LoginPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class BladevilleLoginPage extends LoginPage {
  protected get emailInput(): HealableLocator {
    return healable('Bladeville email input',
      'input[name="login[username]"]',
      '#email',
      'input[type="email"]'
    );
  }

  protected get passwordInput(): HealableLocator {
    return healable('Bladeville password input',
      'input[name="login[password]"]',
      '#pass',
      'input[type="password"]'
    );
  }

  protected get loginButton(): HealableLocator {
    return healable('Bladeville login button',
      'button.action.login.primary',
      'button.action.login',
      'button[type="submit"]:has-text("Zaloguj się")',
      '#send2'
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
      'a[href*="customer/account/create"]',
      '.action.create',
      'a:has-text("Utwórz konto")'
    );
  }
}
