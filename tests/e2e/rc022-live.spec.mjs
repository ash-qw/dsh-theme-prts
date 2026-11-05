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

for (const scheme of ['dark', 'light']) for (const width of [1440, 390]) {
  test(`0.2.2 sidebar hover buttons align and open native menus (${scheme}, ${width}) @live-rc022`, async ({ page }) => {
    test.skip(process.env.PRTS_RC022_WRITE !== '1', 'Requires reversible color-scheme changes')
    test.setTimeout(90_000)
    const errors = await openHarness(page, width)
    const html = page.locator('html')
    const originalScheme = await html.getAttribute('data-prts-scheme')
    try {
      if (originalScheme !== scheme) await page.locator('[data-prts-scheme-toggle]').evaluate(node => node.click())
      await expect(html).toHaveAttribute('data-prts-scheme', scheme)
      const frame = page.locator('[data-prts-region="frame"]')
      if (await frame.getAttribute('data-sidebar-collapsed') !== null) {
        await page.getByRole('button', { name: '打开侧边栏', exact: true }).click()
      }
      for (const kind of ['workspace', 'session']) {
        const row = page.locator(`[data-prts-${kind}-row]`).filter({ has: page.locator('button[data-context-menu-trigger]') }).first()
        const actions = row.locator(`[data-prts-${kind}-actions]`)
        const menu = row.locator(`[data-prts-${kind}-menu]`)
        await row.hover()
        await expect(menu).toBeVisible()
        await expect(menu).toHaveAttribute('data-prts-facility-vector', '')
        await expect.poll(() => actions.evaluate(node => Array.from(node.querySelectorAll('button')).every(button =>
          button.getAnimations().every(animation => animation.playState === 'finished'),
        ))).toBe(true)
        await expect.poll(() => actions.evaluate(node => {
          const bounds = node.getBoundingClientRect()
          return Array.from(node.querySelectorAll('button')).filter(button => button.checkVisibility()).every(button => {
            const rect = button.getBoundingClientRect()
            return Math.abs(rect.top - bounds.top) < 0.5 && Math.abs(rect.bottom - bounds.bottom) < 0.5
              && rect.left >= bounds.left - 0.5 && rect.right <= bounds.right + 0.5
          })
        })).toBe(true)
        if (kind === 'workspace') {
          const create = row.locator('[data-prts-workspace-create]')
          await expect(create).toBeVisible()
          expect(await create.getAttribute('data-context-menu-trigger')).toBeNull()
          await create.click({ trial: true })
        } else {
          await expect(row.locator('[data-prts-session-quick-actions]')).toHaveCSS('display', 'none')
        }
        await menu.click()
        await expect(page.getByRole('menu')).toBeVisible()
        await expect(row).toHaveAttribute('data-prts-row-menu-open', '')
        await page.mouse.move(1000, 800)
        await expect(menu).toBeVisible()
        await page.keyboard.press('Escape')
        await expect(page.getByRole('menu')).toBeHidden()
        await expect(row).not.toHaveAttribute('data-prts-row-menu-open')
      }
      expect(errors).toEqual([])
    } finally {
      await page.keyboard.press('Escape')
      if (await html.getAttribute('data-prts-scheme') !== originalScheme) {
        await page.locator('[data-prts-scheme-toggle]').evaluate(node => node.click())
        await expect(html).toHaveAttribute('data-prts-scheme', originalScheme)
      }
    }
  })
}

for (const width of [1440, 390]) {
  test(`0.2.2 pinned session keeps its native indicator when hovered and selected (${width}) @live-rc022`, async ({ page }) => {
    test.skip(process.env.PRTS_RC022_WRITE !== '1', 'Requires reversible session selection')
    test.setTimeout(90_000)
    const errors = await openHarness(page, width)
    const originalUrl = page.url()
    const frame = page.locator('[data-prts-region="frame"]')
    const openSidebar = async () => {
      if (await frame.getAttribute('data-sidebar-collapsed') !== null) {
        await page.getByRole('button', { name: '打开侧边栏', exact: true }).click()
      }
    }
    try {
      await openSidebar()
      const row = page.locator('[data-prts-session-row]').filter({ has: page.locator('[data-prts-session-pin]') }).first()
      await expect(row).toBeVisible()
      const pin = row.locator('[data-prts-session-pin]')
      await expect(pin).toHaveCount(1)
      const checkPin = async () => {
        await expect(pin).toBeVisible()
        await expect.poll(() => pin.evaluate(node => {
          for (let ancestor = node; ancestor; ancestor = ancestor.parentElement) {
            if (Number(getComputedStyle(ancestor).opacity) === 0) return false
          }
          return true
        })).toBe(true)
        await expect.poll(() => row.evaluate(node => {
          const pin = node.querySelector('[data-prts-session-pin]').getBoundingClientRect()
          const face = node.querySelector('[data-prts-facility-face]').getBoundingClientRect()
          return pin.left >= face.left && pin.right <= face.right - 3.5
            && pin.top >= face.top && pin.bottom <= face.bottom
        })).toBe(true)
      }
      await row.hover()
      await checkPin()
      await row.locator('[data-prts-row-title]').click()
      await openSidebar()
      await expect(row).toHaveAttribute('aria-selected', 'true')
      await page.mouse.move(1000, 800)
      await checkPin()
      await row.hover()
      await checkPin()
      await expect(row.locator('[data-prts-session-menu]')).toBeVisible()
      expect(errors).toEqual([])
    } finally {
      await page.goto(originalUrl)
    }
  })
}

for (const width of [1440, 390]) {
  test(`0.2.2 saved current session truncates long titles inside its card (${width}) @live-rc022`, async ({ page }) => {
    const errors = await openHarness(page, width)
    const originalUrl = page.url()
    const frame = page.locator('[data-prts-region="frame"]')
    if (await frame.getAttribute('data-sidebar-collapsed') !== null) {
      await page.getByRole('button', { name: '打开侧边栏', exact: true }).click()
    }
    await page.locator('[data-prts-session-row][aria-selected="false"]:not(:has([data-prts-session-pin]))').first().locator('[data-prts-row-title]').click()
    if (await frame.getAttribute('data-sidebar-collapsed') !== null) {
      await page.getByRole('button', { name: '打开侧边栏', exact: true }).click()
    }
    const row = page.locator('[data-prts-session-row][aria-selected="true"]')
    await expect(row.locator('[data-prts-session-resting]')).toHaveCount(1)
    await expect(row).toBeVisible()
    const title = row.locator('[data-prts-row-title]')
    const originalTitle = await title.textContent()
    try {
      for (const text of ['这是一个需要省略显示而不能超出会话卡片右侧边缘的很长的当前会话标题', 'AReallyLongUnbrokenCurrentSessionTitleThatMustRemainInsideTheCardBoundary']) {
        await title.evaluate((node, text) => { node.textContent = text }, text)
        for (const hovered of [false, true]) {
          if (hovered) await row.hover()
          else await page.mouse.move(width - 10, 850)
          await expect(title).toHaveCSS('overflow', 'hidden')
          await expect(title).toHaveCSS('white-space', 'nowrap')
          if (!hovered) {
            expect(await row.evaluate(node => node.matches(':hover, :focus-within'))).toBe(false)
            await expect(title).toHaveCSS('text-overflow', 'ellipsis')
            await expect.poll(() => title.evaluate(node => node.scrollLeft)).toBe(0)
          }
          await expect.poll(() => row.evaluate(node => {
            const title = node.querySelector('[data-prts-row-title]')
            const bounds = title.getBoundingClientRect()
            const face = node.querySelector('[data-prts-facility-face]').getBoundingClientRect()
            return bounds.left >= face.left - 0.5 && bounds.right <= face.right + 0.5
          })).toBe(true)
          expect(await title.evaluate(node => node.scrollWidth > node.clientWidth)).toBe(true)
        }
      }
      expect(errors).toEqual([])
    } finally {
      await title.evaluate((node, text) => { node.textContent = text }, originalTitle)
      await page.goto(originalUrl)
    }
  })
}


test('0.2.2 composer retains native frosted glass while the sidebar spine animates @live-rc022', async ({ page }) => {
  const errors = await openHarness(page)
  const frame = page.locator('[data-prts-region="frame"]')
  if (await frame.getAttribute('data-sidebar-collapsed') !== null) {
    await page.getByRole('button', { name: '打开侧边栏', exact: true }).click()
  }
  const glass = page.locator('[data-prts-composer-glass-surface] > .glass-surface').first()
  const checkMaterial = async () => {
    await expect(glass).toBeVisible()
    await expect(glass).toHaveClass(/glass-surface--fallback/)
    const filter = await glass.evaluate(node => getComputedStyle(node).backdropFilter)
    expect(filter).toContain('blur(5px)')
    expect(filter).not.toContain('url(')
    await expect(glass.locator('canvas')).toHaveCount(0)
  }
  const row = page.locator('[data-prts-session-row]').filter({ has: page.locator('[data-prts-session-menu]') }).first()
  const spine = row.locator('[data-prts-facility-spine]')
  const face = row.locator('[data-prts-facility-face]')
  const spineScale = () => spine.evaluate(node => new DOMMatrix(getComputedStyle(node).transform).a)
  const faceOffset = () => face.evaluate(node => new DOMMatrix(getComputedStyle(node).transform).m41)
  await page.mouse.move(1400, 100)
  await expect.poll(spineScale).toBeCloseTo(0.25)
  await checkMaterial()
  await row.hover()
  await expect.poll(spineScale).toBeCloseTo(1)
  await expect.poll(faceOffset).toBeCloseTo(6)
  await expect(row.locator('[data-prts-session-menu]')).toBeVisible()
  await checkMaterial()
  await page.mouse.move(1400, 100)
  await expect.poll(spineScale).toBeCloseTo(0.25)
  await expect.poll(faceOffset).toBeCloseTo(0)
  await checkMaterial()
  expect(errors).toEqual([])
})
