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
            "--disable-features=NetworkServiceSandbox",
            // On GitHub Actions runners a system proxy (HTTP_PROXY) can cause Chromium
            // to route even loopback requests through a resolver, surfacing as
            // ERR_NAME_NOT_RESOLVED on the literal IP 127.0.0.1. Disabling the proxy
            // server makes Chromium connect to loopback directly.
            "--no-proxy-server",
          ],
        },
      },
    },
  ],
  webServer: externalBaseURL
    ? undefined
    : {
        command: process.env.CI ? "npm start" : "npm run dev",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        stdout: "pipe",
        stderr: "pipe",
      },
});
