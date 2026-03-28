import { RegistrationPage } from '../../../core/pages/RegistrationPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class EnteloRegistrationPage extends RegistrationPage {
  protected get submitButton(): HealableLocator {
    return healable('Entelo register button',
      'button.action.submit.primary',
      '.form-create-account button[type="submit"]',
      'button:has-text("Załóż konto")',
      'button:has-text("Zarejestruj")'
    );
  }
}
