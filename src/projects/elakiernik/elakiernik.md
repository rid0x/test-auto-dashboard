# E-lakiernik.net - Test Automation Notes

## Status: 65/75 passed (87%), 6 failed, 4 skipped

**Data**: 2026-03-28
**Projekt**: https://e-lakiernik.net - auto detailing, kosmetyki samochodowe (Magento)

---

## Znane problemy (6 failures)

### Login invalid credentials (1)
- Error message nie matchuje domyślnych selektorów (.message-error)
- e-lakiernik ma duplikaty ID (#pass, #email, #send2) przez 2 formularze logowania
- Page object naprawiony (scope do visible form)

### Cart update qty (1)
- Przycisk aktualizacji koszyka może mieć inny selektor lub timing

### Checkout (3)
- Shipping form fields, methods, order summary
- KnockoutJS rendering z opóźnieniem
- Cookiebot może nadal blokować interakcje

## Specyfika

- **Cookiebot** - `#CybotCookiebotDialog` overlay blokuje pointer events, wymaga force-remove
- **Duplikaty ID** - 2 login forms (#email, #pass, #send2 zduplikowane)
- **Produkty konfiguracyjne** - lakier zaprawkowy wymaga wyboru koloru (custom options)
- **Prosty produkt testowy** - gąbka `/honeycomb-gabka-do-mycia-auta` (bez opcji)
- **Standard Magento** - #product-addtocart-button, .breadcrumbs, #search, #qty

## TODO
- [ ] Login error: sprawdzić selektor komunikatu błędu
- [ ] Cart update: inspect update button selektor
- [ ] Checkout: Cookiebot dismiss + dłuższe timeouty
- [ ] GDPR checkbox na formularzach
