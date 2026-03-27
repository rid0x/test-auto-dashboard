import { LoginPage } from '../../../core/pages/LoginPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class PieceofcaseLoginPage extends LoginPage {
  protected get loginButton(): HealableLocator {
    return healable('Login button',
      'button:has-text("Zaloguj się")',
      '#send2',
      'button[type="submit"]',
      'button.action.login'
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
    await this.page.evaluate(() => document.querySelectorAll('[id^="__pb"]').forEach(el => el.remove())).catch(() => {});
  }
}
