# Test Automation Dashboard

Multi-store E2E & API test automation framework for Magento 2 e-commerce stores with a real-time dashboard, auto-healing selectors, and detailed HTML reports with screenshots.

![Playwright](https://img.shields.io/badge/Playwright-1.58-45ba4b?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?logo=typescript&logoColor=white)
![Magento](https://img.shields.io/badge/Magento_2-11_stores-f46f25?logo=magento&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-1028-blue)

---

## Co to jest?

Framework do automatycznego testowania sklepow internetowych na platformie Magento 2. Jeden codebase obsluguje **11 sklepow** z roznymi theme'ami, konfiguracjami i funkcjonalnosciami. Kazdy sklep ma pelny zestaw testow E2E (przegladarkowych) i API (REST + GraphQL).

### Kluczowe cechy

- **1028 testow** across 11 projektow (E2E + API)
- **Real-time dashboard** z WebSocket - uruchamianie testow, podglad na zywo, historia runow
- **Auto-healing selectors** - testy automatycznie probuja fallback selektorow gdy glowny selector sie zmieni
- **Multi-browser** - Chrome, Firefox, Safari, Mobile Chrome, Mobile iPhone
- **Screenshoty w raportach** - zielona ramka PASS, czerwona FAIL, dolaczone do kazdego testu
- **API response details** - pelny status, URL, JSON body attachowany do raportu
- **reCAPTCHA detection** - automatyczny skip testow blokowanych przez reCAPTCHA (nie fail)
- **Cookie consent handling** - automatyczne zamykanie Amasty, CookieYes, Cookiebot, GDPR popupow
- **Allure + HTML reports** - dwa formaty raportow z pelna historia

---

## Architektura

```
test-auto/
├── config/                          # Konfiguracja per sklep (URL, credentials, selektory)
│   ├── getprice.config.ts
│   ├── willsoor.config.ts
│   ├── cornette.config.ts
│   └── ... (11 plikow)
├── src/
│   ├── core/                        # Wspolny framework
│   │   ├── pages/                   # Bazowe Page Objecty (8 stron)
│   │   │   ├── BasePage.ts          # Auto-healing, cookie consent, screenshoty
│   │   │   ├── LoginPage.ts
│   │   │   ├── CartPage.ts
│   │   │   ├── CheckoutPage.ts
│   │   │   └── ...
│   │   ├── fixtures/                # Playwright fixture factory
│   │   ├── helpers/                 # Auto-healing, reCAPTCHA, API client
│   │   └── types/                   # TypeScript interfaces
│   └── projects/                    # Per-sklep customizacje
│       ├── getprice/
│       │   ├── pages/               # Nadpisane selektory per sklep
│       │   ├── tests/               # 10 test suite'ow
│       │   │   ├── login/
│       │   │   ├── cart/
│       │   │   ├── checkout/
│       │   │   └── ...
│       │   ├── api/                 # REST + GraphQL testy
│       │   └── fixture.ts
│       └── ... (11 projektow)
├── dashboard/
│   ├── server.ts                    # Express + WebSocket backend
│   └── public/                      # Frontend dashboard
├── reports/                         # Generowane raporty per projekt
├── playwright.config.ts             # Multi-browser config
└── TESTING-GUIDE.md                 # Przewodnik tworzenia testow
```

---

## Testowane sklepy

| Sklep | Branza | Testy | Specyfika |
|-------|--------|-------|-----------|
| **getprice.pl** | IT / serwery | 106 | Custom Tailwind frontend, konfigurator produktow |
| **willsoor.pl** | Moda meska | 102 | Dwa formularze logowania (popup + page), Amasty search |
| **moncredo.pl** | Perfumy | 101 | CreativeStyle theme (cs-*), reCAPTCHA na login |
| **pieceofcase.pl** | Etui na telefon | 94 | Overlay removal, dependent select dropdowns |
| **distripark.com** | Chemia B2B | 92 | Rejestracja B2B (NIP, REGON), konfigurowane produkty |
| **4szpaki.pl** | Kosmetyki naturalne | 91 | Salesmanago popup, Amasty search, qty +/- buttons |
| **abazur.pl** | Oswietlenie | 90 | Mirasvit Search, reCAPTCHA v3, 5000+ produktow w kategorii |
| **pierrerene.pl** | Kosmetyki kolorowe | 89 | URL prefix /pl/, ceny w .price-wrapper |
| **cornette.pl** | Bielizna | 88 | CookieYes overlay, swatch-select, custom qty counter |
| **elakiernik.pl** | Lakiery samochodowe | 88 | - |
| **entelo.pl** | Krzesla ergonomiczne | 87 | Cookiebot, Doofinder search, reCAPTCHA v2 na rejestracji |

---

## Obszary testowe (per sklep)

Kazdy sklep ma identyczny zestaw obszarow testowych:

| Obszar | Tagi | Co testuje |
|--------|------|------------|
| **Homepage** | `@homepage @e2e` | Logo, search bar, nawigacja, koszyk, tytul, responsywnosc, console errors |
| **Login** | `@login @e2e` | Formularz, valid/invalid credentials, empty fields, forgot password, create account |
| **Registration** | `@registration @e2e` | Pola formularza, walidacja hasel, required fields, privacy policy |
| **Search** | `@search @e2e` | Valid/invalid query, autocomplete, form submit, product info w wynikach |
| **Product Page** | `@product-page @e2e` | Nazwa, cena, zdjecie, add to cart, qty, opis, breadcrumbs, reviews, related |
| **Category** | `@category @e2e` | Lista produktow, filtry, sortowanie, nawigacja do produktu, breadcrumbs |
| **Cart** | `@cart @e2e` | Pusty koszyk, dodawanie, szczegoly, qty update, usuwanie, subtotal, checkout button |
| **Checkout** | `@checkout @e2e` | Formularz dostawy, metody dostawy, podsumowanie zamowienia |
| **Footer** | `@footer @e2e` | Stopka, linki, kontakt, newsletter, social media |
| **API** | `@api @rest @graphql` | REST: store config, search, guest cart, auth. GraphQL: search, cart, product details |

---

## Tech Stack

| Technologia | Rola |
|-------------|------|
| **Playwright** | Framework testowy - multi-browser, auto-wait, selektory, screenshoty |
| **TypeScript** | Typy, Page Object Pattern, konfiguracja |
| **Express** | Backend dashboardu |
| **WebSocket** | Real-time streaming wynikow testow do dashboardu |
| **Allure** | Zaawansowane raporty z historiq |
| **Node.js** | Runtime |

---

## Auto-Healing Selectors

Framework automatycznie probuje alternatywne selektory gdy glowny selector przestaje dzialac:

```typescript
protected get loginButton(): HealableLocator {
  return healable('Login button',
    '#send2',                              // Glowny selector
    'button.action.login.primary',         // Fallback 1
    'button:has-text("Zaloguj")',          // Fallback 2
    'form button[type="submit"]'           // Fallback 3
  );
}
```

Gdy selector #1 failuje, framework automatycznie probuje #2, #3, #4 i loguje healing event:
```
[AUTO-HEAL] "Login button" — primary failed: "#send2". Healed with fallback: "button.action.login.primary"
```

---

## Dashboard

Real-time dashboard na `localhost:3000`:

- **Lista projektow** z liczba testow
- **Obszary testowe** per projekt z podgladem testow
- **Uruchamianie testow** z wyborem przegladarki (Chrome/Firefox/Safari) i urzadzenia (Desktop/Mobile)
- **Live terminal** ze streamingiem wynikow przez WebSocket
- **Historia runow** - klikalne wiersze otwieraja raport HTML
- **Notatki** per projekt (co dziala, co nie, co wymaga naprawy)
- **Archiwum raportow** - automatyczne archiwizowanie HTML raportow z timestampem

### Uruchomienie

```bash
npm run dashboard
# Dashboard dostepny na http://localhost:3000
```

---

## Szybki start

### Instalacja

```bash
git clone <repo-url>
cd test-auto
npm install
npx playwright install
```

### Uruchomienie testow

```bash
# Wszystkie testy dla jednego sklepu (5 przegladarek)
npm run test:getprice

# Tylko Chrome Desktop
npx cross-env PROJECT=getprice npx playwright test --project=getprice-desktop-chrome

# Tylko konkretny obszar
npm run test:getprice:login
npm run test:getprice:cart
npm run test:getprice:api

# Z widoczna przegladarka (debug)
npm run test:getprice:headed

# Wszystkie sklepy
npm run test:all
```

### Raporty

```bash
# Playwright HTML report
npm run report:getprice

# Allure report
npm run report:getprice:allure
```

---

## Konfiguracja

Kazdy sklep ma plik `config/{project}.config.ts`:

```typescript
export const getpriceConfig: ProjectConfig = {
  name: 'getprice',
  baseUrl: 'https://getprice.pl',
  credentials: {
    valid: { email: 'test@getprice.pl', password: '...' },
    invalid: { email: 'invalid@getprice.pl', password: 'wrong' },
  },
  search: { validQuery: 'patchcord', invalidQuery: 'xyznonexistent99999' },
  product: { url: '/patchcord-utp-rj45...', name: 'Patchcord UTP RJ45' },
  category: { url: '/serwery', name: 'Serwery', expectedMinProducts: 5 },
  features: {
    hasRecaptchaOnLogin: false,
    hasRecaptchaOnRegistration: true,
    hasCookieConsent: true,
    cookieConsentSelector: '.consent-cookie-directive button',
  },
  api: {
    baseUrl: 'https://getprice.pl',
    restEndpoint: '/rest/V1',
    graphqlEndpoint: '/graphql',
  },
};
```

Credentials mozna tez ustawic przez zmienne srodowiskowe w `.env`.

---

## Struktura testow

Testy uzywaja **Page Object Pattern** z dziedziczeniem:

```
BasePage (auto-healing, cookie consent, screenshoty)
  └── LoginPage (domyslne Magento selektory)
        └── GetpriceLoginPage (nadpisane selektory per sklep)
```

Kazdy test ma:
- **Screenshoty** dolaczane do raportu (PASS i FAIL)
- **test.step()** dla czytelnej struktury w raporcie
- **Annotations** z opisem po polsku
- **Smart skip** dla testow blokowanych przez reCAPTCHA

Testy API maja:
- **attachApiResponse()** - pelny status, URL, JSON body w raporcie
- **Czas odpowiedzi** mierzony per request

---

## Wymagania

- Node.js 18+
- npm 9+
- Playwright browsers (`npx playwright install`)

---

## Licencja

ISC
