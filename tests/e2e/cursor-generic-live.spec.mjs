import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

const candidate = process.env.PRTS_CURSOR_CANDIDATE ? await readFile(new URL('../../lib/client.js', import.meta.url), 'utf8') : null
const base = candidate ? await readFile(process.env.PRTS_CURSOR_BASE_CLIENT, 'utf8') : null
test.use({ locale: 'zh-CN', storageState: process.env.PRTS_RC022_STATE || undefined })

for (const scheme of ['dark', 'light']) {
  test(`real partner expanded workspace uses generic text regions (${scheme}) @live`, async ({ page }) => {
    test.skip(!process.env.PRTS_RC022_STATE, 'Requires authenticated local DSH storage state')
    test.setTimeout(90_000)
    const errors = [], writes = []
    let replacements = 0
    page.on('pageerror', error => errors.push(error.message))
    if (candidate) await page.route(url => url.pathname === '/plugins/', async route => {
      const response = await route.fetch(), body = await response.text()
      if (body.includes(base)) replacements++
      await route.fulfill({ response, body: body.replace(base, () => candidate) })
    })
    await page.route('**/api/settings/describe', async route => {
      const response = await route.fetch(), packet = await response.json()
      packet.result.value.writable = false
      for (const namespace of packet.result.value.namespaces) {
        if (namespace.ns === 'theme-prts') namespace.value = { ...namespace.value, enabled: true, preferencesInitialized: true,
          bootAnimation: false, motion: 'system', cursorAnimation: false, cursor: 'prts' }
        if (namespace.ns === 'ui-theme') namespace.value = { ...namespace.value, preference: scheme }
      }
      await route.fulfill({ response, json: packet })
    })
    await page.route(url => url.pathname.startsWith('/partner-local/v1'), route => {
      if (route.request().method() === 'GET') return route.continue()
      writes.push(route.request().method())
      return route.abort('blockedbyclient')
    })
    await page.route(/\/api\/(settings\/mutate|session\/(create|prompt)|commands\/execute)(?:\?|$)/, route => {
      if (!route.request().url().includes('/session/create')) writes.push('host write')
      return route.abort('blockedbyclient')
    })
    await page.goto(process.env.PRTS_LIVE_URL || 'http://127.0.0.1:3080')
    await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', scheme, { timeout: 20_000 })
    await expect(page.locator('html')).toHaveAttribute('data-prts-cursor', 'prts')
    if (candidate) expect(replacements).toBe(1)
    await page.locator('[data-prts-startup]').waitFor({ state: 'hidden' })
    await page.locator('.dsh-partner-sidebar-row, .dsh-partner-rail').first().evaluate(element => element.click())
    const workspace = page.locator('.dsh-partner-workspace')
    await expect(workspace).toBeVisible()
    const paragraphs = workspace.locator('.dsh-partner-stage p:visible')
    await expect.poll(() => paragraphs.count()).toBeGreaterThan(0)
    let blanks = 0
    for (let index = 0; index < Math.min(await paragraphs.count(), 3); index++) {
      const paragraph = paragraphs.nth(index)
      await paragraph.scrollIntoViewIfNeeded()
      const probe = await paragraph.evaluate(element => {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
        let node
        while ((node = walker.nextNode()) && !node.data.trim()) {}
        const range = document.createRange()
        range.setStart(node, 0); range.setEnd(node, Math.min(2, node.length))
        const first = range.getBoundingClientRect(), box = element.getBoundingClientRect()
        range.selectNodeContents(element)
        const last = [...range.getClientRects()].at(-1)
        return { text: { x: first.x + first.width / 2, y: first.y + first.height / 2 },
          blank: box.right - last.right > 15 ? { x: box.right - 3, y: last.y + last.height / 2 } : null,
          box: [box.x, box.y, box.width, box.height] }
      })
      await page.mouse.move(probe.text.x, probe.text.y)
      await expect.poll(() => page.evaluate(({ x, y }) => getComputedStyle(document.elementFromPoint(x, y)).cursor, probe.text)).toMatch(/data:image\/png.*text$/)
      if (probe.blank) {
        await page.mouse.move(probe.blank.x, probe.blank.y)
        await expect.poll(() => page.evaluate(({ x, y }) => getComputedStyle(document.elementFromPoint(x, y)).cursor, probe.blank)).toMatch(/default$/)
        blanks++
      }
      expect(await paragraph.evaluate(element => {
        const box = element.getBoundingClientRect()
        return [box.x, box.y, box.width, box.height]
      })).toEqual(probe.box)
    }
    expect(blanks).toBeGreaterThan(0)
    const button = workspace.locator('button:visible').first()
    await button.hover()
    await expect(button).toHaveCSS('cursor', /data:image\/png.*pointer$/)
    await expect(workspace.locator('[data-prts-text-hit]')).toHaveCount(0)
    await button.click()
    expect(errors).toEqual([])
    expect(writes).toEqual([])
  })
}
