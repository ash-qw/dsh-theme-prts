import { expect, test } from '@playwright/test'

test.use({ locale: 'zh-CN', storageState: process.env.PRTS_RC022_STATE || undefined })
test.beforeEach(async ({ page }) => {
  test.skip(!process.env.PRTS_RC022_STATE, 'Requires authenticated local 0.2.2 storage state')
  test.setTimeout(60_000)
  await page.addInitScript(() => {
    let facade
    const wrapped = new WeakSet()
    Object.defineProperty(window, '__ModuleLoader__', {
      configurable: true,
      get: () => facade,
      set(value) {
        facade = value
        let load = value.load
        Object.defineProperty(value, 'load', {
          configurable: true,
          get: () => registration => {
            if (registration.id === '@ash-qw/dsh-theme-prts' && !registration.chunk && !wrapped.has(registration)) {
              wrapped.add(registration)
              const factory = registration.factory
              registration.factory = require => {
                const exports = factory(require)
                window.__prtsNativeRequire = require
                return exports
              }
            }
            return load.call(value, registration)
          },
          set(next) { load = next },
        })
      },
    })
  })
})

async function openProbe(page, { scheme, corner, width, enabled = true }) {
  const errors = []
  const writes = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/api/settings/describe', async route => {
    const response = await route.fetch()
    const packet = await response.json()
    expect(packet.result?.ok).toBe(true)
    const settings = packet.result.value
    settings.writable = false
    for (const namespace of settings.namespaces) {
      if (namespace.ns === 'theme-prts') namespace.value = {
        ...namespace.value, enabled, preferencesInitialized: true, bootAnimation: false, motion: 'reduced',
      }
      if (namespace.ns === 'ui-theme') namespace.value = { ...namespace.value, preference: scheme }
    }
    return route.fulfill({ response, json: packet })
  })
  await page.route('**/api/settings/mutate', route => {
    writes.push(route.request().url())
    return route.abort('blockedbyclient')
  })
  await page.setViewportSize({ width, height: 560 })
  await page.goto(process.env.PRTS_LIVE_URL || 'http://127.0.0.1:3080')
  await expect.poll(() => page.evaluate(() => typeof window.__prtsNativeRequire), { timeout: 20_000 }).toBe('function')
  if (enabled) await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
  else await expect(page.locator('html')).not.toHaveAttribute('data-dsh-prts')
  await page.locator('[data-prts-startup]').waitFor({ state: 'hidden' })
  if (enabled) await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', scheme)
  await page.evaluate(corner => {
    const require = window.__prtsNativeRequire
    const React = require('react')
    const ReactDOM = require('react-dom')
    const { Menu } = require('@deepseek-ai/dsh-client-ui-primitives')
    const stage = document.createElement('section')
    stage.dataset.nativeSubmenuProbe = ''
    stage.style.cssText = `position:fixed;z-index:1200;${corner === 'top-left' ? 'left:12px;top:12px' : 'right:12px;bottom:12px'}`
    document.body.append(stage)
    const root = ReactDOM.createRoot(stage)
    const state = { selected: [], closed: 0 }
    const childItems = [
      { id: 'disabled', label: '不可用操作', disabled: true },
      ...Array.from({ length: 18 }, (_, index) => ({ id: `action-${index}`, label: `验收操作 ${index + 1}：保持原生菜单行为` })),
      { id: 'danger', label: '危险操作示例', danger: true },
    ]
    function Probe() {
      const [open, setOpen] = React.useState(false)
      const anchor = React.createElement('button', {
        type: 'button', 'data-native-menu-trigger': '', onClick: () => setOpen(value => !value),
        style: { minWidth: 200 },
      }, '菜单验收入口')
      const menu = React.createElement(Menu, {
        open, anchor, portal: true, autoFocus: true, contextual: true, minWidthFromAnchor: true, submenuBackLabel: '返回',
        items: [
          { id: 'first', label: '普通操作' },
          { id: 'more', label: '更多操作', submenu: childItems },
          { id: 'last', label: '末尾操作' },
        ],
        onClose: () => { state.closed += 1; setOpen(false) },
        onSelect: id => { state.selected.push(id); setOpen(false) },
      })
      return React.createElement(React.Fragment, null, menu, React.createElement('button', {
        type: 'button', 'data-native-menu-outside': '',
        style: { position: 'fixed', left: 12, top: '50%', zIndex: 1300 },
      }, '外部焦点目标'))
    }
    root.render(React.createElement(Probe))
    window.__prtsSubmenuProbe = state
    window.__prtsDisposeSubmenuProbe = () => {
      root.unmount()
      stage.remove()
      delete window.__prtsSubmenuProbe
      delete window.__prtsDisposeSubmenuProbe
    }
  }, corner)
  const trigger = page.locator('[data-native-menu-trigger]')
  const parent = page.locator('[data-context-menu][data-anchor-side]')
  const child = page.locator('[data-submenu-layout]')
  return { errors, writes, trigger, parent, child }
}

async function expectInsideViewport(menu) {
  const bounds = await menu.evaluate(node => {
    const rect = node.getBoundingClientRect()
    return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom,
      width: document.documentElement.clientWidth, height: window.innerHeight }
  })
  expect(bounds.left).toBeGreaterThanOrEqual(-1)
  expect(bounds.top).toBeGreaterThanOrEqual(-1)
  expect(bounds.right).toBeLessThanOrEqual(bounds.width + 1)
  expect(bounds.bottom).toBeLessThanOrEqual(bounds.height + 1)
}

async function expectMaterial(menu) {
  await expect(menu).toHaveAttribute('data-prts-floating-glass', 'menu')
  await expect(menu).not.toHaveAttribute('data-prts-floating-nested')
  await expect.poll(() => menu.evaluate(node => getComputedStyle(node).backdropFilter)).toContain('blur(')
  await expect(menu.locator(':scope > [aria-hidden="true"][class*="_material_"]')).toHaveCSS('backdrop-filter', 'none')
  await expect(menu.locator('[role="menuitem"]').first()).toHaveAttribute('data-prts-floating-item', '')
}

async function resizeToShortPage(page, probe) {
  await probe.trigger.click()
  await probe.parent.getByRole('menuitem', { name: '更多操作', exact: true }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(probe.child).toHaveAttribute('data-submenu-layout', 'page')
  await probe.child.evaluate(node => { node.dataset.probeIdentity = 'same-child' })
  const last = probe.child.getByRole('menuitem', { name: '危险操作示例', exact: true })
  await last.focus()
  await expect(last).toBeInViewport()
  await expect(probe.child.getByRole('menuitem', { name: '返回', exact: true })).toBeInViewport()
  await page.setViewportSize({ width: 1440, height: 560 })
  await expect(probe.child).toHaveAttribute('data-submenu-layout', 'side')
  await expect(probe.child).toHaveAttribute('data-probe-identity', 'same-child')
  await expect(last).toBeFocused()
  await expect(probe.child.locator('[data-menu-back]')).toHaveCount(0)
  await expectInsideViewport(probe.child)
  await page.setViewportSize({ width: 390, height: 420 })
  await expect(probe.child).toHaveAttribute('data-submenu-layout', 'page')
  await expect(probe.child).toHaveAttribute('data-probe-identity', 'same-child')
  await expect(last).toBeFocused()
  await expectInsideViewport(probe.child)
  return last
}

for (const scheme of ['dark', 'light']) for (const width of [390, 1440]) for (const corner of ['top-left', 'bottom-right']) {
  test(`native submenu keyboard, return and edge placement (${scheme}, ${width}, ${corner}) @live-rc0222`, async ({ page }) => {
    const probe = await openProbe(page, { scheme, width, corner })
    try {
      await probe.trigger.click()
      await expectMaterial(probe.parent)
      await expectInsideViewport(probe.parent)
      const more = probe.parent.getByRole('menuitem', { name: '更多操作', exact: true })
      await probe.parent.getByRole('menuitem', { name: '普通操作', exact: true }).focus()
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowRight')
      await expect(probe.child).toHaveAttribute('data-submenu-layout', width < 600 ? 'page' : 'side')
      await expectMaterial(probe.child)
      await expectInsideViewport(probe.child)
      await expect(probe.child.getByRole('menuitem', { name: '验收操作 1：保持原生菜单行为', exact: true })).toBeFocused()
      await expect(probe.child.getByRole('menuitem', { name: '不可用操作', exact: true })).toBeDisabled()
      await expect(probe.child.getByRole('menuitem', { name: '危险操作示例', exact: true })).toHaveAttribute('data-prts-floating-danger', '')
      if (width < 600) {
        await expect(probe.parent).toBeHidden()
        await expect(probe.child.getByRole('menuitem', { name: '返回', exact: true })).toBeVisible()
      } else {
        const parentBounds = await probe.parent.boundingBox()
        const childBounds = await probe.child.boundingBox()
        expect(childBounds.x >= parentBounds.x + parentBounds.width - 1
          || childBounds.x + childBounds.width <= parentBounds.x + 1).toBe(true)
      }
      await page.keyboard.press('ArrowLeft')
      await expect(probe.child).toHaveCount(0)
      await expect(more).toBeFocused()
      await page.keyboard.press('ArrowRight')
      await expect(probe.child).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(probe.child).toHaveCount(0)
      await expect(more).toBeFocused()
      await page.keyboard.press('Escape')
      await expect(probe.parent).toHaveCount(0)
      await expect(probe.trigger).toBeFocused()
      expect(await page.evaluate(() => window.__prtsSubmenuProbe.closed)).toBe(1)
      await probe.trigger.click()
      await probe.parent.getByRole('menuitem', { name: '更多操作', exact: true }).focus()
      await page.keyboard.press('ArrowRight')
      await expect(probe.child).toBeVisible()
      const outside = page.locator('[data-native-menu-outside]')
      await outside.click()
      await expect(probe.child).toHaveCount(0)
      await expect(probe.parent).toHaveCount(0)
      await expect(outside).toBeFocused()
      expect(await page.evaluate(() => window.__prtsSubmenuProbe.closed)).toBe(2)
      expect(await page.evaluate(() => window.__prtsSubmenuProbe.selected)).toEqual([])
      expect(probe.errors).toEqual([])
      expect(probe.writes).toEqual([])
    } finally {
      await page.evaluate(() => window.__prtsDisposeSubmenuProbe?.())
    }
  })
}

test.describe('touch submenu navigation', () => {
  test.use({ hasTouch: true })
  for (const scheme of ['dark', 'light']) for (const corner of ['top-left', 'bottom-right']) {
    test(`native submenu back row and selection (${scheme}, ${corner}) @live-rc0222`, async ({ page }) => {
      const probe = await openProbe(page, { scheme, width: 390, corner })
      try {
        await probe.trigger.tap()
        const more = probe.parent.getByRole('menuitem', { name: '更多操作', exact: true })
        await more.tap()
        await expect(probe.child).toHaveAttribute('data-submenu-layout', 'page')
        await expectMaterial(probe.child)
        await expectInsideViewport(probe.child)
        await probe.child.getByRole('menuitem', { name: '返回', exact: true }).tap()
        await expect(probe.child).toHaveCount(0)
        await expect(more).toBeFocused()
        expect(await page.evaluate(() => window.__prtsSubmenuProbe)).toEqual({ selected: [], closed: 0 })
        await more.tap()
        await probe.child.getByRole('menuitem', { name: '验收操作 1：保持原生菜单行为', exact: true }).tap()
        await expect(probe.child).toHaveCount(0)
        await expect(probe.parent).toHaveCount(0)
        await expect(probe.trigger).toBeFocused()
        expect(await page.evaluate(() => window.__prtsSubmenuProbe.selected)).toEqual(['action-0'])
        expect(probe.errors).toEqual([])
        expect(probe.writes).toEqual([])
      } finally {
        await page.evaluate(() => window.__prtsDisposeSubmenuProbe?.())
      }
    })
  }
})

for (const scheme of ['dark', 'light']) {
  for (const enabled of [true, false]) test(`native submenu keeps identity and focus when resized (${scheme}, enabled=${enabled}) @live-rc0222`, async ({ page }) => {
    const probe = await openProbe(page, { scheme, enabled, width: 390, corner: 'bottom-right' })
    try {
      await resizeToShortPage(page, probe)
      await page.keyboard.press('ArrowUp')
      const previous = probe.child.getByRole('menuitem', { name: '验收操作 18：保持原生菜单行为', exact: true })
      await expect(previous).toBeFocused()
      await expect(previous).toBeInViewport()
      const back = probe.child.getByRole('menuitem', { name: '返回', exact: true })
      await expect(back).toBeInViewport()
      await back.click()
      await expect(probe.child).toHaveCount(0)
      await expect(probe.parent.getByRole('menuitem', { name: '更多操作', exact: true })).toBeFocused()
      expect(await page.evaluate(() => window.__prtsSubmenuProbe.selected)).toEqual([])
      expect(probe.errors).toEqual([])
      expect(probe.writes).toEqual([])
    } finally {
      await page.evaluate(() => window.__prtsDisposeSubmenuProbe?.())
    }
  })
}

for (const enabled of [true, false]) {
  test(`known rc.2 focused row visibility after shrinking (enabled=${enabled}) @live-rc0222 @known-upstream-rc0222`, async ({ page }) => {
    const probe = await openProbe(page, { scheme: 'dark', enabled, width: 390, corner: 'bottom-right' })
    try {
      const last = await resizeToShortPage(page, probe)
      expect(probe.errors).toEqual([])
      expect(probe.writes).toEqual([])
      test.fail(true, 'DSH 0.2.2-rc.2 retains child focus but does not scroll the focused last row into view after height reduction, with or without PRTS')
      await expect(last).toBeInViewport()
    } finally {
      await page.evaluate(() => window.__prtsDisposeSubmenuProbe?.())
    }
  })
}
