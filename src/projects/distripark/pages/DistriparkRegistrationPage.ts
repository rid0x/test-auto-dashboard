import { RegistrationPage } from '../../../core/pages/RegistrationPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class DistriparkRegistrationPage extends RegistrationPage {
  protected get submitButton(): HealableLocator {
    return healable('Distripark register button',
      'button.action.submit.primary',
      '.form-create-account button[type="submit"]',
      'button:has-text("Zarejestruj")',
      'button:has-text("Załóż konto")'
    );
  }
}
