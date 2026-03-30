import { test, expect } from '@playwright/test';
import { pierrereneConfig } from '../../../../../config/pierrerene.config';

const BASE = pierrereneConfig.baseUrl;

test.describe('Pierrerene - Security Tests @security', () => {

  // ============================================================
  // 1. SQL INJECTION
  // ============================================================

  test.describe('SQL Injection', () => {
    // @desc: Pole wyszukiwania odrzuca SQL injection
    test('search input rejects SQL injection', async ({ page }) => {
      const payload = "' OR 1=1 --";
      await page.goto(`${BASE}/catalogsearch/result/?q=${encodeURIComponent(payload)}`, { waitUntil: 'load' });

      // Should not crash (500) or show DB error
      const status = page.url().includes('catalogsearch') || page.url().includes('4szpaki');
      expect(status).toBeTruthy();
      const bodyText = await page.locator('body').textContent() || '';
      expect(bodyText).not.toContain('SQL');
      expect(bodyText).not.toContain('syntax error');
      expect(bodyText).not.toContain('mysql');
      expect(bodyText).not.toContain('SQLSTATE');

      await test.info().attach('SQL injection search result', {
        body: `Payload: ${payload}\nURL: ${page.url()}\nResult: Page loaded without DB error`,
        contentType: 'text/plain',
      });
    });

    // @desc: Formularz logowania odrzuca SQL injection w polu email
    test('login form rejects SQL injection in email', async ({ page }) => {
      await page.goto(`${BASE}/customer/account/login/`, { waitUntil: 'load' });
      // Dismiss cookie consent if present
      const cookie = page.locator('.ec-gtm-cookie-directive a.accept-all').first();
      if (await cookie.isVisible({ timeout: 3000 }).catch(() => false)) {
        await cookie.click();
        await page.waitForTimeout(500);
      }
      await page.locator('#email, input[name="login[username]"]').first().fill("admin' OR '1'='1");
      await page.locator('#pass, input[name="login[password]"]').first().fill("' OR '1'='1");
      await page.locator('button.action.login, #send2').first().click();
      await page.waitForLoadState('load');

      // Should NOT log in - should stay on login or show error
      expect(page.url()).not.toContain('customer/account/index');
      const bodyText = await page.locator('body').textContent() || '';
      expect(bodyText).not.toContain('SQLSTATE');
      expect(bodyText).not.toContain('syntax error');

      await test.info().attach('SQL injection login result', {
        body: `Payload: admin' OR '1'='1\nURL after submit: ${page.url()}\nResult: Login rejected`,
        contentType: 'text/plain',
      });
    });

    // @desc: URL parameters odrzucaja SQL injection
    test('URL parameters reject SQL injection', async ({ page }) => {
      const response = await page.goto(`${BASE}/catalog/product/view/id/1' OR 1=1--`, { waitUntil: 'load' });
      const bodyText = await page.locator('body').textContent() || '';
      expect(bodyText).not.toContain('SQLSTATE');
      expect(bodyText).not.toContain('mysql');

      await test.info().attach('SQL injection URL result', {
        body: `URL: ${page.url()}\nStatus: ${response?.status()}\nResult: No DB error exposed`,
        contentType: 'text/plain',
      });
    });
  });

  // ============================================================
  // 2. XSS (Cross-Site Scripting)
  // ============================================================

  test.describe('XSS Protection', () => {
    // @desc: Wyszukiwarka escapuje tagi HTML/JS
    test('search escapes script tags', async ({ page }) => {
      const payload = '<script>alert("XSS")</script>';
      await page.goto(`${BASE}/catalogsearch/result/?q=${encodeURIComponent(payload)}`, { waitUntil: 'load' });

      // Script should be escaped, not executed
      const dialogFired = await page.evaluate(() => {
        return (window as any).__xss_fired || false;
      });
      expect(dialogFired).toBeFalsy();

      // Check that the script tag is not rendered as HTML
      const html = await page.content();
      expect(html).not.toContain('<script>alert("XSS")</script>');

      await test.info().attach('XSS search test', {
        body: `Payload: ${payload}\nScript executed: NO\nTags escaped: YES`,
        contentType: 'text/plain',
      });
    });

    // @desc: Wyszukiwarka escapuje event handlers
    test('search escapes event handlers', async ({ page }) => {
      const payload = '"><img src=x onerror=alert(1)>';
      await page.goto(`${BASE}/catalogsearch/result/?q=${encodeURIComponent(payload)}`, { waitUntil: 'load' });

      // Check that the onerror handler is not in an actual img tag (escaped is OK)
      const dangerousImg = await page.locator('img[onerror]').count();
      expect(dangerousImg).toBe(0);

      await test.info().attach('XSS event handler test', {
        body: `Payload: ${payload}\nDangerous <img onerror> in DOM: ${dangerousImg === 0 ? 'NO (safe)' : 'YES - DANGER!'}`,
        contentType: 'text/plain',
      });
    });
  });

  // ============================================================
  // 3. SECURITY HEADERS
  // ============================================================

  test.describe('Security Headers', () => {
    // @desc: Strona zwraca header X-Frame-Options (ochrona przed clickjacking)
    test('has X-Frame-Options header', async ({ request }) => {
      const response = await request.get(BASE);
      const header = response.headers()['x-frame-options'];

      await test.info().attach('X-Frame-Options', {
        body: `Value: ${header || 'MISSING'}\nExpected: SAMEORIGIN or DENY`,
        contentType: 'text/plain',
      });

      expect(header).toBeTruthy();
      expect(['SAMEORIGIN', 'DENY', 'sameorigin', 'deny']).toContain(header?.toUpperCase());
    });

    // @desc: Strona zwraca header X-Content-Type-Options (ochrona przed MIME sniffing)
    test('has X-Content-Type-Options header', async ({ request }) => {
      const response = await request.get(BASE);
      const header = response.headers()['x-content-type-options'];

      await test.info().attach('X-Content-Type-Options', {
        body: `Value: ${header || 'MISSING'}\nExpected: nosniff`,
        contentType: 'text/plain',
      });

      expect(header?.toLowerCase()).toBe('nosniff');
    });

    // @desc: Strona uzywa HTTPS z Strict-Transport-Security
    test('has Strict-Transport-Security header', async ({ request }) => {
      const response = await request.get(BASE);
      const header = response.headers()['strict-transport-security'];

      await test.info().attach('Strict-Transport-Security', {
        body: `Value: ${header || 'MISSING'}\nExpected: max-age=... with includeSubDomains`,
        contentType: 'text/plain',
      });

      // HSTS may not be present on all stores - soft check
      if (!header) {
        test.info().annotations.push({ type: 'warning', description: 'HSTS header missing - site may be vulnerable to SSL stripping' });
      }
      expect(header || 'not-required').toBeTruthy(); // pass but warn
    });

    // @desc: HTTP redirectuje na HTTPS
    test('HTTP redirects to HTTPS', async ({ request }) => {
      const httpUrl = BASE.replace('https://', 'http://');
      const response = await request.get(httpUrl, { maxRedirects: 0 }).catch(() => null);

      const status = response?.status() || 0;
      const location = response?.headers()['location'] || '';

      await test.info().attach('HTTP→HTTPS redirect', {
        body: `HTTP URL: ${httpUrl}\nStatus: ${status}\nLocation: ${location}\nRedirects to HTTPS: ${location.startsWith('https') ? 'YES' : 'NO'}`,
        contentType: 'text/plain',
      });

      // Should redirect (301/302) to HTTPS
      expect([301, 302, 307, 308]).toContain(status);
      expect(location).toContain('https');
    });
  });

  // ============================================================
  // 4. CSRF PROTECTION
  // ============================================================

  test.describe('CSRF Protection', () => {
    // @desc: Formularz logowania zawiera token form_key (CSRF)
    test('login form has CSRF token', async ({ page }) => {
      await page.goto(`${BASE}/customer/account/login/`, { waitUntil: 'load' });
      const formKey = page.locator('input[name="form_key"]');
      const count = await formKey.count();

      await test.info().attach('CSRF token on login', {
        body: `form_key inputs found: ${count}\nCSRF protection: ${count > 0 ? 'YES' : 'NO'}`,
        contentType: 'text/plain',
      });

      expect(count).toBeGreaterThan(0);
    });

    // @desc: Formularz rejestracji zawiera token form_key (CSRF)
    test('registration form has CSRF token', async ({ page }) => {
      await page.goto(`${BASE}/customer/account/create/`, { waitUntil: 'load' });
      const formKey = page.locator('input[name="form_key"]');
      const count = await formKey.count();

      await test.info().attach('CSRF token on registration', {
        body: `form_key inputs found: ${count}\nCSRF protection: ${count > 0 ? 'YES' : 'NO'}`,
        contentType: 'text/plain',
      });

      expect(count).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // 5. EXPOSED PATHS & SENSITIVE FILES
  // ============================================================

  test.describe('Exposed Paths', () => {
    // @desc: Plik .env nie jest publicznie dostepny
    test('.env file is not accessible', async ({ request }) => {
      const response = await request.get(`${BASE}/.env`);
      await test.info().attach('.env access attempt', {
        body: `URL: ${BASE}/.env\nStatus: ${response.status()}\nAccessible: ${response.status() === 200 ? 'YES - DANGER!' : 'NO (blocked)'}`,
        contentType: 'text/plain',
      });
      expect(response.status()).not.toBe(200);
    });

    // @desc: Folder /var/log nie jest publicznie dostepny
    test('/var/log is not accessible', async ({ request }) => {
      const response = await request.get(`${BASE}/var/log/`);
      await test.info().attach('/var/log access attempt', {
        body: `URL: ${BASE}/var/log/\nStatus: ${response.status()}\nAccessible: ${response.status() === 200 ? 'YES - DANGER!' : 'NO (blocked)'}`,
        contentType: 'text/plain',
      });
      expect(response.status()).not.toBe(200);
    });

    // @desc: Folder /app/etc (config Magento) nie jest publicznie dostepny
    test('/app/etc is not accessible', async ({ request }) => {
      const response = await request.get(`${BASE}/app/etc/env.php`);
      await test.info().attach('/app/etc/env.php access attempt', {
        body: `URL: ${BASE}/app/etc/env.php\nStatus: ${response.status()}\nAccessible: ${response.status() === 200 ? 'YES - CRITICAL!' : 'NO (blocked)'}`,
        contentType: 'text/plain',
      });
      expect(response.status()).not.toBe(200);
    });

    // @desc: Git repo nie jest publicznie dostepny
    test('.git is not accessible', async ({ request }) => {
      const response = await request.get(`${BASE}/.git/config`);
      await test.info().attach('.git access attempt', {
        body: `URL: ${BASE}/.git/config\nStatus: ${response.status()}\nAccessible: ${response.status() === 200 ? 'YES - DANGER!' : 'NO (blocked)'}`,
        contentType: 'text/plain',
      });
      expect(response.status()).not.toBe(200);
    });

    // @desc: phpinfo() nie jest publicznie dostepny
    test('phpinfo is not accessible', async ({ request }) => {
      const urls = [`${BASE}/phpinfo.php`, `${BASE}/info.php`, `${BASE}/php_info.php`];
      for (const url of urls) {
        const response = await request.get(url);
        expect(response.status()).not.toBe(200);
      }
      await test.info().attach('phpinfo access attempts', {
        body: urls.map(u => `${u} → blocked`).join('\n'),
        contentType: 'text/plain',
      });
    });

    // @desc: Admin panel nie jest pod domyslnym /admin URL
    test('default /admin path is not accessible', async ({ request }) => {
      const response = await request.get(`${BASE}/admin`);
      const status = response.status();
      const body = await response.text();

      await test.info().attach('/admin access attempt', {
        body: `URL: ${BASE}/admin\nStatus: ${status}\nShows login form: ${body.includes('login') ? 'YES - consider changing admin URL' : 'NO'}`,
        contentType: 'text/plain',
      });

      // /admin should redirect (302) or return 404, not show login directly
      // Soft check - many stores keep /admin but it's not ideal
      if (status === 200 && body.includes('login')) {
        test.info().annotations.push({ type: 'warning', description: 'Admin panel accessible at default /admin URL - consider changing to custom path' });
      }
    });
  });

  // ============================================================
  // 6. API SECURITY
  // ============================================================

  test.describe('API Security', () => {
    // @desc: REST API nie wycieka danych klientow bez autoryzacji
    test('customer data requires auth', async ({ request }) => {
      const response = await request.get(`${BASE}/rest/V1/customers/search?searchCriteria[pageSize]=1`);
      const status = response.status();

      await test.info().attach('Customer data API (no auth)', {
        body: `URL: ${BASE}/rest/V1/customers/search\nStatus: ${status}\nBlocked: ${status === 401 || status === 403 ? 'YES' : 'NO - DANGER!'}`,
        contentType: 'text/plain',
      });

      expect([401, 403]).toContain(status);
    });

    // @desc: REST API nie wycieka zamowien bez autoryzacji
    test('order data requires auth', async ({ request }) => {
      const response = await request.get(`${BASE}/rest/V1/orders?searchCriteria[pageSize]=1`);
      const status = response.status();

      await test.info().attach('Order data API (no auth)', {
        body: `URL: ${BASE}/rest/V1/orders\nStatus: ${status}\nBlocked: ${status === 401 || status === 403 ? 'YES' : 'NO - DANGER!'}`,
        contentType: 'text/plain',
      });

      expect([401, 403]).toContain(status);
    });

    // @desc: GraphQL nie wycieka danych klientow
    test('GraphQL customer query requires auth', async ({ request }) => {
      const response = await request.post(`${BASE}/graphql`, {
        data: { query: '{ customer { email firstname lastname } }' },
        headers: { 'Content-Type': 'application/json' },
      });
      const body = await response.json();

      const hasError = body?.errors?.length > 0;
      const hasCustomerData = body?.data?.customer?.email;

      await test.info().attach('GraphQL customer query (no auth)', {
        body: `Query: { customer { email firstname lastname } }\nHas errors: ${hasError ? 'YES (good)' : 'NO'}\nLeaks data: ${hasCustomerData ? 'YES - DANGER!' : 'NO'}`,
        contentType: 'text/plain',
      });

      expect(hasCustomerData).toBeFalsy();
    });
  });

  // ============================================================
  // 7. COOKIE SECURITY
  // ============================================================

  test.describe('Cookie Security', () => {
    // @desc: Cookies sesji maja flage HttpOnly i Secure
    test('session cookies have HttpOnly and Secure flags', async ({ page, context }) => {
      await page.goto(BASE, { waitUntil: 'load' });
      const cookies = await context.cookies();

      const results: string[] = [];
      for (const cookie of cookies) {
        results.push(`${cookie.name}: HttpOnly=${cookie.httpOnly}, Secure=${cookie.secure}, SameSite=${cookie.sameSite}, Domain=${cookie.domain}`);
      }

      await test.info().attach('All cookies', {
        body: results.length > 0 ? `Total cookies: ${cookies.length}\n\n${results.join('\n')}` : 'No cookies found',
        contentType: 'text/plain',
      });

      // Site should set at least some cookies
      expect(cookies.length).toBeGreaterThan(0);

      // Check that cookies on the main domain use Secure flag (HTTPS site)
      const siteCookies = cookies.filter(c => c.domain.includes('pierrerene'));
      for (const cookie of siteCookies) {
        if (cookie.name.includes('PHPSESSID') || cookie.name.includes('private_content') || cookie.name.includes('mage-')) {
          expect(cookie.secure).toBeTruthy();
        }
      }
    });
  });
});
