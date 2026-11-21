import { expect, test } from '@playwright/test'

test.use({ locale: 'zh-CN', storageState: process.env.PRTS_RC022_STATE || undefined })

for (const scheme of ['dark', 'light']) {
  test(`installed theme settings use CSS text cursors (${scheme}) @live`, async ({ page }) => {
    test.skip(!process.env.PRTS_RC022_STATE, 'Requires authenticated local DSH storage state')
    test.setTimeout(90_000)
    const errors = [], writes = []
    page.on('pageerror', error => errors.push(error.message))
    await page.route('**/api/settings/describe', async route => {
      const response = await route.fetch(), packet = await response.json()
      packet.result.value.writable = false
      for (const namespace of packet.result.value.namespaces) {
        if (namespace.ns === 'theme-prts') namespace.value = { ...namespace.value, enabled: true, preferencesInitialized: true,
          bootAnimation: false, motion: 'reduced', cursorAnimation: false, cursor: 'prts' }
        if (namespace.ns === 'ui-theme') namespace.value = { ...namespace.value, preference: scheme }
      }
      await route.fulfill({ response, json: packet })
    })
    await page.route(/\/api\/(settings\/mutate|session\/(create|prompt)|commands\/execute)(?:\?|$)/, route => {
      if (!route.request().url().includes('/session/create')) writes.push('host write')
      return route.abort('blockedbyclient')
    })
    await page.route(url => url.pathname.startsWith('/prts-theme-api/'), route => {
      if (route.request().method() === 'GET') return route.continue()
      writes.push('theme write')
      return route.abort('blockedbyclient')
    })
    await page.goto(process.env.PRTS_LIVE_URL || 'http://127.0.0.1:3080')
    await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', scheme, { timeout: 20_000 })
    await expect(page.locator('html')).toHaveAttribute('data-prts-cursor', 'prts')
    await page.locator('[data-prts-startup]').waitFor({ state: 'hidden' })
    if (await page.locator('[data-prts-rail-launcher]').isVisible()) await page.locator('[data-prts-rail-launcher]').click()
    await page.locator('[data-prts-rail-brand]').click()
    const panel = page.locator('[data-prts-theme-settings]')
    await expect(panel).toBeVisible()
    await page.evaluate(() => {
      window.settingsCursorProfile = { caret: 0, ranges: 0 }
      for (const name of ['caretPositionFromPoint', 'caretRangeFromPoint']) {
        const original = document[name]?.bind(document)
        if (original) document[name] = (...args) => {
          if (document.elementFromPoint(args[0], args[1])?.closest('[data-prts-theme-settings]')) window.settingsCursorProfile.caret++
          return original(...args)
        }
      }
      const original = Range.prototype.getClientRects
      Range.prototype.getClientRects = function (...args) {
        const target = this.commonAncestorContainer.nodeType === 1 ? this.commonAncestorContainer : this.commonAncestorContainer.parentElement
        if (target?.closest('[data-prts-theme-settings]')) window.settingsCursorProfile.ranges++
        return original.apply(this, args)
      }
    })
    const hoverText = async locator => {
      await locator.scrollIntoViewIfNeeded()
      const point = await locator.evaluate(element => {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
        let node
        while ((node = walker.nextNode()) && !node.data.trim()) {}
        const range = document.createRange()
        range.setStart(node, 0); range.setEnd(node, Math.min(2, node.length))
        const box = range.getBoundingClientRect()
        return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
      })
      await page.mouse.move(point.x, point.y)
      await expect(locator).toHaveCSS('cursor', /data:image\/png.*text$/)
    }
    for (const tab of ['appearance', 'background', 'flow', 'interaction', 'particles', 'assistance', 'ai-tools']) {
      await panel.locator(`[data-prts-settings-jump="${tab}"]`).click()
      const section = panel.locator(`[data-prts-settings-section="${tab}"]`)
      await hoverText(section.locator('h3').first())
      await expect(section).toHaveCSS('cursor', /default$/)
    }
    await hoverText(panel.locator('[data-prts-ai-tools] p').first())
    await panel.locator('[data-prts-transfer-open]').click()
    const transfer = panel.locator('[data-prts-transfer-dialog]')
    await hoverText(transfer.locator('p').first())
    await expect(transfer.locator('label span').first()).toHaveCSS('cursor', /default$/)
    await transfer.locator('[data-prts-transfer-close]').click()
    await expect(panel.locator('[data-prts-text-hit]')).toHaveCount(0)
    expect(await page.evaluate(() => window.settingsCursorProfile)).toEqual({ caret: 0, ranges: 0 })
    expect(errors).toEqual([])
    expect(writes).toEqual([])
  })
}
