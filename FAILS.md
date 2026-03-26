# Test Failures Per Project
**Date:** 2026-03-26 (last parallel run — 5 projects simultaneously)

> **UWAGA:** Wyniki z parallel runu (5 projektow naraz) sa gorsze niz solo.
> Getprice solo: 92/96 (96%) → parallel: 85/96 (89%) — roznica z powodu resource contention.
> **Jutro: testowac per projekt osobno.**

---

## Getprice.pl — 85/96 pass (89%) | Solo best: 92/96 (96%)

### Fails (8):
| Test | Area | Czas | Prawdopodobna przyczyna |
|------|------|------|------------------------|
| should add configurator product to cart | Configurator | 24.2s | Timeout — parallel resource contention |
| should add product to cart | Cart | 60s | Timeout — success message nie pojawil sie w czasie |
| should display order summary in checkout | Checkout | 66s | Timeout — KnockoutJS nie zaladowal |
| should display remote assistance checkbox | Registration | 35.8s | Timeout — strona wolno laduje w parallel |
| should navigate to cart from checkout | Checkout | 60s | Timeout — checkout ciezki JS |
| should navigate to checkout from cart | Checkout | 66s | Timeout — cart → checkout redirect |
| should show password strength meter | Registration | 35.7s | Timeout — JS nie zaladowal |
| should show product in checkout summary | Checkout | 60s | Timeout — checkout nie zaladowal |

**Diagnoza:** Wszystkie faile to timeouty — parallel run (5 przegladarek) spowalnia. Solo run dal 92/96. Jutro puścić solo.

### Skips (3):
- Registration: register with valid data (reCAPTCHA)
- Registration: show error for existing email (reCAPTCHA)
- API: authenticate customer (auth token)

---

## Willsoor.pl — 48/85 pass (56%) | Solo best: 66/86 (77%)

### Fails (32):
| Test | Area | Przyczyna |
|------|------|-----------|
| should add product to cart | Cart | Product add timeout — size select JS |
| should add product to cart from product page | Cart | j.w. |
| should display cart item details | Cart | Zalezy od add to cart |
| should display cart subtotal | Cart | j.w. |
| should have proceed to checkout button | Cart | j.w. |
| should remove item from cart | Cart | Confirm modal + timeout |
| should update quantity in cart | Cart | j.w. |
| should show mini cart after adding product | Product | j.w. |
| should display add to cart button | Product | Timeout |
| should update quantity and add to cart | Product | Size select issue |
| should display product description/details | Product | Selektor do sprawdzenia |
| should apply filter and update results | Category | Filter accordion selektor |
| should display filter panel | Category | Timeout |
| should navigate to product from category | Category | Timeout |
| should display footer | Footer | Timeout (nowy test) |
| should display newsletter form | Footer | Selektor willsoor newsletter |
| should have contact information in footer | Footer | Timeout |
| should display navigation menu | Homepage | Selektor .first() — naprawiony ale parallel slow |
| should load without console errors | Homepage | Timeout |
| should display shipping form | Checkout | Zalezy od cart |
| should display shipping methods | Checkout | j.w. |
| should fill shipping address as guest | Checkout | j.w. |
| should validate required shipping fields | Checkout | j.w. |
| should display order summary in checkout | Checkout | j.w. |
| should navigate to checkout from cart | Checkout | j.w. |
| should find results for valid query | Search | Timeout |
| should search via Enter key | Search | Amasty intercept |
| should show error with empty password | Login | Timeout |
| should validate required fields on empty submit | Registration | Selektor |
| should create empty cart via GraphQL | API | GraphQL endpoint |
| should create guest cart | API | REST auth |
| should search products via GraphQL | API | j.w. |

### Skips (5):
- Login: valid credentials (reCAPTCHA)
- Login: invalid credentials (reCAPTCHA)
- Registration: register (reCAPTCHA)
- Registration: existing email (reCAPTCHA)
- Login: credentials skip

### Kluczowe problemy do naprawy:
1. **Product add to cart** — size select przez JS evaluate + form.submit. Dziala solo ale parallel timeout.
2. **Cart/Checkout** — kaskadowo zalezy od product add to cart
3. **Footer/Newsletter** — nowe testy, selektory do dopasowania
4. **API** — GraphQL i REST auth issues

---

## 4szpaki.pl — 43/88 pass (49%) | Solo best: 49/80 (61%)

### Kluczowe faile:
- **Product add to cart** — wariant buttons (button.action.tocart) nie standardowy #product-addtocart-button
- **Cart/Checkout** — kaskadowo zalezy od product
- **Category filters** — inne selektory niz standardowy Magento
- **Registration** — button "Zarejestruj się" (naprawiony ale walidacja do sprawdzenia)
- **API REST** — auth required
- **Footer/Newsletter** — nowe testy, selektory do dopasowania
- **Simple product** — `https://4szpaki.pl/mydla-w-kostce/p/mydlo-mis` — do ustawienia w config

---

## Pieceofcase.pl — 48/88 pass (55%) | Solo best: 49/80 (61%)

### Kluczowe faile:
- **Cookie overlay** — `.__pb-cookie_button_accept` blokuje kliknięcia (naprawiony ale do weryfikacji)
- **Product** — etui wymaga wyboru modelu telefonu (marka → model)
- **Cart/Checkout** — zalezy od product
- **Registration** — selektory do sprawdzenia
- **Footer/Newsletter** — `form.newsletter` w custom layout
- **Search no results** — dziala (0 produktow)

---

## Moncredo.pl — 47/88 pass (53%) | Solo best: 47/82 (57%)

### Kluczowe faile:
- **Product** — `/arkano-delle-stelle.html` — do zweryfikowania selektorow
- **Cart/Checkout** — zalezy od product
- **Category** — `/perfumy/dla-niej.html` — do zweryfikowania
- **API** — endpointy do sprawdzenia
- **Footer/Newsletter** — `form.subscribe.cs-newsletter__form`
- **Brak cookie popup** — OK

---

## Plan na jutro
1. **Getprice solo** — powinien dać 92-96/96. Naprawić ostatni fail (checkout login/guest)
2. **Willsoor solo** — focus na product add to cart + cart operations
3. **4szpaki** — ustawić simple product, naprawić filters, registration
4. **Pieceofcase** — cookie fix weryfikacja, product model selection
5. **Moncredo** — inspekcja DOM, product/category/newsletter

**Kolejność priorytetów:** getprice → willsoor → 4szpaki → pieceofcase → moncredo
