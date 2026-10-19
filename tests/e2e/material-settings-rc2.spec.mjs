import { expect, test } from '@playwright/test'

test('native settings save background material and Baker loading through the host form contract', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const initial = { enabled: true, bootAnimation: false, conversationStyle: 'deck-chat' }
  await page.addInitScript(value => {
    if (!localStorage.getItem('prtsFixtureNativeConfig')) {
      localStorage.setItem('prtsFixtureNativeConfig', JSON.stringify({ revision: 1, value }))
    }
  }, initial)
  const background = { revision: 1, sidebar: null, conversation: null, full: null }
  await page.route('**/prts-theme-api/backgrounds/configuration', async route => {
    if (route.request().method() === 'POST') {
      const request = route.request().postDataJSON()
      expect(request.slot).toBe('full')
      expect(request.image).toBeTruthy()
      background.revision += 1
      background.full = { id: '11111111-1111-4111-8111-111111111111' }
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(background) })
  })
  await page.route('**/prts-theme-api/backgrounds/image/*', route => route.fulfill({
    status: 200, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WZfG9AAAAAASUVORK5CYII=', 'base64'),
  }))
  await page.goto('/tests/fixtures/rc7-harness.html?native-forms')
  await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')

  await page.locator('[data-prts-rail-brand]').click()
  const loading = page.getByRole('switch', { name: '回复完成前显示加载动画' })
  await expect(loading).toBeVisible()
  await expect(page.locator('[data-prts-baker-loading-sample]')).toHaveCount(0)
  await loading.click()
  await expect(loading).toHaveAttribute('aria-checked', 'true')
  await expect(page.locator('html')).toHaveAttribute('data-prts-baker-loading', '')
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('prtsFixtureNativeConfig')).value.bakerLoading)).toBe(true)
  await page.evaluate(() => {
    const step = document.createElement('div')
    step.id = 'baker-loading-fixture'
    step.setAttribute('data-chat-flow-kind', 'assistant-step')
    step.innerHTML = '<div class="fixture_root" data-streaming><div class="fixture_body"><p>逐字生成的回复</p></div></div>'
    document.querySelector('[data-conversation-scroll]').append(step)
  })
  const reply = page.locator('#baker-loading-fixture .fixture_body')
  await expect(reply).toHaveAttribute('data-prts-ai-surface', 'body')
  await expect(reply.locator('p')).toHaveCSS('display', 'none')
  await page.locator('#baker-loading-fixture [data-streaming]').evaluate(node => node.removeAttribute('data-streaming'))
  await expect(reply.locator('p')).not.toHaveCSS('display', 'none')

  await page.locator('[data-prts-settings-jump="background"]').click()
  await expect(page.locator('[data-prts-background-settings]')).toBeVisible()
  await page.locator('[data-prts-setting-key="backgroundMode"][data-prts-setting-value="full"]').click()
  await expect(page.locator('[data-prts-opacity-settings]')).toBeVisible()
  await page.locator('[data-prts-background-file="full"]').setInputFiles({
    name: 'background.png', mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WZfG9AAAAAASUVORK5CYII=', 'base64'),
  })
  await expect(page.locator('[data-prts-background-upload="full"]')).toHaveAttribute('data-has-image', '')
  await expect(page.locator('[data-prts-background-status]')).toContainText('背景已保存')
  await expect(page.locator('[data-prts-opacity-control="bakerOpacity"]')).toBeVisible()
  await expect(page.locator('[data-prts-opacity-control="classicUserOpacity"]')).toBeHidden()
  const opacityLayout = await page.locator('[data-prts-opacity-grid]').evaluate(grid => ({
    width: grid.getBoundingClientRect().width,
    columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
    dialWidth: grid.querySelector('[data-prts-opacity-dial]').getBoundingClientRect().width,
  }))
  expect(opacityLayout.width).toBeLessThanOrEqual(432)
  expect(opacityLayout.columns).toBe(3)
  expect(opacityLayout.dialWidth).toBeLessThanOrEqual(108)
  const dial = page.locator('[data-prts-opacity-control="railOpacity"] input[type="number"]')
  await dial.fill('82')
  await dial.press('Tab')
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('prtsFixtureNativeConfig')).value.railOpacity)).toBe(.18)
  await expect(page.locator('[data-prts-persistence-error]')).toBeHidden()

  await page.reload()
  await page.locator('[data-prts-rail-brand]').click()
  await page.locator('[data-prts-settings-jump="background"]').click()
  await expect(page.locator('[data-prts-opacity-control="railOpacity"] input[type="number"]')).toHaveValue('82')
  await page.locator('[data-prts-settings-jump="appearance"]').click()
  await expect(loading).toHaveAttribute('aria-checked', 'true')
  const bakerRow = await page.locator('[data-prts-setting-row="bakerGroupAvatars"]').evaluate(row => {
    const label = row.querySelector('span').getBoundingClientRect()
    const toggle = row.querySelector('button').getBoundingClientRect()
    return { display: getComputedStyle(row).display, labelLeft: label.left, labelBottom: label.bottom, toggleLeft: toggle.left, toggleTop: toggle.top }
  })
  await page.setViewportSize({ width: 390, height: 780 })
  await page.locator('[data-prts-settings-jump="background"]').click()
  const narrowGrid = await page.locator('[data-prts-opacity-grid]').evaluate(grid => ({
    width: grid.getBoundingClientRect().width,
    columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
    overflow: grid.scrollWidth - grid.clientWidth,
  }))
  expect(narrowGrid.width).toBeLessThanOrEqual(284)
  expect(narrowGrid.columns).toBe(2)
  expect(narrowGrid.overflow).toBe(0)
  const composerRow = await page.locator('[data-prts-composer-glass-setting] [data-prts-setting-row]').evaluate(row => {
    const label = row.querySelector('span').getBoundingClientRect()
    const toggle = row.querySelector('button').getBoundingClientRect()
    return { display: getComputedStyle(row).display, labelLeft: label.left, labelBottom: label.bottom, toggleLeft: toggle.left, toggleTop: toggle.top, overflow: row.scrollWidth - row.clientWidth }
  })
  expect(bakerRow.display).toBe('grid')
  expect(bakerRow.toggleLeft).toBeCloseTo(bakerRow.labelLeft, 0)
  expect(bakerRow.toggleTop).toBeGreaterThanOrEqual(bakerRow.labelBottom)
  expect(composerRow.display).toBe(bakerRow.display)
  expect(composerRow.toggleLeft).toBeCloseTo(composerRow.labelLeft, 0)
  expect(composerRow.toggleTop).toBeGreaterThanOrEqual(composerRow.labelBottom)
  expect(composerRow.overflow).toBe(0)
  expect(errors).toEqual([])
})

test('Baker solid background uses the conversation color for the native composer fade', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('prtsFixtureNativeConfig', JSON.stringify({
    revision: 1, value: { enabled: true, bootAnimation: false, conversationStyle: 'deck-chat', backgroundMode: 'off', composerGlass: false },
  })))
  await page.goto('/tests/fixtures/rc7-harness.html?native-forms')
  await expect(page.locator('html')).not.toHaveAttribute('data-prts-composer-enhanced')
  const fade = await page.evaluate(() => {
    document.querySelector('[data-prts-region="operation"]').dataset.phase = 'active'
    return getComputedStyle(document.querySelector('[data-composer-seat]')).backgroundImage
  })
  expect(fade).toContain('rgb(10, 14, 17)')
  expect(fade).not.toContain('rgb(8, 10, 12)')
  const lightFade = await page.evaluate(() => {
    document.documentElement.dataset.prtsScheme = 'light'
    return getComputedStyle(document.querySelector('[data-composer-seat]')).backgroundImage
  })
  expect(lightFade).toContain('rgb(237, 241, 243)')
  await page.locator('[data-composer-card]').evaluate(card => card.setAttribute('data-prts-composer-glass-active', ''))
  await expect(page.locator('[data-composer-seat]')).toHaveCSS('background-image', 'none')
})

test('Classic user messages use the saved wallpaper opacity in dark and light modes', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('prtsFixtureNativeConfig')) localStorage.setItem('prtsFixtureNativeConfig', JSON.stringify({
      revision: 1, value: { enabled: true, bootAnimation: false, conversationStyle: 'native', backgroundMode: 'full' },
    }))
  })
  await page.route('**/prts-theme-api/backgrounds/configuration', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ revision: 1, sidebar: null, conversation: null, full: { id: '11111111-1111-4111-8111-111111111111' } }),
  }))
  await page.route('**/prts-theme-api/backgrounds/image/*', route => route.fulfill({
    status: 200, contentType: 'image/png',
    body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WZfG9AAAAAASUVORK5CYII=', 'base64'),
  }))
  await page.goto('/tests/fixtures/rc7-harness.html?native-forms')
  await expect(page.locator('html')).toHaveAttribute('data-prts-background-full', '')
  await page.evaluate(() => {
    const scroll = document.querySelector('[data-conversation-scroll]')
    scroll.insertAdjacentHTML('afterbegin', '<article data-message-role="user">已发送的用户消息</article><div data-submission-echo><div class="fixture_bubble">发送中的用户消息</div></div>')
  })
  const message = page.locator('[data-message-role="user"]')
  const echo = page.locator('[data-submission-echo] .fixture_bubble')
  await expect(message).toHaveCSS('background-color', 'rgba(23, 29, 33, 0.5)')
  await expect(echo).toHaveCSS('background-color', 'rgba(23, 29, 33, 0.5)')
  await page.locator('[data-prts-rail-brand]').click()
  await page.locator('[data-prts-settings-jump="background"]').click()
  await expect(page.locator('[data-prts-opacity-control="classicUserOpacity"]')).toBeVisible()
  await expect(page.locator('[data-prts-opacity-control="bakerOpacity"]')).toBeHidden()
  const input = page.locator('[data-prts-opacity-control="classicUserOpacity"] input[type="number"]')
  await input.fill('76')
  await input.press('Tab')
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('prtsFixtureNativeConfig')).value.classicUserOpacity)).toBe(.24)
  await expect(message).toHaveCSS('background-color', 'rgba(23, 29, 33, 0.24)')
  await expect(echo).toHaveCSS('background-color', 'rgba(23, 29, 33, 0.24)')
  await page.evaluate(() => { document.documentElement.dataset.prtsScheme = 'light' })
  await expect(message).toHaveCSS('background-color', 'rgba(229, 234, 237, 0.24)')
  await expect(echo).toHaveCSS('background-color', 'rgba(229, 234, 237, 0.24)')
  await page.reload()
  await page.locator('[data-prts-rail-brand]').click()
  await page.locator('[data-prts-settings-jump="background"]').click()
  await expect(page.locator('[data-prts-opacity-control="classicUserOpacity"] input[type="number"]')).toHaveValue('76')
})
