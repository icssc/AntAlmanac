import { defineConfig, devices } from '@playwright/experimental-ct-react';
import { resolve } from 'node:path';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './',
    testMatch: '*.spec.ts',

    /* The base directory, relative to the config file, for snapshot files created with toMatchSnapshot and toHaveScreenshot. */
    snapshotDir: './__snapshots__',
    /* Maximum time one test can run for. */
    timeout: 15 * 1000,
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: 'html',
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',

        /* Port to use for Playwright component endpoint. */
        ctPort: 3100,

        baseURL: 'http://localhost:5173',

        ctViteConfig: {
            resolve: {
                alias: {
                    $assets: resolve(__dirname, './src/assets'),
                    $actions: resolve(__dirname, './src/actions'),
                    $api: resolve(__dirname, './src/api'),
                    $components: resolve(__dirname, './src/components'),
                    $lib: resolve(__dirname, './src/lib'),
                    $providers: resolve(__dirname, './src/providers'),
                    $routes: resolve(__dirname, './src/routes'),
                    $src: resolve(__dirname, './src'),
                    $stores: resolve(__dirname, './src/stores'),
                },
            },
        },
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
    ],
});
