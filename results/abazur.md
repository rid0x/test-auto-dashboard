# Abazur - Test Results

**Ostatni run:** 28.03.2026 | Desktop Chrome
**Wynik:** 83 pass / 3 fail / 9 skip | **97%**

## Faile (3)

| Test | Czas | Problem | Priorytet |
|------|------|---------|-----------|
| should remove item from cart | 49.5s | Remove button selector nie trafia - Abazur uzywa innego selektora delete | WYSOKI |
| should display shipping form fields | 56.8s | Checkout JS render timeout - KnockoutJS wolno renderuje formularz | SREDNI |
| should remove product and show empty cart | 54.8s | Jak wyzej - remove button | WYSOKI |

## Skip (9)

Glownie reCAPTCHA v3 na login i rejestracji.

## Do poprawy

1. **Cart remove (2 faile)** - AbazurCartPage.removeFirstItem() musi uzyc prawidlowego selektora. Sprawdzic `.action-delete`, `a[title="Usuń"]`, lub confirm modal
2. **Checkout form timeout** - zwiekszyc timeout lub dodac `waitForTimeout(5000)` przed sprawdzaniem pol

## Sugestie

- Abazur ma duzo produktow (5000+ w kategorii) - strony moga ladowac wolniej
- reCAPTCHA v3 na login/registration - 9 skipow jest OK, to ograniczenie strony
- Bardzo blisko 100% - wystarczy naprawic cart remove i checkout timing
