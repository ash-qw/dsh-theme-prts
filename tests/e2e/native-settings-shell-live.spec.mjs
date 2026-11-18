import { expect, test } from '@playwright/test'

async function expectNativeBackdrop(shell) {
  const surfaces = await shell.evaluate(node => {
    const overlay = node.parentElement
    const targets = [overlay, ...overlay.querySelectorAll(':scope > [aria-hidden="true"]')]
    const inspect = () => targets.map(target => {
      const style = getComputedStyle(target)
      return Object.fromEntries(['backgroundColor', 'backgroundImage', 'backdropFilter', 'opacity', 'filter'].map(key => [key, style[key]]))
    })
    const themed = inspect()
    const marker = overlay.getAttribute('data-prts-floating-scrim')
    overlay.removeAttribute('data-prts-floating-scrim')
    try { return { themed, native: inspect(), marked: marker !== null } }
    finally { if (marker !== null) overlay.setAttribute('data-prts-floating-scrim', marker) }
  })
  expect(surfaces.marked).toBe(true)
  expect(surfaces.themed).toHaveLength(2)
  expect(surfaces.themed).toEqual(surfaces.native)
}

test.use({ locale: 'zh-CN', storageState: process.env.PRTS_RC022_STATE || undefined })
test.beforeEach(() => {
  test.skip(!process.env.PRTS_RC022_STATE, 'Requires authenticated local DSH storage state')
  test.setTimeout(60_000)
})

async function expectPastedBookmark(shell, width) {
  await expect(shell).not.toHaveAttribute('data-prts-settings-flipping')
  const geometry = await shell.evaluate(node => {
    const bounds = node.getBoundingClientRect()
    const front = getComputedStyle(node.querySelector('[data-prts-settings-depth="0"]'))
    const current = node.querySelector('nav button[aria-current="true"], nav button[aria-current="page"]')
    const tab = current.getBoundingClientRect()
    const horizontal = window.innerWidth < 768
    const pageLeft = bounds.left + parseFloat(front.left)
    const pageTop = bounds.top + parseFloat(front.top)
    const point = horizontal ? { x: tab.left + tab.width / 2, y: pageTop + 7 } : { x: pageLeft + 14, y: tab.top + tab.height / 2 }
    return {
      overlap: horizontal ? tab.bottom - pageTop : tab.right - pageLeft,
      ringCount: node.querySelectorAll('[data-prts-settings-binding]').length,
      sheetHeights: [...node.querySelectorAll('[data-prts-settings-page]')].map(sheet => sheet.getBoundingClientRect().height),
      rectangular: [...node.querySelectorAll('[data-prts-settings-page]')].every(sheet => getComputedStyle(sheet).clipPath === 'none'),
      hit: document.elementFromPoint(point.x, point.y)?.closest('nav button') === current,
      pageCount: node.querySelectorAll('[data-prts-settings-page]').length, categoryCount: node.querySelectorAll('nav button').length,
      backingDepth: Math.max(...[...node.querySelectorAll('[data-prts-settings-page]')].map(sheet => sheet.getBoundingClientRect().bottom)) - bounds.bottom,
    }
  })
  expect(geometry.overlap).toBeGreaterThanOrEqual(width < 768 ? 13 : 20)
  expect(geometry.hit).toBe(true)
  expect(geometry.ringCount).toBe(0)
  expect(new Set(geometry.sheetHeights).size).toBe(1)
  expect(geometry.sheetHeights[0]).toBeGreaterThan(600)
  expect(geometry.rectangular).toBe(true)
  expect(geometry.pageCount).toBe(geometry.categoryCount)
  expect(geometry.backingDepth).toBeGreaterThan(0)
  return geometry.backingDepth
}

for (const width of [1440, 390]) {
  test(`native settings shell preserves host navigation and forms (${width}) @live-rc0222`, async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.setViewportSize({ width, height: 900 })
    await page.goto(process.env.PRTS_LIVE_URL || 'http://127.0.0.1:3080')
    await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '', { timeout: 20_000 })
    await page.locator('[data-prts-startup]').waitFor({ state: 'hidden' })
    const expand = page.getByRole('button', { name: '打开侧边栏', exact: true })
    if (await expand.isVisible()) await expand.click()
    await page.locator('[data-slot="sidebar.settings"] button').click()
    await page.getByRole('menuitem', { name: '设置', exact: true }).click()
    const shell = page.locator('[data-shortcut-modal="settings"]')
    await expect(shell).toBeVisible()
    await expect(shell).toHaveAttribute('data-prts-settings-shell', '')
    await expect(shell.locator('[data-prts-settings-jacket]')).toHaveCount(1)
    const emblem = shell.locator('[data-prts-settings-emblem] img')
    await expect(emblem).toHaveJSProperty('complete', true)
    await expect(emblem).toHaveJSProperty('naturalWidth', 95)
    await expect(emblem).toHaveJSProperty('naturalHeight', 81)
    await expect(shell.locator('nav button[aria-current]')).toHaveText('通用设置')
    await expect(shell.locator('[data-prts-settings-filetab]')).toHaveCount(0)
    const geometry = await shell.evaluate(node => {
      const bounds = node.getBoundingClientRect()
      const themedWidth = getComputedStyle(node).width
      const themedMaxWidth = getComputedStyle(node).maxWidth
      node.removeAttribute('data-shortcut-modal')
      const nativeWidth = getComputedStyle(node).width
      const nativeMaxWidth = getComputedStyle(node).maxWidth
      node.setAttribute('data-shortcut-modal', 'settings')
      const title = node.querySelector('[data-slot="settings.header"]').parentElement
      const close = node.querySelector('[data-slot="settings.close"]').closest('button')
      return { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom, themedWidth, themedMaxWidth, nativeWidth, nativeMaxWidth,
        titleDisplay: getComputedStyle(title).display, railWidth: node.querySelector('nav').getBoundingClientRect().width, closeWidth: close.getBoundingClientRect().width }
    })
    expect(geometry.left).toBeGreaterThanOrEqual(0)
    expect(geometry.right).toBeLessThanOrEqual(width)
    expect(geometry.top).toBeGreaterThanOrEqual(0)
    expect(geometry.bottom).toBeLessThanOrEqual(900)
    expect(geometry.titleDisplay).toBe('none')
    if (width >= 768) {
      expect(geometry.railWidth).toBe(96)
      expect(geometry.themedWidth).toBe(geometry.nativeWidth)
      expect(geometry.themedMaxWidth).toBe(geometry.nativeMaxWidth)
    }
    await expect(shell).toHaveAccessibleName('设置')
    await expect(shell.locator('[data-prts-settings-watermark]')).toHaveCount(0)
    expect(geometry.closeWidth).toBe(36)
    await expect(shell.locator('[data-prts-settings-caption]')).toHaveCount(0)
    const controls = await shell.evaluate(node => {
      const section = node.querySelector('[data-slot="settings.section"]')
      const original = [...section.querySelectorAll('input, textarea, select, button')]
      const markup = section.innerHTML
      const properties = ['fontSize', 'fontWeight', 'lineHeight', 'color', 'backgroundColor', 'border', 'borderRadius', 'boxShadow', 'padding', 'margin', 'gap']
      const inspect = () => [...section.querySelectorAll('*')].map(element => properties.map(property => getComputedStyle(element)[property]))
      const themed = inspect()
      node.removeAttribute('data-prts-settings-shell')
      const nativeStyles = inspect()
      const nativeMarkup = section.innerHTML
      node.setAttribute('data-prts-settings-shell', '')
      return { themed, nativeStyles, count: original.length, markupUnchanged: markup === nativeMarkup, identitiesUnchanged: original.every((control, index) => section.querySelectorAll('input, textarea, select, button')[index] === control) }
    })
    expect(controls.themed).toEqual(controls.nativeStyles)
    expect(controls.count).toBeGreaterThan(0)
    expect(controls.markupUnchanged).toBe(true)
    expect(controls.identitiesUnchanged).toBe(true)
    await expectNativeBackdrop(shell)
    const backingDepth = await expectPastedBookmark(shell, width)
    const navigation = shell.locator(':scope > nav')
    if (width >= 768) {
      const labels = await navigation.locator('button > span:not([aria-hidden="true"])').evaluateAll(nodes => nodes.map(node => ({ width: node.clientWidth, height: node.clientHeight, scrollWidth: node.scrollWidth, scrollHeight: node.scrollHeight })))
      expect(labels.length).toBeGreaterThan(0)
      for (const label of labels) {
        expect(label.scrollWidth).toBeLessThanOrEqual(label.width + 1)
        expect(label.scrollHeight).toBeLessThanOrEqual(label.height + 1)
      }
    }
    await navigation.getByRole('button', { name: '模型', exact: true }).click()
    await expect(navigation.getByRole('button', { name: '模型', exact: true })).toHaveAttribute('aria-current', 'true')
    await expect(shell.locator('nav button[aria-current]')).toHaveText('模型')
    await expect(shell.locator('[data-slot="settings.section"]').getByRole('heading', { name: '模型', exact: true })).toHaveCount(1)
    expect(await expectPastedBookmark(shell, width)).toBeCloseTo(backingDepth, 1)
    await navigation.getByRole('button').last().click()
    expect(await expectPastedBookmark(shell, width)).toBeCloseTo(backingDepth, 1)
    await expect(shell.locator('[data-prts-settings-filetab]')).toHaveCount(0)
    await navigation.getByRole('button', { name: '通用设置', exact: true }).click()
    await expect(navigation.getByRole('button', { name: '通用设置', exact: true })).toHaveAttribute('aria-current', 'true')
    await expect(shell.locator('[data-prts-settings-filetab]')).toHaveCount(0)
    await shell.getByRole('button', { name: '关闭', exact: true }).click()
    await expect(shell).toHaveCount(0)
    expect(errors).toEqual([])
  })
}


test('model settings stay steady without idle page draws @live-rc0222', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(process.env.PRTS_LIVE_URL || 'http://127.0.0.1:3080')
  await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '', { timeout: 20_000 })
  await page.locator('[data-prts-startup]').waitFor({ state: 'hidden' })
  await page.locator('[data-slot="sidebar.settings"] button').click()
  await page.getByRole('menuitem', { name: '设置', exact: true }).click()
  const shell = page.locator('[data-prts-settings-shell]')
  await shell.locator('nav').getByRole('button', { name: '模型', exact: true }).click()
  await expect(shell.locator('[data-slot="settings.section"]').getByRole('heading', { name: '模型', exact: true })).toBeVisible()
  await expect(shell).not.toHaveAttribute('data-prts-settings-turn')
  await page.waitForTimeout(600)
  const state = await shell.evaluate(async node => {
    const animations = []
    const geometry = new Set()
    const content = node.querySelector('[data-slot="settings.section"]').parentElement
    const recordAnimation = event => { if (event.animationName.startsWith('prts-settings-')) animations.push(event.animationName) }
    node.addEventListener('animationstart', recordAnimation)
    const timer = setInterval(() => {
      const section = node.querySelector('[data-slot="settings.section"]').firstElementChild
      const bounds = section.getBoundingClientRect()
      geometry.add(JSON.stringify([bounds.x, bounds.y, bounds.width, content.scrollTop]))
    }, 100)
    try {
      await new Promise(resolve => setTimeout(resolve, 15000))
      return { animations, positions: geometry.size, turn: node.getAttribute('data-prts-settings-turn') }
    } finally {
      clearInterval(timer)
      node.removeEventListener('animationstart', recordAnimation)
    }
  })
  expect(state.animations).toEqual([])
  expect(state.positions).toBe(1)
  expect(state.turn).toBeNull()
  await expect(shell.locator('[data-prts-settings-pagination]')).toHaveText('02 / ' + String(await shell.locator('nav button').count()).padStart(2, '0'))
})
