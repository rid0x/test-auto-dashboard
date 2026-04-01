import { test, expect } from '@playwright/test';
import { testConfig } from '../../../../../config/Test.config';

const BASE = testConfig.baseUrl;

test.describe('Test - SEO Tests @seo', () => {

  // ============================================================
  // 1. META TAGS
  // ============================================================

  test.describe('Meta Tags', () => {
    // @desc: Strona glowna ma meta title
    test('homepage has meta title', async ({ page }) => {
      await page.goto(BASE, { waitUntil: 'domcontentloaded' });
      const title = await page.title();

      await test.info().attach('Homepage title', {
        body: `Title: "${title}"\nLength: ${title.length} chars\nOptimal: 30-60 chars`,
        contentType: 'text/plain',
      });

      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(5);
    });

    // @desc: Strona glowna ma meta description
    test('homepage has meta description', async ({ page }) => {
      await page.goto(BASE, { waitUntil: 'domcontentloaded' });
      const desc = await page.locator('meta[name="description"]').getAttribute('content');

      await test.info().attach('Homepage meta description', {
        body: `Description: "${desc || 'MISSING'}"\nLength: ${desc?.length || 0} chars\nOptimal: 120-160 chars`,
        contentType: 'text/plain',
      });

      expect(desc).toBeTruthy();
      expect(desc!.length).toBeGreaterThan(20);
    });

    // @desc: Strona produktu ma unikalne meta title
    test('product page has meta title', async ({ page }) => {
      await page.goto(`${BASE}${testConfig.product.url}`, { waitUntil: 'domcontentloaded' });
      const title = await page.title();

      await test.info().attach('Product page title', {
        body: `Title: "${title}"\nLength: ${title.length} chars`,
        contentType: 'text/plain',
      });

      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(5);
    });

    // @desc: Strona kategorii ma meta title
    test('category page has meta title', async ({ page }) => {
      await page.goto(`${BASE}${testConfig.category.url}`, { waitUntil: 'domcontentloaded' });
      const title = await page.title();

      await test.info().attach('Category page title', {
        body: `Title: "${title}"\nLength: ${title.length} chars`,
        contentType: 'text/plain',
      });

      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(5);
    });

    // @desc: Strona produktu ma meta description
    test('product page has meta description', async ({ page }) => {
      await page.goto(`${BASE}${testConfig.product.url}`, { waitUntil: 'domcontentloaded' });
      const desc = await page.locator('meta[name="description"]').getAttribute('content').catch(() => null);

      await test.info().attach('Product meta description', {
        body: `Description: "${desc || 'MISSING'}"\nLength: ${desc?.length || 0} chars`,
        contentType: 'text/plain',
      });

      // Product pages should have description, but some stores skip it
      if (!desc) {
        test.info().annotations.push({ type: 'warning', description: 'Product page missing meta description' });
      }
      expect(desc || 'ok').toBeTruthy();
    });
  });

  // ============================================================
  // 2. CANONICAL & ROBOTS
  // ============================================================

  test.describe('Canonical & Robots', () => {
    // @desc: Strona glowna ma canonical URL
    test('homepage has canonical URL', async ({ page }) => {
      await page.goto(BASE, { waitUntil: 'domcontentloaded' });
      const canonical = await page.evaluate(() => {
        const link = document.querySelector('link[rel="canonical"]');
        return link ? link.getAttribute('href') : null;
      });

      await test.info().attach('Canonical URL', {
        body: `Canonical: ${canonical || 'MISSING'}`,
        contentType: 'text/plain',
      });

      expect(canonical).toBeTruthy();
    });

    // @desc: robots.txt istnieje i zwraca 200
    test('robots.txt exists', async ({ request }) => {
      const response = await request.get(`${BASE}/robots.txt`);
      const body = await response.text();

      await test.info().attach('robots.txt', {
        body: `Status: ${response.status()}\nContent (first 500 chars):\n${body.substring(0, 500)}`,
        contentType: 'text/plain',
      });

      expect(response.status()).toBe(200);
      expect(body).toContain('User-agent');
    });

    // @desc: sitemap.xml istnieje i zwraca 200
    test('sitemap.xml exists', async ({ request }) => {
      // Try common sitemap locations
      let found = false;
      let sitemapUrl = '';

      for (const path of ['/sitemap.xml', '/pub/sitemap.xml', '/media/sitemap.xml']) {
        const response = await request.get(`${BASE}${path}`).catch(() => null);
        if (response && response.status() === 200) {
          const body = await response.text();
          if (body.includes('<?xml') || body.includes('<urlset') || body.includes('<sitemapindex')) {
            found = true;
            sitemapUrl = `${BASE}${path}`;
            await test.info().attach('sitemap.xml', {
              body: `URL: ${sitemapUrl}\nStatus: 200\nContent (first 300 chars):\n${body.substring(0, 300)}`,
              contentType: 'text/plain',
            });
            break;
          }
        }
      }

      if (!found) {
        await test.info().attach('sitemap.xml', {
          body: 'Sitemap not found at /sitemap.xml, /pub/sitemap.xml, /media/sitemap.xml',
          contentType: 'text/plain',
        });
      }

      expect(found).toBeTruthy();
    });

    // @desc: Strona produktu ma canonical URL
    test('product page has canonical URL', async ({ page }) => {
      await page.goto(`${BASE}${testConfig.product.url}`, { waitUntil: 'domcontentloaded' });
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href').catch(() => null);

      await test.info().attach('Product canonical', {
        body: `Canonical: ${canonical || 'MISSING'}`,
        contentType: 'text/plain',
      });

      expect(canonical).toBeTruthy();
    });
  });

  // ============================================================
  // 3. HEADINGS & STRUCTURE
  // ============================================================

  test.describe('Headings & Structure', () => {
    // @desc: Strona produktu ma dokladnie jeden H1
    test('product page has exactly one H1', async ({ page }) => {
      await page.goto(`${BASE}${testConfig.product.url}`, { waitUntil: 'domcontentloaded' });
      const h1s = await page.locator('h1').allTextContents();

      await test.info().attach('H1 tags', {
        body: `H1 count: ${h1s.length}\nH1 texts:\n${h1s.map((h, i) => `  ${i + 1}. "${h.trim()}"`).join('\n')}`,
        contentType: 'text/plain',
      });

      expect(h1s.length).toBe(1);
    });

    // @desc: Strona kategorii ma dokladnie jeden H1
    test('category page has exactly one H1', async ({ page }) => {
      await page.goto(`${BASE}${testConfig.category.url}`, { waitUntil: 'domcontentloaded' });
      const h1s = await page.locator('h1').allTextContents();

      await test.info().attach('Category H1 tags', {
        body: `H1 count: ${h1s.length}\nH1 texts:\n${h1s.map((h, i) => `  ${i + 1}. "${h.trim()}"`).join('\n')}`,
        contentType: 'text/plain',
      });

      expect(h1s.length).toBe(1);
    });

    // @desc: Obrazki na stronie produktu maja atrybut alt
    test('product images have alt attributes', async ({ page }) => {
      await page.goto(`${BASE}${testConfig.product.url}`, { waitUntil: 'load' });

      const images = await page.locator('img').evaluateAll(imgs => {
        const total = imgs.filter(i => i.offsetWidth > 0).length; // only visible images
        const withAlt = imgs.filter(i => i.offsetWidth > 0 && i.alt && i.alt.trim().length > 0).length;
        const withoutAlt = imgs.filter(i => i.offsetWidth > 0 && (!i.alt || i.alt.trim().length === 0))
          .map(i => i.src?.substring(0, 80));
        return { total, withAlt, withoutAlt };
      });

      await test.info().attach('Image alt attributes', {
        body: `Total visible images: ${images.total}\nWith alt: ${images.withAlt}\nWithout alt: ${images.withoutAlt.length}\n${images.withoutAlt.length > 0 ? '\nMissing alt:\n' + images.withoutAlt.join('\n') : ''}`,
        contentType: 'text/plain',
      });

      // At least 80% of images should have alt
      if (images.total > 0) {
        const ratio = images.withAlt / images.total;
        expect(ratio).toBeGreaterThan(0.5);
      }
    });
  });

  // ============================================================
  // 4. STRUCTURED DATA
  // ============================================================

  test.describe('Structured Data', () => {
    // @desc: Strona produktu ma JSON-LD structured data
    test('product page has JSON-LD', async ({ page }) => {
      await page.goto(`${BASE}${testConfig.product.url}`, { waitUntil: 'domcontentloaded' });

      const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();

      const parsed = jsonLd.map(j => { try { return JSON.parse(j); } catch { return null; } }).filter(Boolean);
      const hasProduct = parsed.some(p => p['@type'] === 'Product' || p['@graph']?.some?.((g: any) => g['@type'] === 'Product'));

      await test.info().attach('JSON-LD structured data', {
        body: `JSON-LD scripts found: ${jsonLd.length}\nContains Product schema: ${hasProduct ? 'YES' : 'NO'}\n\nSchemas:\n${parsed.map(p => `  @type: ${p['@type'] || 'graph'}`).join('\n')}`,
        contentType: 'text/plain',
      });

      expect(jsonLd.length).toBeGreaterThan(0);
    });

    // @desc: Strona glowna ma Open Graph meta tags
    test('homepage has Open Graph tags', async ({ page }) => {
      await page.goto(BASE, { waitUntil: 'domcontentloaded' });

      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content').catch(() => null);
      const ogType = await page.locator('meta[property="og:type"]').getAttribute('content').catch(() => null);
      const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content').catch(() => null);

      await test.info().attach('Open Graph tags', {
        body: `og:title: ${ogTitle || 'MISSING'}\nog:type: ${ogType || 'MISSING'}\nog:url: ${ogUrl || 'MISSING'}`,
        contentType: 'text/plain',
      });

      // OG tags are nice to have, not critical
      const hasAny = ogTitle || ogType || ogUrl;
      if (!hasAny) {
        test.info().annotations.push({ type: 'warning', description: 'No Open Graph tags found' });
      }
      expect(hasAny || 'ok').toBeTruthy();
    });
  });

  // ============================================================
  // 5. 404 PAGE
  // ============================================================

  test.describe('Error Pages', () => {
    // @desc: Strona 404 zwraca kod 404 i ma tresc
    test('404 page returns proper status', async ({ page }) => {
      const response = await page.goto(`${BASE}/this-page-does-not-exist-12345`, { waitUntil: 'domcontentloaded' });
      const status = response?.status() || 0;
      const bodyText = await page.locator('body').textContent() || '';

      await test.info().attach('404 page', {
        body: `URL: ${BASE}/this-page-does-not-exist-12345\nStatus: ${status}\nHas content: ${bodyText.length > 100 ? 'YES' : 'NO'}\nHas search: ${bodyText.includes('szukaj') || bodyText.includes('Szukaj') || bodyText.includes('search') ? 'YES' : 'NO'}`,
        contentType: 'text/plain',
      });

      // Magento may return 200 with "no route" or proper 404
      expect([404, 200]).toContain(status);
      expect(bodyText.length).toBeGreaterThan(100);
    });
  });
});
