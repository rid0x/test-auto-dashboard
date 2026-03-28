import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { spawn, execSync, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const PORT = Number(process.env.DASHBOARD_PORT || 3000);
const ROOT = path.resolve(__dirname, '..');

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

  const totalTests = areas.reduce((sum, a) => sum + a.testCount, 0);
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

// --- WebSocket: Live test runner ---
const activeProcesses = new Map<string, ChildProcess>();

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (raw: Buffer) => {
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
      if (proc) {
        proc.kill('SIGTERM');
        activeProcesses.delete(msg.runId);
      }
    }
  });
});

// --- Start ---
cleanupOldReports();

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

