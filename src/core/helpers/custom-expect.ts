import { expect as baseExpect, Locator, test } from '@playwright/test';

export const expect = baseExpect.extend({
  async toBeVisible(locator: Locator, options?: { timeout?: number }) {
    const isNot = this.isNot;
    let pass: boolean;

    try {
      await baseExpect(locator).toBeVisible(options);
      pass = true;
    } catch {
      pass = false;
    }

    // Only highlight for positive checks (.toBeVisible, not .not.toBeVisible)
    if (!isNot) {
      const willPass = pass;
      const color = willPass ? '#00e676' : '#ff1744';
      const status = willPass ? 'PASS' : 'FAIL';

      try {
        const page = locator.page();
        if (pass) {
          await locator.evaluate((el, c) => {
            el.style.setProperty('outline', `3px solid ${c}`, 'important');
            el.style.setProperty('outline-offset', '2px', 'important');
            el.style.setProperty('box-shadow', `0 0 10px ${c}80`, 'important');
          }, color);
        }
        const screenshot = await page.screenshot();
        await test.info().attach(`${status}: ${locator.toString()}`, { body: screenshot, contentType: 'image/png' });
        if (pass) {
          await locator.evaluate((el) => {
            el.style.removeProperty('outline');
            el.style.removeProperty('outline-offset');
            el.style.removeProperty('box-shadow');
          });
        }
      } catch {
        // Element gone or page navigated — try plain screenshot
        try {
          const page = locator.page();
          const screenshot = await page.screenshot();
          await test.info().attach(`${status}: element (no highlight)`, { body: screenshot, contentType: 'image/png' });
        } catch {
          // Page gone entirely
        }
      }
    }

    return {
      pass,
      message: () => pass
        ? `expected element not to be visible`
        : `expected element to be visible`,
      name: 'toBeVisible',
    };
  }
});
