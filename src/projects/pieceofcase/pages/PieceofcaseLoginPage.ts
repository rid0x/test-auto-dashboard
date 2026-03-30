import { LoginPage } from '../../../core/pages/LoginPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';
import { setupPbPopupAutoDismiss } from '../../../core/helpers/cookie-consent';

export class PieceofcaseLoginPage extends LoginPage {
  protected get loginButton(): HealableLocator {
    return healable('Login button',
      'button:has-text("Zaloguj się"):visible',
      '#send2:visible',
      'button.action.login:visible',
      'button[type="submit"]:visible:has-text("Zaloguj")'
    );
  }

  protected get loggedInIndicator(): HealableLocator {
    return healable('Logged in indicator',
      '.page-title:has-text("Moje konto")',
      '.customer-account-index',
      '.block-dashboard-info',
      '.greet.welcome',
      '.customer-welcome'
    );
  }

  async navigate(path: string = ''): Promise<void> {
    await super.navigate(path);
    await setupPbPopupAutoDismiss(this.page);
  }
}
