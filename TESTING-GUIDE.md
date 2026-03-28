# Przewodnik tworzenia testów per projekt

## Workflow: Nowy projekt od zera

### 1. Inspektuj stronę (NAJWAŻNIEJSZE)

Zanim dotkniesz kodu, zbadaj stronę ręcznie lub skryptem:

```bash
node scripts/inspect-site.js https://example.pl
```

**Co sprawdzić:**
- Czy to Magento? (sprawdź `/customer/account/login/`, `/checkout/cart/`)
- Jaki theme? (standardowy Luma, CreativeStyle `cs-*`, Snowdog Alpaca, custom)
- reCAPTCHA? (szukaj `grecaptcha`, `.g-recaptcha`, `recaptcha` w DOM)
- Cookie consent? (szukaj przycisków akceptacji)
- Amasty search? (szukaj `.amsearch-*` selektorów)
- Prefixy CSS? (np. CreativeStyle = `cs-*`, Snowdog = `sd-*`)

**Kluczowe strony do inspekcji:**
1. Homepage → logo, search, navigation, cart icon
2. `/customer/account/login/` → pola logowania, przycisk
3. `/customer/account/create/` → formularz rejestracji
4. Strona produktu → cena, add-to-cart button, opcje konfiguracyjne
5. Strona kategorii → filtry, produkty, sortowanie
6. `/checkout/cart/` → koszyk, przycisk usuwania, checkout
7. `/checkout/` → formularz zamówienia
8. Footer → newsletter, social media, linki
9. Search z zapytaniem → wyniki, autosuggest

### 2. Config (`config/{project}.config.ts`)

Najważniejsze pola do prawidłowego ustawienia:
- `baseUrl` - sprawdź czy z `www.` czy bez, `https` czy `http`
- `product.url` - znajdź produkt PROSTY (nie konfigurowalny) na start, lub konfigurowalny z opcjami
- `category.url` - kategoria z min. 5 produktami
- `search.validQuery` - zapytanie które zwraca wyniki
- `features.hasRecaptchaOnLogin/Registration` - **SPRAWDŹ NA STRONIE!** (invisible reCAPTCHA jest trudna do zauważenia)
- `features.hasCookieConsent` + `cookieConsentSelector` - sprawdź czy jest popup

### 3. Page Objects (`src/projects/{project}/pages/`)

**Zasady:**
- Każdy page object dziedziczy z core (`src/core/pages/`)
- Nadpisuj TYLKO to co się różni od domyślnych selektorów
- Używaj `healable()` z wieloma fallback selektorami
- Testuj selektory w DevTools zanim je wpiszesz

**Najczęściej potrzebne nadpisania per theme:**

| Element | Standard Magento | CreativeStyle (cs-) | Snowdog |
|---------|-----------------|--------------------| --------|
| Navigation | `.nav-sections` | `.cs-navigation` | `.sd-navigation` |
| Search | `#search` | `.cs-header-search__input` | `#search` |
| Add to cart | `#product-addtocart-button` | `button.tocart` | `#product-addtocart-button` |
| Breadcrumbs | `.breadcrumbs` | `.cs-breadcrumbs` | `.breadcrumbs` |
| Cart delete | `a.action-delete` | `.cs-cart-item__link--remove` | `a.action-delete` |
| Cart icon | `.minicart-wrapper .showcart` | `.cs-addtocart__minicart-link` | `.minicart-wrapper` |

**Add-to-cart flow (najczęstsze pułapki):**
1. Produkt konfigurowalny? → Trzeba wybrać opcje (swatch/select) PRZED kliknięciem
2. Button ID istnieje? → Nie wszystkie sklepy mają `#product-addtocart-button`
3. AJAX response → Po kliknięciu czekaj na response `/cart/add`
4. Success message → `.message-success` lub counter minicart
5. Mini-cart vs cart page → Przycisk usuwania w minicart i na cart page to INNE elementy!

### 4. Testy (`src/projects/{project}/tests/`)

**Kolejność implementacji (od najłatwiejszego):**
1. `homepage/` - prawie zawsze przechodzi z domyślnymi selektorami
2. `login/` - proste, ale uważaj na reCAPTCHA
3. `registration/` - dużo pól, różne walidacje per sklep
4. `search/` - autocomplete często problematyczne
5. `footer/` - newsletter form nie wszędzie jest
6. `category/` - filtry/sortowanie różnią się między sklepami
7. `product-page/` - opcje konfiguracyjne, breadcrumbs
8. `cart/` - zależne od add-to-cart
9. `checkout/` - najbardziej złożone, zależne od koszyka
10. `api/` - REST wymaga auth, GraphQL zwykle działa

**Testy z hardcoded selektorami:**
Testy (.spec.ts) też używają selektorów bezpośrednio (nie tylko page objecty).
Typowe problemy:
- `#product-addtocart-button` → zamień na `button.tocart, button:has-text("Dodaj do koszyka")`
- `.product-item` → może nie istnieć, sprawdź `.product-item-info`, `.cs-product-tile`
- `.breadcrumbs` → może być `.cs-breadcrumbs`
- `#menu-cart-icon` → może nie istnieć, użyj `.counter.qty`

### 5. Iteracyjne naprawianie

```bash
# Pełny run (start)
npx cross-env PROJECT=myproject npx playwright test --project=myproject-desktop-chrome --reporter=list

# Debugowanie konkretnego testu
npx cross-env PROJECT=myproject npx playwright test --project=myproject-desktop-chrome -g "should add product"

# Z widoczną przeglądarką
npx cross-env PROJECT=myproject npx playwright test --project=myproject-desktop-chrome --headed -g "should add product"
```

**Workflow naprawiania (WAŻNE!):**
1. Puść CAŁY suite RAZ → zanotuj failures
2. Naprawiaj test po teście: `-g "exact test name"` - NIE puszczaj całego suite po każdej zmianie!
3. Najpierw napraw page objecty (selektory) → to naprawia dużo testów naraz
4. Potem napraw testy z hardcoded selektorami
5. Na koniec: timing issues (waitForTimeout, waitForLoadState)
6. DOPIERO jak wszystko naprawione → puść CAŁY suite na koniec
7. Zostaw co nie działa → dodaj do `{project}.md`

**NIE trać czasu** na pełne suite po każdej drobnej zmianie - 10-15min na nic.

### 6. Notatki per projekt (`src/projects/{project}/{project}.md`)

Po zakończeniu utwórz plik z:
- Status (X/Y passed)
- Znane failures i dlaczego
- Specyfika sklepu (theme, prefixy CSS, nietypowe elementy)
- Co wymaga danych w `.env` (credentials)
- TODO na przyszłość

---

## Częste pułapki

### Breadcrumbs - ZAWSZE przez kategorię!
- Breadcrumbs NIE pojawią się jeśli wejdziesz na produkt przez bezpośredni link
- ZAWSZE testuj breadcrumbs: kategoria → kliknij produkt → sprawdź breadcrumbs
- W teście: `page.goto(category_url)` → `click first product` → `expect(.breadcrumbs)`

### Checkout - sprawdzaj głęboko
- Guest checkout: email, imię, nazwisko, adres, kod, miasto, telefon
- Firma/NIP: sprawdź czy są inputy na dane firmowe
- Metody dostawy: policz ile widocznych (`input[type="radio"][name*="shipping"]`)
- Metody płatności: policz ile widocznych (`input[type="radio"][name*="payment"]`)
- Consenty/zgody: sprawdź wymagane checkboxy

### Różne theme'y / edgecase'y
- **4szpaki** - inne niż standardowy Magento, specyficzne selektory
- **CreativeStyle (cs-)** - prefix `cs-*` na większości elementów (moncredo)
- **Entelo** - 2 formularze logowania (popup hidden + page visible), inne ID pól
- **Abazur** - search redirect do kategorii zamiast catalogsearch/result
- **PierreRene** - `/pl/` prefix na URL, ceny w `price-wrapper` nie w `.price`

### reCAPTCHA (invisible)
- Nie zawsze widoczna w DOM! Szukaj `<div class="g-recaptcha">` lub JS `grecaptcha`
- Testy z reCAPTCHA trzeba oznaczać `skipIfRecaptcha()` lub `test.skip(config.features.hasRecaptchaOnLogin)`

### Label intercepting click
- Jeśli `page.locator('#search').click()` failuje z "element intercepted" → użyj `{ force: true }`
- Albo kliknij label/wrapper zamiast input

### Offikance / mini-cart drawer
- Wiele sklepów ma off-canvas mini-cart z własnymi przyciskami delete/checkout
- Selektory `.action-delete` mogą matchować ZARÓWNO minicart jak i cart page
- Scopeuj do kontenera: `#shopping-cart-table .action-delete`

### AJAX / KnockoutJS timing
- Magento checkout używa KnockoutJS → elementy renderują się z opóźnieniem
- Używaj `waitForResponse()` po AJAX akcjach
- Używaj `expect().toPass()` z intervals do retry

### Product options (swatch/select)
- Configurable products wymagają wyboru opcji przed add-to-cart
- Swatch: `.swatch-option:not(.disabled)` → click
- Select: `select.super-attribute-select` → selectOption
- Po wyborze opcji poczekaj na JS: `waitForTimeout(500-1000)`

---

## Struktura plików per projekt

```
src/projects/{project}/
├── fixture.ts                     # Test fixture (importuj page objecty)
├── {project}.md                   # Notatki o stanie testów
├── pages/
│   ├── index.ts                   # Barrel export
│   ├── {Project}HomePage.ts       # extends HomePage
│   ├── {Project}LoginPage.ts      # extends LoginPage
│   ├── {Project}RegistrationPage.ts
│   ├── {Project}SearchPage.ts
│   ├── {Project}ProductPage.ts
│   ├── {Project}CartPage.ts
│   ├── {Project}CategoryPage.ts
│   └── {Project}CheckoutPage.ts
├── tests/
│   ├── homepage/homepage.spec.ts
│   ├── login/login.spec.ts
│   ├── registration/registration.spec.ts
│   ├── search/search.spec.ts
│   ├── product-page/product-page.spec.ts
│   ├── cart/cart.spec.ts
│   ├── category/category.spec.ts
│   ├── checkout/checkout.spec.ts
│   └── footer/footer.spec.ts
└── api/
    └── api.spec.ts

config/
└── {project}.config.ts
```

## Komendy

```bash
# Testy per projekt
npm run test:{project}                 # Wszystkie testy
npm run test:{project}:login           # Tylko login
npm run test:{project}:headed          # Z widoczną przeglądarką
npm run test:{project}:api             # Tylko API

# Dashboard
npm run dashboard                      # Start dashboard na localhost:3000

# Raporty
npm run report:{project}               # Otwórz HTML raport
npm run report:{project}:allure        # Allure raport
```
