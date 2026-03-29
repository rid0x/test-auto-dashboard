# Pierrerene - Test Results

**Ostatni run:** 28.03.2026 | Desktop Chrome
**Wynik:** 77 pass / 14 fail / 3 skip | **85%**

## Faile (14)

| Test | Czas | Problem | Priorytet |
|------|------|---------|-----------|
| should create guest cart | 271ms | REST API 403 Forbidden - guest cart creation blocked | SREDNI |
| should remove item from cart | 52.6s | Remove button timeout | WYSOKI |
| should display shipping form fields | 1.0m | Checkout timeout - custom checkout form | WYSOKI |
| should display shipping methods | 1.0m | Checkout timeout | WYSOKI |
| should remove product and show empty cart | 1.0m | Remove button timeout | WYSOKI |
| should have back to cart link | 1.0m | Timeout | NISKI |
| should display all shipping address fields | 1.0m | Checkout timeout | WYSOKI |
| should display shipping methods after filling address | 1.0m | Checkout timeout | WYSOKI |
| should display payment methods after next step | 1.0m | Checkout timeout | WYSOKI |
| should proceed to payment step | 1.0m | Checkout timeout | WYSOKI |
| should display order summary on checkout | 1.0m | Checkout timeout | WYSOKI |
| should have forgot password link | 1.0m | Selector timeout - link moze miec inny tekst | SREDNI |
| should accumulate quantity for same product | 1.0m | Minicart timeout | NISKI |
| should show product name in cart | 48.5s | Minicart timeout | NISKI |

## Skip (3)

Brak credentials + minor.

## Do poprawy

1. **Checkout (8 faili!)** - Pierrerene uzywa custom checkout z polami `custom_attributes[customer-email]` zamiast `#customer-email`. Formularz ma inne selektory niz standardowy Magento. Testy sa juz czesciowo dostosowane ale checkout JS moze nie renderowac sie w headless
2. **Cart remove (2 faile)** - PierrereneCartPage musi nadpisac removeFirstItem() z prawidlowym selektorem
3. **Forgot password link** - link moze miec tekst "Nie pamiętasz hasła?" zamiast oczekiwanego
4. **REST guest cart** - API zwraca 403 Forbidden, guest cart creation moze byc wylaczone

## Sugestie

- Pierrerene ma URL prefix `/pl/` i custom checkout - to glowna przyczyna tylu faili
- Checkout wymaga gruntownej inspekcji w headed mode zeby zrozumiec flow
- Cart remove prawdopodobnie wymaga scrollIntoView + force click
- Warto zmienic product na prosty (nie konfigurowalny) jesli istnieje
