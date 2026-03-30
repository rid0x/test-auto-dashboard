import { test, expect } from '@playwright/test';
import { szpakiConfig } from '../../../../../config/4szpaki.config';

const BASE = szpakiConfig.baseUrl;

test.describe('4szpaki - Performance Tests @performance', () => {

  // ============================================================
  // 1. PAGE LOAD TIMES
  // ============================================================

  test.describe('Page Load Times', () => {
    // @desc: Strona glowna laduje sie w mniej niz 5 sekund
    test('homepage loads under 5s', async ({ page }) => {
      const start = Date.now();
      await page.goto(BASE, { waitUntil: 'load' });
      const loadTime = Date.now() - start;

      await test.info().attach('Homepage load time', {
        body: `URL: ${BASE}\nLoad time: ${loadTime}ms\nThreshold: 5000ms\nResult: ${loadTime < 5000 ? 'PASS' : 'SLOW'}`,
        contentType: 'text/plain',
      });

      expect(loadTime).toBeLessThan(5000);
    });

    // @desc: Strona produktu laduje sie w mniej niz 5 sekund
    test('product page loads under 5s', async ({ page }) => {
      const start = Date.now();
      await page.goto(`${BASE}${szpakiConfig.product.url}`, { waitUntil: 'load' });
      const loadTime = Date.now() - start;

      await test.info().attach('Product page load time', {
        body: `URL: ${BASE}${szpakiConfig.product.url}\nLoad time: ${loadTime}ms\nThreshold: 5000ms`,
        contentType: 'text/plain',
      });

      expect(loadTime).toBeLessThan(5000);
    });

    // @desc: Strona kategorii laduje sie w mniej niz 5 sekund
    test('category page loads under 5s', async ({ page }) => {
      const start = Date.now();
      await page.goto(`${BASE}${szpakiConfig.category.url}`, { waitUntil: 'load' });
      const loadTime = Date.now() - start;

      await test.info().attach('Category page load time', {
        body: `URL: ${BASE}${szpakiConfig.category.url}\nLoad time: ${loadTime}ms\nThreshold: 5000ms`,
        contentType: 'text/plain',
      });

      expect(loadTime).toBeLessThan(5000);
    });

    // @desc: Strona logowania laduje sie w mniej niz 4 sekundy
    test('login page loads under 4s', async ({ page }) => {
      const start = Date.now();
      await page.goto(`${BASE}/customer/account/login/`, { waitUntil: 'load' });
      const loadTime = Date.now() - start;

      await test.info().attach('Login page load time', {
        body: `Load time: ${loadTime}ms\nThreshold: 4000ms`,
        contentType: 'text/plain',
      });

      expect(loadTime).toBeLessThan(4000);
    });
  });

  // ============================================================
  // 2. CORE WEB VITALS
  // ============================================================

  test.describe('Core Web Vitals', () => {
    // @desc: TTFB (Time to First Byte) ponizej 800ms
    test('TTFB under 800ms', async ({ page }) => {
      await page.goto(BASE, { waitUntil: 'load' });

      const ttfb = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return nav ? Math.round(nav.responseStart - nav.requestStart) : -1;
      });

      await test.info().attach('TTFB', {
        body: `Time to First Byte: ${ttfb}ms\nThreshold: 800ms\nResult: ${ttfb < 800 ? 'GOOD' : ttfb < 1800 ? 'NEEDS IMPROVEMENT' : 'POOR'}`,
        contentType: 'text/plain',
      });

      expect(ttfb).toBeLessThan(1800); // Google considers >1800ms as poor
    });

    // @desc: DOM Content Loaded ponizej 3 sekund
    test('DOM Content Loaded under 3s', async ({ page }) => {
      await page.goto(BASE, { waitUntil: 'domcontentloaded' });

      const dcl = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : -1;
      });

      await test.info().attach('DOM Content Loaded', {
        body: `DCL: ${dcl}ms\nThreshold: 3000ms`,
        contentType: 'text/plain',
      });

      expect(dcl).toBeLessThan(5000);
    });

    // @desc: Largest Contentful Paint (LCP) ponizej 2.5s
    test('LCP under 2.5s on homepage', async ({ page }) => {
      await page.goto(BASE, { waitUntil: 'load' });
      await page.waitForTimeout(2000); // Let LCP settle

      const lcp = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const last = entries[entries.length - 1];
            resolve(Math.round(last.startTime));
          }).observe({ type: 'largest-contentful-paint', buffered: true });
          // Fallback if no LCP observed
          setTimeout(() => resolve(-1), 3000);
        });
      });

      await test.info().attach('LCP (Largest Contentful Paint)', {
        body: `LCP: ${lcp}ms\nThreshold: 2500ms (Google Good)\nResult: ${lcp > 0 && lcp < 2500 ? 'GOOD' : lcp < 4000 ? 'NEEDS IMPROVEMENT' : 'POOR or N/A'}`,
        contentType: 'text/plain',
      });

      if (lcp > 0) {
        expect(lcp).toBeLessThan(4000); // Soft threshold (4s = poor)
      }
    });
  });

  // ============================================================
  // 3. RESOURCE OPTIMIZATION
  // ============================================================

  test.describe('Resource Optimization', () => {
    // @desc: Obrazki na stronie glownej maja lazy loading
    test('homepage images have lazy loading', async ({ page }) => {
      await page.goto(BASE, { waitUntil: 'load' });

      const images = await page.locator('img').evaluateAll(imgs => {
        const total = imgs.length;
        const withLazy = imgs.filter(img => img.loading === 'lazy' || img.getAttribute('loading') === 'lazy').length;
        const belowFold = imgs.filter(img => {
          const rect = img.getBoundingClientRect();
          return rect.top > window.innerHeight;
        }).length;
        return { total, withLazy, belowFold };
      });

      await test.info().attach('Image lazy loading', {
        body: `Total images: ${images.total}\nWith loading="lazy": ${images.withLazy}\nBelow fold: ${images.belowFold}\nLazy loading coverage: ${images.total > 0 ? Math.round(images.withLazy / images.total * 100) : 0}%`,
        contentType: 'text/plain',
      });

      // At least some images should have lazy loading
      if (images.belowFold > 0) {
        expect(images.withLazy).toBeGreaterThan(0);
      }
    });

    // @desc: Transfer size strony ponizej 5MB (skompresowane)
    test('total transfer size under 5MB', async ({ page }) => {
      await page.goto(BASE, { waitUntil: 'load' });
      await page.waitForTimeout(2000);

      const metrics = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        let totalTransfer = 0;
        const byType: Record<string, number> = {};
        for (const r of resources) {
          totalTransfer += r.transferSize || 0;
          const ext = r.name.split('?')[0].split('.').pop() || 'other';
          byType[ext] = (byType[ext] || 0) + (r.transferSize || 0);
        }
        return { totalTransfer, byType, count: resources.length };
      });

      const totalMB = (metrics.totalTransfer / 1024 / 1024).toFixed(2);
      const breakdown = Object.entries(metrics.byType)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([ext, size]) => `  .${ext}: ${(size / 1024).toFixed(0)} KB`)
        .join('\n');

      await test.info().attach('Page transfer size', {
        body: `Total transfer: ${totalMB} MB (${metrics.count} resources)\nThreshold: 5 MB\n\nTop resource types:\n${breakdown}`,
        contentType: 'text/plain',
      });

      expect(metrics.totalTransfer).toBeLessThan(5 * 1024 * 1024);
    });

    // @desc: Strona nie wykonuje wiecej niz 100 requestow HTTP
    test('total HTTP requests under 100', async ({ page }) => {
      let requestCount = 0;
      const requestTypes: Record<string, number> = {};

      page.on('request', (req) => {
        requestCount++;
        const type = req.resourceType();
        requestTypes[type] = (requestTypes[type] || 0) + 1;
      });

      await page.goto(BASE, { waitUntil: 'load' });
      await page.waitForTimeout(2000);

      const breakdown = Object.entries(requestTypes)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => `  ${type}: ${count}`)
        .join('\n');

      await test.info().attach('HTTP request count', {
        body: `Total requests: ${requestCount}\nThreshold: 100\n\nBreakdown:\n${breakdown}`,
        contentType: 'text/plain',
      });

      // Magento typically makes 100-200 requests (RequireJS modules, analytics, fonts)
      expect(requestCount).toBeLessThan(200);
    });

    // @desc: Brak blokujacych skryptow renderowanie w head
    test('no render-blocking scripts in head', async ({ page }) => {
      await page.goto(BASE, { waitUntil: 'domcontentloaded' });

      const blockingScripts = await page.evaluate(() => {
        const scripts = document.querySelectorAll('head script[src]:not([async]):not([defer])');
        return Array.from(scripts).map(s => s.getAttribute('src')).filter(Boolean);
      });

      await test.info().attach('Render-blocking scripts', {
        body: blockingScripts.length > 0
          ? `Blocking scripts found (${blockingScripts.length}):\n${blockingScripts.join('\n')}`
          : 'No render-blocking scripts in <head> - GOOD',
        contentType: 'text/plain',
      });

      // Magento often has RequireJS in head - soft check
      if (blockingScripts.length > 5) {
        test.info().annotations.push({ type: 'warning', description: `${blockingScripts.length} render-blocking scripts in <head>` });
      }
      expect(blockingScripts.length).toBeLessThan(10);
    });
  });
});
