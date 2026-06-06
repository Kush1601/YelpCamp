import { defineConfig, devices } from "@playwright/test";

// When PLAYWRIGHT_BASE_URL is set (e.g. a Vercel deployment), tests run against
// that URL and no local web server is started. Otherwise we boot the app locally.
const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = externalBaseURL ?? "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            // Disables Chromium's network service sandbox, which on some GitHub Actions
            // ubuntu-latest runners blocks all loopback connections (both localhost and
            // 127.0.0.1) causing ERR_NAME_NOT_RESOLVED even for literal IPs.
            "--disable-features=NetworkServiceSandbox",
          ],
        },
      },
    },
  ],
  webServer: externalBaseURL
    ? undefined
    : {
        command: process.env.CI ? "npm start -- -H 127.0.0.1" : "npm run dev",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        stdout: "pipe",
        stderr: "pipe",
      },
});
