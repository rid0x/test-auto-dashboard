# Test Automation Report
**Date:** 2026-03-26
**Framework:** Playwright + TypeScript + Auto-healing locators
**Dashboard:** `npm run dashboard` → http://localhost:3000

---

## Getprice.pl — 75/83 pass (90%)

| Area | Tests | Pass | Fail | Skip | Notes |
|------|-------|------|------|------|-------|
| API (REST + GraphQL) | 9 | 8 | 0 | 1 | Skip: auth token needs setup |
| Category | 9 | 9 | 0 | 0 | Filters, sorting, navigation — all OK |
| Homepage | 9 | 9 | 0 | 0 | Logo, search, nav, cart, responsive — all OK |
| Login | 7 | 7 | 0 | 0 | Valid/invalid login, forgot password, create account |
| Product Page | 11 | 11 | 0 | 0 | Name, price, image, add to cart, breadcrumbs |
| Registration | 17 | 15 | 0 | 2 | Skip: reCAPTCHA v3 blocks form submit in Playwright |
| Cart | 8 | 5 | 3 | 0 | Add/remove/qty/subtotal OK. Checkout link offscreen — fixing |
| Checkout | 5 | 3 | 2 | 0 | Guest flow, summary OK. Navigation from cart — fixing |
| Search | 7 | 6 | 1 | 0 | Autocomplete, results OK. Form submit race condition |

### Remaining Fixes Needed
- Cart: "proceed to checkout" button is `<a>` tag offscreen — needs scroll
- Cart: "display cart item details" — cookie dismiss timing in parallel test
- Checkout: depends on cart fix above
- Search: form.submit() sometimes redirects to homepage (Amasty race)

### reCAPTCHA Status
- **Login:** No reCAPTCHA — all tests pass
- **Registration:** Invisible reCAPTCHA v3 blocks Playwright (headless AND headed)
  - 15/17 tests pass (form structure, validation, password strength)
  - 2 tests skipped: register + existing email (need reCAPTCHA disabled on server)

---

## Willsoor.pl — 38/80 pass (47%) — IN PROGRESS

| Area | Tests | Pass | Fail | Skip | Notes |
|------|-------|------|------|------|-------|
| API | 9 | 2 | 7 | 0 | API endpoints may differ — needs inspection |
| Category | 9 | 5 | 4 | 0 | Filters use different structure |
| Homepage | 9 | 7 | 2 | 0 | Nav menu selector needs fix |
| Login | 7 | 2 | 3 | 2 | reCAPTCHA on login, locators need fix |
| Product Page | 11 | 7 | 4 | 0 | Size swatch, qty input — needs inspection |
| Registration | 13 | 8 | 3 | 2 | Remember me checkbox dynamic ID |
| Cart | 8 | 1 | 7 | 0 | Product add to cart needs size selection |
| Checkout | 6 | 0 | 6 | 0 | Depends on cart working |
| Search | 7 | 5 | 2 | 0 | Amasty search — some selectors need fix |

### Willsoor Next Steps
1. Inspect willsoor DOM for failing areas (login, cart, product page)
2. Fix locators based on real DOM
3. Handle size swatch selection for willsoor products
4. Fix API endpoints (may need different REST/GraphQL paths)
5. Handle reCAPTCHA on login (skip with clear annotation)

---

## Architecture

```
test-auto/
├── config/              # Per-project configs (URLs, credentials, features)
├── dashboard/           # Web dashboard (Express + WebSocket)
├── src/
│   ├── core/            # Shared framework
│   │   ├── helpers/     # Auto-healing, cookie, reCAPTCHA, API client
│   │   ├── pages/       # Base Page Objects (Magento defaults)
│   │   ├── fixtures/    # Playwright fixture factory
│   │   └── types/       # TypeScript interfaces
│   └── projects/
│       ├── getprice/    # Getprice overrides + tests
│       └── willsoor/    # Willsoor overrides + tests
├── playwright.config.ts
└── package.json         # All npm scripts
```

## Key Features
- **Auto-healing locators** — fallback selectors with logging
- **reCAPTCHA detection** — graceful skip with annotation (no false positives)
- **Cookie consent** — auto-dismiss per project
- **Dashboard** — live terminal, progress bar, browser/device selection, run history
- **Per-project overrides** — extend base page objects for custom frontends
- **Screenshots** — attached to every test in HTML report
- **API tests** — REST + GraphQL Magento endpoints

## What's Needed From Team
1. **reCAPTCHA:** Disable on staging/test environment OR whitelist test IP
2. **Willsoor:** Need to inspect and fix remaining locators (login, cart, product)
3. **GitHub:** Create repo `rid0x/test-auto` and push
