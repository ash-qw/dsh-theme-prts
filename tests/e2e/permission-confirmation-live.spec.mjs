import { expect, test } from '@playwright/test'

test.use({ locale: 'zh-CN', storageState: process.env.PRTS_RC022_STATE || undefined })

for (const scheme of ['dark', 'light']) for (const width of [1440, 390]) {
  test(`native permission confirmation and system menu preserve layout (${scheme}, ${width}) @live-rc0222`, async ({ page }, testInfo) => {
    test.skip(!process.env.PRTS_RC022_STATE, 'Requires authenticated local DSH storage state')
    test.setTimeout(60_000)
    const writes = []
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.route('**/api/settings/describe', async route => {
      const response = await route.fetch()
      const packet = await response.json()
      expect(packet.result?.ok).toBe(true)
      packet.result.value.writable = false
      for (const namespace of packet.result.value.namespaces) {
        if (namespace.ns === 'theme-prts') namespace.value = {
          ...namespace.value, enabled: true, preferencesInitialized: true, bootAnimation: false, motion: 'reduced',
        }
        if (namespace.ns === 'ui-theme') namespace.value = { ...namespace.value, preference: scheme }
      }
      await route.fulfill({ response, json: packet })
    })
    await page.route(/\/api\/(settings\/mutate|session\/(create|prompt)|commands\/execute)(?:\?|$)/, route => {
      writes.push(new URL(route.request().url()).pathname)
      return route.abort('blockedbyclient')
    })
    await page.setViewportSize({ width, height: 900 })
    await page.goto(process.env.PRTS_LIVE_URL || 'http://127.0.0.1:3080')
    await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', scheme, { timeout: 20_000 })
    await page.locator('[data-prts-startup]').waitFor({ state: 'hidden' })
    const permission = page.locator('[data-composer-card] button[aria-label^="访问模式"]')
    await permission.click()
    await page.getByRole('menuitem', { name: '完全权限', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: '确认启用完全权限？', exact: true })
    await expect(dialog).toBeVisible()
    await expect(dialog).toHaveAttribute('data-prts-floating-glass', 'dialog')
    const checkbox = dialog.getByRole('checkbox')
    await expect(checkbox).not.toHaveAttribute('data-prts-floating-input')
    await expect(checkbox).toHaveCSS('height', '14px')
    await expect(checkbox).toHaveCSS('width', '14px')
    const geometry = await checkbox.evaluate(node => {
      const input = node.getBoundingClientRect()
      const label = node.nextElementSibling.getBoundingClientRect()
      return { horizontal: label.left - input.right, vertical: input.top - label.top }
    })
    expect(geometry.horizontal).toBeGreaterThanOrEqual(4)
    expect(Math.abs(geometry.vertical)).toBeLessThanOrEqual(4)
    const confirm = dialog.getByRole('button', { name: '启用完全权限', exact: true })
    await expect(confirm).toBeDisabled()
    await checkbox.check()
    await expect(confirm).toBeEnabled()
    await checkbox.uncheck()
    await expect(confirm).toBeDisabled()
    const bounds = await dialog.boundingBox()
    expect(bounds.x).toBeGreaterThanOrEqual(0)
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
    await dialog.screenshot({ path: testInfo.outputPath('permission-confirmation.png') })
    await dialog.getByRole('button', { name: '取消', exact: true }).click()
    await expect(dialog).toHaveCount(0)
    if (width === 390) {
      const openSidebar = page.getByRole('button', { name: '打开侧边栏', exact: true })
      if (await openSidebar.isVisible()) await openSidebar.click()
    }
    const system = page.locator('[data-slot="settings.launcher"] button[aria-haspopup="menu"]')
    await system.click()
    const menu = page.locator('[data-prts-glass-menu="system"]')
    await expect(menu).toBeVisible()
    await expect.poll(() => menu.evaluate(node => getComputedStyle(node).getPropertyValue('--prts-menu-card-caption').trim())).toBe('"SYSTEM"')
    const decorations = await menu.evaluate(node => {
      const caption = getComputedStyle(node, '::before')
      const plate = getComputedStyle(node.querySelector(':scope > [aria-hidden="true"]'), '::after')
      return { caption: caption.content, mask: caption.maskImage, clip: plate.clipPath, pointerEvents: plate.pointerEvents }
    })
    expect(decorations.caption).toBe('""')
    expect(decorations.mask).toContain('%3Cpath')
    expect(decorations.clip).toBe('polygon(7px 0px, 100% 0px, 100% 100%, 0px 100%)')
    expect(decorations.pointerEvents).toBe('none')
    await expect(menu.getByRole('menuitem', { name: /设置/ })).toBeVisible()
    await menu.screenshot({ path: testInfo.outputPath('system-menu.png') })
    await page.keyboard.press('Escape')
    await expect(menu).toHaveCount(0)
    await page.getByRole('button', { name: '更多', exact: true }).click()
    const actions = page.locator('[data-menu-material]').filter({ has: page.locator('[data-slot="sidebar.panellist.actions"]') })
    await expect(actions).toBeVisible()
    await expect.poll(() => actions.evaluate(node => getComputedStyle(node).getPropertyValue('--prts-menu-card-caption').trim())).toBe('"ACTION"')
    expect(await actions.evaluate(node => getComputedStyle(node, '::before').maskImage)).toBe(decorations.mask)
    await expect(actions.getByRole('menuitem', { name: '浏览更多插件', exact: true })).toBeVisible()
    await expect(actions.getByRole('menuitem', { name: '创建你的插件', exact: true })).toBeVisible()
    await actions.screenshot({ path: testInfo.outputPath('sidebar-actions-menu.png') })
    await page.keyboard.press('Escape')
    await expect(actions).toHaveCount(0)
    expect(writes).toEqual([])
    expect(errors).toEqual([])
  })
}
