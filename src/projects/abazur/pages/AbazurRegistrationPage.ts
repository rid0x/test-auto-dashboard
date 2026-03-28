import { RegistrationPage } from '../../../core/pages/RegistrationPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class AbazurRegistrationPage extends RegistrationPage {
  protected get submitButton(): HealableLocator {
    return healable('Abazur register button',
      '.form-create-account button[type="submit"]',
      'button.action.submit.primary',
      'button:has-text("Załóż konto")',
      'button:has-text("Zarejestruj")'
    );
  }
}
