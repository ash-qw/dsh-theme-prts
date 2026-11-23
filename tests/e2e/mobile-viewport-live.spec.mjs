import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import sharp from 'sharp'

test.use({ hasTouch: true, storageState: process.env.PRTS_RC022_STATE || undefined })

for (const scheme of ['dark', 'light']) {
  test(`installed mobile viewport (${scheme}) @live-mobile`, async ({ page }) => {
    test.skip(!process.env.PRTS_RC022_STATE, 'Requires authenticated local DSH storage state')
    const errors = [], writes = [], blockedCreates = [], scripts = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('response', response => {
      if (response.request().resourceType() === 'script') scripts.push(response.text().catch(() => ''))
    })
    await page.route('**/api/settings/describe', async route => {
      const response = await route.fetch()
      const packet = await response.json()
      packet.result.value.writable = false
      for (const ns of packet.result.value.namespaces) {
        if (ns.ns === 'theme-prts') ns.value = { ...ns.value, enabled: true, preferencesInitialized: true, bootAnimation: false, motion: 'reduced', backgroundMode: 'split' }
        if (ns.ns === 'ui-theme') ns.value = { ...ns.value, preference: scheme }
      }
      await route.fulfill({ response, json: packet })
    })
    await page.route(/\/api\/(settings\/mutate|session\/(create|prompt)|commands\/execute)(?:\?|$)/, route => {
      // The host requests a draft session on initial load; block that as well.
      const target = new URL(route.request().url()).pathname === '/api/session/create' ? blockedCreates : writes
      target.push(route.request().url())
      return route.abort('blockedbyclient')
    })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(process.env.PRTS_LIVE_URL || 'http://127.0.0.1:3080')
    await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', scheme, { timeout: 20_000 })
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /viewport-fit=cover/)
    await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute('content', 'yes')
    await expect(page.locator('meta[name="apple-mobile-web-app-status-bar-style"]')).toHaveAttribute('content', 'black-translucent')
    await expect(page.locator('html')).toHaveAttribute('data-prts-background-conversation')
    await expect(page.locator('meta[data-prts-browser-chrome]')).toHaveAttribute('content', /^rgb\(/, { timeout: 20_000 })
    const chromeColor = await page.locator('meta[data-prts-browser-chrome]').getAttribute('content')
    for (const meta of await page.locator('meta[name="theme-color" i]').all()) await expect(meta).toHaveAttribute('content', chromeColor)
    await expect(page.locator('[data-prts-mobile-chrome-probe]')).toHaveCount(0)
    await expect(page.locator('html')).toHaveCSS('background-color', chromeColor)
    await expect(page.locator('body')).toHaveCSS('background-color', chromeColor)
    expect(chromeColor).not.toBe(scheme === 'dark' ? 'rgb(8, 10, 12)' : 'rgb(238, 241, 243)')
    expect(await page.locator('body').evaluate(node => getComputedStyle(node).backgroundImage)).toContain('url(')
    await expect(page.locator('[data-prts-region="frame"]')).toHaveCSS('background-image', 'none')
    // The native boot handoff may already have started before config is mocked.
    // Inspect wallpaper pixels only after its full-screen overlay has left.
    await expect(page.locator('[data-prts-startup]')).toHaveCount(0, { timeout: 25_000 })
    await expect(page.locator('body')).toHaveCSS('overflow-y', 'hidden')
    await expect.poll(() => page.evaluate(() => document.scrollingElement.scrollHeight - innerHeight)).toBe(0)
    for (const size of [{ width: 390, height: 844, top: 59, bottom: 34, left: 0, right: 0 }, { width: 844, height: 390, top: 0, bottom: 21, left: 47, right: 47 }]) {
      await page.setViewportSize({ width: size.width, height: size.height })
      await page.evaluate(({ top, bottom, left, right }) => {
        for (const [edge, value] of Object.entries({ top, bottom, left, right })) document.documentElement.style.setProperty(`--prts-safe-${edge}`, `${value}px`)
        window.dispatchEvent(new Event('resize'))
      }, size)
      const frame = page.locator('[data-prts-region="frame"]')
      await expect.poll(() => frame.evaluate(node => Math.round(node.getBoundingClientRect().bottom))).toBe(size.height - size.bottom)
      const bounds = await frame.boundingBox()
      expect(bounds.y).toBeCloseTo(size.top, 1)
      expect(bounds.x + bounds.width).toBeCloseTo(size.width - size.right, 1)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(size.width)
      if (scheme === 'dark' && size.top > 0) {
        const color = await page.locator('meta[data-prts-browser-chrome]').getAttribute('content')
        const expectedRgb = color.match(/\d+/g).map(Number)
        const { data, info } = await sharp(await page.screenshot({ clip: { x: 0, y: 0, width: size.width, height: 4 } })).removeAlpha().raw().toBuffer({ resolveWithObject: true })
        for (let channel = 0; channel < 3; channel++) {
          let sum = 0
          for (let i = channel; i < data.length; i += info.channels) sum += data[i]
          expect(Math.abs(sum / (info.width * info.height) - expectedRgb[channel])).toBeLessThan(3)
        }
      }
    }
    const expected = (await readFile(new URL('../../lib/client.js', import.meta.url), 'utf8')).trim()
    expect((await Promise.all(scripts)).some(script => script.includes(expected))).toBe(true)
    expect(writes).toEqual([])
    expect(blockedCreates.length).toBeLessThanOrEqual(1)
    expect(errors).toEqual([])
  })
}

test('initial viewport includes standalone launch declarations @live-mobile', async ({ browser }) => {
  test.skip(!process.env.PRTS_RC022_STATE, 'Requires authenticated local DSH storage state')
  const context = await browser.newContext({ javaScriptEnabled: false, storageState: process.env.PRTS_RC022_STATE })
  try {
    const page = await context.newPage()
    const response = await page.goto(process.env.PRTS_LIVE_URL || 'http://127.0.0.1:3080')
    expect(response.status()).toBe(200)
    await expect(page.locator('meta[name="viewport"]')).toHaveCount(1)
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /viewport-fit=cover/)
    await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute('content', 'yes')
    await expect(page.locator('meta[name="apple-mobile-web-app-status-bar-style"]')).toHaveAttribute('content', 'black-translucent')
    await expect(page.locator('meta[data-prts-browser-chrome]')).toHaveCount(0)
    await expect(page.locator('html')).not.toHaveAttribute('data-dsh-prts')
  } finally {
    await context.close()
  }
})
