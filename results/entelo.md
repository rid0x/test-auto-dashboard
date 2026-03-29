# Entelo - Test Results

**Ostatni run:** 28.03.2026 | Desktop Chrome
**Wynik:** 80 pass / 7 fail / 5 skip | **92%**

## Faile (7)

| Test | Czas | Problem | Priorytet |
|------|------|---------|-----------|
| should create guest cart | 10.0s | REST API timeout - endpoint moze wymagac innego path | SREDNI |
| should search products via GraphQL | 10.0s | GraphQL timeout - endpoint moze nie istniec | SREDNI |
| should create empty cart via GraphQL | 10.0s | GraphQL timeout - jak wyzej | SREDNI |
| should add product to cart from product page | 1.0m | Add-to-cart timeout - Cookiebot overlay lub swatch selection | WYSOKI |
| should display payment methods after next step | 1.0m | Checkout timeout | SREDNI |
| should proceed to payment step | 1.0m | Checkout timeout | SREDNI |
| should validate password mismatch | 21.5s | Zly tekst walidacji | NISKI |

## Skip (5)

reCAPTCHA v2 na rejestracji + brak credentials.

## Do poprawy

1. **API endpoints (3 faile)** - sprawdzic czy entelo.pl ma REST pod `/rest/V1/` czy moze pod `/rest/default/V1/`. GraphQL moze byc wylaczony
2. **Add-to-cart** - EnteloProductPage uzywa in-page fetch workaround. Sprawdzic czy swatch selection wybiera prawidlowa opcje (krzesla maja wiele atrybutow: kolor, rozmiar)
3. **Checkout timeout** - payment step moze wymagac wiecej czasu na JS render
4. **Password mismatch** - sprawdzic tekst walidacji (pl vs en)

## Sugestie

- Entelo ma Cookiebot - upewnic sie ze dismissCookiebot() jest wywolywane przed kazda interakcja
- Produkty entelo (krzesla) maja wiele atrybutow swatch - mozliwe ze nie wszystkie sa wybierane
- GraphQL moze byc wylaczony na produkcji - rozwazyc skip zamiast fail
