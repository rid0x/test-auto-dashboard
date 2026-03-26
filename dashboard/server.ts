import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { spawn, execSync, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const PORT = Number(process.env.DASHBOARD_PORT || 3000);
const ROOT = path.resolve(__dirname, '..');

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
interface TestInfo {
  name: string;
  line: number;
  tags: string[];
  warning?: string; // e.g. "reCAPTCHA may block this test"
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
          warning = 'reCAPTCHA aktywna na tej stronie — test moze zostac skipniety automatycznie (nie jest to blad).';
        }
      }

      tests.push({ name, line: idx + 1, tags, warning });
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

        // Check for HTML report
        const htmlReportDir = path.join(ROOT, 'reports', project, 'html');
        const hasHtmlReport = fs.existsSync(path.join(htmlReportDir, 'index.html'));

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
          reportUrl: hasHtmlReport ? `/reports/${project}/html/index.html` : null,
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
