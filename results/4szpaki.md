# 4szpaki - Test Results

**Ostatni run:** 28.03.2026 | Desktop Chrome
**Wynik:** 75 pass / 9 fail / 10 skip | **89%**

## Faile (9)

| Test | Czas | Problem | Priorytet |
|------|------|---------|-----------|
| should display cart item details | 25.4s | Cart item selector timeout | SREDNI |
| should add product with quantity 2 | 37.1s | Qty=2 nie dziala - custom +/- buttons | SREDNI |
| should display all shipping form fields | 24.6s | Checkout form timeout - Salesmanago popup moze blokowac | WYSOKI |
| should display payment methods | 22.9s | Checkout timeout | WYSOKI |
| should display consents and place order button | 40.5s | Checkout timeout | WYSOKI |
| should accumulate quantity for same product | 1.0m | Minicart test timeout | NISKI |
| should validate password mismatch | 7.3s | Zly tekst walidacji - 4szpaki moze uzywac innego komunikatu | SREDNI |
| should show product name in cart | 39.6s | Minicart test timeout | NISKI |
| should show search suggestions (autocomplete) | 17.9s | Amasty autocomplete selector timeout | NISKI |

## Skip (10)

reCAPTCHA na rejestracji + Salesmanago popup blocking.

## Do poprawy

1. **Checkout (3 faile)** - Salesmanago popup moze blokowac checkout form. Upewnic sie ze auto-dismiss dziala w checkout. Ewentualnie dodac wiecej `dismissSalesmanago()` calls
2. **Password mismatch** - sprawdzic dokladny tekst walidacji na 4szpaki (moze "Proszę podać tą samą wartość ponownie")
3. **Amasty autocomplete** - selector `.amsearch-results` lub `.amsearch-highlight` zamiast `#search_autocomplete`
4. **Qty=2** - SzpakiProductPage uzywa +/- buttons, nie input fill. Metoda setQuantity() moze nie dzialac dla qty>1

## Sugestie

- Salesmanago popup to glowny blocker na 4szpaki - pojawia sie losowo i blokuje interakcje
- Warto dodac agresywniejszy auto-dismiss w SzpakiCheckoutPage
