# Pieceofcase - Test Results

**Ostatni run:** 28.03.2026 | Desktop Chrome
**Wynik:** 84 pass / 7 fail / 3 skip | **92%**

## Faile (7)

| Test | Czas | Problem | Priorytet |
|------|------|---------|-----------|
| should add product with quantity 2 | 44.3s | Qty=2 nie dziala - dependent dropdown wymaga ponownego wyboru opcji | SREDNI |
| should display cart totals with price | 35.5s | Timeout - cart totals selector | NISKI |
| should navigate to checkout from cart | 33.9s | Timeout - proceedToCheckout nie klika | SREDNI |
| should have product in cart after adding | 51.0s | Minicart test - nowy, wymaga dopracowania | SREDNI |
| should accumulate quantity for same product | 1.0m | Minicart test - timeout | SREDNI |
| should open minicart or navigate to cart on click | 46.7s | Minicart test - selector | SREDNI |
| should show product name in cart | 41.7s | Minicart test - selector | SREDNI |

## Do poprawy

1. **Minicart testy (4 faile)** - nowe testy minicart.spec.ts nie sa dostosowane do pieceofcase. Overlay `.pb-cookie` moze blokowac klikniecia
2. **Qty=2** - PieceofcaseProductPage.selectFirstAvailableOption() musi byc wywolane ponownie po zmianie qty
3. **Cart totals** - selector `.cart-summary` moze nie istniec, sprawdzic `.cart-totals` lub `.grand.totals`

## Sugestie

- Pieceofcase ma Page Builder overlay ktory blokuje klikniecia - upewnic sie ze jest usuwany w kazdym teście
- Dependent dropdowns (rozmiar zalezy od modelu) - trudne do automatyzacji, moze warto wybrac produkt prosty
