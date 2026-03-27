import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { healable, HealableLocator } from '../helpers/auto-healing';

export abstract class RegistrationPage extends BasePage {
  protected get firstNameInput(): HealableLocator {
    return healable('First name input',
      '#firstname',
      'input[name="firstname"]',
      'input[name="first_name"]'
    );
  }

  protected get lastNameInput(): HealableLocator {
    return healable('Last name input',
      '#lastname',
      'input[name="lastname"]',
      'input[name="last_name"]'
    );
  }

  protected get emailInput(): HealableLocator {
    return healable('Email input',
      '#email_address',
      'input[name="email"]',
      'input[type="email"]'
    );
  }

  protected get passwordInput(): HealableLocator {
    return healable('Password input',
      '#password',
      'input[name="password"]',
      'input[type="password"]:first-of-type'
    );
  }

  protected get confirmPasswordInput(): HealableLocator {
    return healable('Confirm password input',
      '#password-confirmation',
      'input[name="password_confirmation"]',
      'input[name="confirmation"]'
    );
  }

  protected get submitButton(): HealableLocator {
    return healable('Create account button',
      'button[title="Załóż konto"]',
      'button:has-text("Załóż konto")',
      'button:has-text("Create an Account")',
      'button.action.submit.primary',
      '.action.submit'
    );
  }

  protected get successMessage(): HealableLocator {
    return healable('Success message',
      '.message-success',
      '[data-ui-id="message-success"]',
      '.messages .success-msg'
    );
  }

  protected get errorMessage(): HealableLocator {
    return healable('Error message',
      '.message-error',
      '[data-ui-id="message-error"]',
      '.messages .error-msg'
    );
  }

  async goto(): Promise<void> {
    await this.navigate('/customer/account/create/');
  }

  async fillRegistrationForm(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<void> {
    const fnEl = await this.findWithHealing(this.firstNameInput);
    await fnEl.fill(data.firstName);

    const lnEl = await this.findWithHealing(this.lastNameInput);
    await lnEl.fill(data.lastName);

    const emailEl = await this.findWithHealing(this.emailInput);
    await emailEl.fill(data.email);

    const passEl = await this.findWithHealing(this.passwordInput);
    await passEl.fill(data.password);

    const confirmEl = await this.findWithHealing(this.confirmPasswordInput);
    await confirmEl.fill(data.password);
  }

  async submitRegistration(): Promise<void> {
    const btn = await this.findWithHealing(this.submitButton);
    await btn.click();
    await this.page.waitForLoadState('load');
  }

  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<void> {
    await this.fillRegistrationForm(data);
    await this.submitRegistration();
  }

  async expectRegistrationSuccess(): Promise<void> {
    const msg = await this.findWithHealing(this.successMessage, { timeout: 10000 });
    await this.assertVisible(msg, 'Registration success');
  }

  async expectRegistrationError(): Promise<void> {
    const msg = await this.findWithHealing(this.errorMessage, { timeout: 10000 });
    await this.assertVisible(msg, 'Registration error');
  }
}
