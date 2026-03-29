import { RegistrationPage } from '../../../core/pages/RegistrationPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class BladevilleRegistrationPage extends RegistrationPage {
  protected get submitButton(): HealableLocator {
    return healable('Bladeville create account button',
      'button.action.submit.primary',
      'button:has-text("Utwórz konto")',
      'button[title="Utwórz konto"]',
      '.action.submit'
    );
  }

  protected get newsletterCheckbox(): HealableLocator {
    return healable('Newsletter checkbox',
      'input[name="is_subscribed"]',
      '#is_subscribed'
    );
  }

  /**
   * Override submitRegistration — Bladeville has reCAPTCHA on registration page,
   * but no extra consent checkboxes like willsoor.
   */
  async submitRegistration(): Promise<void> {
    const btn = await this.findWithHealing(this.submitButton);
    await btn.click();
    await this.page.waitForLoadState('load');
  }
}
