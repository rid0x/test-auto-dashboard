import { expect } from '@playwright/test';
import { RegistrationPage } from '../../../core/pages/RegistrationPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class GetpriceRegistrationPage extends RegistrationPage {
  protected get submitButton(): HealableLocator {
    return healable('Getprice create account button',
      '#accountcreate button[type="submit"]',
      'button:has-text("Utwórz konto")',
      'form#accountcreate button.action.submit'
    );
  }

  protected get successMessage(): HealableLocator {
    return healable('Registration success message',
      '.message.success',
      '[ui-id="message-success"]',
      '.message:has-text("potwierdzić")',
      '.page.messages .message.success'
    );
  }

  protected get errorMessage(): HealableLocator {
    return healable('Registration error message',
      '.message.error',
      '[ui-id="message-error"]',
      '.page.messages .message.error'
    );
  }

  async expectRegistrationSuccess(): Promise<void> {
    // Getprice shows "Musisz potwierdzić swoje konto" with class .message.success
    const msg = await this.findWithHealing(this.successMessage, { timeout: 15000 });
    await expect(msg).toBeVisible();
  }
}
