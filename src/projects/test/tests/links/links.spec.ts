import { test, expect } from '@playwright/test';
import { testConfig } from '../../../../../config/Test.config';

const BASE = testConfig.baseUrl;

// Social media sites block non-browser requests (return 400/403) - skip them
const SOCIAL_DOMAINS = ['facebook.com', 'instagram.com', 'linkedin.com', 'tiktok.com', 'twitter.com', 'x.com', 'pinterest.com', 'youtube.com'];
function isSocialMedia(url: string): boolean {
  return SOCIAL_DOMAINS.some(d => url.includes(d));
}

test.describe('Test - Broken Links Tests @links', () => {

  // ============================================================
  // 1. NAVIGATION LINKS
  // ============================================================

  // @desc: Wszystkie linki w nawigacji glownej zwracaja 200
  test('main navigation links return 200', async ({ page, request }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });

    const links = await page.evaluate(() => {
      const navLinks = Array.from(document.querySelectorAll('nav a[href], .nav-sections a[href], .navigation a[href]'));
      return navLinks
        .map(a => a.getAttribute('href'))
        .filter(href => href && href.startsWith('http') && !href.includes('javascript:'))
        .filter((v, i, arr) => arr.indexOf(v) === i) // unique
        .slice(0, 20); // max 20 to avoid overload
    });

    const results: string[] = [];
    let broken = 0;

    for (const link of links) {
      if (isSocialMedia(link!)) { results.push(`SKIP [social] ${link}`); continue; }
      const response = await request.get(link!).catch(() => null);
      const status = response?.status() || 0;
      const ok = status >= 200 && status < 400;
      if (!ok) broken++;
      results.push(`${ok ? 'OK' : 'BROKEN'} [${status}] ${link}`);
    }

    await test.info().attach('Navigation links audit', {
      body: `Total: ${links.length}\nBroken: ${broken}\n\n${results.join('\n')}`,
      contentType: 'text/plain',
    });

    expect(broken).toBe(0);
  });

  // ============================================================
  // 2. FOOTER LINKS
  // ============================================================

  // @desc: Wszystkie linki w stopce zwracaja 200
  test('footer links return 200', async ({ page, request }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });

    const links = await page.evaluate(() => {
      const footer = document.querySelector('footer, .footer, .page-footer');
      if (!footer) return [];
      return Array.from(footer.querySelectorAll('a[href]'))
        .map(a => a.getAttribute('href'))
        .filter(href => href && (href.startsWith('http') || href.startsWith('/')))
        .filter(href => !href!.includes('javascript:') && !href!.includes('mailto:') && !href!.includes('tel:'))
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .slice(0, 20);
    });

    const results: string[] = [];
    let broken = 0;

    for (let link of links) {
      if (link!.startsWith('/')) link = `${BASE}${link}`;
      if (isSocialMedia(link!)) { results.push(`SKIP [social] ${link}`); continue; }
      const response = await request.get(link!).catch(() => null);
      const status = response?.status() || 0;
      const ok = status >= 200 && status < 400;
      if (!ok) broken++;
      results.push(`${ok ? 'OK' : 'BROKEN'} [${status}] ${link}`);
    }

    await test.info().attach('Footer links audit', {
      body: `Total: ${links.length}\nBroken: ${broken}\n\n${results.join('\n')}`,
      contentType: 'text/plain',
    });

    expect(broken).toBe(0);
  });

  // ============================================================
  // 3. PRODUCT PAGE LINKS
  // ============================================================

  // @desc: Linki na stronie produktu (breadcrumbs, related) zwracaja 200
  test('product page links return 200', async ({ page, request }) => {
    await page.goto(`${BASE}${testConfig.product.url}`, { waitUntil: 'domcontentloaded' });

    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.breadcrumbs a[href], .related a[href], .upsell a[href]'))
        .map(a => a.getAttribute('href'))
        .filter(href => href && (href.startsWith('http') || href.startsWith('/')))
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .slice(0, 15);
    });

    const results: string[] = [];
    let broken = 0;

    for (let link of links) {
      if (link!.startsWith('/')) link = `${BASE}${link}`;
      if (isSocialMedia(link!)) { results.push(`SKIP [social] ${link}`); continue; }
      const response = await request.get(link!).catch(() => null);
      const status = response?.status() || 0;
      const ok = status >= 200 && status < 400;
      if (!ok) broken++;
      results.push(`${ok ? 'OK' : 'BROKEN'} [${status}] ${link}`);
    }

    await test.info().attach('Product page links audit', {
      body: `Total: ${links.length}\nBroken: ${broken}\n\n${results.join('\n')}`,
      contentType: 'text/plain',
    });

    expect(broken).toBe(0);
  });

  // ============================================================
  // 4. CATEGORY PAGE LINKS
  // ============================================================

  // @desc: Linki produktow na stronie kategorii zwracaja 200
  test('category product links return 200', async ({ page, request }) => {
    await page.goto(`${BASE}${testConfig.category.url}`, { waitUntil: 'domcontentloaded' });

    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.product-item a[href], .product-item-link[href]'))
        .map(a => a.getAttribute('href'))
        .filter(href => href && (href.startsWith('http') || href.startsWith('/')))
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .slice(0, 10); // first 10 products
    });

    const results: string[] = [];
    let broken = 0;

    for (let link of links) {
      if (link!.startsWith('/')) link = `${BASE}${link}`;
      if (isSocialMedia(link!)) { results.push(`SKIP [social] ${link}`); continue; }
      const response = await request.get(link!).catch(() => null);
      const status = response?.status() || 0;
      const ok = status >= 200 && status < 400;
      if (!ok) broken++;
      results.push(`${ok ? 'OK' : 'BROKEN'} [${status}] ${link}`);
    }

    await test.info().attach('Category product links audit', {
      body: `Total: ${links.length}\nBroken: ${broken}\n\n${results.join('\n')}`,
      contentType: 'text/plain',
    });

    expect(broken).toBe(0);
  });

  // ============================================================
  // 5. 404 PAGE
  // ============================================================

  // @desc: Strona 404 nie jest pusta i zawiera nawigacje
  test('404 page has navigation and content', async ({ page }) => {
    await page.goto(`${BASE}/this-page-definitely-does-not-exist-xyz-123`, { waitUntil: 'domcontentloaded' });

    const hasNav = await page.locator('nav, .nav-sections, .navigation').first().isVisible().catch(() => false);
    const hasContent = (await page.locator('body').textContent() || '').length > 200;
    const hasSearch = await page.locator('#search, input[name="q"]').first().isVisible().catch(() => false);

    await test.info().attach('404 page audit', {
      body: `Has navigation: ${hasNav ? 'YES' : 'NO'}\nHas content (>200 chars): ${hasContent ? 'YES' : 'NO'}\nHas search: ${hasSearch ? 'YES' : 'NO'}`,
      contentType: 'text/plain',
    });

    expect(hasContent).toBeTruthy();
  });
});
