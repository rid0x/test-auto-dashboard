# Abazur.pl - Test Automation Notes

## Status: 65/77 passed (84%), 8 failed, 4 skipped

**Data**: 2026-03-28

---

## Znane problemy

### Search (4 failures)
- Abazur redirectuje wyszukiwanie do stron kategorii (nie `catalogsearch/result`)
- Autocomplete: Mirasvit search - może nie działać w headless
- Testy już mają lenient URL checks ale nadal failują

### Cart remove (1)
- Selektor delete button

### Checkout shipping (1)
- KnockoutJS rendering delay

### Login create account (1)
- Duplikat formularzy na stronie

### Registration password mismatch (1)
- Selektor error message

## Specyfika

- **Search redirect**: Wyszukiwanie redirectuje do kategorii (np. `/lampy/lampy-biurkowe`)
- **Mirasvit autocomplete**: `.mst-searchautocomplete__autocomplete`
- **reCAPTCHA**: Na loginie i rejestracji
- **Standard Magento**: Luma-based theme, standardowe selektory

## TODO
- [ ] Search: sprawdzić inny validQuery (np. "kinkiet")
- [ ] Cart remove: inspect delete button
- [ ] Checkout: zwiększyć timeouty
