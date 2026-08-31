import { defineConfig, devices } from '@playwright/test'

const fixturePort = Number(process.env.PRTS_FIXTURE_PORT || 4173)
const fixtureServer = {
  command: `PORT=${fixturePort} node tests/e2e/fixture-server.mjs`,
  url: `http://127.0.0.1:${fixturePort}/tests/fixtures/rc7-harness.html`,
  reuseExistingServer: true,
  timeout: 20_000,
}
const webServers = [fixtureServer]
if (process.env.PRTS_LIVE_TARGET) {
  const liveProxyUrl = 'http://127.0.0.1:3080/'
  process.env.PRTS_LIVE_URL = liveProxyUrl
  webServers.push({
    command: 'node tests/e2e/live-proxy.mjs',
    url: liveProxyUrl,
    reuseExistingServer: false,
    timeout: 20_000,
  })
}

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.01,
    },
  },
  snapshotPathTemplate: '{testDir}/screenshots/{arg}{ext}',
  use: {
    baseURL: `http://127.0.0.1:${fixturePort}`,
    colorScheme: 'dark',
    trace: 'retain-on-failure',
  },
  webServer: webServers,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } },
    },
  ],
})
