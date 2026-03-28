import { RegistrationPage } from '../../../core/pages/RegistrationPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class CornetteRegistrationPage extends RegistrationPage {
  protected get submitButton(): HealableLocator {
    return healable('Cornette register button',
      'button:has-text("Utwórz konto")',
      '.form-create-account button[type="submit"]',
      'button.button.button-red[type="submit"]',
      'button.action.submit.primary'
    );
  }

  /**
   * Cornette requires privacy_policy checkbox before registration.
   */
  async fillRegistrationForm(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<void> {
    await super.fillRegistrationForm(data);
    // Check privacy policy checkbox (required on Cornette)
    const privacyCheckbox = this.page.locator('#privacy_policy');
    if (await privacyCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
      if (!(await privacyCheckbox.isChecked())) {
        await privacyCheckbox.check();
      }
    }
  }
}
