# Distripark - Test Results

**Ostatni run:** 28.03.2026 | Desktop Chrome
**Wynik:** 78 pass / 12 fail / 7 skip | **87%**

## Faile (12)

| Test | Czas | Problem | Priorytet |
|------|------|---------|-----------|
| should apply filter and update results | 15.7s | Filter selector - Distripark uzywa "Filtry" button + side panel | NISKI |
| should display cart item details | 30.9s | Cart item selector timeout | SREDNI |
| should navigate to checkout from cart | 22.8s | Checkout redirect | SREDNI |
| should display guest checkout button | 19.9s | B2B checkout - przycisk "Kup jako gość" moze nie istniec | WYSOKI |
| should have proceed to checkout button | 27.7s | Selector timeout | SREDNI |
| should display company fields for Firma | 21.3s | B2B specific - radio button #type-2 | WYSOKI |
| should have shipping method auto-selected | 20.0s | Shipping radio selector | SREDNI |
| should proceed to payment with Przelew and PayU | 39.4s | Payment step timeout | SREDNI |
| should have product in cart after adding | 30.8s | Minicart test | NISKI |
| should display all shipping address fields | 29.5s | Checkout form timeout | SREDNI |
| should display breadcrumbs | 14.8s | Breadcrumbs selector | NISKI |
| should validate password mismatch | 7.3s | Tekst walidacji | NISKI |

## Skip (7)

reCAPTCHA na rejestracji + B2B specific.

## Do poprawy

1. **B2B checkout (2 faile)** - Distripark to hurtownia chemiczna z B2B checkout. Flow jest inny: "Kup jako gość" → typ kupujacego (osoba/firma/gospodarstwo) → dane firmy (NIP, REGON). Testy sa juz dostosowane ale wymagaja fine-tuningu
2. **Cart item details** - configurable products (warianty opakowan: 25kg, 300kg, 1000kg) moga miec inny uklad cart item
3. **Breadcrumbs** - sprawdzic selector na stronie produktu distripark
4. **Password mismatch** - tekst walidacji

## Sugestie

- Distripark jest B2B - standardowe testy Magento B2C nie pasuja do wszystkich scenariuszy
- Configurable products z radio buttons (nie swatch) - DistriparkProductPage ma juz workaround ale moze wymagac dopracowania
- Warto rozwazyc dodanie testow specyficznych dla B2B: rejestracja firmy, zamowienie hurtowe
