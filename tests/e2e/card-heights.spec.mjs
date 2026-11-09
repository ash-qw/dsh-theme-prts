import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { DEFAULT_PREFERENCES } from '../../src/client/preferences.js'

async function mount(page, preferences = {}) {
  await page.addInitScript(preferences => {
    if (!localStorage.getItem('prtsFixtureNativeConfig')) localStorage.setItem('prtsFixtureNativeConfig', JSON.stringify({
      revision: 1, value: { enabled: true, bootAnimation: false, motion: 'reduced', ...preferences },
    }))
  }, preferences)
  await page.goto('/tests/fixtures/rc7-harness.html?native-forms')
  await expect(page.locator('[data-prts-workspace-row] [data-prts-facility-vector]').first()).toBeAttached()
}

async function openHeights(page) {
  if (!await page.locator('[data-prts-rail-brand]').isVisible()) await page.locator('[data-prts-rail-launcher]').click()
  await page.locator('[data-prts-rail-brand]').click()
  await page.locator('#prts-tab-flow').click()
  return page.locator('[data-prts-card-heights]')
}

const saved = (page, key) => page.evaluate(({ key, fallback }) => window.__PRTS_FIXTURE_RUNTIME__.nativeConfigForm.getSnapshot().value[key] ?? fallback, { key, fallback: DEFAULT_PREFERENCES[key] })
const preview = (range, value) => range.evaluate((input, value) => {
  input.value = String(value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}, value)
const commit = range => range.dispatchEvent('change')

async function expectGeometry(page, selector, height) {
  const row = page.locator(selector)
  await expect(row).toHaveCSS('height', `${height}px`)
  for (const part of ['[data-prts-facility-face]', '> [data-prts-facility-spine]']) {
    const owner = row.locator(part)
    await expect(owner).toHaveCSS('height', `${height}px`)
    await expect.poll(() => owner.evaluate(node => (node.matches('svg') ? node : node.querySelector('svg')).viewBox.baseVal.height)).toBe(height)
  }
  const silhouette = row.locator('[data-prts-silhouette-content]')
  if (await silhouette.count()) await expect(silhouette).toHaveAttribute('transform', `translate(0 1) scale(1 ${Number(((height - 2) / 38).toFixed(5))})`)
  const buttons = row.locator('[data-prts-workspace-actions] button,[data-prts-session-actions] button')
  for (const button of await buttons.all()) await expect(button).toHaveCSS('height', `${height}px`)
}

for (const width of [2560, 1440, 390]) for (const scheme of ['dark', 'light']) {
  test(`card heights stay equal automatically and custom ranges retain their geometry (${width}, ${scheme})`, async ({ page }) => {
    test.setTimeout(60_000)
    await page.setViewportSize({ width, height: width === 2560 ? 1440 : 900 })
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' })
    await mount(page)
    if (await page.locator('html').getAttribute('data-prts-scheme') !== scheme) {
      if (!await page.locator('[data-prts-rail-brand]').isVisible()) await page.locator('[data-prts-rail-launcher]').click()
      await page.locator('[data-prts-scheme-toggle]').click()
    }
    await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', scheme)
    for (const height of [width === 2560 ? 1440 : 900, 820, 600, 821]) {
      await page.setViewportSize({ width, height })
      const expected = height <= 820 ? 32 : 36
      await expectGeometry(page, '[data-prts-workspace-row]', expected)
      await expectGeometry(page, '[data-prts-session-row]', expected)
    }
    const section = await openHeights(page)
    await expect(page.locator('#prts-tab-flow')).toHaveText('侧栏卡片')
    await expect(section.locator('[data-prts-card-height-controls]')).toBeHidden()
    await expect(section.locator('[data-prts-card-height-auto]')).toBeVisible()
    await expect(section.getByRole('button', { name: '自动适应', exact: true })).toHaveAttribute('aria-pressed', 'true')
    await section.screenshot({ path: `/tmp/prts-sidebar-card-auto-${width}-${scheme}.png` })
    expect(await section.evaluate(node => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1)
    await section.getByRole('button', { name: '手动调节', exact: true }).click()
    await expect.poll(() => saved(page, 'cardHeightMode')).toBe('custom')
    await expect(section.locator('[data-prts-card-height-auto]')).toBeHidden()
    await expect(section.getByRole('button', { name: '手动调节', exact: true })).toHaveAttribute('aria-pressed', 'true')
    await expect(section.getByRole('button', { name: '自动适应', exact: true })).toHaveAttribute('aria-pressed', 'false')
    for (const [key, selector, min, max] of [
      ['workspaceCardHeight', '[data-prts-workspace-row]', 32, 48],
      ['sessionCardHeight', '[data-prts-session-row]', 32, 48],
    ]) {
      const range = section.locator(`[data-prts-card-height-key="${key}"]`)
      await expect(range).toHaveAttribute('min', String(min))
      await expect(range).toHaveAttribute('max', String(max))
      await expect(range).toHaveAttribute('step', '1')
      await expect(section.locator(`[data-prts-setting-row="${key}"] [data-prts-card-height-bounds]`)).toHaveText('32px · 紧凑下限48px · 高度上限')
      const original = await saved(page, key)
      for (const value of [min, min + 1, 36, 40, max - 1, max]) {
        await preview(range, value)
        await expect(section.locator(`[data-prts-card-height-output="${key}"]`)).toHaveText(`${value}px`)
        await expectGeometry(page, selector, value)
        expect(await saved(page, key)).toBe(original)
        await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
      }
      await commit(range)
      await expect.poll(() => saved(page, key)).toBe(max)
    }
    await section.scrollIntoViewIfNeeded()
    for (const label of await section.locator('[data-prts-card-height-controls] label').all()) {
      expect(await label.evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(1)
    }
    const overflow = await section.evaluate(node => node.scrollWidth - node.clientWidth)
    expect(overflow).toBeLessThanOrEqual(1)
    await section.screenshot({ path: `/tmp/prts-card-heights-${width}-${scheme}.png` })
    await page.keyboard.press('Escape')
    for (const height of [820, 600, width === 2560 ? 1440 : 900]) {
      await page.setViewportSize({ width, height })
      await expectGeometry(page, '[data-prts-workspace-row]', 48)
      await expectGeometry(page, '[data-prts-session-row]', 48)
    }
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-prts-card-height', 'custom')
    await expectGeometry(page, '[data-prts-workspace-row]', 48)
    const reopened = await openHeights(page)
    await reopened.getByRole('button', { name: '自动适应', exact: true }).click()
    await expect(page.locator('html')).toHaveAttribute('data-prts-card-height', 'auto')
    await expect(reopened.locator('[data-prts-card-height-auto]')).toBeVisible()
    await expect(reopened.locator('[data-prts-card-height-controls]')).toBeHidden()
    await page.keyboard.press('Escape')
    await page.setViewportSize({ width, height: 600 })
    await expectGeometry(page, '[data-prts-workspace-row]', 32)
    await expectGeometry(page, '[data-prts-session-row]', 32)
    expect(await saved(page, 'workspaceCardHeight')).toBe(48)
    expect(await saved(page, 'sessionCardHeight')).toBe(48)
  })
}

test('height settings export and import with the mode and both independent values', async ({ page }) => {
  await mount(page, { cardHeightMode: 'custom', workspaceCardHeight: 48, sessionCardHeight: 32 })
  await openHeights(page)
  await page.locator('[data-prts-transfer-open]').click()
  await page.locator('[data-prts-transfer-assets]').uncheck()
  const waiting = page.waitForEvent('download')
  await page.locator('[data-prts-transfer-export]').click()
  const download = await waiting
  const packaged = JSON.parse(await readFile(await download.path(), 'utf8'))
  expect([packaged.preferences.cardHeightMode, packaged.preferences.workspaceCardHeight, packaged.preferences.sessionCardHeight]).toEqual(['custom', 48, 32])
  packaged.preferences.workspaceCardHeight = 32
  packaged.preferences.sessionCardHeight = 48
  await page.locator('[data-prts-transfer-file]').setInputFiles({ name: 'heights.prts-theme.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(packaged)) })
  await page.locator('[data-prts-transfer-apply]').click()
  await expect(page.locator('[data-prts-transfer-status]')).toContainText('主题已导入并保存')
  await page.keyboard.press('Escape')
  await expectGeometry(page, '[data-prts-workspace-row]', 32)
  await expectGeometry(page, '[data-prts-session-row]', 48)
  await page.reload()
  await expectGeometry(page, '[data-prts-workspace-row]', 32)
  expect(await saved(page, 'sessionCardHeight')).toBe(48)
})

test('touch devices retain the equal standard height in automatic mode', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 600 }, isMobile: true, hasTouch: true })
  try {
    const page = await context.newPage()
    await mount(page)
    await expectGeometry(page, '[data-prts-workspace-row]', 36)
    await expectGeometry(page, '[data-prts-session-row]', 36)
  } finally { await context.close() }
})


test('height choices support the keyboard and preserve custom values and unrelated sidebar settings', async ({ page }) => {
  await mount(page, { workspaceCardHeight: 37, sessionCardHeight: 33, sessionFlow: false, workspaceSpineColor: '#123456', sessionSpineColorLight: '#654321' })
  const section = await openHeights(page)
  const automatic = section.getByRole('button', { name: '自动适应', exact: true })
  const custom = section.getByRole('button', { name: '手动调节', exact: true })
  const original = await page.evaluate(() => window.__PRTS_FIXTURE_RUNTIME__.nativeConfigForm.getSnapshot().value)
  await custom.focus()
  await page.keyboard.press('Space')
  await expect(custom).toHaveAttribute('aria-pressed', 'true')
  await expect(section.locator('[data-prts-card-height-key="workspaceCardHeight"]')).toHaveValue('37')
  await expect(section.locator('[data-prts-card-height-key="sessionCardHeight"]')).toHaveValue('33')
  await automatic.focus()
  await page.keyboard.press('Enter')
  await expect(automatic).toHaveAttribute('aria-pressed', 'true')
  await expect(section.locator('[data-prts-card-height-auto]')).toBeVisible()
  const current = await page.evaluate(() => window.__PRTS_FIXTURE_RUNTIME__.nativeConfigForm.getSnapshot().value)
  expect(current).toEqual({ ...original, cardHeightMode: 'auto' })
})
