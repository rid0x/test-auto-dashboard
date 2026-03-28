import { expect } from '@playwright/test';
import { LoginPage } from '../../../core/pages/LoginPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class AbazurLoginPage extends LoginPage {
  protected get loggedInIndicator(): HealableLocator {
    return healable('Abazur logged in',
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
