# Willsoor - Test Results

**Ostatni run:** 28.03.2026 | Desktop Chrome
**Wynik:** 85 pass / 0 fail / 9 skip | **100%**

## Status: CLEAN

Zero faili.

## Skip (9)

| Test | Powod |
|------|-------|
| should login with valid credentials | reCAPTCHA na loginie |
| should show error with invalid credentials | reCAPTCHA na loginie |
| should show error with empty email | reCAPTCHA na loginie |
| should show error with empty password | reCAPTCHA na loginie |
| should register with valid data | reCAPTCHA na rejestracji |
| should show error for existing email | reCAPTCHA na rejestracji |
| should authenticate customer via REST | Brak credentials |
| + 2 inne | reCAPTCHA related |

## Do poprawy

Nic. Projekt stabilny. Wiekszosc skipow to reCAPTCHA ktora nie da sie obejsc bez bypass.

## Sugestie

- reCAPTCHA blokuje 9 testow - to jest ograniczenie strony, nie testow
- Mozna rozwazyc reCAPTCHA bypass token jesli klient go udostepni
