# PierreRene.pl - Test Automation Notes

## Status: ~66/76 passed (87%), ~7 failed, 3 skipped (szacowane po fixach)

**Data**: 2026-03-28

---

## Naprawione
- Product price: dodano `.price-wrapper` selektory
- Login create account: użyto `getByRole` zamiast `locator().first()`

## Znane problemy

### API - GraphQL (3 failures)
- GraphQL endpoint `/pl/graphql` - może wymagać innej konfiguracji
- Testy są lenient (akceptują 200/401/403/404/502) ale nadal failują

### Cart remove item (1)
- Delete button selektor prawdopodobnie OK, problem z timing/confirmation modal

### Checkout (2)
- KnockoutJS rendering delay
- Formularz dostawy wymaga dłuższych timeoutów

### Registration password mismatch (1)
- Walidacja mismatch - selektor error msg

## Specyfika

- **URL prefix**: `/pl/` na wszystkich stronach
- **Ceny**: `price-wrapper` zamiast `.price`
- **Cookie consent**: `.ec-gtm-cookie-directive a.accept-all`
- **2 login forms**: popup + main page (jak entelo/distripark)
- **Product URLs**: `/pl/pomadka-matowa-royal-mat-lipstick-nr-03-nude-sand`

## TODO
- [ ] Debugować GraphQL API (może CORS/auth issue)
- [ ] Checkout timeouts
- [ ] Cart remove - confirmation modal handling
