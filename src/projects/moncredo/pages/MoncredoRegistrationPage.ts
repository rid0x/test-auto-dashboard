import { RegistrationPage } from '../../../core/pages/RegistrationPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class MoncredoRegistrationPage extends RegistrationPage {
  protected get submitButton(): HealableLocator {
    return healable('Create account button',
      '#send2',
      'button.action.submit.primary',
      'button:has-text("Zarejestruj się")',
      '.action.submit'
    );
  }
}
