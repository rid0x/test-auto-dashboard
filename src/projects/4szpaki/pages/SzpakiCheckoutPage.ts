import { expect } from '@playwright/test';
import { CheckoutPage } from '../../../core/pages/CheckoutPage';

export class SzpakiCheckoutPage extends CheckoutPage {
  async continueAsGuest(): Promise<void> {
    // Ensure cookie consent is dismissed (may appear late on 4szpaki)
    try {
      const cookie = this.page.getByText('Zaakceptuj wszystkie');
      if (await cookie.isVisible({ timeout: 3000 }).catch(() => false)) {
        await cookie.click();
        await this.page.waitForTimeout(500);
      }
    } catch { /* already dismissed */ }

    const guestBtn = this.page.getByRole('button', { name: 'Zakupy bez logowania' });
    await expect(guestBtn).toBeVisible({ timeout: 30000 });
    await guestBtn.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async fillShippingAddress(data: {
    email?: string;
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    postcode: string;
    phone: string;
    country?: string;
  }): Promise<void> {
    if (data.email) {
      await this.page.getByRole('textbox', { name: 'E-mail' }).first().fill(data.email);
      await this.page.waitForTimeout(500);
    }

    await this.page.getByRole('textbox', { name: 'Telefon' }).fill(data.phone);
    await this.page.getByRole('textbox', { name: 'Imię' }).fill(data.firstName);
    await this.page.getByRole('textbox', { name: 'Nazwisko' }).fill(data.lastName);
    await this.page.locator('input[name="street[0]"]').fill(data.street);
    await this.page.getByRole('textbox', { name: 'Kod pocztowy' }).fill(data.postcode);
    await this.page.waitForTimeout(1000);

    const cityInput = this.page.getByRole('textbox', { name: 'Miasto' });
    const cityValue = await cityInput.inputValue();
    if (!cityValue || cityValue.trim().length === 0) {
      await cityInput.fill(data.city);
    }
  }

  async selectShippingAndProceed(): Promise<void> {
    // Dismiss "Wybierz punkt odbioru" modal if it appeared
    const okBtn = this.page.getByRole('button', { name: 'OK' });
    if (await okBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await okBtn.click();
      await this.page.waitForTimeout(500);
    }

    // Wait for Magento loading mask to disappear and shipping methods to enable
    await this.page.waitForSelector('.loading-mask', { state: 'hidden', timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(2000);

    // Click DPD Kurier radio directly via CSS (exact, not "za pobraniem")
    const dpdRadio = this.page.locator('input[type="radio"][value*="Dpdshipping_Dpdshipping"]');
    await dpdRadio.scrollIntoViewIfNeeded();
    await dpdRadio.evaluate((el: HTMLInputElement) => {
      el.disabled = false;
      el.click();
    });

    // Wait for Magento AJAX to save the selected shipping method
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(3000);

    // Dismiss modal if triggered
    if (await okBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await okBtn.click();
      await this.page.waitForTimeout(500);
    }

    // Click "Przejdź dalej" to go to payment/summary step
    const nextBtn = this.page.getByRole('button', { name: 'Przejdź dalej' });
    await nextBtn.scrollIntoViewIfNeeded();
    await nextBtn.click();
    await this.page.waitForTimeout(3000);

    // If still on shipping step, try Knockout step navigator
    const stillOnShipping = await this.page.locator('table.table-checkout-shipping-method').isVisible().catch(() => false);
    if (stillOnShipping) {
      // Use Magento's Knockout step navigator to force navigation
      await this.page.evaluate(() => {
        try {
          (window as any).require(['Magento_Checkout/js/model/step-navigator'], (nav: any) => {
            nav.next();
          });
        } catch { /* ignore */ }
      });
      await this.page.waitForTimeout(5000);
    }

    // Wait for next step
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(2000);

    // Dismiss modal if it appears
    if (await okBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await okBtn.click();
      await this.page.waitForTimeout(1000);
    }
  }
}
