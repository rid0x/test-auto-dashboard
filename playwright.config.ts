import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

const PROJECT = process.env.PROJECT || 'getprice';

/**
 * Main Playwright config.
 *
 * Usage:
 *   PROJECT=getprice npx playwright test                           # all getprice tests
 *   PROJECT=getprice npx playwright test --grep @login             # only login tests
 *   PROJECT=willsoor npx playwright test --grep @api               # only API tests
 *   PROJECT=getprice npx playwright test --grep "@cart|@checkout"  # cart + checkout
 */
export default defineConfig({
  testDir: `./src/projects/${PROJECT}`,
  timeout: 60000,
  expect: {
    timeout: 8000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: [
    ['html', { open: 'never', outputFolder: `reports/${PROJECT}/html` }],
    ['list'],
    ['allure-playwright', { outputFolder: `reports/${PROJECT}/allure-results` }],
    ['json', { outputFile: `reports/${PROJECT}/results.json` }],
  ],
  outputDir: `reports/${PROJECT}/test-results`,

  use: {
    baseURL: getBaseUrl(PROJECT),
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on-first-retry',
    actionTimeout: 10000,
    navigationTimeout: 30000,
    locale: 'pl-PL',
    timezoneId: 'Europe/Warsaw',
  },

  projects: [
    // Desktop
    {
      name: `${PROJECT}-desktop-chrome`,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: `${PROJECT}-desktop-firefox`,
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: `${PROJECT}-desktop-safari`,
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    // Mobile
    {
      name: `${PROJECT}-mobile-chrome`,
      use: {
        ...devices['Pixel 7'],
      },
    },
    {
      name: `${PROJECT}-mobile-safari`,
      use: {
        ...devices['iPhone 14'],
      },
    },
  ],
});

function getBaseUrl(project: string): string {
  const urls: Record<string, string> = {
    getprice: process.env.GETPRICE_BASE_URL || 'https://getprice.pl',
    willsoor: process.env.WILLSOOR_BASE_URL || 'https://willsoor.pl',
    pieceofcase: process.env.PIECEOFCASE_BASE_URL || 'https://pieceofcase.pl',
    '4szpaki': process.env.SZPAKI_BASE_URL || 'https://4szpaki.pl',
  };
  return urls[project] || 'https://localhost';
}
