import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/qa',
  fullyParallel: false,
  retries: 1,
  timeout: 30_000,
  reporter: [
    ['list'],
    ['./tests/qa/reporter.js'],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: 'Android Chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'iPhone Safari',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'Desktop Firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 20_000,
  },
});
