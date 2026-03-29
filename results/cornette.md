# Cornette - Test Results

**Ostatni run:** 28.03.2026 | Desktop Chrome
**Wynik:** 60 pass / 14 fail / 1 skip | **81%**

## Faile (14)

| Test | Czas | Problem | Priorytet |
|------|------|---------|-----------|
| should add product to cart from product page | ~40s | CookieYes overlay + swatch-select | WYSOKI |
| should display cart item details | ~40s | Zalezy od add-to-cart | WYSOKI |
| should update quantity in cart | ~40s | Zalezy od add-to-cart | WYSOKI |
| should remove item from cart | ~40s | Zalezy od add-to-cart | WYSOKI |
| should display cart subtotal | ~40s | Zalezy od add-to-cart | WYSOKI |
| should have proceed to checkout button | ~40s | Zalezy od add-to-cart | WYSOKI |
| should navigate to checkout from cart | ~40s | Zalezy od add-to-cart (checkout beforeEach) | WYSOKI |
| should display shipping form fields | ~40s | Zalezy od add-to-cart (checkout beforeEach) | WYSOKI |
| should display shipping methods | ~40s | Zalezy od add-to-cart (checkout beforeEach) | WYSOKI |
| should display order summary in checkout | ~40s | Zalezy od add-to-cart (checkout beforeEach) | WYSOKI |
| should add product to cart (product-page) | ~28s | CookieYes overlay + swatch-select | WYSOKI |
| should update quantity and add to cart | ~14s | Zalezy od add-to-cart | WYSOKI |
| should register with valid data | 20.4s | Privacy policy checkbox + CookieYes overlay | SREDNI |
| should show search suggestions (autocomplete) | 20.6s | Autocomplete timeout | NISKI |

## Skip (1)

Filter apply (brak klikalnych opcji w wybranej kategorii).

## Do poprawy

1. **CookieYes overlay (12 faili!)** - `<div class="cky-overlay">` blokuje WSZYSTKIE klikniecia na stronie produktu. CornetteProductPage ma dismissCookieOverlay() ale nie dziala wystarczajaco agresywnie. Trzeba:
   - Kliknac `.cky-btn-accept` ZANIM cokolwiek innego
   - Force-remove `.cky-overlay` przez JS evaluate
   - Uzyc `{ force: true }` na wszystkich kliknieciach
2. **Swatch-select** - Cornette renderuje rozmiary jako `<select class="swatch-select">` (nie div.swatch-option). CornetteProductPage.selectFirstAvailableOption() juz obsluguje to ale moze nie dzialac jesli CookieYes blokuje
3. **Registration** - privacy_policy checkbox + CookieYes overlay na formularzu rejestracji
4. **Autocomplete** - Cornette moze nie miec autocomplete, rozwazyc skip

## Sugestie

- Naprawienie CookieYes dismiss naprawi 12 z 14 faili jednym strzalem
- Cornette uzywa custom theme Aurora z niestandardowymi elementami (qty-counter KnockoutJS, swatch-select, CookieYes)
- Warto sprawdzic headed mode zeby zobaczyc dokladnie co blokuje
- Produkt testowy (bokserki-ta-boss) jest konfigurowalny - jesli jest prosty produkt, warto go uzyc
