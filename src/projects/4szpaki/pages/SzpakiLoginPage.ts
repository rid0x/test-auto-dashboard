import { expect } from '@playwright/test';
import { LoginPage } from '../../../core/pages/LoginPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class SzpakiLoginPage extends LoginPage {
  protected get loggedInIndicator(): HealableLocator {
    return healable('4szpaki logged in',
      ':has-text("Witamy Cię")',
      ':has-text("Cześć")',
      '.greet.welcome',
      '.customer-welcome'
    );
  }

  async expectLoginSuccess(): Promise<void> {
    await expect(this.page.getByText('Witamy Cię na swoim koncie')).toBeVisible({ timeout: 15000 });
  }
}
