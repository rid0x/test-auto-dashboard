import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { spawn, execSync, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

const ROOT = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(ROOT, '.env') });

const PORT = Number(process.env.DASHBOARD_PORT || 3000);

// Catch uncaught errors for debugging
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT:', err);
});
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED:', err);
});

// Kill any existing process on our port before starting
try {
  execSync(`npx kill-port ${PORT}`, { stdio: 'ignore', timeout: 5000 });
} catch {
  // No process to kill — that's fine
}

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// --- Static files ---
app.use(express.static(path.join(__dirname, 'public')));
app.use('/reports', express.static(path.join(ROOT, 'reports')));
app.use(express.json());

// --- Types ---
interface TestDetails {
  navigations: string[];
  selectors: string[];
  assertions: string[];
  actions: string[];
}

interface TestInfo {
  name: string;
  line: number;
  tags: string[];
  warning?: string;
  description?: string;
  details: TestDetails;
}

interface AreaInfo {
  name: string;
  displayName: string;
  testCount: number;
  tests: TestInfo[];
  specFile: string;
}

interface ProjectInfo {
  name: string;
  displayName: string;
  areas: AreaInfo[];
  totalTests: number;
}

// --- Test Discovery ---

function extractTestBody(lines: string[], testLineIdx: number): string {
  let braceCount = 0;
  let started = false;
  const bodyLines: string[] = [];

  for (let i = testLineIdx; i < Math.min(testLineIdx + 200, lines.length); i++) {
    const line = lines[i];
    for (const ch of line) {
      if (ch === '{') { braceCount++; started = true; }
      if (ch === '}') braceCount--;
    }
    if (started) bodyLines.push(line);
    if (started && braceCount <= 0) break;
  }

  return bodyLines.join('\n');
}

function parseTestDetails(body: string): TestDetails {
  const navSet = new Set<string>();
  const selSet = new Set<string>();
  const assSet = new Set<string>();
  const actSet = new Set<string>();

  // --- Nawigacja (osobne regex dla ' i " i `) ---
  for (const m of body.matchAll(/page\.goto\s*\(\s*'([^']*)'/g)) navSet.add(m[1]);
  for (const m of body.matchAll(/page\.goto\s*\(\s*"([^"]*)"/g)) navSet.add(m[1]);
  for (const m of body.matchAll(/page\.goto\s*\(\s*`([^`]+)`/g)) navSet.add(m[1].replace(/\$\{([^}]+)\}/g, '${$1}'));
  for (const m of body.matchAll(/page\.goto\s*\(\s*([a-zA-Z_][\w.]*(?:\[['"\w\]]*\])*)\s*[,)]/g)) {
    const v = m[1]; if (!v.startsWith("'") && !v.startsWith('"')) navSet.add(v);
  }
  for (const m of body.matchAll(/request\.(get|post|put|delete|patch)\s*\(\s*'([^']*)'/g)) {
    navSet.add(`${m[1].toUpperCase()} ${m[2]}`);
  }
  for (const m of body.matchAll(/request\.(get|post|put|delete|patch)\s*\(\s*"([^"]*)"/g)) {
    navSet.add(`${m[1].toUpperCase()} ${m[2]}`);
  }
  for (const m of body.matchAll(/request\.(get|post|put|delete|patch)\s*\(\s*`([^`]+)`/g)) {
    navSet.add(`${m[1].toUpperCase()} ${m[2].replace(/\$\{[^}]+\}/g, '...')}`);
  }

  // --- Lokatory (osobne regex dla ' i " zeby nie obcinac has-text/name=) ---
  for (const m of body.matchAll(/\.locator\s*\(\s*'([^']*)'/g)) selSet.add(m[1]);
  for (const m of body.matchAll(/\.locator\s*\(\s*"([^"]*)"/g)) selSet.add(m[1]);
  for (const m of body.matchAll(/\.locator\s*\(\s*`([^`]*)`/g)) selSet.add(m[1]);
  for (const m of body.matchAll(/\.getByRole\s*\(\s*'([^']+)'(?:\s*,\s*\{[^}]*?name:\s*(?:'([^']*?)'|"([^"]*?)"|\/([^/]*?)\/[gimsuy]*))?/g)) {
    selSet.add(m[2] || m[3] || m[4] ? `role=${m[1]} "${m[2] || m[3] || m[4]}"` : `role=${m[1]}`);
  }
  for (const m of body.matchAll(/\.getByRole\s*\(\s*"([^"]+)"(?:\s*,\s*\{[^}]*?name:\s*(?:'([^']*?)'|"([^"]*?)"|\/([^/]*?)\/[gimsuy]*))?/g)) {
    selSet.add(m[2] || m[3] || m[4] ? `role=${m[1]} "${m[2] || m[3] || m[4]}"` : `role=${m[1]}`);
  }
  for (const m of body.matchAll(/\.getByText\s*\(\s*'([^']*)'/g)) selSet.add(`text "${m[1]}"`);
  for (const m of body.matchAll(/\.getByText\s*\(\s*"([^"]*)"/g)) selSet.add(`text "${m[1]}"`);
  for (const m of body.matchAll(/\.getByText\s*\(\s*\/([^/]+)\//g)) selSet.add(`text /${m[1]}/`);
  for (const m of body.matchAll(/\.getByPlaceholder\s*\(\s*'([^']*)'/g)) selSet.add(`placeholder "${m[1]}"`);
  for (const m of body.matchAll(/\.getByPlaceholder\s*\(\s*"([^"]*)"/g)) selSet.add(`placeholder "${m[1]}"`);
  for (const m of body.matchAll(/\.getByLabel\s*\(\s*'([^']*)'/g)) selSet.add(`label "${m[1]}"`);
  for (const m of body.matchAll(/\.getByLabel\s*\(\s*"([^"]*)"/g)) selSet.add(`label "${m[1]}"`);

  // --- Akcje ---
  if (/\.click\s*\(/.test(body)) actSet.add('klik');
  if (/\.fill\s*\(/.test(body)) actSet.add('wypełnienie pola');
  if (/\.selectOption\s*\(/.test(body)) actSet.add('wybór opcji');
  if (/\.press\s*\(/.test(body)) actSet.add('klawisz');
  if (/\.check\s*\(\s*\)/.test(body)) actSet.add('zaznaczenie');
  if (/\.uncheck\s*\(/.test(body)) actSet.add('odznaczenie');
  if (/\.hover\s*\(/.test(body)) actSet.add('hover');
  if (/\.scrollIntoViewIfNeeded\s*\(/.test(body)) actSet.add('scroll');
  if (/\.setViewportSize\s*\(/.test(body)) actSet.add('zmiana viewportu');
  // Page Object actions
  for (const m of body.matchAll(/await\s+(\w+)\.(add\w+|remove\w+|update\w+|search\w+|login\w+|register\w+|navigate\w+|open\w+|goto\w+|fill\w+|click\w+|select\w+)\s*\(/g)) {
    if (!['page','expect','test','console'].includes(m[1])) actSet.add(`${m[1]}.${m[2]}()`);
  }

  // --- Asercje ---
  const visibleCount = (body.match(/toBeVisible\s*\(/g) || []).length;
  if (visibleCount > 0) assSet.add(visibleCount > 1 ? `widoczność (${visibleCount}x)` : 'widoczność');
  if (body.includes('toBeAttached')) assSet.add('obecność w DOM');
  if (body.includes('not.toBeVisible') || body.includes('toBeHidden')) assSet.add('element ukryty');
  if (body.includes('toBeChecked')) assSet.add('checkbox zaznaczony');
  if (body.includes('toBeEnabled')) assSet.add('element aktywny');
  if (body.includes('toBeDisabled')) assSet.add('element nieaktywny');
  for (const m of body.matchAll(/toHaveURL\s*\(\s*(?:['"]([^'"]*?)['"]|\/([^/]*?)\/)/g)) assSet.add(`URL: ${m[1] || m[2]}`);
  for (const m of body.matchAll(/toHaveTitle\s*\(\s*(?:['"]([^'"]*?)['"]|\/([^/]*?)\/)/g)) assSet.add(`tytuł: ${m[1] || m[2]}`);
  for (const m of body.matchAll(/toContainText\s*\(\s*'([^']*)'/g)) assSet.add(`zawiera "${m[1]}"`);
  for (const m of body.matchAll(/toContainText\s*\(\s*"([^"]*)"/g)) assSet.add(`zawiera "${m[1]}"`);
  for (const m of body.matchAll(/toContainText\s*\(\s*\/([^/]*?)\//g)) assSet.add(`zawiera /${m[1]}/`);
  for (const m of body.matchAll(/toHaveText\s*\(\s*'([^']*)'/g)) assSet.add(`tekst "${m[1]}"`);
  for (const m of body.matchAll(/toHaveText\s*\(\s*"([^"]*)"/g)) assSet.add(`tekst "${m[1]}"`);
  for (const m of body.matchAll(/toHaveCount\s*\(\s*(\d+)/g)) assSet.add(`count = ${m[1]}`);
  for (const m of body.matchAll(/toHaveAttribute\s*\(\s*'([^']*)'\s*,\s*'?([^')]*)'?\s*\)/g)) assSet.add(`atrybut ${m[1]}="${m[2]}"`);
  for (const m of body.matchAll(/toHaveAttribute\s*\(\s*"([^"]*)"\s*,\s*"?([^")]*)"?\s*\)/g)) assSet.add(`atrybut ${m[1]}="${m[2]}"`);
  if (body.match(/toHaveAttribute\s*\(\s*['"]type['"]/)) assSet.add('atrybut type');
  if (body.includes('toBeGreaterThan')) assSet.add('count > 0');
  if (body.includes('not.toHaveCount(0)')) assSet.add('count > 0');
  if (body.includes('toBeTruthy')) assSet.add('wartość truthy');
  if (/\.toPass\s*\(/.test(body)) assSet.add('z retry (toPass)');
  if (/console.*error/i.test(body) && body.includes('expect')) assSet.add('brak błędów konsoli');
  for (const m of body.matchAll(/waitForResponse\s*\([^)]*?['"]([^'"]+?)['"]/g)) assSet.add(`czeka na API: ${m[1]}`);
  for (const m of body.matchAll(/waitForResponse\s*\(\s*(?:resp|response|r)\s*=>[^)]*?\.includes\s*\(\s*['"]([^'"]+?)['"]/g)) assSet.add(`czeka na API: ${m[1]}`);
  for (const m of body.matchAll(/status\s*\(\s*\)[^.]*\.toBe\s*\(\s*(\d+)/g)) assSet.add(`HTTP ${m[1]}`);
  if (body.includes('skipIfRecaptcha')) assSet.add('skip jesli reCAPTCHA');
  // Page Object verifications
  for (const m of body.matchAll(/await\s+(\w+)\.(verify\w+|check\w+|assert\w+|expect\w+|validate\w+|should\w+)\s*\(/g)) {
    if (!['page','expect','test','console'].includes(m[1])) assSet.add(`${m[1]}.${m[2]}()`);
  }

  return {
    navigations: [...navSet],
    selectors: [...selSet],
    assertions: [...assSet],
    actions: [...actSet],
  };
}

function extractTestsFromFile(filePath: string, projectName?: string): TestInfo[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const tests: TestInfo[] = [];
  const lines = content.split('\n');

  // Load project config to check actual reCAPTCHA status
  let recaptchaAreas: Set<string> = new Set();
  if (projectName) {
    try {
      const configPath = path.join(ROOT, 'config', `${projectName}.config.ts`);
      const configContent = fs.readFileSync(configPath, 'utf-8');
      if (configContent.includes('hasRecaptchaOnLogin: true')) recaptchaAreas.add('login');
      if (configContent.includes('hasRecaptchaOnRegistration: true')) recaptchaAreas.add('registration');
      if (configContent.includes('hasRecaptchaOnCheckout: true')) recaptchaAreas.add('checkout');
    } catch {}
  }

  // Detect which area this file belongs to
  const fileArea = filePath.replace(/\\/g, '/').match(/tests\/([^/]+)\//)?.[1] || '';

  lines.forEach((line, idx) => {
    const match = line.match(/^\s*test\s*\(\s*['"`](.+?)['"`]/);
    if (match && !line.includes('test.describe') && !line.includes('test.beforeEach') && !line.includes('test.afterAll') && !line.includes('test.beforeAll') && !line.includes('test.afterEach')) {
      const name = match[1];
      const tags = (name.match(/@[\w-]+/g) || []);

      // Only show warning if reCAPTCHA is ACTUALLY configured for this area in this project
      let warning: string | undefined;
      if (recaptchaAreas.has(fileArea)) {
        const bodyLines = lines.slice(idx, Math.min(idx + 20, lines.length)).join('\n');
        if (bodyLines.includes('skipIfRecaptcha') || bodyLines.includes('skipIfRecaptchaConfigured')) {
          warning = 'reCAPTCHA aktywna na tej stronie — test może zostać skipnięty automatycznie (nie jest to błąd).';
        }
      }

      // Extract @desc comment from line above test declaration
      let description: string | undefined;
      if (idx > 0) {
        const prevLine = lines[idx - 1].trim();
        const descMatch = prevLine.match(/\/\/\s*@desc:\s*(.+)/);
        if (descMatch) {
          description = descMatch[1].trim();
        }
      }

      const body = extractTestBody(lines, idx);
      const details = parseTestDetails(body);
      tests.push({ name, line: idx + 1, tags, warning, description, details });
    }
  });

  return tests;
}

function discoverProject(projectName: string): ProjectInfo | null {
  const projectDir = path.join(ROOT, 'src', 'projects', projectName);
  if (!fs.existsSync(projectDir)) return null;

  const testsDir = path.join(projectDir, 'tests');
  const apiDir = path.join(projectDir, 'api');
  const areas: AreaInfo[] = [];

  // Scan test directories
  if (fs.existsSync(testsDir)) {
    const areaDirs = fs.readdirSync(testsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const areaDir of areaDirs) {
      const areaPath = path.join(testsDir, areaDir.name);
      const specFiles = fs.readdirSync(areaPath).filter(f => f.endsWith('.spec.ts'));

      for (const specFile of specFiles) {
        const specPath = path.join(areaPath, specFile);
        const tests = extractTestsFromFile(specPath, projectName);
        const displayName = areaDir.name
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());

        areas.push({
          name: areaDir.name,
          displayName,
          testCount: tests.length,
          tests,
          specFile: path.relative(ROOT, specPath).replace(/\\/g, '/'),
        });
      }
    }
  }

  // Scan API tests
  if (fs.existsSync(apiDir)) {
    const specFiles = fs.readdirSync(apiDir).filter(f => f.endsWith('.spec.ts'));
    for (const specFile of specFiles) {
      const specPath = path.join(apiDir, specFile);
      const tests = extractTestsFromFile(specPath, projectName);
      areas.push({
        name: 'api',
        displayName: 'API Tests',
        testCount: tests.length,
        tests,
        specFile: path.relative(ROOT, specPath).replace(/\\/g, '/'),
      });
    }
  }

  // Exclude dedicated-button areas from total count
  const excludeFromTotal = ['smoke', 'security', 'seo', 'a11y', 'performance', 'links'];
  const totalTests = areas.filter(a => !excludeFromTotal.includes(a.name)).reduce((sum, a) => sum + a.testCount, 0);
  const displayName = projectName.charAt(0).toUpperCase() + projectName.slice(1);

  return { name: projectName, displayName, areas, totalTests };
}

function discoverAllProjects(): ProjectInfo[] {
  const projectsDir = path.join(ROOT, 'src', 'projects');
  if (!fs.existsSync(projectsDir)) return [];

  return fs.readdirSync(projectsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => discoverProject(d.name))
    .filter(Boolean) as ProjectInfo[];
}

// --- Report Archival ---

function archiveReport(project: string): string | null {
  const htmlDir = path.join(ROOT, 'reports', project, 'html');
  if (!fs.existsSync(path.join(htmlDir, 'index.html'))) return null;

  const now = new Date();
  const ts = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const archiveBase = path.join(ROOT, 'reports', project, 'html-archive');
  const archiveDir = path.join(archiveBase, ts);

  if (!fs.existsSync(archiveBase)) fs.mkdirSync(archiveBase, { recursive: true });

  // Copy html dir to archive
  copyDirSync(htmlDir, archiveDir);

  return `/reports/${project}/html-archive/${ts}/index.html`;
}

function copyDirSync(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function cleanupOldReports(maxAgeDays = 30): void {
  const reportsDir = path.join(ROOT, 'reports');
  if (!fs.existsSync(reportsDir)) return;

  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  let cleaned = 0;

  for (const projectDir of fs.readdirSync(reportsDir, { withFileTypes: true })) {
    if (!projectDir.isDirectory()) continue;
    const archiveBase = path.join(reportsDir, projectDir.name, 'html-archive');
    if (!fs.existsSync(archiveBase)) continue;

    for (const archiveDir of fs.readdirSync(archiveBase, { withFileTypes: true })) {
      if (!archiveDir.isDirectory()) continue;
      const dirPath = path.join(archiveBase, archiveDir.name);
      try {
        const stat = fs.statSync(dirPath);
        if (stat.mtimeMs < cutoff) {
          fs.rmSync(dirPath, { recursive: true, force: true });
          cleaned++;
        }
      } catch {}
    }
  }

  if (cleaned > 0) console.log(`  🧹 Cleaned up ${cleaned} old report(s) (>30 days)`);
}

// --- History ---

function getHistoryPath(project: string): string {
  const dir = path.join(ROOT, 'reports', project);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, 'history.json');
}

function loadHistory(project: string): any[] {
  const p = getHistoryPath(project);
  if (fs.existsSync(p)) {
    try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return []; }
  }
  return [];
}

function saveHistory(project: string, entry: any): void {
  const history = loadHistory(project);
  history.unshift(entry); // newest first
  // Keep last 100 runs
  const trimmed = history.slice(0, 100);
  fs.writeFileSync(getHistoryPath(project), JSON.stringify(trimmed, null, 2));
}

// --- Helpers: Naming & Validation ---

function toPascalCase(name: string): string {
  return name.replace(/(^|[-_])(\w)/g, (_, _sep, ch) => ch.toUpperCase());
}

function toConfigVarName(name: string): string {
  // "4szpaki" → "szpakiConfig", "my-shop" → "myshopConfig"
  const clean = name.replace(/^[0-9]+/, '').replace(/-/g, '');
  return (clean || name.replace(/-/g, '')) + 'Config';
}

function validateProjectName(name: string): string | null {
  if (!name) return 'Nazwa projektu jest wymagana';
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) return 'Nazwa musi składać się z małych liter, cyfr i myślników';
  if (name.length > 30) return 'Nazwa max 30 znaków';
  const reserved = ['core', 'reports', 'config', 'dashboard', 'node_modules', 'src'];
  if (reserved.includes(name)) return 'Nazwa zarezerwowana';
  const projectDir = path.join(ROOT, 'src', 'projects', name);
  if (fs.existsSync(projectDir)) return 'Projekt o tej nazwie już istnieje';
  return null;
}

function validatePathSafety(filePath: string): boolean {
  const resolved = path.resolve(filePath);
  return resolved.startsWith(path.resolve(ROOT));
}

// --- Helpers: Area & Page mappings ---

const STANDARD_AREAS = ['login', 'registration', 'homepage', 'search', 'product-page', 'cart', 'category', 'checkout', 'footer'];
const EXTRA_AREAS = ['security', 'seo', 'a11y', 'performance', 'links', 'smoke'];
const ALL_AREAS = [...STANDARD_AREAS, 'api', ...EXTRA_AREAS];

const AREA_TO_PAGE: Record<string, string> = {
  'login': 'LoginPage', 'registration': 'RegistrationPage', 'homepage': 'HomePage',
  'search': 'SearchPage', 'product-page': 'ProductPage', 'cart': 'CartPage',
  'category': 'CategoryPage', 'checkout': 'CheckoutPage',
};

const AREA_TO_TAG: Record<string, string> = {
  'login': '@login @e2e', 'registration': '@registration @e2e', 'homepage': '@homepage @e2e',
  'search': '@search @e2e', 'product-page': '@product-page @e2e', 'cart': '@cart @e2e',
  'category': '@category @e2e', 'checkout': '@checkout @e2e', 'footer': '@footer @e2e',
  'api': '@api', 'security': '@security', 'seo': '@seo', 'a11y': '@a11y',
  'performance': '@performance', 'links': '@links', 'smoke': '@smoke @e2e',
};

const CORE_PAGES = ['LoginPage', 'RegistrationPage', 'HomePage', 'SearchPage', 'ProductPage', 'CartPage', 'CategoryPage', 'CheckoutPage'];

// --- Template Generators ---

function ensureHttps(url: string): string {
  if (!url) return 'https://example.pl';
  url = url.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url;
}

function generateConfigTemplate(name: string, data: any): string {
  const varName = toConfigVarName(name);
  const envPrefix = name.toUpperCase().replace(/-/g, '_');
  const baseUrl = ensureHttps(data.baseUrl);
  data.baseUrl = baseUrl; // normalize for all uses below
  return `import { ProjectConfig } from '../src/core/types/project.types';

export const ${varName}: ProjectConfig = {
  name: '${name}',
  baseUrl: process.env.${envPrefix}_BASE_URL || '${data.baseUrl || 'https://example.pl'}',

  credentials: {
    valid: {
      email: process.env.${envPrefix}_USER_EMAIL || '${data.credentials?.valid?.email || ''}',
      password: process.env.${envPrefix}_USER_PASSWORD || '${data.credentials?.valid?.password || ''}',
    },
    invalid: {
      email: '${data.credentials?.invalid?.email || 'invalid@example.pl'}',
      password: '${data.credentials?.invalid?.password || 'WrongPassword123!'}',
    },
  },

  registration: {
    testEmail: \`aurorabot-\${Date.now()}@auroracreation.com\`,
    testPassword: 'AutoTest123!@#',
    firstName: '${data.registration?.firstName || 'Aurora'}',
    lastName: '${data.registration?.lastName || 'Bot'}',
  },

  search: {
    validQuery: '${data.search?.validQuery || 'test'}',
    invalidQuery: '${data.search?.invalidQuery || 'qwertyasdfghzxcvbn99999'}',
    expectedResultMinCount: ${data.search?.expectedResultMinCount || 1},
  },

  product: {
    url: '${data.product?.url || '/sample-product'}',
    name: '${data.product?.name || 'Sample Product'}',
  },

  category: {
    url: '${data.category?.url || '/category'}',
    name: '${data.category?.name || 'Category'}',
    expectedMinProducts: ${data.category?.expectedMinProducts || 3},
  },

  features: {
    hasRecaptchaOnLogin: ${data.features?.hasRecaptchaOnLogin || false},
    hasRecaptchaOnRegistration: ${data.features?.hasRecaptchaOnRegistration || false},
    hasRecaptchaOnCheckout: ${data.features?.hasRecaptchaOnCheckout || false},
    hasCookieConsent: ${data.features?.hasCookieConsent || false},
    cookieConsentSelector: '${data.features?.cookieConsentSelector || ''}',
  },

  api: {
    baseUrl: process.env.${envPrefix}_API_URL || '${data.baseUrl || 'https://example.pl'}',
    restEndpoint: '/rest/V1',
    graphqlEndpoint: '/graphql',
  },
};
`;
}

function generateFixtureTemplate(name: string): string {
  const pascal = toPascalCase(name);
  const pages = CORE_PAGES.map(p => `${pascal}${p}`);
  const imports = pages.map(p => `import { ${p} } from './pages/${p}';`).join('\n');
  const mapping = [
    `  loginPage: ${pascal}LoginPage,`,
    `  registrationPage: ${pascal}RegistrationPage,`,
    `  homePage: ${pascal}HomePage,`,
    `  searchPage: ${pascal}SearchPage,`,
    `  cartPage: ${pascal}CartPage,`,
    `  checkoutPage: ${pascal}CheckoutPage,`,
    `  productPage: ${pascal}ProductPage,`,
    `  categoryPage: ${pascal}CategoryPage,`,
  ].join('\n');

  return `import { createProjectFixture } from '../../core/fixtures/base.fixture';
${imports}

export const test = createProjectFixture('${name}', {
${mapping}
});

export { expect } from '../../core/helpers/custom-expect';
`;
}

function generatePageObjectTemplate(projectName: string, corePage: string): string {
  const pascal = toPascalCase(projectName);
  const className = `${pascal}${corePage}`;
  return `import { ${corePage} } from '../../../core/pages/${corePage}';
import { healable, HealableLocator } from '../../../core/helpers/auto-healing';

export class ${className} extends ${corePage} {
  // Override selectors that differ from the core defaults
  // See src/core/pages/${corePage}.ts for available overrides
}
`;
}

function generatePagesIndexTemplate(projectName: string): string {
  const pascal = toPascalCase(projectName);
  return CORE_PAGES.map(p => `export { ${pascal}${p} } from './${pascal}${p}';`).join('\n') + '\n';
}

function generateEmptySpecTemplate(projectName: string, areaName: string): string {
  const displayName = toPascalCase(projectName);
  const tag = AREA_TO_TAG[areaName] || `@${areaName} @e2e`;
  const areaDisplayName = areaName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Special areas (security, seo, a11y, etc.) import config directly
  const isSpecialArea = EXTRA_AREAS.includes(areaName) || areaName === 'api';
  if (isSpecialArea) {
    const configVar = toConfigVarName(projectName);
    // api/ is 4 levels deep, tests/{area}/ is 5 levels deep
    const configRelPath = areaName === 'api' ? '../../../../config' : '../../../../../config';
    return `import { test, expect } from '@playwright/test';
import { ${configVar} } from '${configRelPath}/${projectName}.config';

const config = ${configVar};

test.describe('${displayName} - ${areaDisplayName} ${tag}', () => {
  // Add tests here
});
`;
  }

  return `import { test, expect } from '../../fixture';

test.describe('${displayName} - ${areaDisplayName} ${tag}', () => {
  // Add tests here
});
`;
}

function generateEmptyTestBlock(testName: string): string {
  return `
  // @desc: ${testName}
  test('${testName}', async ({ page }) => {
    await test.step('TODO: implement', async () => {
      // Add test steps here
    });

    const screenshot = await page.screenshot();
    await test.info().attach('${testName}', { body: screenshot, contentType: 'image/png' });
  });`;
}

// --- Config/Types file updaters ---

function addProjectToConfigIndex(name: string): void {
  const configIndexPath = path.join(ROOT, 'config', 'index.ts');
  let content = fs.readFileSync(configIndexPath, 'utf-8');
  const varName = toConfigVarName(name);

  // Add import line (before the blank line or 'const' line)
  const importLine = `import { ${varName} } from './${name}.config';`;
  const lastImportIdx = content.lastIndexOf("import {");
  const nextNewline = content.indexOf('\n', lastImportIdx);
  content = content.slice(0, nextNewline + 1) + importLine + '\n' + content.slice(nextNewline + 1);

  // Add to projectConfigs record (before the closing '};')
  const recordClose = content.indexOf('};', content.indexOf('const projectConfigs'));
  // Ensure previous line has trailing comma
  const beforeClose = content.slice(0, recordClose).trimEnd();
  const lastNonWhitespace = beforeClose[beforeClose.length - 1];
  if (lastNonWhitespace && lastNonWhitespace !== ',' && lastNonWhitespace !== '{') {
    // Find the last non-whitespace position and add comma
    const lastCharIdx = content.lastIndexOf(lastNonWhitespace, recordClose);
    content = content.slice(0, lastCharIdx + 1) + ',' + content.slice(lastCharIdx + 1);
  }
  // Re-find recordClose after potential comma insertion
  const recordClose2 = content.indexOf('};', content.indexOf('const projectConfigs'));
  const entry = `  '${name}': ${varName},\n`;
  content = content.slice(0, recordClose2) + entry + content.slice(recordClose2);

  // Add to export line
  const exportMatch = content.match(/export \{([^}]+)\};/);
  if (exportMatch) {
    const existing = exportMatch[1].trim();
    content = content.replace(exportMatch[0], `export { ${existing}, ${varName} };`);
  }

  fs.writeFileSync(configIndexPath, content);
}

function removeProjectFromConfigIndex(name: string): void {
  const configIndexPath = path.join(ROOT, 'config', 'index.ts');
  let content = fs.readFileSync(configIndexPath, 'utf-8');
  const varName = toConfigVarName(name);

  // Remove import line
  const importRegex = new RegExp(`import \\{ ${varName} \\} from '\\.\\/${name}\\.config';\\n?`);
  content = content.replace(importRegex, '');

  // Remove from projectConfigs record
  const entryRegex = new RegExp(`\\s*'${name}':\\s*${varName},?\\n?`);
  content = content.replace(entryRegex, '\n');

  // Remove from export line
  const exportRegex = new RegExp(`,?\\s*${varName}`);
  content = content.replace(exportRegex, '');
  // Clean up double commas or leading comma in export
  content = content.replace(/export \{\s*,/, 'export {');
  content = content.replace(/,\s*\}/, ' }');

  fs.writeFileSync(configIndexPath, content);
}

function addProjectToTypeUnion(name: string): void {
  const typesPath = path.join(ROOT, 'src', 'core', 'types', 'project.types.ts');
  let content = fs.readFileSync(typesPath, 'utf-8');
  // Find the ProjectName union line
  const unionRegex = /(export type ProjectName\s*=\s*)([^;]+)(;)/;
  const match = content.match(unionRegex);
  if (match) {
    const existing = match[2].trim();
    content = content.replace(unionRegex, `$1${existing} | '${name}'$3`);
    fs.writeFileSync(typesPath, content);
  }
}

function removeProjectFromTypeUnion(name: string): void {
  const typesPath = path.join(ROOT, 'src', 'core', 'types', 'project.types.ts');
  let content = fs.readFileSync(typesPath, 'utf-8');
  // Remove from union
  content = content.replace(new RegExp(`\\s*\\|\\s*'${name}'`), '');
  content = content.replace(new RegExp(`'${name}'\\s*\\|\\s*`), '');
  fs.writeFileSync(typesPath, content);
}

// --- Skeleton Generation (from existing project templates) ---

function generateSkeletonSpec(projectName: string, areaName: string): string | null {
  // Find an existing project that has this area — use it as template
  const projectsDir = path.join(ROOT, 'src', 'projects');
  const templateProjects = fs.readdirSync(projectsDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== projectName)
    .map(d => d.name);

  for (const tmplProject of templateProjects) {
    const specDir = areaName === 'api'
      ? path.join(projectsDir, tmplProject, 'api')
      : path.join(projectsDir, tmplProject, 'tests', areaName);
    const specFile = areaName === 'api' ? 'api.spec.ts' : `${areaName}.spec.ts`;
    const specPath = path.join(specDir, specFile);

    if (fs.existsSync(specPath)) {
      let content = fs.readFileSync(specPath, 'utf-8');

      // Replace template project name with new project name
      const tmplPascal = toPascalCase(tmplProject);
      const newPascal = toPascalCase(projectName);
      const tmplConfigVar = toConfigVarName(tmplProject);
      const newConfigVar = toConfigVarName(projectName);

      // Replace in test.describe title
      content = content.replace(new RegExp(tmplPascal, 'g'), newPascal);
      content = content.replace(new RegExp(`'${tmplProject}'`, 'g'), `'${projectName}'`);
      content = content.replace(new RegExp(`"${tmplProject}"`, 'g'), `"${projectName}"`);

      // Replace config imports
      content = content.replace(new RegExp(tmplConfigVar, 'g'), newConfigVar);
      content = content.replace(new RegExp(`/${tmplProject}\\.config`, 'g'), `/${projectName}.config`);

      // Replace env var references (e.g., SZPAKI_USER_EMAIL)
      const tmplEnvPrefix = tmplProject.toUpperCase().replace(/-/g, '_');
      const newEnvPrefix = projectName.toUpperCase().replace(/-/g, '_');
      content = content.replace(new RegExp(tmplEnvPrefix, 'g'), newEnvPrefix);

      return content;
    }
  }

  // No template found — return a basic skeleton with common tests
  return null;
}

// --- AI Integration ---

async function callAnthropicAPI(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY nie jest skonfigurowany. Ustaw go w Ustawieniach dashboardu.');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic API error ${response.status}: ${err}`);
    }

    const data = await response.json() as any;
    let text = data.content?.[0]?.text || '';
    // Strip markdown code fences
    text = text.replace(/^```(?:typescript|ts)?\n?/m, '').replace(/\n?```$/m, '');
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

function buildTestGenerationContext(projectName: string, areaName: string): { system: string; context: string } {
  // Load project config
  let configContent = '';
  try {
    configContent = fs.readFileSync(path.join(ROOT, 'config', `${projectName}.config.ts`), 'utf-8');
  } catch {}

  // Load core page object
  const corePage = AREA_TO_PAGE[areaName];
  let corePageContent = '';
  let projectPageContent = '';
  if (corePage) {
    try {
      corePageContent = fs.readFileSync(path.join(ROOT, 'src', 'core', 'pages', `${corePage}.ts`), 'utf-8');
    } catch {}
    const pascal = toPascalCase(projectName);
    try {
      projectPageContent = fs.readFileSync(path.join(ROOT, 'src', 'projects', projectName, 'pages', `${pascal}${corePage}.ts`), 'utf-8');
    } catch {}
  }

  // Load existing spec
  let existingSpec = '';
  const specDir = areaName === 'api' ? 'api' : `tests/${areaName}`;
  const specFile = areaName === 'api' ? 'api.spec.ts' : `${areaName}.spec.ts`;
  try {
    existingSpec = fs.readFileSync(path.join(ROOT, 'src', 'projects', projectName, specDir, specFile), 'utf-8');
  } catch {}

  // Load testing guide (truncated)
  let testingGuide = '';
  try {
    testingGuide = fs.readFileSync(path.join(ROOT, 'TESTING-GUIDE.md'), 'utf-8').substring(0, 3000);
  } catch {}

  const system = `Jesteś ekspertem Playwright do testowania sklepów Magento e-commerce.
Piszesz testy w TypeScript zgodnie z wzorcami projektu.

DOSTĘPNE PARAMETRY FIXTURE (destructuring w async callback):
- { page } — standardowy Playwright Page
- { config } — ProjectConfig z configa projektu (config.baseUrl, config.credentials, config.search, config.product, config.category, config.features)
- { loginPage } — page object LoginPage (metody: goto(), login(email, password), loginWithValidCredentials(), expectLoginSuccess(), expectLoginError(), isOnLoginPage())
- { registrationPage } — RegistrationPage
- { homePage } — HomePage
- { searchPage } — SearchPage (metody: goto(), search(query), expectResults(), expectNoResults())
- { cartPage } — CartPage
- { checkoutPage } — CheckoutPage
- { productPage } — ProductPage (metody: goto(), addToCart(), expectAddToCartSuccess())
- { categoryPage } — CategoryPage
- { projectName } — string z nazwą projektu

NIGDY nie używaj parametrów które nie istnieją (np. "testConfig", "request" w fixture — NIE MA ICH).
Jeśli potrzebujesz request, użyj: const request = page.context().request; lub page.request

WAŻNE ZASADY:
- TESTUJ DOKŁADNIE TO CO USER OPISAŁ — nic więcej, nic mniej. Nie dodawaj extra sprawdzeń których user nie prosił
- Zawsze używaj test.step() do logicznego grupowania
- Zawsze dodawaj komentarz // @desc: nad każdym testem (po polsku)
- Dodawaj screenshot na końcu testu
- Używaj TYLKO parametrów z listy powyżej
- NIE duplikuj istniejących testów
- Zwracaj TYLKO blok test() — bez importów, bez test.describe wrapper
- Pisz po angielsku nazwy testów, po polsku @desc komentarze
- Używaj expect() z konkretnymi asercjami (nie toBeTruthy na statusach)
- BĄDŹ MINIMALNY — prosty test = prosty kod. Jeśli user chce sprawdzić 200, to sprawdź 200 i nic więcej`;

  const context = `KONFIGURACJA PROJEKTU:\n${configContent}\n\nCORE PAGE OBJECT:\n${corePageContent}\n\nPROJECT PAGE OVERRIDE:\n${projectPageContent}\n\nISNIEJĄCE TESTY W TYM OBSZARZE:\n${existingSpec}\n\nWZORCE Z TESTING GUIDE:\n${testingGuide}`;

  return { system, context };
}

// --- Chat Sessions ---

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  messages: ChatMessage[];
  project: string;
  area: string;
}

const chatSessions = new Map<WebSocket, ChatSession>();

function getChatSession(ws: WebSocket, project?: string, area?: string): ChatSession {
  let session = chatSessions.get(ws);
  if (!session || (project && session.project !== project) || (area && session.area !== area)) {
    session = { messages: [], project: project || '', area: area || '' };
    chatSessions.set(ws, session);
  }
  return session;
}

function buildChatSystemPrompt(project: string, area: string): string {
  const { system, context } = buildTestGenerationContext(project, area);
  return `${system}

JESTEŚ INTERAKTYWNYM ASYSTENTEM TESTOWYM W DASHBOARDZIE.
Odpowiadaj po polsku, krótko i konkretnie.

ZASADY KONWERSACJI:
- Jak user prosi o test — wygeneruj go w bloku \`\`\`typescript ... \`\`\`
- Generuj TYLKO blok test() — bez importów, bez test.describe
- Po wygenerowaniu powiedz krótko co test robi
- Jak user wkleja błędy — przeanalizuj i zaproponuj poprawiony kod w bloku \`\`\`typescript
- Jak user pyta o selektory — zaproponuj użycie codegen
- Bądź zwięzły — max 2-3 zdania + kod

KONTEKST PROJEKTU:
${context}`;
}

async function streamAnthropicChat(
  ws: WebSocket,
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY nie skonfigurowany — kliknij koło zębate w headerze');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        stream: true,
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API ${response.status}: ${err}`);
    }

    let fullText = '';
    const reader = response.body as any;

    // Parse SSE stream
    const decoder = new TextDecoder();
    let buffer = '';

    for await (const chunk of reader) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              const token = parsed.delta.text;
              fullText += token;
              ws.send(JSON.stringify({ type: 'chat:delta', token }));
            }
          } catch {}
        }
      }
    }

    ws.send(JSON.stringify({ type: 'chat:complete', fullMessage: fullText }));
    return fullText;
  } finally {
    clearTimeout(timeout);
  }
}

// Extract code blocks from AI response
function extractCodeBlocks(text: string): string[] {
  const blocks: string[] = [];
  const regex = /```(?:typescript|ts)?\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}

// Auto-run a test block (temp write, run, rollback)
async function autoRunTestBlock(
  ws: WebSocket,
  project: string,
  area: string,
  code: string,
): Promise<{ passed: boolean; errorOutput: string; screenshots: string[] }> {
  return new Promise((resolve) => {
    const specDir = area === 'api' ? path.join(ROOT, 'src', 'projects', project, 'api') : path.join(ROOT, 'src', 'projects', project, 'tests', area);
    const specFile = area === 'api' ? 'api.spec.ts' : `${area}.spec.ts`;
    const specPath = path.join(specDir, specFile);

    if (!fs.existsSync(specPath)) {
      resolve({ passed: false, errorOutput: `Spec file not found: ${specPath}`, screenshots: [] });
      return;
    }

    const originalContent = fs.readFileSync(specPath, 'utf-8');
    const lines = originalContent.split('\n');

    let insertIdx = lines.length - 1;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].match(/^\s{0,2}\}\);/)) { insertIdx = i; break; }
    }
    lines.splice(insertIdx, 0, '\n' + code + '\n');
    fs.writeFileSync(specPath, lines.join('\n'));

    const testNameMatch = code.match(/test\s*\(\s*['"`](.+?)['"`]/);
    const testName = testNameMatch ? testNameMatch[1] : '';
    const escaped = testName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cmdString = `npx playwright test --grep "${escaped}" --project ${project}-desktop-chrome`;

    ws.send(JSON.stringify({ type: 'chat:status', status: 'running', message: `Uruchamiam test: ${testName}...` }));
    ws.send(JSON.stringify({ type: 'run:start', runId: `chat-${Date.now()}`, project, area, command: `[AUTO] PROJECT=${project} ${cmdString}` }));

    const proc = spawn(cmdString, [], {
      cwd: ROOT,
      env: { ...process.env, PROJECT: project, FORCE_COLOR: '0' },
      shell: true,
    });

    let fullOutput = '';
    let passedTests = 0, failedTests = 0;
    const screenshotPaths: string[] = [];

    proc.stdout?.on('data', (d: Buffer) => {
      const text = d.toString();
      fullOutput += text;
      for (const ln of text.split('\n')) {
        if (ln.match(/^\s*(ok|✓)\s+\d+/)) passedTests++;
        else if (ln.match(/^\s*(x|✗|×)\s+\d+/)) failedTests++;
        // Capture screenshot paths from Playwright output
        const screenMatch = ln.match(/reports[\\\/].*\.png/);
        if (screenMatch) {
          const relPath = '/' + screenMatch[0].replace(/\\/g, '/');
          if (!screenshotPaths.includes(relPath)) screenshotPaths.push(relPath);
        }
      }
      ws.send(JSON.stringify({ type: 'run:output', data: text }));
    });
    proc.stderr?.on('data', (d: Buffer) => {
      fullOutput += d.toString();
      ws.send(JSON.stringify({ type: 'run:output', data: d.toString() }));
    });

    const killTimer = setTimeout(() => { proc.kill('SIGTERM'); }, 60000);

    proc.on('close', (exitCode: number | null) => {
      clearTimeout(killTimer);
      fs.writeFileSync(specPath, originalContent);

      const passed = exitCode === 0;

      // Also scan test-results dir for screenshots (backup method)
      const resultsDir = path.join(ROOT, 'reports', project, 'test-results');
      if (fs.existsSync(resultsDir)) {
        const scanDir = (dir: string) => {
          try {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
              const full = path.join(dir, entry.name);
              if (entry.isDirectory()) scanDir(full);
              else if ((entry.name.endsWith('.png') || entry.name.endsWith('.jpg'))) {
                // Only files modified in last 60 seconds (from this run)
                try {
                  const stat = fs.statSync(full);
                  if (Date.now() - stat.mtimeMs < 60000) {
                    const rel = '/reports/' + path.relative(path.join(ROOT, 'reports'), full).replace(/\\/g, '/');
                    if (!screenshotPaths.includes(rel)) screenshotPaths.push(rel);
                  }
                } catch {}
              }
            }
          } catch {}
        };
        scanDir(resultsDir);
      }

      ws.send(JSON.stringify({ type: 'run:complete', exitCode, project, passed: passedTests, failed: failedTests }));
      resolve({ passed, errorOutput: passed ? '' : fullOutput.slice(-2000), screenshots: screenshotPaths.slice(0, 5) });
    });
  });
}

// --- API Routes ---

app.get('/api/projects', (_req, res) => {
  const projects = discoverAllProjects();
  res.json(projects);
});

app.get('/api/history/:project', (req, res) => {
  const history = loadHistory(req.params.project);
  res.json(history);
});

app.get('/api/projects/:name', (req, res) => {
  const project = discoverProject(req.params.name);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

// Last run results
app.get('/api/results/:project', (req, res) => {
  const resultsFile = path.join(ROOT, 'reports', req.params.project, 'results.json');
  if (fs.existsSync(resultsFile)) {
    const data = JSON.parse(fs.readFileSync(resultsFile, 'utf-8'));
    res.json(data);
  } else {
    res.json(null);
  }
});

// Project notes (*.md files)
app.get('/api/notes/:project', (req, res) => {
  const projectDir = path.join(ROOT, 'src', 'projects', req.params.project);
  const mdFiles = [
    path.join(projectDir, `${req.params.project}.md`),
    path.join(projectDir, 'notes.md'),
    path.join(projectDir, 'README.md'),
  ];

  for (const mdFile of mdFiles) {
    if (fs.existsSync(mdFile)) {
      const content = fs.readFileSync(mdFile, 'utf-8');
      return res.json({ file: path.basename(mdFile), content });
    }
  }
  res.json(null);
});

// All projects summary (pass/fail from latest results + history)
app.get('/api/summary', (_req, res) => {
  const projectsDir = path.join(ROOT, 'src', 'projects');
  if (!fs.existsSync(projectsDir)) return res.json([]);

  const summaries = fs.readdirSync(projectsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => {
      const name = d.name;
      const resultsFile = path.join(ROOT, 'reports', name, 'results.json');
      const history = loadHistory(name);
      const lastRun = history.length > 0 ? history[0] : null;

      // Check if project notes exist
      const hasNotes = [
        path.join(projectsDir, name, `${name}.md`),
        path.join(projectsDir, name, 'notes.md'),
      ].some(f => fs.existsSync(f));

      return {
        name,
        lastRun: lastRun ? {
          date: lastRun.date,
          passed: lastRun.passed || 0,
          failed: lastRun.failed || 0,
          skipped: lastRun.skipped || 0,
          total: lastRun.total || 0,
          duration: lastRun.duration || 0,
        } : null,
        hasNotes,
      };
    });

  res.json(summaries);
});

// --- CRUD: Projects ---

app.post('/api/projects', (req, res) => {
  try {
    const { name, baseUrl, credentials, registration, search, product, category, areas, generateMode } = req.body;
    // Auto-prefix cookie consent selector with text= if needed
    const features = req.body.features || {};
    if (features.cookieConsentSelector) {
      const sel = features.cookieConsentSelector.trim();
      if (sel && !sel.startsWith('text=') && !sel.startsWith('.') && !sel.startsWith('#') && !sel.startsWith('[')) {
        features.cookieConsentSelector = 'text=' + sel;
      }
    }

    // Validate
    const nameError = validateProjectName(name);
    if (nameError) return res.status(400).json({ error: nameError });
    if (!baseUrl) return res.status(400).json({ error: 'baseUrl jest wymagany' });

    const createdPaths: string[] = [];
    try {
      // 1. Config file
      const configPath = path.join(ROOT, 'config', `${name}.config.ts`);
      fs.writeFileSync(configPath, generateConfigTemplate(name, req.body));
      createdPaths.push(configPath);

      // 2. Project directory structure
      const projectDir = path.join(ROOT, 'src', 'projects', name);
      fs.mkdirSync(projectDir, { recursive: true });
      createdPaths.push(projectDir);

      // 3. Pages
      const pagesDir = path.join(projectDir, 'pages');
      fs.mkdirSync(pagesDir, { recursive: true });
      fs.writeFileSync(path.join(pagesDir, 'index.ts'), generatePagesIndexTemplate(name));
      for (const corePage of CORE_PAGES) {
        const pascal = toPascalCase(name);
        fs.writeFileSync(path.join(pagesDir, `${pascal}${corePage}.ts`), generatePageObjectTemplate(name, corePage));
      }

      // 4. Fixture
      fs.writeFileSync(path.join(projectDir, 'fixture.ts'), generateFixtureTemplate(name));

      // 5. Test areas
      const selectedAreas: string[] = areas || STANDARD_AREAS;
      const testsDir = path.join(projectDir, 'tests');
      fs.mkdirSync(testsDir, { recursive: true });

      for (const area of selectedAreas) {
        if (area === 'api') {
          const apiDir = path.join(projectDir, 'api');
          fs.mkdirSync(apiDir, { recursive: true });
          fs.writeFileSync(path.join(apiDir, 'api.spec.ts'), generateEmptySpecTemplate(name, 'api'));
        } else {
          const areaDir = path.join(testsDir, area);
          fs.mkdirSync(areaDir, { recursive: true });
          fs.writeFileSync(path.join(areaDir, `${area}.spec.ts`), generateEmptySpecTemplate(name, area));
        }
      }

      // 6. Update config/index.ts
      addProjectToConfigIndex(name);

      // 7. Update ProjectName union
      addProjectToTypeUnion(name);

      console.log(`  ✅ Project "${name}" created with ${selectedAreas.length} areas`);
      res.json({ success: true, name, areas: selectedAreas });
    } catch (err: any) {
      // Rollback
      for (const p of createdPaths.reverse()) {
        try { fs.rmSync(p, { recursive: true, force: true }); } catch {}
      }
      throw err;
    }
  } catch (err: any) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: err.message || 'Błąd tworzenia projektu' });
  }
});

app.delete('/api/projects/:name', (req, res) => {
  try {
    const { name } = req.params;
    const projectDir = path.join(ROOT, 'src', 'projects', name);
    if (!fs.existsSync(projectDir)) return res.status(404).json({ error: 'Projekt nie istnieje' });

    // Remove project directory
    fs.rmSync(projectDir, { recursive: true, force: true });

    // Remove config file
    const configPath = path.join(ROOT, 'config', `${name}.config.ts`);
    if (fs.existsSync(configPath)) fs.rmSync(configPath);

    // Update config/index.ts
    try { removeProjectFromConfigIndex(name); } catch (e) { console.error('Warning: config index update failed:', e); }

    // Update ProjectName union
    try { removeProjectFromTypeUnion(name); } catch (e) { console.error('Warning: type union update failed:', e); }

    // Remove from uptime data
    try {
      const uptimeData = loadUptimeData();
      if (uptimeData[name]) {
        delete uptimeData[name];
        saveUptimeData(uptimeData);
      }
    } catch (e) { console.error('Warning: uptime cleanup failed:', e); }

    console.log(`  🗑️ Project "${name}" deleted`);
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/:name/config', (req, res) => {
  try {
    const configPath = path.join(ROOT, 'config', `${req.params.name}.config.ts`);
    if (!fs.existsSync(configPath)) return res.status(404).json({ error: 'Config not found' });
    const content = fs.readFileSync(configPath, 'utf-8');
    res.json({ content, path: path.relative(ROOT, configPath).replace(/\\/g, '/') });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- CRUD: Areas ---

app.post('/api/projects/:name/areas', (req, res) => {
  try {
    const { name } = req.params;
    const { areaName } = req.body;

    if (!areaName || !/^[a-z][a-z0-9-]*$/.test(areaName)) {
      return res.status(400).json({ error: 'Nieprawidłowa nazwa obszaru' });
    }

    const projectDir = path.join(ROOT, 'src', 'projects', name);
    if (!fs.existsSync(projectDir)) return res.status(404).json({ error: 'Projekt nie istnieje' });

    if (areaName === 'api') {
      const apiDir = path.join(projectDir, 'api');
      if (fs.existsSync(apiDir)) return res.status(400).json({ error: 'Obszar API już istnieje' });
      fs.mkdirSync(apiDir, { recursive: true });
      fs.writeFileSync(path.join(apiDir, 'api.spec.ts'), generateEmptySpecTemplate(name, 'api'));
    } else {
      const areaDir = path.join(projectDir, 'tests', areaName);
      if (fs.existsSync(areaDir)) return res.status(400).json({ error: 'Obszar już istnieje' });
      fs.mkdirSync(areaDir, { recursive: true });
      fs.writeFileSync(path.join(areaDir, `${areaName}.spec.ts`), generateEmptySpecTemplate(name, areaName));
    }

    console.log(`  ✅ Area "${areaName}" added to project "${name}"`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:name/areas/:area', (req, res) => {
  try {
    const { name, area } = req.params;
    const projectDir = path.join(ROOT, 'src', 'projects', name);

    let areaDir: string;
    if (area === 'api') {
      areaDir = path.join(projectDir, 'api');
    } else {
      areaDir = path.join(projectDir, 'tests', area);
    }

    if (!fs.existsSync(areaDir)) return res.status(404).json({ error: 'Obszar nie istnieje' });
    fs.rmSync(areaDir, { recursive: true, force: true });

    console.log(`  🗑️ Area "${area}" deleted from project "${name}"`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- CRUD: Tests ---

app.post('/api/projects/:name/areas/:area/tests', async (req, res) => {
  try {
    const { name, area } = req.params;
    const { description, generateMode } = req.body;

    // Find the spec file
    const specDir = area === 'api' ? path.join(ROOT, 'src', 'projects', name, 'api') : path.join(ROOT, 'src', 'projects', name, 'tests', area);
    const specFile = area === 'api' ? 'api.spec.ts' : `${area}.spec.ts`;
    const specPath = path.join(specDir, specFile);

    if (!fs.existsSync(specPath)) return res.status(404).json({ error: 'Plik spec nie istnieje' });

    const content = fs.readFileSync(specPath, 'utf-8');
    const lines = content.split('\n');

    // Find last closing of test.describe (last '});' at indent 0-1)
    let insertAfterLine = lines.length - 1;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].match(/^\s{0,2}\}\);/)) {
        insertAfterLine = i;
        break;
      }
    }

    let proposedCode: string;

    if (generateMode === 'ai') {
      const { system, context } = buildTestGenerationContext(name, area);
      const userPrompt = `${context}\n\nUŻYTKOWNIK CHCE PRZETESTOWAĆ:\n${description}\n\nWygeneruj test() block w TypeScript. Użyj page objectów z fixture. Dodaj // @desc: komentarz. Dodaj screenshoty.`;
      proposedCode = await callAnthropicAPI(system, userPrompt);
    } else {
      proposedCode = generateEmptyTestBlock(description || 'new test');
    }

    const relSpecFile = path.relative(ROOT, specPath).replace(/\\/g, '/');
    res.json({ proposedCode, specFile: relSpecFile, insertBeforeLine: insertAfterLine });
  } catch (err: any) {
    console.error('Error generating test:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects/:name/areas/:area/tests/confirm', (req, res) => {
  try {
    const { code, specFile } = req.body;
    const specPath = path.join(ROOT, specFile);

    if (!validatePathSafety(specPath)) return res.status(400).json({ error: 'Nieprawidłowa ścieżka' });
    if (!fs.existsSync(specPath)) return res.status(404).json({ error: 'Plik spec nie istnieje' });

    const content = fs.readFileSync(specPath, 'utf-8');
    const lines = content.split('\n');

    // Find last '});' (closing of test.describe) and insert before it
    let insertIdx = lines.length - 1;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].match(/^\s{0,2}\}\);/)) {
        insertIdx = i;
        break;
      }
    }

    // Insert the test code before the closing '});'
    const codeToInsert = '\n' + code + '\n';
    lines.splice(insertIdx, 0, codeToInsert);

    fs.writeFileSync(specPath, lines.join('\n'));
    console.log(`  ✅ Test added to ${specFile}`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:name/areas/:area/tests', (req, res) => {
  try {
    const { testName, line } = req.body;
    const { name, area } = req.params;

    const specDir = area === 'api' ? path.join(ROOT, 'src', 'projects', name, 'api') : path.join(ROOT, 'src', 'projects', name, 'tests', area);
    const specFile = area === 'api' ? 'api.spec.ts' : `${area}.spec.ts`;
    const specPath = path.join(specDir, specFile);

    if (!fs.existsSync(specPath)) return res.status(404).json({ error: 'Plik spec nie istnieje' });

    const content = fs.readFileSync(specPath, 'utf-8');
    const lines = content.split('\n');

    // Find the test block starting from the given line (0-indexed: line-1)
    const startIdx = line - 1;
    if (startIdx < 0 || startIdx >= lines.length) return res.status(400).json({ error: 'Nieprawidłowy numer linii' });

    // Also remove @desc comment above if present
    let removeStart = startIdx;
    if (removeStart > 0 && lines[removeStart - 1].trim().startsWith('// @desc:')) {
      removeStart--;
    }
    // Remove blank line above @desc if present
    if (removeStart > 0 && lines[removeStart - 1].trim() === '') {
      removeStart--;
    }

    // Find end of test block
    let braceCount = 0;
    let started = false;
    let removeEnd = startIdx;
    for (let i = startIdx; i < lines.length; i++) {
      for (const ch of lines[i]) {
        if (ch === '{') { braceCount++; started = true; }
        if (ch === '}') braceCount--;
      }
      if (started && braceCount <= 0) {
        removeEnd = i;
        break;
      }
    }

    lines.splice(removeStart, removeEnd - removeStart + 1);
    fs.writeFileSync(specPath, lines.join('\n'));

    console.log(`  🗑️ Test "${testName}" deleted from ${specFile}`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- File Editor ---

app.get('/api/files', (req, res) => {
  try {
    const filePath = req.query.path as string;
    if (!filePath) return res.status(400).json({ error: 'path is required' });

    const fullPath = path.join(ROOT, filePath);
    if (!validatePathSafety(fullPath)) return res.status(400).json({ error: 'Invalid path' });
    if (!fs.existsSync(fullPath)) return res.status(404).json({ error: 'File not found' });

    const content = fs.readFileSync(fullPath, 'utf-8');
    res.json({ content, path: filePath });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/files', (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    if (!filePath || content === undefined) return res.status(400).json({ error: 'path and content are required' });

    const fullPath = path.join(ROOT, filePath);
    if (!validatePathSafety(fullPath)) return res.status(400).json({ error: 'Invalid path' });
    if (!fs.existsSync(fullPath)) return res.status(404).json({ error: 'File not found' });

    fs.writeFileSync(fullPath, content);
    console.log(`  📝 File saved: ${filePath}`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- AI Endpoints ---

app.get('/api/ai/status', (_req, res) => {
  res.json({ configured: !!process.env.ANTHROPIC_API_KEY });
});

app.post('/api/settings/ai-key', (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) return res.status(400).json({ error: 'API key is required' });

    const envPath = path.join(ROOT, '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
    }

    if (envContent.includes('ANTHROPIC_API_KEY=')) {
      envContent = envContent.replace(/ANTHROPIC_API_KEY=.*/, `ANTHROPIC_API_KEY=${apiKey}`);
    } else {
      envContent += `\nANTHROPIC_API_KEY=${apiKey}\n`;
    }

    fs.writeFileSync(envPath, envContent);
    process.env.ANTHROPIC_API_KEY = apiKey;

    console.log('  🔑 Anthropic API key updated');
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/generate-test', async (req, res) => {
  try {
    const { project, area, description } = req.body;
    if (!project || !area || !description) return res.status(400).json({ error: 'project, area, description are required' });

    const { system, context } = buildTestGenerationContext(project, area);
    const userPrompt = `${context}\n\nUŻYTKOWNIK CHCE PRZETESTOWAĆ:\n${description}\n\nWygeneruj test() block w TypeScript. Użyj page objectów z fixture. Dodaj // @desc: komentarz. Dodaj screenshoty.`;

    const proposedCode = await callAnthropicAPI(system, userPrompt);
    res.json({ proposedCode });
  } catch (err: any) {
    console.error('AI generate-test error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/generate-area', async (req, res) => {
  try {
    const { project, area } = req.body;
    if (!project || !area) return res.status(400).json({ error: 'project, area are required' });

    const { system, context } = buildTestGenerationContext(project, area);
    const areaDisplay = area.replace(/-/g, ' ');
    const userPrompt = `${context}\n\nWygeneruj KOMPLETNY zestaw testów dla obszaru "${areaDisplay}" w sklepie Magento.
Uwzględnij: happy path, error cases, edge cases. Dla każdego testu dodaj // @desc: komentarz.
Zwróć CAŁY plik spec.ts — z importami, test.describe, i wszystkimi testami.
Użyj fixture import: import { test, expect } from '../../fixture';
Tag: ${AREA_TO_TAG[area] || '@' + area + ' @e2e'}`;

    const proposedCode = await callAnthropicAPI(system, userPrompt);
    res.json({ proposedCode });
  } catch (err: any) {
    console.error('AI generate-area error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/generate-skeleton', (req, res) => {
  try {
    const { project, area } = req.body;
    if (!project || !area) return res.status(400).json({ error: 'project, area are required' });

    const skeleton = generateSkeletonSpec(project, area);
    if (skeleton) {
      res.json({ proposedCode: skeleton });
    } else {
      res.json({ proposedCode: generateEmptySpecTemplate(project, area) });
    }
  } catch (err: any) {
    console.error('Skeleton generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/fix-locators', async (req, res) => {
  try {
    const { project, area, description, fileContent } = req.body;
    if (!fileContent || !description) return res.status(400).json({ error: 'fileContent and description are required' });

    const { system } = buildTestGenerationContext(project || '', area || '');

    // Detect if fileContent is a full file or just a test block
    const isFullFile = fileContent.includes('import ') && fileContent.includes('test.describe');
    const formatInstruction = isFullFile
      ? 'Zwróć CAŁY poprawiony plik — nie tylko fragment. Zachowaj formatowanie, importy i styl.'
      : 'Zwróć TYLKO poprawiony blok test() — bez importów, bez test.describe wrapper. Taki sam format jak na wejściu.';

    const fixSystem = system + `\n\nTwoim zadaniem jest naprawienie kodu testowego.
Przeanalizuj błędy z terminala i napraw KOD TESTU tak żeby przeszedł.
Typowe problemy: zły parametr fixture (używaj TYLKO: page, config, loginPage, homePage, searchPage, cartPage, productPage, categoryPage, checkoutPage, registrationPage, projectName), zły selektor, zły URL, timeout, brak await.
${formatInstruction}
NIE dodawaj nic extra — napraw TYLKO to co jest zepsute.`;

    const userPrompt = `KOD TESTOWY:\n${fileContent}\n\nBŁĘDY / PROBLEM:\n${description}\n\nNapraw kod.`;

    const proposedCode = await callAnthropicAPI(fixSystem, userPrompt);
    res.json({ proposedCode });
  } catch (err: any) {
    console.error('AI fix-locators error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- Codegen / Inspector ---

app.post('/api/codegen', (req, res) => {
  try {
    const { project, url } = req.body;

    // Determine URL
    let targetUrl = url;
    if (!targetUrl && project) {
      const configPath = path.join(ROOT, 'config', `${project}.config.ts`);
      if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf-8');
        const urlMatch = configContent.match(/baseUrl.*?['"]([^'"]+)['"]/);
        if (urlMatch) targetUrl = urlMatch[1];
      }
    }
    targetUrl = targetUrl || 'https://example.com';

    const proc = spawn('npx', ['playwright', 'codegen', targetUrl], {
      cwd: ROOT,
      shell: true,
      detached: true,
      stdio: 'ignore',
    });
    proc.unref();

    console.log(`  🎭 Codegen launched for ${targetUrl} (PID: ${proc.pid})`);
    res.json({ pid: proc.pid, url: targetUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inspector', (req, res) => {
  try {
    const { project, area, testName } = req.body;
    const args = ['playwright', 'test', '--debug'];

    if (testName) {
      const escaped = testName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      args.push('--grep', `"${escaped}"`);
    } else if (area) {
      args.push('--grep', `@${area}`);
    }

    args.push('--project', `${project}-desktop-chrome`);

    const proc = spawn('npx', args, {
      cwd: ROOT,
      env: { ...process.env, PROJECT: project },
      shell: true,
      detached: true,
      stdio: 'ignore',
    });
    proc.unref();

    console.log(`  🔍 Inspector launched for ${project}/${area || 'all'} (PID: ${proc.pid})`);
    res.json({ pid: proc.pid });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- WebSocket: Live test runner ---
const activeProcesses = new Map<string, ChildProcess>();

wss.on('connection', (ws: WebSocket) => {
  ws.on('close', () => { chatSessions.delete(ws); });
  ws.on('message', async (raw: Buffer) => {
    let msg: any;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.type === 'run') {
      const { project, area, testName, headed, browser, device } = msg;
      const runId = `${project}-${area || 'all'}-${Date.now()}`;

      // Build playwright command
      const args = ['playwright', 'test'];

      if (testName) {
        const escaped = testName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        args.push('--grep', `"${escaped}"`);
      } else if (area && area !== 'all') {
        const tag = area === 'api' ? '@api' : `@${area}`;
        args.push('--grep', tag);
      } else {
        // "all" mode: exclude dedicated-button tests
        args.push('--grep-invert', '@smoke|@security|@seo|@a11y|@performance|@links');
      }

      if (headed) {
        args.push('--headed');
      }

      // Map browser + device to Playwright project name(s)
      const browserMap: Record<string, Record<string, string>> = {
        chromium: { desktop: `${project}-desktop-chrome`, mobile: `${project}-mobile-chrome` },
        firefox:  { desktop: `${project}-desktop-firefox`, mobile: `${project}-desktop-firefox` },
        webkit:   { desktop: `${project}-desktop-safari`,  mobile: `${project}-mobile-safari` },
      };

      const selectedBrowser = browser || 'chromium';
      const selectedDevice = device || 'desktop';

      if (selectedBrowser === 'all' && selectedDevice === 'all') {
        // Run ALL projects — don't add --project
      } else if (selectedBrowser === 'all') {
        // All browsers, specific device
        const browsers = ['chromium', 'firefox', 'webkit'];
        const projectNames = browsers.map(b => browserMap[b]?.[selectedDevice]).filter(Boolean);
        for (const pn of projectNames) {
          args.push('--project', pn);
        }
      } else if (selectedDevice === 'all') {
        // Specific browser, all devices
        const devices = ['desktop', 'mobile'];
        const projectNames = devices.map(d => browserMap[selectedBrowser]?.[d]).filter(Boolean);
        // Deduplicate (firefox desktop=mobile)
        const unique = [...new Set(projectNames)];
        for (const pn of unique) {
          args.push('--project', pn);
        }
      } else {
        const projectName = browserMap[selectedBrowser]?.[selectedDevice] || `${project}-desktop-chrome`;
        args.push('--project', projectName);
      }

      // Don't override reporter — use config's reporters (list + html + allure + json)
      // Config already has correct output paths

      const env = {
        ...process.env,
        PROJECT: project,
        FORCE_COLOR: '0',
      };

      // Build full command string — necessary on Windows where shell: true
      // doesn't properly handle array args with spaces
      const cmdParts = ['npx', ...args];
      const cmdString = cmdParts.join(' ');

      ws.send(JSON.stringify({
        type: 'run:start',
        runId,
        project,
        area,
        command: `PROJECT=${project} ${cmdString}`,
      }));

      const proc = spawn(cmdString, [], {
        cwd: ROOT,
        env,
        shell: true,
      });

      activeProcesses.set(runId, proc);

      // --- Progress tracking ---
      let totalTests = 0;
      let passedTests = 0;
      let failedTests = 0;
      let skippedTests = 0;
      const startTime = Date.now();
      const healingEvents: string[] = [];

      const parseOutput = (raw: string) => {
        const text = raw.toString();

        // Detect total test count: "Running 71 tests using 2 workers"
        const totalMatch = text.match(/Running (\d+) test/);
        if (totalMatch) totalTests = parseInt(totalMatch[1]);

        // Detect individual test results
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.match(/^\s*(ok|✓)\s+\d+/)) passedTests++;
          else if (line.match(/^\s*(x|✗|×)\s+\d+/)) failedTests++;
          else if (line.match(/^\s*-\s+\d+/)) skippedTests++;

          if (line.includes('[AUTO-HEAL]')) healingEvents.push(line.trim());
        }

        // Send progress update
        const done = passedTests + failedTests + skippedTests;
        if (totalTests > 0) {
          ws.send(JSON.stringify({
            type: 'run:progress',
            runId,
            total: totalTests,
            done,
            passed: passedTests,
            failed: failedTests,
            skipped: skippedTests,
            percent: Math.round((done / totalTests) * 100),
          }));
        }

        // Forward raw output
        ws.send(JSON.stringify({ type: 'run:output', runId, data: text }));
      };

      proc.stdout?.on('data', parseOutput);
      proc.stderr?.on('data', parseOutput);

      proc.on('close', (code: number | null) => {
        activeProcesses.delete(runId);
        const duration = Date.now() - startTime;

        // Archive HTML report to timestamped directory
        const archivedReportUrl = archiveReport(project);

        // Save to history
        const historyEntry = {
          id: runId,
          date: new Date().toISOString(),
          project,
          area: area || 'all',
          testName: testName || null,
          browser: selectedBrowser,
          device: selectedDevice,
          total: totalTests,
          passed: passedTests,
          failed: failedTests,
          skipped: skippedTests,
          duration,
          exitCode: code,
          healingEvents,
          reportUrl: archivedReportUrl,
        };
        saveHistory(project, historyEntry);

        ws.send(JSON.stringify({
          type: 'run:complete',
          runId,
          ...historyEntry,
        }));
      });
    }

    if (msg.type === 'stop') {
      const proc = activeProcesses.get(msg.runId);
      if (proc && proc.pid) {
        // On Windows, SIGTERM doesn't kill child processes — use taskkill
        try {
          execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: 'ignore', timeout: 5000 });
        } catch {
          proc.kill('SIGTERM');
        }
        activeProcesses.delete(msg.runId);
        ws.send(JSON.stringify({ type: 'run:output', data: '\n⏹️ Testy zatrzymane przez uzytkownika\n' }));
        ws.send(JSON.stringify({ type: 'run:complete', exitCode: -1, project: msg.project || '' }));
      }
    }

    // --- Chat ---
    if (msg.type === 'chat:send') {
      const { message, project, area } = msg;
      if (!message || !project) return;

      const session = getChatSession(ws, project, area);
      session.messages.push({ role: 'user', content: message });

      // Keep last 20 messages
      if (session.messages.length > 20) {
        session.messages = session.messages.slice(-20);
      }

      const systemPrompt = buildChatSystemPrompt(project, area);

      try {
        const fullResponse = await streamAnthropicChat(ws, systemPrompt, session.messages);
        session.messages.push({ role: 'assistant', content: fullResponse });

        // Check for code blocks → auto-run
        const codeBlocks = extractCodeBlocks(fullResponse);
        if (codeBlocks.length > 0 && area) {
          const testCode = codeBlocks[codeBlocks.length - 1]; // last code block
          // Only auto-run if it looks like a test block
          if (testCode.includes('test(') || testCode.includes('test.step(')) {
            ws.send(JSON.stringify({ type: 'chat:autoRunStart' }));

            const result = await autoRunTestBlock(ws, project, area, testCode);

            if (result.passed) {
              ws.send(JSON.stringify({ type: 'chat:testResult', passed: true, code: testCode, screenshots: result.screenshots }));
              // Add result to conversation
              session.messages.push({ role: 'user', content: '[SYSTEM] Test PRZESZEDŁ pomyślnie.' });
              // AI responds to success
              const successResponse = await streamAnthropicChat(ws, systemPrompt, session.messages);
              session.messages.push({ role: 'assistant', content: successResponse });
            } else {
              ws.send(JSON.stringify({ type: 'chat:testResult', passed: false, errorOutput: result.errorOutput, screenshots: result.screenshots }));
              // Feed error back to AI for auto-fix
              session.messages.push({
                role: 'user',
                content: `[SYSTEM] Test NIE PRZESZEDŁ. Błędy:\n${result.errorOutput}\n\nNapraw test. Zwróć poprawiony kod w bloku \`\`\`typescript.`
              });
              // AI auto-fixes
              const fixResponse = await streamAnthropicChat(ws, systemPrompt, session.messages);
              session.messages.push({ role: 'assistant', content: fixResponse });

              // Try auto-run the fix
              const fixBlocks = extractCodeBlocks(fixResponse);
              if (fixBlocks.length > 0) {
                const fixCode = fixBlocks[fixBlocks.length - 1];
                if (fixCode.includes('test(') || fixCode.includes('test.step(')) {
                  ws.send(JSON.stringify({ type: 'chat:autoRunStart' }));
                  const fixResult = await autoRunTestBlock(ws, project, area, fixCode);
                  ws.send(JSON.stringify({ type: 'chat:testResult', passed: fixResult.passed, code: fixCode, errorOutput: fixResult.errorOutput, screenshots: fixResult.screenshots }));

                  if (fixResult.passed) {
                    session.messages.push({ role: 'user', content: '[SYSTEM] Poprawiony test PRZESZEDŁ!' });
                    const yayResponse = await streamAnthropicChat(ws, systemPrompt, session.messages);
                    session.messages.push({ role: 'assistant', content: yayResponse });
                  } else {
                    session.messages.push({ role: 'user', content: `[SYSTEM] Poprawiony test dalej nie przechodzi. Błędy:\n${fixResult.errorOutput}\n\nZaproponuj inny fix lub poproś usera o pomoc (codegen).` });
                    const retryResponse = await streamAnthropicChat(ws, systemPrompt, session.messages);
                    session.messages.push({ role: 'assistant', content: retryResponse });
                  }
                }
              }
            }
          }
        }
      } catch (err: any) {
        ws.send(JSON.stringify({ type: 'chat:error', error: err.message }));
      }
    }

    if (msg.type === 'chat:reset') {
      chatSessions.delete(ws);
      ws.send(JSON.stringify({ type: 'chat:cleared' }));
    }

    // --- Try Test: temp write → run → rollback ---
    if (msg.type === 'tryTest') {
      const { project, area, code, specFile, headed } = msg;
      const specPath = path.join(ROOT, specFile);

      if (!fs.existsSync(specPath)) {
        ws.send(JSON.stringify({ type: 'tryTest:error', error: 'Spec file not found' }));
        return;
      }

      // Save original for rollback
      const originalContent = fs.readFileSync(specPath, 'utf-8');
      const lines = originalContent.split('\n');

      // Insert test before last '});'
      let insertIdx = lines.length - 1;
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].match(/^\s{0,2}\}\);/)) { insertIdx = i; break; }
      }
      lines.splice(insertIdx, 0, '\n' + code + '\n');
      fs.writeFileSync(specPath, lines.join('\n'));

      // Extract test name
      const testNameMatch = code.match(/test\s*\(\s*['"`](.+?)['"`]/);
      const testName = testNameMatch ? testNameMatch[1] : '';
      const escaped = testName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const args = ['playwright', 'test', '--grep', `"${escaped}"`, '--project', `${project}-desktop-chrome`];
      if (headed) args.push('--headed');
      const cmdString = ['npx', ...args].join(' ');

      ws.send(JSON.stringify({
        type: 'run:start',
        runId: `try-${Date.now()}`,
        project,
        area,
        command: `[PROBA] PROJECT=${project} ${cmdString}`,
      }));

      const proc = spawn(cmdString, [], {
        cwd: ROOT,
        env: { ...process.env, PROJECT: project, FORCE_COLOR: '0' },
        shell: true,
      });

      let totalTests = 0, passedTests = 0, failedTests = 0, skippedTests = 0;
      const startTime = Date.now();
      let fullOutput = '';
      let finished = false;

      const parseOutput = (raw: Buffer) => {
        const text = raw.toString();
        fullOutput += text;

        const totalMatch = text.match(/Running (\d+) test/);
        if (totalMatch) totalTests = parseInt(totalMatch[1]);

        for (const line of text.split('\n')) {
          if (line.match(/^\s*(ok|✓)\s+\d+/)) passedTests++;
          else if (line.match(/^\s*(x|✗|×)\s+\d+/)) failedTests++;
          else if (line.match(/^\s*-\s+\d+/)) skippedTests++;
        }

        const done = passedTests + failedTests + skippedTests;
        if (totalTests > 0) {
          ws.send(JSON.stringify({ type: 'run:progress', total: totalTests, done, passed: passedTests, failed: failedTests, skipped: skippedTests }));
        }
        ws.send(JSON.stringify({ type: 'run:output', data: text }));
      };

      proc.stdout?.on('data', parseOutput);
      proc.stderr?.on('data', parseOutput);

      // Safety timeout — kill after 60s to prevent hanging
      const killTimer = setTimeout(() => {
        if (!finished) {
          proc.kill('SIGTERM');
          ws.send(JSON.stringify({ type: 'run:output', data: '\n⏱️ Timeout — test przerwany po 60s\n' }));
        }
      }, 60000);

      proc.on('close', (exitCode: number | null) => {
        finished = true;
        clearTimeout(killTimer);
        // ROLLBACK — restore original file
        fs.writeFileSync(specPath, originalContent);
        console.log(`  🧪 Try test "${testName}": ${exitCode === 0 ? 'PASSED' : 'FAILED'} — file restored`);

        const passed = exitCode === 0;
        // Truncate output for AI context (last 3000 chars most relevant)
        const errorOutput = fullOutput.length > 3000 ? fullOutput.slice(-3000) : fullOutput;

        ws.send(JSON.stringify({
          type: 'tryTest:complete',
          passed,
          exitCode,
          testName,
          duration: Date.now() - startTime,
          passedCount: passedTests,
          failedCount: failedTests,
          errorOutput: passed ? '' : errorOutput,
        }));

        ws.send(JSON.stringify({
          type: 'run:complete',
          exitCode,
          project,
          passed: passedTests,
          failed: failedTests,
          skipped: skippedTests,
          duration: Date.now() - startTime,
        }));
      });
    }
  });
});

// --- Uptime Monitoring ---

interface UptimePing {
  timestamp: string;
  status: number;
  responseTime: number;
  ok: boolean;
}

interface UptimeStore {
  name: string;
  url: string;
  current: 'up' | 'down' | 'unknown';
  lastCheck: string | null;
  lastStatus: number;
  lastResponseTime: number;
  uptime24h: number; // percentage
  history: UptimePing[]; // last 288 pings (24h at 5min intervals)
}

const UPTIME_INTERVAL = 60 * 1000; // 1 minute
const UPTIME_HISTORY_MAX = 1440; // 24h of 1min pings

function getUptimePath(): string {
  const dir = path.join(ROOT, 'reports');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, 'uptime.json');
}

function loadUptimeData(): Record<string, UptimeStore> {
  const p = getUptimePath();
  if (fs.existsSync(p)) {
    try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return {}; }
  }
  return {};
}

function saveUptimeData(data: Record<string, UptimeStore>): void {
  fs.writeFileSync(getUptimePath(), JSON.stringify(data, null, 2));
}

function getStoreUrls(): { name: string; url: string }[] {
  const projectsDir = path.join(ROOT, 'src', 'projects');
  if (!fs.existsSync(projectsDir)) return [];

  const stores: { name: string; url: string }[] = [];
  const configDir = path.join(ROOT, 'config');

  for (const file of fs.readdirSync(configDir)) {
    if (!file.endsWith('.config.ts') || file === 'index.ts') continue;
    const content = fs.readFileSync(path.join(configDir, file), 'utf-8');
    const urlMatch = content.match(/baseUrl.*?['"]([^'"]+)['"]/);
    const nameMatch = content.match(/name:\s*['"]([^'"]+)['"]/);
    if (urlMatch && nameMatch) {
      stores.push({ name: nameMatch[1], url: urlMatch[1] });
    }
  }
  return stores;
}

async function pingStore(url: string): Promise<UptimePing> {
  const start = Date.now();
  return new Promise((resolve) => {
    try {
      const lib = url.startsWith('https') ? require('https') : require('http');
      const req = lib.get(url, { timeout: 10000, headers: { 'User-Agent': 'UptimeMonitor/1.0' } }, (res: any) => {
        res.resume(); // drain response
        resolve({
          timestamp: new Date().toISOString(),
          status: res.statusCode || 0,
          responseTime: Date.now() - start,
          ok: res.statusCode >= 200 && res.statusCode < 400,
        });
      });
      req.on('error', () => {
        resolve({ timestamp: new Date().toISOString(), status: 0, responseTime: Date.now() - start, ok: false });
      });
      req.on('timeout', () => {
        req.destroy();
        resolve({ timestamp: new Date().toISOString(), status: 0, responseTime: Date.now() - start, ok: false });
      });
    } catch {
      resolve({ timestamp: new Date().toISOString(), status: 0, responseTime: Date.now() - start, ok: false });
    }
  });
}

async function runUptimeCheck(): Promise<void> {
  try {
  const stores = getStoreUrls();
  const data = loadUptimeData();

  for (const store of stores) {
    const ping = await pingStore(store.url);

    if (!data[store.name]) {
      data[store.name] = {
        name: store.name,
        url: store.url,
        current: 'unknown',
        lastCheck: null,
        lastStatus: 0,
        lastResponseTime: 0,
        uptime24h: 100,
        history: [],
      };
    }

    const entry = data[store.name];
    entry.url = store.url;
    entry.current = ping.ok ? 'up' : 'down';
    entry.lastCheck = ping.timestamp;
    entry.lastStatus = ping.status;
    entry.lastResponseTime = ping.responseTime;
    entry.history.unshift(ping);
    entry.history = entry.history.slice(0, UPTIME_HISTORY_MAX);

    // Calculate 24h uptime percentage
    const okCount = entry.history.filter(h => h.ok).length;
    entry.uptime24h = entry.history.length > 0 ? Math.round((okCount / entry.history.length) * 1000) / 10 : 100;
  }

  saveUptimeData(data);

  // Notify connected WebSocket clients
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'uptime:update', data }));
    }
  });
  } catch (e) {
    console.error('Uptime check error (non-fatal):', e);
  }
}

// API endpoint for uptime data
app.get('/api/uptime', (_req, res) => {
  res.json(loadUptimeData());
});

// Start uptime monitoring
let uptimeTimer: ReturnType<typeof setInterval> | null = null;
function startUptimeMonitoring() {
  console.log(`  📡 Uptime monitoring started (every ${UPTIME_INTERVAL / 1000}s)`);
  runUptimeCheck(); // First check immediately
  uptimeTimer = setInterval(runUptimeCheck, UPTIME_INTERVAL);
}

// --- Start ---
cleanupOldReports();
startUptimeMonitoring();

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`\n  ⚠️  Port ${PORT} is busy. Trying ${Number(PORT) + 1}...`);
    server.listen(Number(PORT) + 1, () => {
      console.log(`\n  🚀 Test Dashboard running at http://localhost:${Number(PORT) + 1}\n`);
    });
  } else {
    throw err;
  }
});

server.listen(PORT, () => {
  console.log(`\n  🚀 Test Dashboard running at http://localhost:${PORT}\n`);
});

