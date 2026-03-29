import { LoginPage } from '../../../core/pages/LoginPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class HulajnogimicroLoginPage extends LoginPage {
  protected get emailInput(): HealableLocator {
    return healable('Hulajnogimicro email input',
      'input[name="login[username]"]',
      '#email',
      'input[type="email"]'
    );
  }

  protected get passwordInput(): HealableLocator {
    return healable('Hulajnogimicro password input',
      'input[name="login[password]"]',
      '#pass',
      'input[type="password"]'
    );
  }

  protected get loginButton(): HealableLocator {
    return healable('Hulajnogimicro login button',
      'button:has-text("Zaloguj się")',
      'button.action.login',
      '#send2',
      'button[type="submit"]'
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
      'a:has-text("Utwórz konto")',
      '.action.create'
    );
  }
}
