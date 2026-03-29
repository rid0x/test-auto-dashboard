# Getprice - Test Results

**Ostatni run:** 28.03.2026 | Desktop Chrome
**Wynik:** 90 pass / 0 fail / 6 skip | **100%**

## Status: CLEAN

Zero faili. Najlepszy projekt w portfolio.

## Skip (6)

| Test | Powod |
|------|-------|
| should register with valid data | reCAPTCHA blokuje rejestracje |
| should show error for existing email | reCAPTCHA blokuje rejestracje |
| should authenticate customer via REST | Brak credentials w .env |
| should display minicart icon in header | Minicart test (nowy) |
| should show empty counter when cart is empty | Minicart test (nowy) |
| should have cart link pointing to checkout/cart | Minicart test (nowy) |

## Do poprawy

Nic. Projekt jest stabilny.

## Sugestie

- Mozna dodac testy minicart jesli ikona jest widoczna na desktop
- Credentials do REST auth warto ustawic w .env zeby test nie skipował
