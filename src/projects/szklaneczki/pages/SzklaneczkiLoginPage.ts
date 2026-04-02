import { LoginPage } from '../../../core/pages/LoginPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class SzklaneczkiLoginPage extends LoginPage {
  // Szklaneczki uses id="password" instead of Magento default id="pass"
  protected get passwordInput(): HealableLocator {
    return healable('Password input',
      '#password',
      '#pass',
      'input[type="password"]'
    );
  }
}
