# Moncredo.pl - Test Automation Notes

## Status: 82/88 passed (93%), 3 failed, 3 skipped

**Data**: 2026-03-28
**Projekt**: https://moncredo.pl - perfumeria internetowa (Magento + Creativestyle theme)

---

## Znane problemy (3 failures)

### 1. Login - valid credentials
- **Test**: `login.spec.ts` > "should login with valid credentials"
- **Problem**: Brak danych logowania w `.env` (`MONCREDO_USER_EMAIL`, `MONCREDO_USER_PASSWORD`)
- **Fix**: Dodaj dane testowego konta w pliku `.env`
- **Priorytet**: Niski (skip jeśli brak danych)

### 2. Search - autocomplete suggestions
- **Test**: `search.spec.ts` > "should show search suggestions (autocomplete)"
- **Problem**: Moncredo nie ma Amasty search ani standardowego autocomplete. Pole `#search_autocomplete` istnieje w DOM ale nigdy nie staje się widoczne przy wpisywaniu tekstu.
- **Fix**: Sprawdzić czy Moncredo ma jakąkolwiek funkcję autocomplete (może wymaga innego trigera) lub oznaczyć test jako `test.skip()`
- **Priorytet**: Niski (feature może nie istnieć na sklepie)

### 3. Checkout - product in summary
- **Test**: `checkout.spec.ts` > "should show product in checkout summary"
- **Problem**: `.product-item-name` nie jest widoczny na stronie checkout. Moncredo checkout renderuje summary przez KnockoutJS/RequireJS z opóźnieniem, elementy mogą nie pojawić się w czasie timeout.
- **Fix**: Zwiększyć timeout lub użyć `waitForFunction` żeby poczekać aż KnockoutJS wyrenderuje podsumowanie
- **Priorytet**: Średni

---

## Skipped testy (3)

1. **Registration - valid data** - skip bo reCAPTCHA na rejestracji
2. **Registration - existing email** - skip bo reCAPTCHA na rejestracji
3. **Login - valid credentials** - skip bo brak danych w env (ale powinien się skip-ować czysto)

---

## Specyfika Moncredo (vs inne sklepy)

### Selektory
- **Nawigacja**: `.cs-navigation` (nie standardowe `.nav-sections`)
- **Breadcrumbs**: `.cs-breadcrumbs` (nie `.breadcrumbs`)
- **Add to cart button**: `button.tocart.primary` (brak `#product-addtocart-button`)
- **Cart delete**: `div.cs-cart-item__link--remove` w tabeli koszyka (nie `a.action-delete`)
- **Product image**: `.fotorama__img` (Fotorama gallery)
- **Swatch options**: Text-based swatch (Pojemność: 100ml, 2ml Sample, 1.2ml)
- **Footer**: `.cs-footer` z newsletter `.cs-newsletter`

### Cechy
- **reCAPTCHA**: Invisible badge na loginie i rejestracji
- **Brak cookie consent**: Nie wymaga akceptacji cookies
- **CreativeStyle theme**: Większość elementów ma prefix `cs-`
- **Mini-cart**: Offcanvas drawer (`.cs-offcanvas`) z osobnymi przyciskami delete
- **Search**: Standardowy Magento search (nie Amasty), brak autocomplete dropdown
- **API**: REST wymaga autoryzacji admin, GraphQL działa bez auth

---

## Do ogarniecia w przyszlosci

- [ ] Dodać dane testowe do `.env` (MONCREDO_USER_EMAIL/PASSWORD)
- [ ] Zbadać autocomplete na moncredo (czy jest w ogóle)
- [ ] Checkout: poczekać na KnockoutJS render przed sprawdzeniem product-item-name
- [ ] Rozważyć dodanie testów e2e: pełny flow zakupowy jako gość
