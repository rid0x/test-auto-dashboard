import { RegistrationPage } from '../../../core/pages/RegistrationPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class ElakiernikRegistrationPage extends RegistrationPage {
  protected get submitButton(): HealableLocator {
    return healable('Elakiernik register button',
      'button:has-text("Utwórz konto")',
      '.form-create-account button[type="submit"]',
      'button.action.submit.primary'
    );
  }
}
