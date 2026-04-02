import { test, expect } from '../../fixture';

test.describe('Testowy - Homepage @homepage @e2e', () => {

  // @desc: Test dodania produktu do koszyka z poziomu strony produktu
  test('should navigate to product page and add to cart', async ({ page, config }) => {
    await test.step('Go to homepage and accept cookies', async () => {
      await page.goto(config.baseUrl);

      // Akceptuj cookies jesli sa
      const cookieButton = page.getByRole('button', { name: 'Zaakceptuj' });
      if (await cookieButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await cookieButton.click();
      }
    });

    await test.step('Navigate to products and select item', async () => {
      await page.getByRole('link', { name: 'Produkty', exact: true }).click();
      await page.getByText('Marcinek', { exact: true }).click();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Add product to cart', async () => {
      await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();

      // Czekaj na potwierdzenie dodania do koszyka
      await Promise.race([
        page.waitForSelector('.message-success', { timeout: 5000 }).catch(() => null),
        page.waitForResponse(response => response.url().includes('cart') && response.status() === 200, { timeout: 5000 }).catch(() => null)
      ]);
    });

    await test.step('Take final screenshot', async () => {
      await page.screenshot({ path: `screenshots/${config.name}-product-add-to-cart.png`, fullPage: true });
    });
  });


test('should add product to cart successfully', async ({ page, config }) => {
  // @desc: Test dodania produktu Marcinek do koszyka i sprawdzenia komunikatu sukcesu

  await test.step('Navigate to homepage and handle cookies', async () => {
    await page.goto(config.baseUrl);
    
    // Akceptuj cookies jeśli są
    const cookieButton = page.getByRole('button', { name: 'Zaakceptuj' });
    if (await cookieButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cookieButton.click();
    }
  });

  await test.step('Navigate to product', async () => {
    await page.getByRole('link', { name: 'Produkty', exact: true }).click();
    await page.getByText('Marcinek', { exact: true }).click();
    await page.waitForLoadState('networkidle');
  });

  await test.step('Add product to cart and verify success', async () => {
    await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
    
    // Sprawdź komunikat sukcesu lub odpowiedź AJAX
    await Promise.race([
      page.waitForSelector('.message-success', { timeout: 5000 }),
      page.waitForResponse(response => 
        response.url().includes('cart') && response.status() === 200, 
        { timeout: 5000 }
      )
    ]);
  });

  await test.step('Take screenshot', async () => {
    await page.screenshot({ 
      path: `screenshots/${config.name}-add-to-cart-success.png`, 
      fullPage: true 
    });
  });
});


test('should return 200 status on homepage', async ({ page, config }) => {
  // @desc: Test sprawdzenia czy strona główna zwraca status 200

  await test.step('Navigate to homepage and check status', async () => {
    const response = await page.goto(config.baseUrl);
    expect(response?.status()).toBe(200);
  });

  await test.step('Take screenshot', async () => {
    await page.screenshot({ 
      path: `screenshots/${config.name}-homepage-status-200.png`, 
      fullPage: true 
    });
  });
});

});
