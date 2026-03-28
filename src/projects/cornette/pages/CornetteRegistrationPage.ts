import { RegistrationPage } from '../../../core/pages/RegistrationPage';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class CornetteRegistrationPage extends RegistrationPage {
  protected get submitButton(): HealableLocator {
    return healable('Cornette register button',
      'button:has-text("Utwórz konto")',
      '.form-create-account button[type="submit"]',
      'button.button.button-red[type="submit"]',
      'button.action.submit.primary'
    );
  }

  private async dismissCookieOverlay(): Promise<void> {
    const acceptBtn = this.page.locator('.cky-btn-accept, [data-cky-tag="accept-button"]').first();
    if (await acceptBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await acceptBtn.click().catch(() => {});
      await this.page.waitForTimeout(500);
    }
    await this.page.evaluate(() => {
      document.querySelectorAll('.cky-overlay, .cky-consent-container, .cky-consent-bar').forEach(el => el.remove());
    }).catch(() => {});
  }

  /**
   * Cornette requires privacy_policy checkbox before registration.
   */
  async fillRegistrationForm(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<void> {
    await this.dismissCookieOverlay();
    await super.fillRegistrationForm(data);
    // Check privacy policy checkbox (required on Cornette)
    const privacyCheckbox = this.page.locator('#privacy_policy');
    if (await privacyCheckbox.count() > 0) {
      await this.dismissCookieOverlay();
      // Use JS to check the checkbox (avoids viewport/overlay issues)
      await this.page.evaluate(() => {
        const cb = document.querySelector('#privacy_policy') as HTMLInputElement;
        if (cb && !cb.checked) { cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true })); }
      });
    }
  }

  async submitRegistration(): Promise<void> {
    await this.dismissCookieOverlay();
    const btn = await this.findWithHealing(this.submitButton);
    await btn.click({ force: true });
    await this.page.waitForLoadState('load');
  }
}
