import { defineConfig } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
    testDir: "./tests",
    timeout: 60_000,
    expect: {
        timeout: 10_000,
    },
    fullyParallel: true,
    reporter: process.env.CI ? "github" : "list",
    use: {
        baseURL,
        browserName: "chromium",
        viewport: { width: 1280, height: 900 },
        trace: "retain-on-failure",
    },
    webServer: process.env.PLAYWRIGHT_BASE_URL
        ? undefined
        : {
              command: "npm run dev",
              url: baseURL,
              reuseExistingServer: !process.env.CI,
              timeout: 120_000,
          },
});
