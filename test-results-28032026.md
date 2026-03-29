# Test Results - 28.03.2026

Desktop Chrome only, per project. Total: **881 pass / 80 fail / 68 skip** across 11 projects.

| Projekt | Pass | Fail | Skip | Total | % Pass |
|---------|------|------|------|-------|--------|
| Getprice | 90 | 0 | 6 | 96 | 100% |
| Willsoor | 85 | 0 | 9 | 94 | 100% |
| Moncredo | 92 | 5 | 9 | 106 | 95% |
| Pieceofcase | 84 | 7 | 3 | 94 | 92% |
| Abazur | 83 | 3 | 9 | 95 | 97% |
| Entelo | 80 | 7 | 5 | 92 | 92% |
| 4szpaki | 75 | 9 | 10 | 94 | 89% |
| Distripark | 78 | 12 | 7 | 97 | 87% |
| Elakiernik | 77 | 9 | 7 | 93 | 90% |
| Pierrerene | 77 | 14 | 3 | 94 | 85% |
| Cornette | 60 | 14 | 1 | 75 | 81% |

---

## Getprice
- **90 pass / 0 fail / 6 skip**
- Skip: reCAPTCHA na rejestracji (2), brak credentials auth (1), minicart (3)
- Status: **CLEAN** - zero faili

## Willsoor
- **85 pass / 0 fail / 9 skip**
- Skip: reCAPTCHA na login i rejestracji, brak credentials
- Status: **CLEAN** - zero faili

## Moncredo
- **92 pass / 5 fail / 9 skip**
- Fail:
  - `should login with valid credentials` - timeout 28s, moze credentials nie dzialaja
  - `should decrease quantity in cart to 1` - qty update nie dziala
  - `should remove product and show empty cart` - remove item fail
  - `should show product in checkout summary` - timeout 37s
  - `should show search suggestions (autocomplete)` - timeout 22s, CreativeStyle autocomplete
- Skip: reCAPTCHA (login + registration), brak credentials
- Status: Do naprawy - login credentials + cart remove + autocomplete selektory

## Pieceofcase
- **84 pass / 7 fail / 3 skip**
- Fail:
  - `should add product with quantity 2` - qty=2 nie dziala (dependent dropdowns)
  - `should display cart totals with price` - timeout
  - `should navigate to checkout from cart` - timeout
  - `should have product in cart after adding` - minicart fail
  - `should accumulate quantity for same product` - minicart fail
  - `should open minicart or navigate to cart on click` - minicart fail
  - `should show product name in cart` - minicart fail
- Status: Nowe testy (cart advanced + minicart) wymagaja dopracowania pod pieceofcase

## Abazur
- **83 pass / 3 fail / 9 skip**
- Fail:
  - `should remove item from cart` - remove button selector
  - `should display shipping form fields` - timeout 56s, checkout JS render
  - `should remove product and show empty cart` - jak wyzej
- Skip: reCAPTCHA (login + registration)
- Status: Dobry - 3 faile do naprawy (cart remove + checkout timing)

## Entelo
- **80 pass / 7 fail / 5 skip**
- Fail:
  - `should create guest cart` - REST API timeout 10s
  - `should search products via GraphQL` - GraphQL timeout 10s
  - `should create empty cart via GraphQL` - GraphQL timeout 10s
  - `should add product to cart from product page` - timeout 1min, add-to-cart nie dziala
  - `should display payment methods after next step` - timeout 1min
  - `should proceed to payment step` - timeout 1min
  - `should validate password mismatch` - zly tekst walidacji
- Skip: reCAPTCHA na rejestracji
- Status: API endpoints moga wymagac innego path, add-to-cart wymaga inspekcji

## 4szpaki
- **75 pass / 9 fail / 10 skip**
- Fail:
  - `should display cart item details` - timeout
  - `should add product with quantity 2` - qty=2 nie dziala
  - `should display all shipping form fields` - checkout form timeout
  - `should display payment methods` - checkout timeout
  - `should display consents and place order button` - checkout timeout
  - `should accumulate quantity for same product` - minicart
  - `should validate password mismatch` - zly tekst walidacji
  - `should show product name in cart` - minicart
  - `should show search suggestions (autocomplete)` - Amasty autocomplete timeout
- Skip: reCAPTCHA (registration), Salesmanago popup blocking
- Status: Checkout testy timeout (Salesmanago popup?), nowe testy (minicart/advanced) do dopracowania

## Distripark
- **78 pass / 12 fail / 7 skip**
- Fail:
  - `should apply filter and update results` - filter selector
  - `should display cart item details` - cart item selector
  - `should navigate to checkout from cart` - checkout redirect
  - `should display guest checkout button` - B2B checkout inny flow
  - `should have proceed to checkout button` - selector
  - `should display company fields for Firma` - B2B specific
  - `should have shipping method auto-selected` - shipping method
  - `should proceed to payment with Przelew and PayU` - payment
  - `should have product in cart after adding` - minicart
  - `should display all shipping address fields` - checkout form
  - `should display breadcrumbs` - breadcrumbs selector
  - `should validate password mismatch` - tekst walidacji
- Skip: reCAPTCHA (registration)
- Status: B2B checkout calkowicie inny (firma, NIP), wymaga dedykowanych testow

## Elakiernik
- **77 pass / 9 fail / 7 skip**
- Fail:
  - `should update quantity in cart` - qty update timeout
  - `should display shipping form fields` - checkout timeout
  - `should display shipping methods` - checkout timeout
  - `should display cart subtotal` - timeout 1min
  - `should display order summary in checkout` - timeout 1min
  - `should display shipping methods after filling address` - timeout 1min
  - `should show error with invalid credentials` - login error selector
  - `should add product to cart` - timeout 1min, add-to-cart nie dziala
  - `should show product name in cart` - minicart timeout
- Status: Checkout i add-to-cart timeouty, login error selector do naprawy

## Pierrerene
- **77 pass / 14 fail / 3 skip**
- Fail:
  - `should create guest cart` - REST API 403
  - `should remove item from cart` - remove button timeout
  - `should display shipping form fields` - checkout timeout 1min
  - `should display shipping methods` - checkout timeout 1min
  - `should remove product and show empty cart` - remove timeout
  - `should have back to cart link` - timeout
  - `should display all shipping address fields` - checkout timeout
  - `should display shipping methods after filling address` - timeout
  - `should display payment methods after next step` - timeout
  - `should proceed to payment step` - timeout
  - `should display order summary on checkout` - timeout
  - `should have forgot password link` - selector timeout 1min
  - `should accumulate quantity for same product` - minicart
  - `should show product name in cart` - minicart
- Status: Checkout calkowicie nie dziala (timeouty 1min), cart remove fail, forgot password link selector

## Cornette
- **60 pass / 14 fail / 1 skip**
- Fail:
  - Wszystko co wymaga add-to-cart (12 testow) - CookieYes overlay + swatch selection
  - `should register with valid data` - privacy_policy checkbox
  - `should show search suggestions (autocomplete)` - autocomplete timeout
- Skip: filter apply (brak klikalnych opcji)
- Status: CookieYes overlay blokuje add-to-cart, swatch-select wymaga dalszej pracy

---

## Podsumowanie priorytetow napraw

### Wysoki priorytet (wiele projektow)
1. **Checkout timeouty** - pierrerene, elakiernik, 4szpaki - checkout JS nie renderuje formularza w czasie
2. **Cart remove** - abazur, pierrerene, moncredo - zly selector dla przycisku usuwania
3. **Minicart testy** - nowe testy (minicart.spec.ts) failuja na wiekszosci projektow
4. **Password mismatch validation** - 4szpaki, distripark, entelo - rozne teksty walidacji

### Sredni priorytet (per projekt)
5. **Cornette CookieYes** - overlay blokuje caly flow add-to-cart
6. **Distripark B2B checkout** - calkiem inny flow (firma, NIP)
7. **Entelo API** - GraphQL/REST timeouty (zly endpoint?)
8. **Pierrerene guest cart** - REST 403

### Niski priorytet
9. **Autocomplete** - moncredo, 4szpaki, cornette - rozne implementacje search
10. **Qty=2 testy** - pieceofcase, 4szpaki - dependent dropdowns / custom qty
