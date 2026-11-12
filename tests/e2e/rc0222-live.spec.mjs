import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test.use({ locale: 'zh-CN', storageState: process.env.PRTS_RC022_STATE || undefined })
test.beforeEach(() => {
  test.skip(!process.env.PRTS_RC022_STATE, 'Requires authenticated local 0.2.2 storage state')
  test.setTimeout(60_000)
})

async function openHarness(page, width = 1440) {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('websocket', socket => socket.on('framereceived', frame => {
    let packet
    try {
      packet = JSON.parse(frame.payload.toString())
    } catch {
      return
    }
    if (packet.value?.event === 'api-session/error') errors.push(packet.value.args[1])
  }))
  await page.setViewportSize({ width, height: 900 })
  await page.goto(process.env.PRTS_LIVE_URL || 'http://127.0.0.1:3080')
  await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '', { timeout: 20_000 })
  await page.locator('[data-prts-startup]').waitFor({ state: 'hidden' })
  return errors
}

test('0.2.2-rc.2 loads the current client and authenticated theme services @live-rc0222', async ({ page, playwright }) => {
  const scripts = []
  page.on('response', response => {
    if (response.request().resourceType() === 'script') scripts.push(response.text().catch(() => ''))
  })
  const errors = await openHarness(page)
  const boot = await page.evaluate(() => ({
    version: window.__DSH_BOOT__?.release?.version,
    theme: window.__DSH_BOOT__?.entries.some(entry => entry.id === '@ash-qw/dsh-theme-prts'),
  }))
  expect(boot).toEqual({ version: '0.2.2-rc.2', theme: true })
  const expected = (await readFile(new URL('../../lib/client.js', import.meta.url), 'utf8')).trim()
  expect((await Promise.all(scripts)).some(script => script.includes(expected))).toBe(true)
  const anonymous = await playwright.request.newContext({ extraHTTPHeaders: { Host: 'prts-untrusted.invalid:3080' } })
  try {
    for (const asset of ['emblems', 'backgrounds', 'avatars']) {
      const url = new URL(`/prts-theme-api/${asset}/configuration`, page.url()).href
      const response = await page.request.get(url)
      expect(response.status()).toBe(200)
      expect(response.headers()['content-type']).toContain('application/json')
      expect((await response.json()).revision).toEqual(expect.any(Number))
      expect((await anonymous.get(url)).status()).toBe(401)
    }
  } finally {
    await anonymous.dispose()
  }
  expect(errors).toEqual([])
})

test('0.2.2-rc.2 theme dialogs own their macOS window exclusions @live-rc0222', async ({ page }) => {
  const errors = await openHarness(page)
  const launcher = page.locator('[data-prts-rail-launcher]')
  if (await launcher.isVisible() && await launcher.getAttribute('aria-expanded') === 'false') await launcher.click()
  await page.locator('[data-prts-rail-brand]').click()
  const panel = page.locator('[data-prts-theme-settings]')
  await expect(panel).toBeVisible()
  const original = await page.locator('html').getAttribute('data-platform')
  try {
    await page.locator('html').evaluate(node => { node.dataset.platform = 'darwin' })
    await expect(panel).toHaveAttribute('data-window-drag-exclude', '')
    await expect(panel).toHaveCSS('-webkit-app-region', 'no-drag')
    expect(await page.locator('[data-prts-shell] dialog').evaluateAll(dialogs =>
      dialogs.length >= 10 && dialogs.every(dialog => dialog.hasAttribute('data-window-drag-exclude')),
    )).toBe(true)
    await page.locator('html').evaluate(node => { node.dataset.platform = 'win32' })
    await expect(panel).toHaveCSS('-webkit-app-region', 'none')
  } finally {
    await page.locator('html').evaluate((node, value) => {
      if (value === null) node.removeAttribute('data-platform')
      else node.setAttribute('data-platform', value)
    }, original)
    await page.keyboard.press('Escape')
  }
  expect(errors).toEqual([])
})

for (const height of [560, 700]) for (const reduced of [false, true]) {
  test(`0.2.2-rc.2 session reveal respects the native outer scrollport (${height}, reduced=${reduced}) @live-rc0222`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' })
    const errors = await openHarness(page)
    await page.setViewportSize({ width: 1440, height })
    const source = await readFile(new URL('../../src/client/session-card-reveal.js', import.meta.url), 'utf8')
    await page.addScriptTag({ content: source.replace('export function createSessionCardReveal', 'window.__prtsRevealForRegression = function createSessionCardReveal') })
    const row = page.locator('[data-prts-session-row]').last()
    await expect(row).toBeAttached()
    const result = await row.evaluate(async target => {
      const root = target.closest('[data-slot="sidebar.workspaces"]')
      const outer = target.closest('[data-sidebar-scrollport]')
      const sessionId = target.getAttribute('data-row-key')?.replace(/^session:/, '') || target.getAttribute('data-session-id')
      for (let node = target.parentElement; node && node !== outer.parentElement; node = node.parentElement) node.scrollTop = 0
      target.setAttribute('data-prts-selection-target', 'true')
      return new Promise(resolve => window.__prtsRevealForRegression({ window, root, sessionId, onDone: () => {
        const card = target.getBoundingClientRect()
        const box = outer.getBoundingClientRect()
        resolve({ visible: card.top >= box.top + outer.clientTop - 1 && card.bottom <= box.top + outer.clientTop + outer.clientHeight + 1 })
      } }))
    })
    expect(result.visible).toBe(true)
    expect(errors).toEqual([])
  })
}

for (const width of [1440, 390]) {
  test(`0.2.2-rc.2 CSS-anchored workspace menus retain theme controls (${width}) @live-rc0222`, async ({ page }) => {
    const errors = await openHarness(page, width)
    const frame = page.locator('[data-prts-region="frame"]')
    if (await frame.getAttribute('data-sidebar-collapsed') !== null) {
      await page.getByRole('button', { name: '打开侧边栏', exact: true }).click()
    }
    const row = page.locator('[data-prts-workspace-row]').filter({ has: page.locator('button[data-context-menu-trigger]') }).first()
    await row.hover()
    const trigger = row.locator('[data-prts-workspace-menu]')
    await expect(trigger).toBeVisible()
    await trigger.click()
    const menu = page.locator('[data-context-menu][role="menu"]:visible')
    await expect(menu).toHaveAttribute('data-menu-material', 'translucent')
    await expect(menu).toHaveAttribute('data-prts-floating-glass', 'menu')
    await expect(menu).toHaveAttribute('data-anchor-side', 'bottom')
    expect(await menu.evaluate(node => getComputedStyle(node).positionAnchor)).not.toBe('auto')
    const items = menu.locator('[role="menuitem"]')
    await expect(items.first()).toHaveAttribute('data-prts-floating-item', '')
    const bounds = await menu.boundingBox()
    expect(bounds.width).toBeGreaterThan(80)
    expect(bounds.x).toBeGreaterThanOrEqual(-1)
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width + 1)
    await page.keyboard.press('ArrowDown')
    await expect.poll(() => menu.evaluate(node => node.contains(document.activeElement))).toBe(true)
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await expect(trigger).toBeFocused()
    expect(errors).toEqual([])
  })
}
