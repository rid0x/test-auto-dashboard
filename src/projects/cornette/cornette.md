# Cornette.pl - Test Automation Notes

## Status: 71/75 passed (95%), 3 failed, 1 skipped

**Data**: 2026-03-28

---

## Znane problemy (3 failures)

### Checkout - shipping form, methods, order summary (3)
- Checkout wymaga produktu w koszyku (beforeEach dodaje)
- Formularz dostawy renderuje się przez KnockoutJS z opóźnieniem
- Selektory formularza mogą wymagać dłuższych timeoutów

## Specyfika

- **CookieYes overlay** - blokuje pointer events, trzeba force-remove `.cky-overlay`
- **Swatch select** - rozmiary przez `<select class="swatch-select">` (nie buttons)
- **Privacy checkbox** - `#privacy_policy` wymagany przy rejestracji, poza viewport
- **Add-to-cart button** - `#product-addtocart-button` z class `button button-red`
- **Product URLs** - bez `.html` suffix: `/mezczyzni/bokserki/bokserki-he-508-166`

## TODO
- [ ] Checkout: zwiększyć timeouty KnockoutJS
- [ ] Sprawdzić guest checkout vs firma
