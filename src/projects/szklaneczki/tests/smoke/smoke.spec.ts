import { test, expect } from '../../fixture';

/**
 * SMOKE TESTS - Szklaneczki
 * Selektory z Playwright codegen na szklaneczki.pl
 * Minimalna sciezka: homepage → login → search → produkt → koszyk → checkout
 */
test.describe('Szklaneczki - Smoke Tests @smoke', () => {

  // @desc: Strona glowna laduje sie poprawnie
  test('smoke: homepage loads', async ({ page, config }) => {
    await page.goto(config.baseUrl);
    const cookie = page.getByRole('button', { name: 'Zezwól na wszystkie' });
    if (await cookie.isVisible({ timeout: 3000 }).catch(() => false)) await cookie.click();
    await expect(page).toHaveURL(/szklaneczki/);
    const screenshot = await page.screenshot();
    await test.info().attach('Homepage', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Strona logowania wyswietla formularz
  test('smoke: login page displays', async ({ page, config }) => {
    await page.goto(`${config.baseUrl}/customer/account/login/`);
    const cookie = page.getByRole('button', { name: 'Zezwól na wszystkie' });
    if (await cookie.isVisible({ timeout: 3000 }).catch(() => false)) await cookie.click();
    await expect(page.getByRole('textbox', { name: 'E-mail*' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('textbox', { name: 'Hasło' })).toBeVisible({ timeout: 10000 });
    const screenshot = await page.screenshot();
    await test.info().attach('Login page', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Wyszukiwarka znajduje produkty
  test('smoke: search returns results', async ({ page, config }) => {
    await page.goto(config.baseUrl);
    const cookie = page.getByRole('button', { name: 'Zezwól na wszystkie' });
    if (await cookie.isVisible({ timeout: 3000 }).catch(() => false)) await cookie.click();
    await page.getByPlaceholder('Szukaj w najlepszym sklepie').fill(config.search.validQuery);
    await page.getByPlaceholder('Szukaj w najlepszym sklepie').press('Enter');
    await page.waitForLoadState('domcontentloaded');
    const products = page.locator('.product-item, .product-item-info, .products-grid .item');
    await expect(products.first()).toBeVisible({ timeout: 15000 });
    const screenshot = await page.screenshot();
    await test.info().attach('Search results', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Karta produktu wyswietla nazwe i cene
  test('smoke: product page displays', async ({ page, config }) => {
    await page.goto(`${config.baseUrl}${config.product.url}`);
    await page.waitForLoadState('domcontentloaded');
    const cookie = page.getByRole('button', { name: 'Zezwól na wszystkie' });
    if (await cookie.isVisible({ timeout: 2000 }).catch(() => false)) await cookie.click();
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
    const screenshot = await page.screenshot();
    await test.info().attach('Product page', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Dodanie produktu do koszyka
  test('smoke: add product to cart', async ({ page, config }) => {
    await page.goto(`${config.baseUrl}${config.product.url}`);
    await page.waitForLoadState('domcontentloaded');
    const cookie = page.getByRole('button', { name: 'Zezwól na wszystkie' });
    if (await cookie.isVisible({ timeout: 2000 }).catch(() => false)) await cookie.click();
    await page.waitForTimeout(1000);
    const addBtn = page.getByText('Dodaj do koszyka Do koszyka').or(page.locator('#product-addtocart-button')).or(page.getByRole('button', { name: 'Dodaj do koszyka' }));
    await addBtn.first().click();
    await page.waitForTimeout(3000);
    await expect(page.getByRole('button', { name: 'Zobacz koszyk' })).toBeVisible({ timeout: 10000 });
    const screenshot = await page.screenshot();
    await test.info().attach('Added to cart', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Koszyk wyswietla dodany produkt
  test('smoke: cart shows product', async ({ page, config }) => {
    await page.goto(`${config.baseUrl}${config.product.url}`);
    await page.waitForLoadState('domcontentloaded');
    const cookie = page.getByRole('button', { name: 'Zezwól na wszystkie' });
    if (await cookie.isVisible({ timeout: 2000 }).catch(() => false)) await cookie.click();
    await page.waitForTimeout(1000);
    await page.getByText('Dodaj do koszyka Do koszyka').or(page.locator('#product-addtocart-button')).first().click();
    await page.waitForTimeout(3000);
    await page.getByRole('button', { name: 'Zobacz koszyk' }).click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText('Podsumowanie')).toBeVisible({ timeout: 10000 });
    const screenshot = await page.screenshot();
    await test.info().attach('Cart', { body: screenshot, contentType: 'image/png' });
  });

  // @desc: Przejscie do checkout i wyswietlenie formularza
  test('smoke: checkout displays', async ({ page, config }) => {
    await page.goto(`${config.baseUrl}${config.product.url}`);
    await page.waitForLoadState('domcontentloaded');
    const cookie = page.getByRole('button', { name: 'Zezwól na wszystkie' });
    if (await cookie.isVisible({ timeout: 2000 }).catch(() => false)) await cookie.click();
    await page.waitForTimeout(1000);
    // Codegen: getByText('Dodaj do koszyka Do koszyka')
    await page.getByText('Dodaj do koszyka Do koszyka').click();
    await page.getByRole('button', { name: 'Zobacz koszyk' }).click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    // Codegen: getByRole('button', { name: 'Przejdź do kasy' })
    await page.getByRole('button', { name: 'Przejdź do kasy' }).click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    // Codegen: getByRole('button', { name: 'Zakupy bez logowania' })
    const guestBtn = page.getByRole('button', { name: 'Zakupy bez logowania' });
    if (await guestBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await guestBtn.click();
      await page.waitForTimeout(1000);
    }
    // Codegen: getByRole('textbox', { name: 'E-mail *' }) — ze spacja przed *
    await expect(page.getByRole('textbox', { name: 'E-mail *' })).toBeVisible({ timeout: 15000 });
    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('Checkout', { body: screenshot, contentType: 'image/png' });
  });
});
