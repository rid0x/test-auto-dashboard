# Moncredo - Test Results

**Ostatni run:** 28.03.2026 | Desktop Chrome
**Wynik:** 92 pass / 5 fail / 9 skip | **95%**

## Faile (5)

| Test | Czas | Problem | Priorytet |
|------|------|---------|-----------|
| should login with valid credentials | 28.0s | Timeout - credentials moga nie dzialac lub reCAPTCHA blokuje | WYSOKI |
| should decrease quantity in cart to 1 | 19.0s | Qty update nie dziala - CreativeStyle cart ma inny mechanizm | SREDNI |
| should remove product and show empty cart | 23.2s | Remove item selector nie trafia - cs-* prefix | SREDNI |
| should show product in checkout summary | 37.4s | Timeout - checkout JS renderuje wolno | NISKI |
| should show search suggestions (autocomplete) | 22.6s | CreativeStyle autocomplete ma inne selektory niz standard | NISKI |

## Do poprawy

1. **Login credentials** - sprawdzic czy l.tumiel@auroracreation.com / Kokoko90! dzialaja na moncredo.pl. Jesli nie, ustawic prawidlowe w .env
2. **Cart remove** - MoncredoCartPage musi nadpisac removeFirstItem() z selektorem `.cs-cart-item__link--remove` lub podobnym
3. **Qty update** - CreativeStyle uzywa innego mechanizmu niz standardowy Magento input.qty
4. **Autocomplete** - selector `.cs-header-search__results` zamiast `#search_autocomplete`

## Sugestie

- Moncredo uzywa CreativeStyle theme (prefix cs-*) - wiele selektorow wymaga nadpisania
- Checkout na CS theme jest wolniejszy niz standardowy Magento - zwiekszyc timeouty
