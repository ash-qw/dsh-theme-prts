import { expect, test } from '@playwright/test'

test.use({ locale: 'zh-CN', storageState: process.env.PRTS_RC022_STATE || undefined })
test.beforeEach(() => {
  test.skip(!process.env.PRTS_RC022_STATE, 'Requires authenticated local 0.2.2 storage state')
  test.setTimeout(60_000)
})

async function openHarness(page, width = 1440) {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.setViewportSize({ width, height: 900 })
  await page.goto(process.env.PRTS_LIVE_URL || 'http://127.0.0.1:3080')
  await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '', { timeout: 20_000 })
  await page.locator('[data-prts-startup]').waitFor({ state: 'hidden' })
  return errors
}

async function openThemeSettings(page) {
  const launcher = page.locator('[data-prts-rail-launcher]')
  if (await launcher.isVisible() && await launcher.getAttribute('aria-expanded') === 'false') await launcher.click()
  await page.locator('[data-prts-rail-brand]').click()
  await expect(page.locator('[data-prts-theme-settings]')).toBeVisible()
}

test('0.2.2 desktop main panels and theme settings remain functional @live-rc022', async ({ page }) => {
  const errors = await openHarness(page)
  const operation = page.locator('[data-prts-region="operation"]')
  await expect(page.locator('[data-slot="main"]').locator('xpath=../..')).toHaveAttribute('data-prts-region', 'operation')
  await expect(page.locator('[data-prts-workspace-row]').first()).toBeVisible()
  await expect(page.locator('[data-prts-session-row]').first()).toBeVisible()
  await page.getByRole('button', { name: '插件', exact: true }).click()
  await expect(operation.locator('[data-global-panel]')).toBeVisible()
  await expect(operation.getByText('@ash-qw/dsh-theme-prts', { exact: true })).toBeVisible()
  await openThemeSettings(page)
  await page.locator('[data-prts-settings-jump="interaction"]').click()
  await expect(page.getByRole('combobox', { name: '光标模式' })).toBeVisible()
  await expect(page.locator('[data-prts-persistence-error]')).toBeHidden()
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-prts-theme-settings]')).toBeHidden()
  for (const asset of ['emblems', 'backgrounds', 'avatars']) {
    const response = await page.request.get(new URL(`/prts-theme-api/${asset}/configuration`, page.url()).href)
    expect(response.status()).toBe(200)
  }
  expect(errors).toEqual([])
})

test('0.2.2 mobile native sidebar overlays rather than squeezing the main column @live-rc022', async ({ page }) => {
  const errors = await openHarness(page, 390)
  const frame = page.locator('[data-prts-region="frame"]')
  const operation = page.locator('[data-prts-region="operation"]')
  const sidebar = page.locator('[data-prts-region="sessions"]')
  await expect(frame).toHaveAttribute('data-sidebar-drawer', 'true')
  await expect(frame).toHaveAttribute('data-sidebar-collapsed', 'true')
  await expect(sidebar).toBeHidden()
  const closedWidth = (await operation.boundingBox()).width
  await page.getByRole('button', { name: '打开侧边栏', exact: true }).click()
  await expect(frame).not.toHaveAttribute('data-sidebar-collapsed')
  await expect(sidebar).toBeVisible()
  await expect(sidebar).toHaveCSS('position', 'absolute')
  await expect(operation).toHaveAttribute('inert', '')
  expect((await operation.boundingBox()).width).toBe(closedWidth)
  await page.locator('[data-sidebar-mask]').click({ position: { x: 385, y: 100 } })
  await expect(sidebar).toBeHidden()
  await expect(operation).not.toHaveAttribute('inert')
  await page.getByRole('button', { name: '打开侧边栏', exact: true }).click()
  await page.getByRole('button', { name: '插件', exact: true }).click()
  await expect(sidebar).toBeHidden()
  await expect(operation.locator('[data-global-panel]')).toBeVisible()
  await expect(operation.getByText('@ash-qw/dsh-theme-prts', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  expect(errors).toEqual([])
})

test('0.2.2 native theme preferences survive reload and restore the original cursor @live-rc022', async ({ page }) => {
  test.skip(process.env.PRTS_RC022_WRITE !== '1', 'Requires explicit reversible settings-write opt-in')
  const errors = await openHarness(page)
  await openThemeSettings(page)
  await page.locator('[data-prts-settings-jump="interaction"]').click()
  const combo = page.getByRole('combobox', { name: '光标模式' })
  const original = (await combo.innerText()).trim()
  const alternate = original === '系统光标' ? 'PRTS 原生光标' : '系统光标'
  try {
    await combo.click()
    await page.getByRole('option', { name: alternate, exact: true }).click()
    await expect(page.locator('[data-prts-persistence-status]')).toHaveText('已保存')
    await page.reload()
    await page.locator('[data-prts-startup]').waitFor({ state: 'hidden' })
    await openThemeSettings(page)
    await page.locator('[data-prts-settings-jump="interaction"]').click()
    await expect(combo).toHaveText(alternate)
    await expect(page.locator('[data-prts-persistence-error]')).toBeHidden()
  } finally {
    if (!(await page.locator('[data-prts-theme-settings]').isVisible())) await openThemeSettings(page)
    await page.locator('[data-prts-settings-jump="interaction"]').click()
    await combo.click()
    await page.getByRole('option', { name: original, exact: true }).click()
    await expect(page.locator('[data-prts-persistence-status]')).toHaveText('已保存')
    await page.keyboard.press('Escape')
  }
  expect(errors).toEqual([])
})

test('0.2.2 native reasoning expands and collapses in both color schemes @live-rc022', async ({ page }) => {
  test.skip(!process.env.PRTS_RC022_REASONING_SESSION, 'Requires an existing conversation with reasoning')
  const errors = await openHarness(page)
  await page.locator('[data-prts-session-row]').filter({ hasText: process.env.PRTS_RC022_REASONING_SESSION }).first().click()
  const group = page.getByRole('button', { name: /已完成，用时/ }).first()
  await expect(group).toBeVisible()
  if (await group.getAttribute('aria-expanded') === 'false') await group.click()
  const summary = page.getByRole('button', { name: /^(已调用工具|执行了命令)/ }).first()
  if (await summary.count() && await summary.getAttribute('aria-expanded') === 'false') await summary.click()
  const reasoning = page.locator('[data-variant="think"]:visible').first()
  const disclosure = reasoning.locator('[data-disclosure-row]')
  await expect(disclosure).toBeVisible()
  const root = page.locator('html')
  const originalScheme = await root.getAttribute('data-prts-scheme')
  try {
    for (const scheme of ['light', 'dark']) {
      if (await root.getAttribute('data-prts-scheme') !== scheme) await page.locator('[data-prts-scheme-toggle]').evaluate(node => node.click())
      await expect(root).toHaveAttribute('data-prts-scheme', scheme)
      if (await disclosure.getAttribute('aria-expanded') === 'true') await disclosure.click()
      await disclosure.click()
      await expect(disclosure).toHaveAttribute('aria-expanded', 'true')
      await expect(reasoning.locator('[class*="thinkBody"]')).toBeVisible()
      await expect(reasoning.locator('[data-slot="conversation.chat.reasoning.body"]')).toBeVisible()
      await disclosure.click()
      await expect(disclosure).toHaveAttribute('aria-expanded', 'false')
    }
    expect(errors).toEqual([])
  } finally {
    if (await root.getAttribute('data-prts-scheme') !== originalScheme) await page.locator('[data-prts-scheme-toggle]').evaluate(node => node.click())
  }
})
