import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

const pkg = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'))
const supportedVersions = pkg.engines.dsh.split(' || ')

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

for (const scheme of ['dark', 'light']) {
  for (const width of [1440, 390]) {
    test(`supported 0.2.2 sidebar session action retains native layout (${scheme}, ${width}) @live-rc0222`, async ({ page }) => {
      const errors = await openHarness(page, width)
      await page.locator('html').evaluate((node, value) => { node.dataset.prtsScheme = value }, scheme)
      const expand = page.getByRole('button', { name: '打开侧边栏', exact: true })
      if (await expand.isVisible()) await expand.click()
      const sidebar = page.locator('[data-prts-region="sessions"]')
      const button = sidebar.getByRole('button', { name: '新建会话', exact: true }).last()
      await expect(button).toBeVisible()
      await expect(button).toBeEnabled()
      await button.focus()
      await expect(button).toBeFocused()
      const bounds = await button.boundingBox()
      expect(bounds.width).toBeGreaterThan(30)
      expect(bounds.height).toBeGreaterThanOrEqual(36)
      expect(bounds.x).toBeGreaterThanOrEqual(0)
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
      if (await page.evaluate(() => window.__DSH_BOOT__.release.version) === '0.2.2-rc.3') {
        const slot = sidebar.locator('[data-slot="sidebar.session.action"]')
        await expect(slot).toHaveCSS('display', 'contents')
        await expect(slot.getByRole('button', { name: '新建会话', exact: true })).toBeVisible()
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
      expect(errors).toEqual([])
    })
  }
}

for (const scheme of ['dark', 'light']) {
  for (const width of [1440, 390]) {
    test(`supported 0.2.2 right sidebar search retains theme materials (${scheme}, ${width}) @live-rc0222`, async ({ page }) => {
      const errors = await openHarness(page, width)
      const expand = page.getByRole('button', { name: '打开右侧边栏', exact: true })
      if (await expand.isVisible()) await expand.click()
      const navigator = page.locator('[data-files-page] [data-files-navigator]:visible').first()
      if (!await navigator.isVisible()) {
        const guide = page.getByRole('button', { name: /工作区文件/ })
        if (await guide.isVisible()) await guide.click()
        else {
          await page.locator('[data-dockkit-add-tab]:visible').first().click()
          await page.getByRole('menuitem', { name: /工作区文件/ }).click()
        }
      }
      await expect(navigator).toBeVisible()
      await page.locator('html').evaluate((node, scheme) => {
        node.dataset.prtsScheme = scheme
        node.dataset.prtsGlass = 'standard'
      }, scheme)
      await expect(navigator).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      const pane = navigator.locator('xpath=ancestor::*[@data-dockkit-pane][1]')
      expect(await pane.evaluate(node => getComputedStyle(node, '::before').backdropFilter)).toContain('blur(')
      const search = navigator.locator('[data-files-search]')
      if (!await search.isVisible()) await pane.locator('[data-files-search-toggle]').click()
      await search.fill('prts')
      await expect(navigator.locator('[data-files-body]')).toHaveAttribute('data-files-view', 'search')
      await expect(navigator.locator('[data-files-body]')).toHaveAttribute('aria-busy', 'false')
      await expect(navigator.locator('[data-files-search-status]')).not.toBeEmpty()
      const trigger = navigator.locator('[data-files-search-settings-toggle]')
      await trigger.click()
      const settings = navigator.locator('[data-files-search-settings]')
      await expect(settings).toBeVisible()
      expect(await settings.getAttribute('aria-modal')).toBeNull()
      await expect(settings).toHaveCSS('backdrop-filter', 'blur(22px) saturate(1.55)')
      const add = settings.locator('input[type="text"]')
      await expect(add).toBeFocused()
      expect((await add.boundingBox()).height).toBeLessThan(40)
      const bounds = await settings.boundingBox()
      expect(bounds.x).toBeGreaterThanOrEqual(0)
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width + 1)
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(900)
      const rulesBefore = await settings.locator('input[type="checkbox"]').evaluateAll(nodes => nodes.map(node => ({ label: node.getAttribute('aria-label'), checked: node.checked })))
      await add.fill('../')
      await add.press('Enter')
      await expect(add).toHaveAttribute('aria-invalid', 'true')
      await expect(settings.getByRole('alert')).toBeVisible()
      expect(await settings.locator('input[type="checkbox"]').evaluateAll(nodes => nodes.map(node => ({ label: node.getAttribute('aria-label'), checked: node.checked })))).toEqual(rulesBefore)
      await page.locator('html').evaluate(node => node.dataset.prtsGlass = 'off')
      await expect(settings).toHaveCSS('backdrop-filter', 'none')
      await add.press('Escape')
      await expect(settings).toBeHidden()
      await expect(trigger).toBeFocused()
      await search.fill('')
      await expect(navigator.locator('[data-files-body]')).toHaveAttribute('data-files-view', 'tree')
      if (width === 1440) {
        const panel = navigator.locator('xpath=ancestor::*[@data-sidebar-right-panel][1]')
        await panel.locator('[data-sidebar-right-mode="fullscreen"]').click()
        await expect(panel).toHaveAttribute('data-sidebar-right-panel', 'fullscreen')
        await expect(navigator).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
        await trigger.click()
        await expect(settings).toBeVisible()
        const fullscreenBounds = await settings.boundingBox()
        expect(fullscreenBounds.x).toBeGreaterThanOrEqual(0)
        expect(fullscreenBounds.x + fullscreenBounds.width).toBeLessThanOrEqual(width + 1)
        await add.press('Escape')
        await panel.locator('[data-sidebar-right-mode="push"]').click()
        await expect(panel).toHaveAttribute('data-sidebar-right-panel', 'push')
      }
      expect(errors).toEqual([])
    })
  }
}

test('supported 0.2.2 host loads the current client and authenticated theme services @live-rc0222', async ({ page, playwright }) => {
  const scripts = []
  page.on('response', response => {
    if (response.request().resourceType() === 'script') scripts.push(response.text().catch(() => ''))
  })
  const errors = await openHarness(page)
  const boot = await page.evaluate(() => ({
    version: window.__DSH_BOOT__?.release?.version,
    theme: window.__DSH_BOOT__?.entries.some(entry => entry.id === '@ash-qw/dsh-theme-prts'),
  }))
  expect(supportedVersions).toContain(boot.version)
  expect(boot.theme).toBe(true)
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

test('supported 0.2.2 theme dialogs own their macOS window exclusions @live-rc0222', async ({ page }) => {
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
  test(`supported 0.2.2 session reveal respects the native outer scrollport (${height}, reduced=${reduced}) @live-rc0222`, async ({ page }) => {
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
  test(`supported 0.2.2 CSS-anchored workspace menus retain theme controls (${width}) @live-rc0222`, async ({ page }) => {
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
