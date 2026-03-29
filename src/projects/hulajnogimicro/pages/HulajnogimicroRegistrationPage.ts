import { RegistrationPage } from '../../../core/pages/RegistrationPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class HulajnogimicroRegistrationPage extends RegistrationPage {
  protected get submitButton(): HealableLocator {
    return healable('Hulajnogimicro create account button',
      'button:has-text("Utwórz konto")',
      'button.action.submit.primary',
      '.action.submit'
    );
  }

  protected get newsletterCheckbox(): HealableLocator {
    return healable('Newsletter checkbox',
      'input[name="is_subscribed"]',
      '#is_subscribed'
    );
  }

  protected get nipInput(): HealableLocator {
    return healable('NIP input',
      'input[name="nip"]',
      'input[name="taxvat"]',
      '#taxvat'
    );
  }

  /**
   * Hulajnogimicro registration has reCAPTCHA — no special consent checkboxes needed.
   */
  async submitRegistration(): Promise<void> {
    const btn = await this.findWithHealing(this.submitButton);
    await btn.click();
    await this.page.waitForLoadState('load');
  }
}
