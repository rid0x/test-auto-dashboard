import { RegistrationPage } from '../../../core/pages/RegistrationPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';
import { setupPbPopupAutoDismiss } from '../../../core/helpers/cookie-consent';

export class PieceofcaseRegistrationPage extends RegistrationPage {
  protected get submitButton(): HealableLocator {
    return healable('Create account button',
      'button.action.submit',
      'button:has-text("Utwórz konto")',
      '.action.submit'
    );
  }

  async navigate(path: string = ''): Promise<void> {
    await super.navigate(path);
    await setupPbPopupAutoDismiss(this.page);
  }
}
