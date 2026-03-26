import { RegistrationPage } from '../../../core/pages/RegistrationPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class WillsoorRegistrationPage extends RegistrationPage {
  protected get submitButton(): HealableLocator {
    return healable('Willsoor create account button',
      'button.action.submit.primary',
      'button:has-text("Załóż darmowe konto")',
      'button:has-text("Załóż konto")',
      '.action.submit'
    );
  }

  protected get gdprCheckbox(): HealableLocator {
    return healable('GDPR consent checkbox',
      '.mgs-gdpr-checkbox input[type="checkbox"]',
      '.mgs-gdpr-checkbox',
      'input[name="gdpr"]'
    );
  }

  protected get registerAgreementCheckbox(): HealableLocator {
    return healable('Register agreement checkbox',
      'input[name="register_agreement"]',
      '#register_agreement',
      '.register-agreement input[type="checkbox"]'
    );
  }

  /**
   * Check required consent checkboxes (GDPR + register agreement)
   * before submitting the registration form.
   */
  async acceptRequiredConsents(): Promise<void> {
    // Check GDPR checkbox if present
    try {
      const gdpr = await this.findWithHealing(this.gdprCheckbox, { timeout: 3000 });
      if (!(await gdpr.isChecked())) {
        await gdpr.check();
      }
    } catch {
      // GDPR checkbox not found — may not be required
    }

    // Check register agreement checkbox if present
    try {
      const agreement = await this.findWithHealing(this.registerAgreementCheckbox, { timeout: 3000 });
      if (!(await agreement.isChecked())) {
        await agreement.check();
      }
    } catch {
      // Agreement checkbox not found — may not be required
    }
  }

  /**
   * Override submitRegistration to accept consents before clicking submit.
   */
  async submitRegistration(): Promise<void> {
    await this.acceptRequiredConsents();
    const btn = await this.findWithHealing(this.submitButton);
    await btn.click();
    await this.page.waitForLoadState('load');
  }
}
