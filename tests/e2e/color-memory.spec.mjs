import { expect, test } from '@playwright/test'

async function mount(page, width, scheme) {
  await page.setViewportSize({ width, height: 900 })
  await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' })
  await page.addInitScript(() => {
    if (!localStorage.getItem('prtsFixtureNativeConfig')) localStorage.setItem('prtsFixtureNativeConfig', JSON.stringify({ revision: 1, value: { enabled: true, bootAnimation: false, motion: 'reduced' } }))
  })
  await page.goto('/tests/fixtures/rc7-harness.html?native-forms')
  await open(page, scheme)
}
async function open(page, scheme) {
  if (!await page.locator('[data-prts-rail-brand]').isVisible()) await page.locator('[data-prts-rail-launcher]').click()
  if (await page.locator('html').getAttribute('data-prts-scheme') !== scheme) await page.locator('[data-prts-scheme-toggle]').click()
  await page.locator('[data-prts-rail-brand]').click()
  await page.locator('#prts-tab-flow').click()
}
const saved = (page, key) => page.evaluate(key => window.__PRTS_FIXTURE_RUNTIME__.nativeConfigForm.getSnapshot().value[key], key)

for (const [width, scheme] of [[1440, 'dark'], [390, 'light']]) {
  test(`all spine slots retain independent day/night custom colors after presets and reload (${width}, ${scheme})`, async ({ page }) => {
    test.setTimeout(60_000)
    await mount(page, width, scheme)
    const corners = await page.locator('html').evaluate(root => [root.style.getPropertyValue('--prts-corner-color-dark'), root.style.getPropertyValue('--prts-corner-color-light')])
    for (const [mode, color] of [['dark', '#123abc'], ['light', '#456def']]) {
      await page.locator('[data-prts-spine-mode="' + mode + '"]').click()
      for (const [key, label] of [['workspaceSpineColor', '工作区卡片'], ['sessionSpineColor', '普通会话卡片'], ['currentSessionSpineColor', '当前会话卡片']]) {
        const setting = key + (mode === 'light' ? 'Light' : '')
        const customKey = setting.replace('SpineColor', 'SpineCustomColor')
        const trigger = page.getByRole('button', { name: label + '侧脊自定义颜色', exact: true })
        await trigger.click()
        const editor = page.getByRole('dialog', { name: label + '侧脊自定义颜色', exact: true })
        await editor.getByLabel('HEX 颜色').fill(color)
        await expect(editor.locator('[data-prts-color-sample]')).toHaveCSS('height', '44px')
        await expect(editor.getByLabel('R 通道')).toHaveCSS('background-image', /linear-gradient/)
        await editor.getByRole('button', { name: '应用颜色', exact: true }).click()
        await expect.poll(() => saved(page, setting)).toBe(color)
        expect(await saved(page, customKey)).toBe(color)
        await page.getByRole('group', { name: label + '侧脊颜色', exact: true }).getByRole('button', { name: '贸易站蓝', exact: true }).click()
        expect(await saved(page, customKey)).toBe(color)
        await expect(trigger).toHaveAttribute('aria-pressed', 'false')
        await trigger.click()
        await expect(editor.getByLabel('HEX 颜色')).toHaveValue(color.toUpperCase())
        await editor.getByLabel('HEX 颜色').fill('#ffffff')
        await editor.getByRole('button', { name: '取消', exact: true }).click()
        expect(await saved(page, setting)).toBe('#33ccff')
        expect(await saved(page, customKey)).toBe(color)
      }
    }
    expect(await page.locator('html').evaluate(root => [root.style.getPropertyValue('--prts-corner-color-dark'), root.style.getPropertyValue('--prts-corner-color-light')])).toEqual(corners)
    await page.reload()
    await open(page, scheme)
    for (const [mode, color] of [['dark', '#123abc'], ['light', '#456def']]) {
      await page.locator('[data-prts-spine-mode="' + mode + '"]').click()
      await page.getByRole('button', { name: '工作区卡片侧脊自定义颜色', exact: true }).click()
      const editor = page.getByRole('dialog', { name: '工作区卡片侧脊自定义颜色', exact: true })
      await expect(editor.getByLabel('HEX 颜色')).toHaveValue(color.toUpperCase())
      await editor.getByRole('button', { name: '应用颜色', exact: true }).click()
      await expect.poll(() => saved(page, 'workspaceSpineColor' + (mode === 'light' ? 'Light' : ''))).toBe(color)
    }
  })

  test(`custom flow layers use the shared editor and survive preset switches and reload (${width}, ${scheme})`, async ({ page }) => {
    await mount(page, width, scheme)
    const choose = value => page.locator('[data-prts-setting-key="sessionFlowPalette"][data-prts-setting-value="' + value + '"]').click()
    await choose('custom')
    for (const [label, key, color] of [['前层', 'Front', '#123abc'], ['中层', 'Core', '#456def'], ['后层', 'Back', '#789abc']]) {
      await page.getByRole('button', { name: label + '流线颜色', exact: true }).click()
      const editor = page.getByRole('dialog', { name: label + '流线颜色', exact: true })
      await editor.getByLabel('HEX 颜色').fill(color)
      await editor.getByRole('button', { name: '应用颜色', exact: true }).click()
      await expect.poll(() => saved(page, 'sessionFlowColor' + key)).toBe(color)
      expect(await saved(page, 'sessionFlowCustomColor' + key)).toBe(color)
    }
    await choose('amber')
    await page.reload()
    await open(page, scheme)
    await choose('custom')
    for (const [key, color] of [['Front', '#123abc'], ['Core', '#456def'], ['Back', '#789abc']]) {
      await expect.poll(() => saved(page, 'sessionFlowColor' + key)).toBe(color)
      await expect(page.locator('[data-prts-setting-color-output="sessionFlowColor' + key + '"]')).toHaveText(color)
    }
    await page.getByRole('button', { name: '前层流线颜色', exact: true }).click()
    const editor = page.getByRole('dialog', { name: '前层流线颜色', exact: true })
    await editor.getByLabel('HEX 颜色').fill('#abcdef')
    await expect(page.locator('html')).toHaveCSS('--prts-session-flow-front', '#abcdef')
    expect(await saved(page, 'sessionFlowColorFront')).toBe('#123abc')
    await page.keyboard.press('Escape')
    await expect(page.locator('html')).toHaveCSS('--prts-session-flow-front', '#123abc')
    expect(await saved(page, 'sessionFlowCustomColorFront')).toBe('#123abc')
    await page.getByRole('button', { name: '前层流线颜色', exact: true }).click()
    await editor.getByLabel('R 通道').fill('200')
    await page.screenshot({ path: '/tmp/prts-shared-color-editor-' + width + '-' + scheme + '.png' })
    await editor.getByRole('button', { name: '取消', exact: true }).click()
  })
}
