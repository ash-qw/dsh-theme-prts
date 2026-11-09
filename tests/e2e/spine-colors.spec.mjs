import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

async function mount(page, preferences = {}) {
  await page.addInitScript(preferences => {
    if (!localStorage.getItem('prtsFixtureNativeConfig')) localStorage.setItem('prtsFixtureNativeConfig', JSON.stringify({
      revision: 1, value: { enabled: true, bootAnimation: false, motion: 'reduced', ...preferences },
    }))
  }, preferences)
  await page.goto('/tests/fixtures/rc7-harness.html?native-forms')
  await expect(page.locator('[data-prts-workspace-row] [data-prts-facility-spine]')).toHaveAttribute('data-prts-facility-vector', '')
}

async function openColors(page) {
  if (!await page.locator('[data-prts-rail-brand]').isVisible()) await page.locator('[data-prts-rail-launcher]').click()
  await page.locator('[data-prts-rail-brand]').click()
  await page.locator('#prts-tab-interaction').click()
}

const saved = (page, key) => page.evaluate(key => window.__PRTS_FIXTURE_RUNTIME__.nativeConfigForm.getSnapshot().value[key], key)

test('spine presets and custom colors persist, export and import independently', async ({ page }) => {
  await mount(page)
  await openColors(page)
  for (const [label, key, name, color] of [
    ['工作区卡片', 'workspaceSpineColor', '贸易站蓝', '#33ccff'],
    ['普通会话卡片', 'sessionSpineColor', '发电站绿', '#ccff66'],
    ['当前会话卡片', 'currentSessionSpineColor', '制造站黄', '#ffcc00'],
  ]) {
    await page.getByRole('group', { name: `${label}侧脊颜色`, exact: true }).getByRole('button', { name, exact: true }).click()
    await expect.poll(() => saved(page, key)).toBe(color)
  }
  const custom = page.getByRole('button', { name: '工作区卡片侧脊自定义颜色', exact: true })
  await custom.click()
  let editor = page.getByRole('dialog', { name: '工作区卡片侧脊自定义颜色', exact: true })
  await editor.getByLabel('HEX 颜色').fill('invalid')
  await expect(editor.getByRole('button', { name: '应用颜色' })).toBeDisabled()
  await editor.getByRole('button', { name: '取消' }).click()
  expect(await saved(page, 'workspaceSpineColor')).toBe('#33ccff')
  await custom.click()
  editor = page.getByRole('dialog', { name: '工作区卡片侧脊自定义颜色', exact: true })
  await editor.getByLabel('HEX 颜色').fill('#123ABC')
  await editor.getByRole('button', { name: '应用颜色' }).click()
  await expect.poll(() => saved(page, 'workspaceSpineColor')).toBe('#123abc')
  await expect(custom).toHaveAttribute('aria-pressed', 'true')
  await page.reload()
  await expect.poll(() => page.locator('html').evaluate(root => getComputedStyle(root).getPropertyValue('--prts-workspace-spine-color').trim())).toBe('#123abc')
  await openColors(page)
  await page.locator('[data-prts-transfer-open]').click()
  await page.locator('[data-prts-transfer-assets]').uncheck()
  const waiting = page.waitForEvent('download')
  await page.locator('[data-prts-transfer-export]').click()
  const downloaded = await waiting
  const imported = JSON.parse(await readFile(await downloaded.path(), 'utf8'))
  expect([imported.preferences.workspaceSpineColor, imported.preferences.sessionSpineColor, imported.preferences.currentSessionSpineColor]).toEqual(['#123abc', '#ccff66', '#ffcc00'])
  imported.preferences.workspaceSpineColor = 'auto'
  imported.preferences.currentSessionSpineColor = '#5ccddb'
  await page.locator('[data-prts-transfer-file]').setInputFiles({ name: 'spine.prts-theme.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(imported)) })
  await page.locator('[data-prts-transfer-apply]').click()
  await expect(page.locator('[data-prts-transfer-status]')).toContainText('主题已导入并保存')
  await expect.poll(() => page.locator('html').evaluate(root => getComputedStyle(root).getPropertyValue('--prts-workspace-spine-color').trim())).toBe('#33ccff')
  expect(await saved(page, 'sessionSpineColor')).toBe('#ccff66')
  expect(await saved(page, 'currentSessionSpineColor')).toBe('#5ccddb')
})

for (const scheme of ['dark', 'light']) for (const height of [900, 600]) {
  test(`spine overrides cover selected, ordinary, hovered and fallback cards (${scheme}, ${height})`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height })
    await page.emulateMedia({ colorScheme: scheme })
    await mount(page, { workspaceSpineColor: '#33ccff', sessionSpineColor: '#ccff66', currentSessionSpineColor: '#ffcc00' })
    if (await page.locator('html').getAttribute('data-prts-scheme') !== scheme) await page.locator('[data-prts-scheme-toggle]').click()
    const workspace = page.locator('[data-prts-workspace-row]')
    const session = page.locator('[data-prts-session-row]')
    const surface = row => row.locator('> [data-prts-facility-spine] [data-prts-facility-layer="surface"]')
    await expect(workspace).toHaveCSS('height', height <= 820 ? '34px' : '38px')
    await expect(surface(workspace)).toHaveCSS('fill', 'rgb(51, 204, 255)')
    await expect(surface(session)).toHaveCSS('fill', 'rgb(255, 204, 0)')
    await session.evaluate(row => { row.setAttribute('aria-selected', 'false'); row.removeAttribute('data-prts-selection-target') })
    await expect(surface(session)).toHaveCSS('fill', 'rgb(204, 255, 102)')
    await session.hover()
    await expect(surface(session)).toHaveCSS('fill', 'rgb(204, 255, 102)')
    await expect.poll(() => session.evaluate(row => getComputedStyle(row, '::before').backgroundColor)).toBe('rgb(204, 255, 102)')
    await session.evaluate(row => row.setAttribute('aria-selected', 'true'))
    await expect(surface(session)).toHaveCSS('fill', 'rgb(255, 204, 0)')
    await expect.poll(() => session.evaluate(row => getComputedStyle(row, '::before').backgroundColor)).toBe('rgb(255, 204, 0)')
    await openColors(page)
    await page.locator('[data-prts-spine-reset]').click()
    await expect.poll(() => saved(page, 'sessionSpineColor')).toBe('auto')
    await session.evaluate(row => row.setAttribute('aria-selected', 'false'))
    await expect(surface(session)).toHaveCSS('fill', scheme === 'dark' ? 'rgb(94, 106, 112)' : 'rgb(101, 114, 122)')
    expect(await saved(page, 'workspaceSpineColor')).toBe('auto')
    expect(await saved(page, 'currentSessionSpineColor')).toBe('auto')
  })
}

test('spine controls and their in-page color editor fit a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 640 })
  await mount(page)
  await openColors(page)
  const colors = page.locator('[data-prts-spine-colors]')
  await expect(colors).toBeVisible()
  expect(await colors.evaluate(node => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1)
  for (const row of await colors.locator('[data-prts-spine-presets]').all()) {
    expect(await row.evaluate(node => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1)
  }
  await page.getByRole('button', { name: '当前会话卡片侧脊自定义颜色', exact: true }).click()
  const editor = page.getByRole('dialog', { name: '当前会话卡片侧脊自定义颜色', exact: true })
  await expect(editor).toBeVisible()
  const bounds = await editor.boundingBox()
  expect(bounds.x).toBeGreaterThanOrEqual(0)
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390)
  expect(bounds.y).toBeGreaterThanOrEqual(0)
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(640)
  await page.keyboard.press('Escape')
  await expect(editor).toHaveCount(0)
  await page.getByRole('button', { name: '当前会话卡片侧脊自定义颜色', exact: true }).click()
  await expect(editor).toBeVisible()
  await page.locator('[data-prts-theme-settings-scroll]').evaluate(node => { node.scrollTop -= 40 })
  await expect(editor).toHaveCount(0)
  await expect(page.locator('[data-prts-theme-settings]')).toBeVisible()
  await page.screenshot({ path: '/tmp/prts-spine-v2-mobile.png' })
})

test('spine settings are last in Interaction, use three presets and reset both palettes only', async ({ page }) => {
  await mount(page, { sessionFlow: false, cornerColor: '#abcdef', workspaceSpineColor: '#123456', workspaceSpineColorLight: '#654321', sessionSpineColor: '#ffffff', sessionSpineColorLight: '#000000', currentSessionSpineColor: '#5ccddb', currentSessionSpineColorLight: '#ccff66', spineColorLinked: true, spineColorSource: 'light' })
  await openColors(page)
  const colors = page.locator('[data-prts-spine-colors]')
  await expect(page.locator('#prts-page-interaction [data-prts-settings-common-grid] > :last-child')).toHaveAttribute('data-prts-spine-colors', '')
  await expect(colors.locator('[data-prts-spine-swatch]')).toHaveCount(9)
  await expect(colors.getByRole('button', { name: '恢复默认', exact: true })).toHaveCount(1)
  await expect(colors.getByRole('button', { name: '跟随主题', exact: true })).toHaveCount(0)
  await colors.locator('[data-prts-spine-reset]').click()
  await expect(colors.getByRole('switch', { name: '日夜共用' })).not.toBeChecked()
  await expect.poll(() => saved(page, 'workspaceSpineColorLight')).toBe('auto')
  for (const key of ['workspaceSpineColor', 'sessionSpineColor', 'currentSessionSpineColor', 'sessionSpineColorLight', 'currentSessionSpineColorLight']) expect(await saved(page, key)).toBe('auto')
  expect(await saved(page, 'cornerColor')).toBe('#abcdef')
  expect(await saved(page, 'sessionFlow')).toBe(false)
  for (const mode of ['light', 'dark']) {
    await colors.locator(`[data-prts-spine-mode="${mode}"]`).click()
    await expect(colors.getByRole('group', { name: '工作区卡片侧脊颜色', exact: true }).getByRole('button', { name: '贸易站蓝', exact: true })).toHaveAttribute('aria-pressed', 'true')
    await expect(colors.getByRole('group', { name: '当前会话卡片侧脊颜色', exact: true }).getByRole('button', { name: '制造站黄', exact: true })).toHaveAttribute('aria-pressed', 'true')
    await expect(colors.locator('[data-prts-setting-row="sessionSpineColor"] input')).toHaveValue(mode === 'light' ? '#65727a' : '#5e6a70')
  }
  await colors.scrollIntoViewIfNeeded()
  await page.screenshot({ path: '/tmp/prts-spine-v2-desktop.png' })
})

for (const source of ['light', 'dark']) {
  test(`spine sharing follows ${source} without overwriting the other palette`, async ({ page }) => {
    await mount(page, { workspaceSpineColor: '#33ccff', workspaceSpineColorLight: '#ffcc00', sessionSpineColor: '#5e6a70', sessionSpineColorLight: '#65727a', currentSessionSpineColor: '#ffcc00', currentSessionSpineColorLight: '#33ccff' })
    await openColors(page)
    const colors = page.locator('[data-prts-spine-colors]')
    const activeWorkspace = () => page.locator('[data-prts-workspace-row] [data-prts-facility-spine] [data-prts-facility-layer="surface"]').evaluate(node => getComputedStyle(node).fill)
    await colors.locator(`[data-prts-spine-mode="${source}"]`).click()
    await expect.poll(activeWorkspace).toBe('rgb(51, 204, 255)')
    const presets = colors.getByRole('group', { name: '工作区卡片侧脊颜色', exact: true })
    await presets.getByRole('button', { name: '发电站绿', exact: true }).click()
    const key = source === 'light' ? 'workspaceSpineColorLight' : 'workspaceSpineColor'
    const other = source === 'light' ? 'workspaceSpineColor' : 'workspaceSpineColorLight'
    const otherColor = source === 'light' ? '#33ccff' : '#ffcc00'
    await expect.poll(() => saved(page, key)).toBe('#ccff66')
    await expect.poll(activeWorkspace).toBe(source === 'light' ? 'rgb(51, 204, 255)' : 'rgb(204, 255, 102)')
    await colors.locator('[data-prts-spine-sync]').click()
    await expect(colors.locator('[data-prts-spine-modes]')).toBeHidden()
    await expect.poll(activeWorkspace).toBe('rgb(204, 255, 102)')
    await presets.getByRole('button', { name: '工作区卡片侧脊自定义颜色', exact: true }).click()
    const editor = page.getByRole('dialog', { name: '工作区卡片侧脊自定义颜色', exact: true })
    await editor.getByLabel('HEX 颜色').fill('#abcdef')
    await editor.getByRole('button', { name: '应用颜色' }).click()
    await expect.poll(activeWorkspace).toBe('rgb(171, 205, 239)')
    expect(await saved(page, key)).toBe('#abcdef')
    expect(await saved(page, other)).toBe(otherColor)
    await page.reload()
    await openColors(page)
    await expect(colors.getByRole('switch', { name: '日夜共用' })).toBeChecked()
    await expect.poll(activeWorkspace).toBe('rgb(171, 205, 239)')
    await page.locator('html').evaluate(root => root.setAttribute('data-prts-scheme', 'light'))
    await expect.poll(activeWorkspace).toBe('rgb(171, 205, 239)')
    await colors.locator('[data-prts-spine-sync]').click()
    await expect(colors.locator(`[data-prts-spine-mode="${source}"]`)).toHaveAttribute('aria-pressed', 'true')
    await expect(colors.locator('[data-prts-spine-modes]')).toBeVisible()
    await page.locator('html').evaluate(root => root.setAttribute('data-prts-scheme', 'dark'))
    await expect.poll(activeWorkspace).toBe(source === 'dark' ? 'rgb(171, 205, 239)' : 'rgb(51, 204, 255)')
    await page.locator('html').evaluate(root => root.setAttribute('data-prts-scheme', 'light'))
    await expect.poll(activeWorkspace).toBe(source === 'light' ? 'rgb(171, 205, 239)' : 'rgb(255, 204, 0)')
    expect(await saved(page, other)).toBe(otherColor)
    await page.locator('[data-prts-transfer-open]').click()
    await page.locator('[data-prts-transfer-assets]').uncheck()
    const download = page.waitForEvent('download')
    await page.locator('[data-prts-transfer-export]').click()
    const exported = JSON.parse(await readFile(await (await download).path(), 'utf8'))
    expect(exported.preferences.spineColorSource).toBe(source)
    expect(exported.preferences.spineColorLinked).toBe(false)
    expect(exported.preferences[key]).toBe('#abcdef')
    expect(exported.preferences[other]).toBe(otherColor)
  })
}
