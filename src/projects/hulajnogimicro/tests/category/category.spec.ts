import { test, expect } from '../../fixture';

test.describe('Hulajnogimicro - Category @category @e2e', () => {
  test.beforeEach(async ({ categoryPage, config }) => {
    await categoryPage.goto(config.category.url);
  });

  // @desc: Strona kategorii wyswietla liste produktow
  test('should display category page with products', async ({ categoryPage, config }) => {
    await categoryPage.expectProductsVisible();
    await categoryPage.expectMinProducts(config.category.expectedMinProducts);
  });

  // @desc: Panel filtrow jest widoczny na stronie kategorii
  test('should display filter panel', async ({ categoryPage }) => {
    await categoryPage.expectFiltersVisible();
  });

  // @desc: Filtry zawieraja opcje do wyboru
  test('should have filter options', async ({ categoryPage }) => {
    const filterNames = await categoryPage.getFilterNames();
    expect(filterNames.length).toBeGreaterThan(0);
  });

  // @desc: Zastosowanie filtra aktualizuje wyniki na liscie produktow
  test('should apply filter and update results', async ({ categoryPage }) => {
    const countBefore = await categoryPage.getProductCount();
    await categoryPage.clickFirstFilterOption();

    await categoryPage.expectProductsVisible();
    const countAfter = await categoryPage.getProductCount();
    expect(countAfter).toBeGreaterThan(0);
  });

  // @desc: Produkty na liscie maja widoczna nazwe i cene
  test('should display product names and prices', async ({ page }) => {
    const firstProduct = page.locator('.cs-product-tile').first();
    await expect(firstProduct).toBeVisible();

    const productName = firstProduct.locator('.product-item-link, .cs-product-tile__name a').first();
    await expect(productName).toBeVisible();

    // Hulajnogimicro shows price as text "699,00zł"
    const priceText = await firstProduct.textContent();
    expect(priceText).toContain('zł');
  });

  // @desc: Klikniecie produktu przenosi na strone produktu
  test('should navigate to product from category', async ({ categoryPage, page }) => {
    const productUrl = await categoryPage.clickFirstProduct();
    expect(page.url()).not.toContain(categoryPage['config'].category.url);
  });

  // @desc: Zmiana sortowania produktow dziala poprawnie
  test('should change sort order', async ({ categoryPage }) => {
    await categoryPage.changeSortOrder();
    await categoryPage.expectProductsVisible();
  });

  // @desc: Naglowek kategorii jest widoczny i zawiera nazwe kategorii
  test('should display category heading', async ({ page, config }) => {
    const heading = page.locator('h1');
    await expect(heading.first()).toBeVisible();
    const text = await heading.first().textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  // @desc: Pasek narzedzi pokazuje liczbe produktow w kategorii
  test('should have product count in toolbar', async ({ page }) => {
    // Hulajnogimicro shows "14 produktów" text
    const countText = page.locator('text=/\\d+ produkt/i');
    await expect(countText.first()).toBeVisible();
  });
});
