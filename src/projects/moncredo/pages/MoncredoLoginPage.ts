import { LoginPage } from '../../../core/pages/LoginPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class MoncredoLoginPage extends LoginPage {
  protected get loginButton(): HealableLocator {
    return healable('Login button',
      '#send2',
      'button.action.login.primary',
      'button:has-text("Zaloguj się")',
      'button.action.login'
    );
  }

  protected get loggedInIndicator(): HealableLocator {
    return healable('Logged in indicator',
      '.greet.welcome',
      '.customer-welcome',
      '.logged-in',
      '.header .welcome',
      '.page-title:has-text("Moje konto")'
    );
  }

  protected get forgotPasswordLink(): HealableLocator {
    return healable('Forgot password link',
      'a.action.remind',
      'a[href*="forgotpassword"]',
      'a:has-text("Nie pamiętasz hasła")'
    );
  }

  protected get createAccountLink(): HealableLocator {
    return healable('Create account link',
      'a.action.create.primary',
      'a[href*="customer/account/create"]',
      'a:has-text("Zarejestruj się")'
    );
  }
}
