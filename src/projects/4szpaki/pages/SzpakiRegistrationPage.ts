import { RegistrationPage } from '../../../core/pages/RegistrationPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class SzpakiRegistrationPage extends RegistrationPage {
  // 4szpaki uses "Zarejestruj się" not "Załóż konto" or "Utwórz konto"
  protected get submitButton(): HealableLocator {
    return healable('4szpaki register button',
      'button.action.submit.primary',
      'button:has-text("Zarejestruj się")',
      'button:has-text("Zarejestruj")',
      'button[type="submit"]'
    );
  }
}
