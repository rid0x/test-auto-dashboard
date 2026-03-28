# Distripark.com - Test Automation Notes

## Status: 66/79 passed (84%), 9 failed, 4 skipped

**Data**: 2026-03-28

---

## Co działa (66 pass)

- **Login 7/7** - dual-form (hidden popup + visible loginPost), scoping do `form[action*="loginPost"]`, loggedInIndicator = `.block.account-nav`
- **Homepage 7/7** - standardowy Magento
- **Search 6/6** - "soda" query, autocomplete skip
- **Footer 5/5** - newsletter, social links
- **Product page 7/8** - add-to-cart via in-page fetch (RequireJS nie działa w headless)
- **Cart 5/7** - empty, add, details, subtotal, checkout button
- **Category 8/9** - `/surowce-i-polprodukty-chemiczne/surowce-chemiczne`, przycisk "Filtry" otwiera panel boczny
- **Checkout 4/9** - navigate, guest button, shipping form, shipping method
- **Registration 4/5** - form fields, submit, input acceptance
- **API 9/9** - REST + GraphQL

## Co NIE działa (9 failures)

### Checkout (5 failures) - PRIORYTET
`beforeEach` addToCart jest niestabilny - in-page fetch POST czasem nie dodaje produktu (session/form_key issue). Gdy koszyk pusty → cały checkout failuje kaskadowo.

**Failing testy:**
- `should display buyer type options` - beforeEach fail
- `should display company fields for Firma` - beforeEach fail
- `should have shipping method auto-selected` - beforeEach fail
- `should proceed to payment with Przelew and PayU` - beforeEach fail
- `should display order summary` - beforeEach fail

**Przyczyna**: `productPage.expectAddToCartSuccess()` nawiguje do `/checkout/cart/` i sprawdza `#shopping-cart-table`. Ale w niektórych runach in-page fetch nie dodaje produktu (form_key expired? session conflict z poprzednim testem?).

**Potencjalne fixy:**
1. Retry add-to-cart w beforeEach (max 2 próby)
2. Czyszczenie koszyka przed każdym testem
3. Użycie REST API do dodawania produktu zamiast in-page fetch
4. `test.describe.serial()` żeby uniknąć równoległych session conflicts

### Cart (2 failures)
- `should update quantity in cart` - przycisk update/aktualizuj selektor
- `should remove item from cart` - selektor delete button

### Category (1 failure)
- `should apply filter and update results` - po kliknięciu "Filtry" → rozwinięciu filtra → kliknięciu checkboxa → "Zastosuj" - checkbox w panelu nie matchuje selektorem. User podał HTML: `<input type="checkbox" data-bind="checked: is_selected" id="is_adrFilter_option_1">`

### Registration (1 failure)
- `should validate password mismatch` - selektor error message

### Product page (1 failure)
- `should display breadcrumbs` - brak breadcrumbs na bezpośrednim linku (trzeba przez kategorię)

---

## Specyfika Distripark

### Dual login form
- Hidden: `form[action*="/login/"]` z `#email`, `#pass`, `#send2` (ALL hidden)
- Visible: `form[action*="loginPost"]` z `#email`, `#password`, `#send2` (ALL visible)
- Login page object scopuje do `form[action*="loginPost"]`

### Produkt konfiguracyjny z radio buttons
- URL: `/weglan-wapnia-stracany-kreda-techniczny`
- Radio buttons: `label[for="product-option[94]"]` = "25 kg - 1 worek"
- Kliknięcie przez `getByText('25 kg - 1 worek')` (nie `.check()` bo custom styling)
- Add-to-cart: RequireJS nie inicjalizuje się w headless → workaround via `page.evaluate(fetch(...))`

### Checkout flow
1. Cart → "Przejdź do kasy"
2. "Kup jako gość" button
3. Buyer type radios: `#type-1` Osoba fizyczna, `#type-2` Firma, `#type-3` Gospodarstwo rolne
4. Firma extra fields: `input[name="company"]`, `input[name="vat_id"]` (NIP)
5. Shipping auto-selected (courier)
6. "Następne" button → Payment step
7. Payment: "Przelew tradycyjny" + "Płatność PayU"
8. Agreement checkbox: `input[name="agreement[1]"]`
9. "Złóż zamówienie" button

### Kategoria z filtrami
- URL: `/surowce-i-polprodukty-chemiczne/surowce-chemiczne`
- Przycisk `button.button-filters` "Filtry" otwiera boczny panel
- Rozwinięcie filtra: `.filter-options-title` click
- Checkbox: `input[data-bind*="is_selected"]` np. `#is_adrFilter_option_1`
- "Zastosuj" button po zaznaczeniu

### Cookie consent
- Complianz: `button:has-text("Akceptuj wszystko")`

### Credentials
- l.tumiel@auroracreation.com / Kokoko90! - DZIAŁA (login 7/7 pass)

---

## TODO (następna sesja)

- [ ] Fix checkout beforeEach - retry add-to-cart lub REST API approach
- [ ] Fix category filter apply - użyć `#is_adrFilter_option_1` selektor
- [ ] Fix cart update qty - inspect update button
- [ ] Fix cart remove - inspect delete button (może `.cs-cart-item__link--remove` jak moncredo?)
- [ ] Fix breadcrumbs - nawigacja przez kategorię
- [ ] Fix registration password mismatch
- [ ] Dodać testy Minicart
- [ ] Dodać testy multi-product cart
- [ ] Pogłębić checkout: inputy per typ kupującego (firma: company, NIP; gospodarstwo: ?)
