# Elakiernik - Test Results

**Ostatni run:** 28.03.2026 | Desktop Chrome
**Wynik:** 77 pass / 9 fail / 7 skip | **90%**

## Faile (9)

| Test | Czas | Problem | Priorytet |
|------|------|---------|-----------|
| should update quantity in cart | 40.0s | Qty update timeout - input lub button selector | SREDNI |
| should display shipping form fields | 38.1s | Checkout form timeout | SREDNI |
| should display shipping methods | 51.6s | Checkout timeout | SREDNI |
| should display cart subtotal | 1.0m | Cart summary selector timeout | SREDNI |
| should display order summary in checkout | 1.0m | Checkout timeout | SREDNI |
| should display shipping methods after filling address | 1.0m | Checkout timeout | SREDNI |
| should show error with invalid credentials | 25.0s | Login error message selector nie trafia | WYSOKI |
| should add product to cart | 1.0m | Add-to-cart timeout - product page problem | WYSOKI |
| should show product name in cart | 1.0m | Minicart timeout | NISKI |

## Skip (7)

reCAPTCHA + credentials.

## Do poprawy

1. **Add-to-cart** - ElakiernikProductPage moze wymagac swatch/option selection. Sprawdzic strone produktu w headed mode
2. **Login error** - selector `.message-error` lub tekst "Nieprawidłowy" moze byc inny na elakiernik
3. **Checkout (4 faile)** - JS render jest wolny. Wszystkie faile to timeouty 1min. Checkout moze wymagac cookie consent dismiss
4. **Cart qty update** - sprawdzic mechanizm qty (input fill vs +/- buttons)

## Sugestie

- Sprawdzic headed mode: `npm run test:elakiernik:headed` zeby zobaczyc co blokuje
- Produkty moga byc konfigurowane (kolor, pojemnosc lakieru) - wymaga swatch selection
- Checkout timeouty sugeruja problem z JS initialization w headless
