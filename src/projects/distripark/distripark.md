# Distripark.com - Test Automation Notes

## Status: 53/74 passed (72%), 18 failed, 3 skipped

**Data**: 2026-03-28

---

## Kluczowy problem: B2B sklep

Distripark.com to sklep B2B (hurtowy) z chemikaliami. **Brak przycisku "Dodaj do koszyka" dla niezalogowanych użytkowników.** Wszystkie testy koszyka, checkout i add-to-cart failują z tego powodu.

## Znane problemy

### Cart (6 failures) - BLOKUJĄCY
- Brak `#product-addtocart-button` na stronach produktów
- Produkty wymagają logowania do zakupu
- **Fix**: Wymaga zalogowanego użytkownika testowego

### Checkout (4 failures)
- Zależne od koszyka (cart musi mieć produkty)

### Product page (2) - add to cart + breadcrumbs
- Add to cart: brak buttona dla gości
- Breadcrumbs: sprawdzić strukturę

### Registration (1) - password mismatch validation
- Selektor komunikatu błędu

### Category (2) - filters
- Specyfika filtrów B2B (inne niż retail)

## Specyfika

- **B2B model** - konta firmowe, hurtowe ilości
- **Login page** - 2 formularze (popup hidden + page visible), `#password` nie `#pass`
- **Cookie consent** - Complianz (`cf2Lf6` klasy)
- **Kategorie** - redirect do search (`surowce-kosmetyczne.html` → `catalogsearch`)

## TODO
- [ ] Dodać dane logowania do .env (DISTRIPARK_USER_EMAIL/PASSWORD)
- [ ] Testy cart/checkout po zalogowaniu
- [ ] Sprawdzić czy produkty B2B mają opcje ilościowe
