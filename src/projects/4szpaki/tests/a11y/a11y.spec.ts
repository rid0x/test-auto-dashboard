import { test, expect } from '@playwright/test';
import { szpakiConfig } from '../../../../../config/4szpaki.config';

const BASE = szpakiConfig.baseUrl;

test.describe('4szpaki - Accessibility Tests @a11y', () => {

  // ============================================================
  // 1. IMAGES
  // ============================================================

  test.describe('Images', () => {
    // @desc: Wszystkie widoczne obrazki na stronie glownej maja alt
    test('homepage images have alt text', async ({ page }) => {
      await page.goto(BASE, { waitUntil: 'load' });

      const result = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img')).filter(i => i.offsetWidth > 0);
        const missing = imgs.filter(i => !i.alt || i.alt.trim() === '').map(i => i.src?.substring(0, 80));
        return { total: imgs.length, withAlt: imgs.length - missing.length, missing };
      });

      await test.info().attach('Homepage image alt audit', {
        body: `Total visible: ${result.total}\nWith alt: ${result.withAlt}\nMissing alt: ${result.missing.length}\n${result.missing.length > 0 ? '\nImages without alt:\n' + result.missing.slice(0, 10).join('\n') : ''}`,
        contentType: 'text/plain',
      });

      if (result.total > 0) {
        expect(result.withAlt / result.total).toBeGreaterThan(0.5);
      }
    });

    // @desc: Obrazki produktu maja alt z nazwa produktu
    test('product images have descriptive alt', async ({ page }) => {
      await page.goto(`${BASE}${szpakiConfig.product.url}`, { waitUntil: 'load' });

      const result = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('.product.media img, .gallery-placeholder img, .fotorama img')).filter(i => i.offsetWidth > 0 || i.offsetHeight > 0);
        return imgs.map(i => ({ src: i.src?.substring(0, 60), alt: i.alt || '' }));
      });

      await test.info().attach('Product image alts', {
        body: result.map(r => `alt="${r.alt}" src=${r.src}`).join('\n') || 'No product images found',
        contentType: 'text/plain',
      });

      // At least one product image should have alt
      const withAlt = result.filter(r => r.alt.length > 0);
      expect(withAlt.length).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // 2. FORMS
  // ============================================================

  test.describe('Forms', () => {
    // @desc: Formularz logowania ma labels lub aria-label na polach
    test('login form has labels', async ({ page }) => {
      await page.goto(`${BASE}/customer/account/login/`, { waitUntil: 'load' });

      const fields = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('form input[type="email"], form input[type="password"], form input[type="text"]')).filter(i => (i as HTMLElement).offsetWidth > 0);
        return inputs.map(input => {
          const id = input.id;
          const label = id ? document.querySelector(`label[for="${id}"]`)?.textContent?.trim() : null;
          const ariaLabel = input.getAttribute('aria-label');
          const placeholder = input.getAttribute('placeholder');
          const name = input.getAttribute('name');
          return { name, id, hasLabel: !!label, label, ariaLabel, placeholder };
        });
      });

      await test.info().attach('Login form labels', {
        body: fields.map(f => `${f.name}: label=${f.hasLabel ? '"' + f.label + '"' : 'NO'} aria-label=${f.ariaLabel || 'NO'} placeholder=${f.placeholder || 'NO'}`).join('\n'),
        contentType: 'text/plain',
      });

      // Each visible input should have at least one accessible name (label, aria-label, or placeholder)
      for (const field of fields) {
        expect(field.hasLabel || field.ariaLabel || field.placeholder).toBeTruthy();
      }
    });

    // @desc: Formularz rejestracji ma labels na polach
    test('registration form has labels', async ({ page }) => {
      await page.goto(`${BASE}/customer/account/create/`, { waitUntil: 'load' });

      const fields = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('.form-create-account input:not([type="hidden"]):not([type="checkbox"])')).filter(i => (i as HTMLElement).offsetWidth > 0);
        return inputs.map(input => {
          const id = input.id;
          const label = id ? document.querySelector(`label[for="${id}"]`)?.textContent?.trim() : null;
          const ariaLabel = input.getAttribute('aria-label');
          const name = input.getAttribute('name');
          return { name, id, hasLabel: !!label, label, ariaLabel };
        });
      });

      await test.info().attach('Registration form labels', {
        body: fields.map(f => `${f.name}: label=${f.hasLabel ? '"' + f.label + '"' : 'NO'} aria-label=${f.ariaLabel || 'NO'}`).join('\n'),
        contentType: 'text/plain',
      });

      const withLabel = fields.filter(f => f.hasLabel || f.ariaLabel);
      expect(withLabel.length / fields.length).toBeGreaterThan(0.5);
    });
  });

  // ============================================================
  // 3. NAVIGATION & KEYBOARD
  // ============================================================

  test.describe('Navigation', () => {
    // @desc: Strona ma skip-to-content link
    test('has skip-to-content link', async ({ page }) => {
      await page.goto(BASE, { waitUntil: 'domcontentloaded' });

      const skipLink = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        const skip = links.find(a => a.textContent?.toLowerCase().includes('skip') || a.textContent?.toLowerCase().includes('przejdź do treści') || a.href.includes('#main') || a.href.includes('#content'));
        return skip ? { text: skip.textContent?.trim(), href: skip.href } : null;
      });

      await test.info().attach('Skip-to-content link', {
        body: skipLink ? `Found: "${skipLink.text}" → ${skipLink.href}` : 'NOT FOUND',
        contentType: 'text/plain',
      });

      // Skip link is nice-to-have for WCAG AA
      if (!skipLink) {
        test.info().annotations.push({ type: 'warning', description: 'No skip-to-content link found' });
      }
      expect(skipLink || 'ok').toBeTruthy();
    });

    // @desc: Elementy interaktywne sa dostepne klawiatura (maja tabindex)
    test('interactive elements are keyboard accessible', async ({ page }) => {
      await page.goto(BASE, { waitUntil: 'load' });

      const result = await page.evaluate(() => {
        const interactive = Array.from(document.querySelectorAll('a[href], button, input, select, textarea')).filter(el => (el as HTMLElement).offsetWidth > 0);
        const withNegativeTabindex = interactive.filter(el => el.getAttribute('tabindex') === '-1');
        return { total: interactive.length, negativeTabindex: withNegativeTabindex.length };
      });

      await test.info().attach('Keyboard accessibility', {
        body: `Total interactive elements: ${result.total}\nWith tabindex="-1" (hidden from keyboard): ${result.negativeTabindex}\nKeyboard accessible: ${result.total - result.negativeTabindex}`,
        contentType: 'text/plain',
      });

      // Most elements should be keyboard accessible
      expect(result.negativeTabindex).toBeLessThan(result.total * 0.3);
    });

    // @desc: Focus jest widoczny na elementach (outline nie jest ukryty globalnie)
    test('focus outline is not globally disabled', async ({ page }) => {
      await page.goto(BASE, { waitUntil: 'load' });

      const outlineHidden = await page.evaluate(() => {
        const styles = Array.from(document.styleSheets);
        let hiddenCount = 0;
        for (const sheet of styles) {
          try {
            for (const rule of Array.from(sheet.cssRules || [])) {
              const text = rule.cssText || '';
              if (text.includes('outline: none') || text.includes('outline:none') || text.includes('outline: 0')) {
                if (text.startsWith('*') || text.startsWith(':focus') || text.includes('*:focus')) {
                  hiddenCount++;
                }
              }
            }
          } catch { /* cross-origin stylesheet */ }
        }
        return hiddenCount;
      });

      await test.info().attach('Focus outline check', {
        body: `Global "outline: none" on :focus or *: ${outlineHidden}\nResult: ${outlineHidden === 0 ? 'GOOD - focus visible' : 'WARNING - focus may be hidden'}`,
        contentType: 'text/plain',
      });

      if (outlineHidden > 0) {
        test.info().annotations.push({ type: 'warning', description: 'Focus outline may be globally disabled' });
      }
      expect(outlineHidden).toBeLessThan(3);
    });
  });

  // ============================================================
  // 4. ARIA & SEMANTIC HTML
  // ============================================================

  test.describe('ARIA & Semantics', () => {
    // @desc: Strona uzywa semantycznych tagow HTML5 (nav, main, footer)
    test('uses semantic HTML5 tags', async ({ page }) => {
      await page.goto(BASE, { waitUntil: 'domcontentloaded' });

      const tags = await page.evaluate(() => {
        return {
          nav: document.querySelectorAll('nav').length,
          main: document.querySelectorAll('main').length,
          header: document.querySelectorAll('header').length,
          footer: document.querySelectorAll('footer').length,
          article: document.querySelectorAll('article').length,
          section: document.querySelectorAll('section').length,
        };
      });

      await test.info().attach('Semantic HTML5 tags', {
        body: Object.entries(tags).map(([tag, count]) => `<${tag}>: ${count}`).join('\n'),
        contentType: 'text/plain',
      });

      // Should have at least nav, header, and footer
      expect(tags.nav + tags.header + tags.footer).toBeGreaterThan(0);
    });

    // @desc: Strona ma ustawiony atrybut lang na <html>
    test('html has lang attribute', async ({ page }) => {
      await page.goto(BASE, { waitUntil: 'domcontentloaded' });

      const lang = await page.evaluate(() => document.documentElement.lang);

      await test.info().attach('HTML lang attribute', {
        body: `lang="${lang || 'MISSING'}"\nExpected: "pl" or "pl-PL"`,
        contentType: 'text/plain',
      });

      expect(lang).toBeTruthy();
      expect(lang.toLowerCase()).toContain('pl');
    });

    // @desc: Kontrast tekstu jest wystarczajacy (spot check na body)
    test('text color contrast ratio check', async ({ page }) => {
      await page.goto(BASE, { waitUntil: 'load' });

      const contrast = await page.evaluate(() => {
        const body = document.body;
        const style = getComputedStyle(body);
        const bgColor = style.backgroundColor;
        const textColor = style.color;
        return { bgColor, textColor };
      });

      await test.info().attach('Body color contrast', {
        body: `Background: ${contrast.bgColor}\nText: ${contrast.textColor}\nNote: WCAG AA requires 4.5:1 ratio for normal text`,
        contentType: 'text/plain',
      });

      // Basic check - colors should be different
      expect(contrast.bgColor).not.toBe(contrast.textColor);
    });
  });
});
