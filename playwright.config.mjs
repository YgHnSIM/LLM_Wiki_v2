import { defineConfig } from '@playwright/test';
import { normalizeBasePath } from './scripts/lib/site-paths.mjs';

const basePath = normalizeBasePath(process.env.BASE_PATH ?? '');
const port = Number.parseInt(process.env.SITE_SERVER_PORT ?? '4173', 10);
const origin = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './scripts/browser-tests',
  globalSetup: './scripts/browser-tests/global-setup.mjs',
  timeout: 30_000,
  fullyParallel: false,
  reporter: 'line',
  use: {
    baseURL: origin,
    browserName: 'chromium',
    viewport: { width: 1440, height: 900 },
    trace: 'retain-on-failure',
  },
});
