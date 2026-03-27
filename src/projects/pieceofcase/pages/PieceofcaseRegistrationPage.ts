import { RegistrationPage } from '../../../core/pages/RegistrationPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

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
    await this.page.evaluate(() => document.querySelectorAll('[id^="__pb"]').forEach(el => el.remove())).catch(() => {});
  }
}
