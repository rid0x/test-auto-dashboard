import { expect } from '@playwright/test';
import { LoginPage } from '../../../core/pages/LoginPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class GetpriceLoginPage extends LoginPage {
  // Getprice uses custom Tailwind-based frontend, not standard Magento Luma

  protected get loginButton(): HealableLocator {
    return healable('Getprice login button',
      'button.btn.btn-primary:has-text("Zaloguj")',
      'button[name="send"][type="submit"]',
      'form button[type="submit"]'
    );
  }

  protected get errorMessage(): HealableLocator {
    return healable('Error message',
      '.page.messages .message.error',
      '.message-error',
      '[data-ui-id="message-error"]',
      '[role="alert"]'
    );
  }

  protected get loggedInIndicator(): HealableLocator {
    return healable('Logged in indicator',
      'a:has-text("Wyloguj")',
      '.account-nav',
      '.block.account-nav',
      'a[href*="logout"]'
    );
  }

  async expectLoginSuccess(): Promise<void> {
    // Getprice redirects to /customer/account/ after login
    await this.page.waitForURL('**/customer/account/**', { timeout: 15000 });
    const indicator = await this.findWithHealing(this.loggedInIndicator, { timeout: 10000 });
    await expect(indicator).toBeVisible();
  }
}
