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

async function openShell(page, scheme, width, glass = 'standard', motion = 'reduced') {
  await page.setViewportSize({ width, height: 900 })
  await page.addInitScript(({ glass, motion }) => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
    version: 12, enabled: true, bootAnimation: false, motion, glass,
  })), { glass, motion })
  await page.goto('/tests/fixtures/rc7-harness.html')
  await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
  if (await page.locator('html').getAttribute('data-prts-scheme') !== scheme) {
    const launcher = page.locator('[data-prts-rail-launcher]')
    if (await launcher.isVisible() && await launcher.getAttribute('aria-expanded') === 'false') await launcher.click()
    await page.locator('[data-prts-scheme-toggle]').click()
  }
  await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', scheme)
  await page.addStyleTag({ content: `
    #native-shell-overlay { position: fixed; inset: 0; z-index: 2147483000; display: flex; align-items: center; justify-content: center; }
    .native-mask { position: absolute; inset: 0; background: #0008; }
    .native-shell { position: relative; display: grid; grid-template: 'native-title native-tools' 54px 'native-nav native-content' minmax(0, 1fr) / 188px minmax(0, 1fr); width: 800px; height: 800px; max-width: calc(100vw - 48px); overflow: hidden; }
    .native-title { grid-area: native-title; padding: 22px 12px 8px 24px; font-size: 16px; }
    .native-tools { grid-area: native-tools; display: flex; height: 54px; align-items: flex-start; justify-content: space-between; padding: 20px 14px 8px 10px; }
    .native-nav { grid-area: native-nav; min-height: 0; }
    .native-nav-list { display: flex; flex-direction: column; overflow: auto; }
    .native-nav-list > button { display: flex; align-items: center; height: 40px; }
    .native-nav-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .native-content { grid-area: native-content; min-height: 0; overflow: auto; padding: 0 24px 24px; }
    .native-form { display: grid; gap: 16px; font: 14px/1.6 sans-serif; }
    .native-form input { box-sizing: border-box; width: 160px; height: 32px; padding: 4px 8px; border: 1px solid #777; border-radius: 8px; background: #fff; color: #111; font: 14px/22px sans-serif; }
    .native-form button { padding: 5px 12px; border: 1px solid #777; border-radius: 8px; background: #ddd; color: #111; }
    @media (max-width: 767px) {
      html:not([data-windows-titlebar]):not([data-platform='darwin']) .native-shell { width: 100%; height: 100%; max-width: none; grid-template: 'native-title native-tools' 48px 'native-nav native-nav' auto 'native-content native-content' minmax(0, 1fr) / minmax(0, 1fr) auto; }
      html:not([data-windows-titlebar]):not([data-platform='darwin']) .native-nav-list { flex-direction: row; padding: 12px 16px 14px; }
    }
  ` })
  await page.evaluate(() => {
    const overlay = document.createElement('div')
    overlay.id = 'native-shell-overlay'
    overlay.setAttribute('role', 'presentation')
    overlay.innerHTML = `<div aria-hidden="true" class="native-mask"></div><div class="native-shell" data-shortcut-modal="settings" role="dialog" aria-modal="true" aria-labelledby="native-shell-title" tabindex="-1">
      <div class="native-title" id="native-shell-title"><div data-slot="settings.header">设置</div></div>
      <nav class="native-nav" aria-label="设置分类"><div class="native-nav-list">${['通用设置', '模型', '内置插件', 'Agent 预设', '插件市场', 'MCP 连接器'].map((label, index) => `<button type="button"${index === 0 ? ' aria-current="true"' : ''}><span aria-hidden="true"><span data-slot="settings.section.icon"><svg width="16" height="16" aria-hidden="true"></svg></span></span><span class="native-nav-label">${label}</span></button>`).join('')}</div></nav>
      <div class="native-tools"><div data-slot="settings.action"><button type="button">原生操作</button></div><button type="button"><span data-slot="settings.close">关闭</span></button></div>
      <div class="native-content"><div data-slot="settings.section"><section class="native-form"><label>原生输入<input aria-label="原生输入"></label><button type="button">原生按钮</button><div style="height:1200px">内容由宿主提供</div></section></div></div>
    </div>`
    overlay.querySelectorAll('nav button').forEach(button => button.addEventListener('click', () => {
      overlay.querySelector('[aria-current]')?.removeAttribute('aria-current')
      button.setAttribute('aria-current', 'true')
      overlay.querySelector('[data-slot="settings.section"]').replaceChildren(Object.assign(document.createElement('input'), { placeholder: '新设置页' }))
    }))
    overlay.querySelector('[data-slot="settings.close"]').parentElement.addEventListener('click', () => overlay.remove())
    document.body.append(overlay)
  })
  const shell = page.locator('[data-shortcut-modal="settings"]')
  await expect(shell).toHaveAttribute('data-prts-floating-glass', 'dialog')
  return shell
}

test('paper bookmarks remain neatly aligned and accept native category changes', async ({ page }) => {
  const shell = await openShell(page, 'dark', 1440)
  await expect(shell.locator('[data-prts-settings-filetab]')).toHaveCount(0)
  const bookmarks = shell.locator('nav button')
  const colors = await bookmarks.evaluateAll(nodes => nodes.map(node => getComputedStyle(node).backgroundColor))
  expect(new Set(colors).size).toBe(6)
  const model = bookmarks.nth(1)
  expect(await model.evaluate(node => parseFloat(getComputedStyle(node).paddingLeft))).toBeGreaterThanOrEqual(14)
  const before = await model.boundingBox()
  await model.click()
  const after = await model.boundingBox()
  expect(after.x).toBe(before.x)
  const pageLeft = await shell.evaluate(node => node.getBoundingClientRect().left + parseFloat(getComputedStyle(node).getPropertyValue('--prts-settings-rail')))
  expect(after.x + after.width - pageLeft).toBeGreaterThanOrEqual(20)
  expect(pageLeft - after.x).toBeLessThanOrEqual(96)
  const label = '新增插件 / A newly installed plugin with a long category name'
  await model.evaluate((button, label) => { button.querySelector('.native-nav-label').firstChild.data = label }, label)
  await expect(shell.locator('nav button[aria-current]')).toHaveText(label)
  const labelSize = await model.locator('.native-nav-label').evaluate(node => ({ width: node.clientWidth, height: node.clientHeight, scrollWidth: node.scrollWidth, scrollHeight: node.scrollHeight }))
  expect(labelSize.scrollWidth).toBeLessThanOrEqual(labelSize.width + 1)
  expect(labelSize.scrollHeight).toBeLessThanOrEqual(labelSize.height + 1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1440)
})

for (const scheme of ['dark', 'light']) for (const width of [1440, 390]) {
  test('current bookmark adheres to the top sheet while other tabs stay tucked below (' + scheme + ', ' + width + ')', async ({ page }) => {
    const shell = await openShell(page, scheme, width)
    const backing = shell.locator('[data-prts-settings-page]')
    await expect(backing).toHaveCount(6)
    await expect(backing.first()).toHaveAttribute('aria-hidden', 'true')
    const inspect = () => shell.evaluate(node => {
      const bounds = node.getBoundingClientRect()
      const pages = [...node.querySelectorAll('[data-prts-settings-page]')].sort((first, second) => Number(first.dataset.prtsSettingsDepth) - Number(second.dataset.prtsSettingsDepth))
      const front = getComputedStyle(node.querySelector('[data-prts-settings-depth="0"]'))
      const current = node.querySelector('nav button[aria-current]')
      const other = [...node.querySelectorAll('nav button')].find(button => button !== current)
      const currentBounds = current.getBoundingClientRect()
      const otherBounds = other.getBoundingClientRect()
      const pageLeft = bounds.left + parseFloat(front.left)
      const pageTop = bounds.top + parseFloat(front.top)
      const horizontal = window.innerWidth < 768
      const point = rectangle => horizontal
        ? { x: rectangle.left + rectangle.width / 2, y: pageTop + 7 }
        : { x: pageLeft + 14, y: rectangle.top + rectangle.height / 2 }
      const hit = rectangle => { const target = point(rectangle); return document.elementFromPoint(target.x, target.y)?.closest('nav button') }
      const content = node.querySelector('[data-slot="settings.section"]').parentElement
      const contentBounds = content.getBoundingClientRect()
      const contentStyle = getComputedStyle(content)
      return {
        overlap: horizontal ? currentBounds.bottom - pageTop : currentBounds.right - pageLeft,
        currentHit: hit(currentBounds) === current,
        otherHit: hit(otherBounds) === other,
        contentClearance: horizontal ? contentBounds.top + parseFloat(contentStyle.paddingTop) - currentBounds.bottom : contentBounds.left + parseFloat(contentStyle.paddingLeft) - currentBounds.right,
        sheets: pages.map(sheet => ({ index: Number(sheet.dataset.prtsSettingsPage), depth: Number(sheet.dataset.prtsSettingsDepth), height: sheet.getBoundingClientRect().height, bottom: sheet.getBoundingClientRect().bottom, z: Number(getComputedStyle(sheet).zIndex), clipPath: getComputedStyle(sheet).clipPath })),
        tabs: [...node.querySelectorAll('nav button')].map(button => ({ left: button.getBoundingClientRect().left, rotate: getComputedStyle(button).rotate, band: getComputedStyle(button, '::after').content })),
        otherZ: Number(getComputedStyle(other).zIndex), frontZ: Number(front.zIndex), currentZ: Number(getComputedStyle(current).zIndex),
      }
    })
    for (const label of ['通用设置', '模型', 'MCP 连接器']) {
      await shell.getByRole('button', { name: label, exact: true }).click()
      const geometry = await inspect()
      expect(geometry.overlap).toBeGreaterThanOrEqual(width < 768 ? 13 : 20)
      expect(geometry.currentHit).toBe(true)
      expect(geometry.otherHit).toBe(false)
      expect(geometry.contentClearance).toBeGreaterThanOrEqual(6)
      expect(geometry.sheets.map(sheet => sheet.depth)).toEqual([0, 1, 2, 3, 4, 5])
      expect(geometry.sheets.every(sheet => sheet.height === geometry.sheets[0].height)).toBe(true)
      expect(geometry.sheets[0].height).toBeGreaterThan(600)
      expect(geometry.sheets.every(sheet => sheet.clipPath === 'none')).toBe(true)
      const selectedIndex = label === '通用设置' ? 1 : label === '模型' ? 2 : 6
      expect(geometry.sheets.map(sheet => sheet.index)).toEqual([selectedIndex, ...[1, 2, 3, 4, 5, 6].filter(index => index !== selectedIndex)])
      for (let index = 1; index < geometry.sheets.length; index++) {
        expect(geometry.sheets[index].bottom).toBeGreaterThan(geometry.sheets[index - 1].bottom + 2)
        expect(geometry.sheets[index].z).toBeLessThan(geometry.sheets[index - 1].z)
      }
      expect(geometry.sheets.at(-1).bottom - geometry.sheets[0].bottom).toBeCloseTo(width < 768 ? 20 * .6667 : 20, 1)
      expect(geometry.tabs.every(tab => tab.rotate === 'none' && tab.band === 'none')).toBe(true)
      if (width >= 768) expect(new Set(geometry.tabs.map(tab => tab.left)).size).toBe(1)
      expect(geometry.otherZ).toBeLessThan(geometry.frontZ)
      expect(geometry.frontZ).toBeLessThan(geometry.currentZ)
    }
    await shell.getByRole('button', { name: '关闭', exact: true }).click()
    await expect(backing).toHaveCount(0)
  })
}

for (const width of [1440, 390]) for (const motion of ['full', 'reduced', 'system-reduced']) {
  test('category changes are immediate without page motion (' + width + ', ' + motion + ')', async ({ page }) => {
    if (motion === 'system-reduced') await page.emulateMedia({ reducedMotion: 'reduce' })
    const shell = await openShell(page, 'dark', width, 'standard', motion === 'reduced' ? 'reduced' : 'full')
    await page.evaluate(() => {
      window.settingsCaptures = 0
      document.startViewTransition = () => { window.settingsCaptures++; throw Error('must not capture') }
    })
    for (const label of ['MCP 连接器', '模型', '通用设置']) {
      await shell.getByRole('button', { name: label, exact: true }).click()
      await expect(shell.locator('nav button[aria-current]')).toHaveText(label)
      const state = await shell.evaluate(async node => {
        const parts = [node.querySelector('[data-prts-settings-depth="0"]'), node.querySelector('[data-prts-settings-jacket]'), node.querySelector('.native-tools'), node.querySelector('.native-content'), node.querySelector('nav button[aria-current]')]
        const inspect = () => parts.map(part => ({ bounds: part.getBoundingClientRect().toJSON(), transform: getComputedStyle(part).transform, animation: getComputedStyle(part).animationName }))
        const before = inspect()
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        return { before, after: inspect(), captures: window.settingsCaptures, bindings: node.querySelectorAll('[data-prts-settings-binding]').length }
      })
      expect(state.captures).toBe(0)
      expect(state.before).toEqual(state.after)
      expect(state.after.every(part => part.animation === 'none' && part.transform === 'none')).toBe(true)
      expect(state.bindings).toBe(0)
      await expect(shell).not.toHaveAttribute('data-prts-settings-turn')
      await expect(shell).not.toHaveAttribute('data-prts-settings-flipping')
      await expect(page.locator('html')).not.toHaveAttribute('data-prts-settings-flip')
      await expect(shell.locator('[data-prts-settings-packet], [data-prts-settings-packet-edges]')).toHaveCount(0)
    }
    await shell.evaluate(node => {
      for (const index of [5, 1, 0]) node.querySelectorAll('nav button')[index].click()
    })
    await expect(shell.locator('[data-prts-settings-depth="0"]')).toHaveAttribute('data-prts-settings-page', '1')
    await expect(shell.locator('nav button[aria-current]')).toHaveText('通用设置')
    expect(await page.evaluate(() => window.settingsCaptures)).toBe(0)
  })
}

for (const scheme of ['dark', 'light']) for (const width of [1440, 768, 600, 390]) {
  test(`native settings shell owns only its frame and navigation (${scheme}, ${width})`, async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    const shell = await openShell(page, scheme, width)
    await expectNativeBackdrop(shell)
    const bounds = await shell.boundingBox()
    expect(bounds.x).toBeGreaterThanOrEqual(0)
    expect(bounds.y).toBeGreaterThanOrEqual(0)
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(900)
    expect(bounds.width).toBe(width < 768 ? width - 24 : Math.min(800, width - 48))
    await expect(shell.locator('.native-title')).toBeHidden()
    await expect(shell).toHaveAccessibleName('设置')
    await expect(shell.locator('[data-prts-settings-watermark]')).toHaveCount(0)
    const content = shell.locator('.native-content')
    const navBounds = await shell.locator('nav').boundingBox()
    const contentBounds = await content.boundingBox()
    if (width >= 768) {
      expect(navBounds.width).toBe(width <= 1100 ? 92 : 96)
      expect(navBounds.width / bounds.width).toBeLessThan(.14)
      expect(contentBounds.width / bounds.width).toBeGreaterThan(.85)
      expect(navBounds.y).toBe(bounds.y)
      expect(contentBounds.x).toBeGreaterThanOrEqual(navBounds.x + navBounds.width)
    } else {
      expect(contentBounds.y).toBeGreaterThanOrEqual(navBounds.y + navBounds.height)
      expect(contentBounds.width).toBe(width - 24)
      expect(navBounds.y).toBe(bounds.y)
      expect(navBounds.height).toBe(56)
    }
    await expect(content).toHaveCSS('overflow-y', 'auto')
    await expect(shell).toHaveAttribute('data-prts-settings-shell', '')
    await expect(shell.locator('nav button[aria-current]')).toHaveText('通用设置')
    await expect(shell.locator('[data-prts-settings-filetab]')).toHaveCount(0)
    await expect(shell.locator('[data-prts-settings-side] b')).toHaveCount(0)
    await expect(shell.locator('[data-prts-settings-caption]')).toHaveCount(0)
    await expect(shell).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    const unmodified = await shell.evaluate(node => {
      const inspect = () => [...node.querySelectorAll('.native-form, .native-form input, .native-form button')].map(control => {
        const style = getComputedStyle(control)
        return Object.fromEntries(['display', 'font', 'color', 'backgroundColor', 'border', 'borderRadius', 'padding', 'gap', 'minHeight', 'boxShadow'].map(key => [key, style[key]]))
      })
      const themed = inspect()
      node.removeAttribute('data-shortcut-modal')
      const native = inspect()
      node.setAttribute('data-shortcut-modal', 'settings')
      return { themed, native }
    })
    expect(unmodified.themed).toEqual(unmodified.native)
    const input = shell.getByRole('textbox', { name: '原生输入' })
    await expect(input).not.toHaveAttribute('data-prts-floating-input')
    await input.fill('宿主仍然处理输入')
    await expect(input).toHaveValue('宿主仍然处理输入')
    const lastCategory = shell.getByRole('button', { name: 'MCP 连接器', exact: true })
    await page.keyboard.press('Tab')
    await lastCategory.focus()
    await expect(lastCategory).toHaveCSS('outline-style', 'solid')
    await lastCategory.click()
    await expect(lastCategory).toHaveAttribute('aria-current', 'true')
    await expect(shell.locator('nav button[aria-current]')).toHaveText('MCP 连接器')
    await expect(shell.locator('[data-prts-settings-filetab]')).toHaveCount(0)
    await expect(shell.locator('[data-prts-settings-depth="0"]')).toHaveAttribute('data-prts-settings-page', '6')
    const replacement = shell.getByPlaceholder('新设置页')
    await replacement.fill('页面可任意替换')
    await expect(replacement).not.toHaveAttribute('data-prts-floating-input')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    expect(errors).toEqual([])
    await shell.getByRole('button', { name: '关闭', exact: true }).click()
    await expect(shell).toHaveCount(0)
  })
}

for (const mode of ['off', 'reduced-transparency']) {
  test(`native settings shell respects ${mode} without changing other dialogs`, async ({ page }) => {
    if (mode === 'reduced-transparency') {
      const session = await page.context().newCDPSession(page)
      await session.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }] })
    }
    const shell = await openShell(page, 'dark', 1440, mode === 'off' ? 'off' : 'standard')
    await expect(shell).toHaveCSS('backdrop-filter', 'none')
    await expect(page.locator('.native-mask')).toHaveCSS('backdrop-filter', 'none')
    await expectNativeBackdrop(shell)
    const paper = await shell.evaluate(node => getComputedStyle(node.querySelector('[data-prts-settings-depth="0"]')).backgroundColor)
    expect(paper).toMatch(/^(?:rgb|color)\(/)
    expect(paper).not.toMatch(/rgba|\//)
    await shell.evaluate(node => {
      node.removeAttribute('data-shortcut-modal')
      node.removeAttribute('aria-labelledby')
      node.setAttribute('aria-label', '其他弹窗')
    })
    await expect(shell).toHaveCount(0)
    const other = page.getByRole('dialog', { name: '其他弹窗' })
    await expect(other).toHaveCSS('width', '800px')
    await expect(other.locator('.native-title')).toHaveCSS('font-size', '16px')
    await expect(other).toHaveCSS('backdrop-filter', 'none')
  })
}

for (const width of [600, 900]) {
  test(`native settings shell stays below desktop window chrome (${width})`, async ({ page }) => {
    const shell = await openShell(page, 'dark', width)
    await page.locator('html').evaluate(node => {
      node.setAttribute('data-windows-titlebar', '')
      node.style.setProperty('--dsh-frame-chrome-top', '40px')
      node.style.setProperty('--dsh-frame-overlay-top', '48px')
    })
    const bounds = await shell.boundingBox()
    expect(bounds.y).toBeGreaterThanOrEqual(40)
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(900)
    await expect(shell.getByRole('button', { name: '关闭', exact: true })).toBeVisible()
  })
}

for (const width of [1440, 390]) {
  test('all bookmarks remain clickable and native category mutations reconcile their sheets (' + width + ')', async ({ page }) => {
    const shell = await openShell(page, 'dark', width)
    const bookmarks = shell.locator('nav button')
    for (let index = 0; index < 6; index++) {
      const bookmark = bookmarks.nth(index)
      const label = await bookmark.textContent()
      await bookmark.click()
      await expect(shell.locator('nav button[aria-current]')).toHaveText(label)
      await expect(shell.locator('[data-prts-settings-depth="0"]')).toHaveAttribute('data-prts-settings-page', String(index + 1))
      if (width >= 768) {
        expect(await bookmark.locator('.native-nav-label').evaluate(node => {
          const bounds = node.getBoundingClientRect()
          return document.elementFromPoint(bounds.right - 1, bounds.top + bounds.height / 2)?.closest('button') === node.closest('button')
        })).toBe(true)
      }
    }
    await shell.evaluate(node => {
      const navigation = node.querySelector('nav > div')
      const plugin = document.createElement('button')
      plugin.textContent = '新插件'
      navigation.prepend(plugin)
    })
    await expect(shell.locator('[data-prts-settings-page]')).toHaveCount(7)
    await expect(shell.locator('[data-prts-settings-depth="0"]')).toHaveAttribute('data-prts-settings-page', '7')
    await shell.evaluate(node => {
      const navigation = node.querySelector('nav > div')
      navigation.prepend(navigation.lastElementChild)
      navigation.children[1].remove()
    })
    await expect(shell.locator('[data-prts-settings-page]')).toHaveCount(6)
    await expect(shell.locator('[data-prts-settings-depth="0"]')).toHaveAttribute('data-prts-settings-page', '1')
    const order = await shell.locator('[data-prts-settings-page]').evaluateAll(pages => pages
      .sort((first, second) => Number(first.dataset.prtsSettingsDepth) - Number(second.dataset.prtsSettingsDepth))
      .map(sheet => Number(sheet.dataset.prtsSettingsPage)))
    expect(order).toEqual([1, 2, 3, 4, 5, 6])
  })
}

for (const scheme of ['dark', 'light']) for (const width of [1440, 390]) {
  test('third-party categories keep scrollable bookmarks and native page ownership (' + scheme + ', ' + width + ')', async ({ page }) => {
    const shell = await openShell(page, scheme, width)
    const input = shell.getByRole('textbox', { name: '原生输入' })
    await input.fill('第三方设置草稿')
    await shell.evaluate(node => {
      const navigation = node.querySelector('nav > div')
      for (let index = 0; index < 12; index++) {
        const button = document.createElement('button')
        button.type = 'button'
        button.dataset.pluginSettings = String(index)
        const label = document.createElement('span')
        label.className = 'native-nav-label'
        label.textContent = index === 11 ? '第三方插件设置 / Third-party plugin settings with a long category name' : '插件 ' + (index + 1)
        button.append(label)
        button.addEventListener('click', () => {
          node.querySelector('nav button[aria-current]')?.removeAttribute('aria-current')
          button.setAttribute('aria-current', 'page')
        })
        navigation.append(button)
      }
      window.pluginSettingsInput = node.querySelector('.native-form input')
    })
    await expect(shell.locator('[data-prts-settings-page]')).toHaveCount(18)
    await expect(shell.locator('[data-prts-settings-pagination]')).toHaveText('01 / 18')
    const tabs = shell.locator('nav > div')
    const overflow = await tabs.evaluate(node => ({ horizontal: node.scrollWidth > node.clientWidth, vertical: node.scrollHeight > node.clientHeight }))
    expect(width < 768 ? overflow.horizontal : overflow.vertical).toBe(true)
    const plugin = shell.locator('nav button[data-plugin-settings="11"]')
    await plugin.click()
    await expect(plugin).toHaveAttribute('aria-current', 'page')
    await expect(plugin).toHaveAccessibleName('第三方插件设置 / Third-party plugin settings with a long category name')
    await expect(shell.locator('[data-prts-settings-depth="0"]')).toHaveAttribute('data-prts-settings-page', '18')
    await expect(shell.locator('[data-prts-settings-pagination]')).toHaveText('18 / 18')
    const geometry = await plugin.evaluate(button => {
      const bounds = button.getBoundingClientRect()
      const node = button.closest('[data-prts-settings-shell]')
      const sheets = [...node.querySelectorAll('[data-prts-settings-page]')]
      const label = button.firstElementChild
      return {
        hit: document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)?.closest('button') === button,
        outsideViewport: bounds.left < 0 || bounds.right > innerWidth || bounds.top < 0 || bounds.bottom > innerHeight,
        clippedLabel: label.scrollWidth > label.clientWidth + 1 || label.scrollHeight > label.clientHeight + 1,
        labelOverflow: getComputedStyle(label).overflowX, labelTextOverflow: getComputedStyle(label).textOverflow,
        pageHeights: sheets.map(sheet => sheet.getBoundingClientRect().height),
        maxOffset: Math.max(...sheets.map(sheet => parseFloat(sheet.style.getPropertyValue('--prts-settings-page-offset')))),
        color: getComputedStyle(button).getPropertyValue('--prts-bookmark').trim(),
        pageColor: getComputedStyle(node.querySelector('[data-prts-settings-depth="0"]')).getPropertyValue('--prts-bookmark').trim(),
        documentWidth: document.documentElement.scrollWidth,
      }
    })
    expect(geometry.hit).toBe(true)
    expect(geometry.outsideViewport).toBe(false)
    if (width < 768) {
      expect(geometry.labelOverflow).toBe('hidden')
      expect(geometry.labelTextOverflow).toBe('ellipsis')
    } else expect(geometry.clippedLabel).toBe(false)
    expect(new Set(geometry.pageHeights).size).toBe(1)
    expect(geometry.maxOffset).toBeLessThanOrEqual(24)
    expect(geometry.color).toBe(geometry.pageColor)
    expect(geometry.documentWidth).toBe(width)
    await expect(input).toHaveValue('第三方设置草稿')
    expect(await input.evaluate(node => node === window.pluginSettingsInput)).toBe(true)
    await plugin.evaluate(button => button.parentElement.prepend(button))
    await expect(shell.locator('[data-prts-settings-depth="0"]')).toHaveAttribute('data-prts-settings-page', '1')
    await expect(shell.locator('[data-prts-settings-pagination]')).toHaveText('01 / 18')
    await shell.locator('nav button[data-plugin-settings="0"]').evaluate(button => button.remove())
    await expect(shell.locator('[data-prts-settings-page]')).toHaveCount(17)
    await expect(shell.locator('[data-prts-settings-pagination]')).toHaveText('01 / 17')
    await expect(input).toHaveValue('第三方设置草稿')
    await expect(shell.locator('[data-prts-settings-caption], [data-prts-settings-binding]')).toHaveCount(0)
  })
}

for (const width of [1440, 900]) {
  test('settings shell inherits native desktop widths and viewport limits (' + width + ')', async ({ page }) => {
    const shell = await openShell(page, 'dark', width)
    for (const nativeWidth of [640, 960]) {
      const nativeRule = await page.addStyleTag({ content: '.native-shell { width: ' + nativeWidth + 'px; max-width: calc(100vw - 64px); }' })
      const sizes = await shell.evaluate(node => {
        const inspect = () => { const style = getComputedStyle(node); return { width: style.width, maxWidth: style.maxWidth } }
        const themed = inspect()
        node.removeAttribute('data-shortcut-modal')
        const native = inspect()
        node.setAttribute('data-shortcut-modal', 'settings')
        return { themed, native }
      })
      expect(sizes.themed).toEqual(sizes.native)
      expect(parseFloat(sizes.themed.width)).toBe(Math.min(nativeWidth, width - 64))
      await expect(shell.getByRole('button', { name: '关闭', exact: true })).toBeVisible()
      await shell.getByRole('button', { name: '模型', exact: true }).click()
      await expect(shell.locator('nav button[aria-current]')).toHaveText('模型')
      await nativeRule.evaluate(node => node.remove())
    }
  })
}

for (const width of [1440, 390]) {
  test('native settings keep host backdrop updates without changing other dialog scrims (' + width + ')', async ({ page }) => {
    const shell = await openShell(page, 'dark', width)
    await page.addStyleTag({ content: '#native-shell-overlay { background: rgba(30, 60, 90, .15); } .native-mask { background: rgba(12, 24, 36, .2); backdrop-filter: blur(3px); }' })
    await expectNativeBackdrop(shell)
    await expect(page.locator('#native-shell-overlay')).toHaveCSS('background-color', 'rgba(30, 60, 90, 0.15)')
    await expect(page.locator('.native-mask')).toHaveCSS('background-color', 'rgba(12, 24, 36, 0.2)')
    await expect(page.locator('.native-mask')).toHaveCSS('backdrop-filter', 'blur(3px)')
    await shell.evaluate(node => node.removeAttribute('data-shortcut-modal'))
    await expect(page.locator('#native-shell-overlay')).toHaveCSS('background-color', 'rgba(3, 5, 6, 0.62)')
    await page.locator('.native-shell').evaluate(node => node.setAttribute('data-shortcut-modal', 'settings'))
    await expectNativeBackdrop(page.locator('.native-shell'))
  })
}

for (const scheme of ['dark', 'light']) for (const width of [1440, 390]) {
  test('paper borders leave native page typography, spacing and controls untouched (' + scheme + ', ' + width + ')', async ({ page }) => {
    const shell = await openShell(page, scheme, width)
    await page.addStyleTag({ content: '.record_section { display:flex; flex-direction:column; gap:24px; } .record_row { display:flex; align-items:center; justify-content:space-between; gap:16px; } .record_rowText { min-width:0; } .record_selector { border-radius:12px; background:#333; color:white; padding:8px 12px; } .record_rows { list-style:none; padding:0; } .record_rowCard { border:1px solid #777; border-radius:12px; }' })
    await shell.locator('[data-slot="settings.section"]').evaluate(node => {
      node.innerHTML = '<section class="record_section"><h2>原生章节标题</h2><p class="record_intro">由宿主提供的原生说明，不注入额外档案抬头。</p><div data-slot="settings.general.item" style="display:contents"><div class="record_row"><div class="record_rowText"><div class="record_title">权限</div><div class="record_desc">原生字段说明</div></div><button class="record_selector" aria-haspopup="menu" aria-expanded="false">原生选择器</button></div><div class="record_row"><label>原生输入<input aria-label="档案输入" style="width:110px;font:14px sans-serif;background:white;color:black;border:1px solid gray;border-radius:8px;padding:4px"></label><button role="switch" aria-checked="false" aria-label="原生开关"><span></span></button></div></div><ul class="record_rows"><li class="record_rowCard"><div class="record_rowHead">原生提供商条目</div></li></ul><div data-slot="settings.plugins.tab"><button class="foreign-control" style="background:rgb(240,220,200);color:rgb(40,50,60);border-radius:12px;padding:9px">第三方控件</button></div></section>'
      node.querySelector('.record_selector').addEventListener('click', event => event.currentTarget.setAttribute('aria-expanded', 'true'))
      node.querySelector('[role="switch"]').addEventListener('click', event => event.currentTarget.setAttribute('aria-checked', 'true'))
    })
    await expect(shell.locator('[data-prts-settings-caption]')).toHaveCount(0)
    await expect(shell.locator('[data-slot="settings.section"] h2')).toHaveCount(1)
    const preservation = await shell.evaluate(node => {
      const section = node.querySelector('[data-slot="settings.section"]')
      const properties = ['fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'color', 'backgroundColor', 'border', 'borderRadius', 'boxShadow', 'padding', 'margin', 'gap', 'counterReset', 'counterIncrement']
      const inspect = () => [...section.querySelectorAll('*')].map(element => ({
        style: Object.fromEntries(properties.map(property => [property, getComputedStyle(element)[property]])),
        before: getComputedStyle(element, '::before').content,
      }))
      const themed = inspect()
      node.removeAttribute('data-prts-settings-shell')
      try { return { themed, native: inspect() } }
      finally { node.setAttribute('data-prts-settings-shell', '') }
    })
    expect(preservation.themed).toEqual(preservation.native)
    const frame = await shell.locator('[data-prts-settings-depth="0"]').evaluate(node => {
      const style = getComputedStyle(node, '::before')
      return { border: style.borderTopWidth, inset: style.top, pointerEvents: getComputedStyle(node).pointerEvents }
    })
    expect(frame).toEqual({ border: '0px', inset: '0px', pointerEvents: 'none' })
    const selector = shell.getByRole('button', { name: '原生选择器' })
    await expect(selector).toHaveCSS('border-radius', '12px')
    const row = shell.locator('[data-slot="settings.general.item"] > .record_row').first()
    await expect(row).toHaveCSS('padding-left', '0px')
    await expect(row).toHaveCSS('counter-increment', 'none')
    await selector.click()
    await expect(selector).toHaveAttribute('aria-expanded', 'true')
    const toggle = shell.getByRole('switch', { name: '原生开关' })
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-checked', 'true')
    const input = shell.getByRole('textbox', { name: '档案输入' })
    await input.fill('保留原生行为')
    await expect(input).toHaveValue('保留原生行为')
    await expect(input).toHaveCSS('border-radius', '8px')
    await expect(shell.locator('.record_rowCard')).toHaveCSS('border-radius', '12px')
    const plugin = shell.getByRole('button', { name: '第三方控件' })
    await expect(plugin).toHaveCSS('border-radius', '12px')
    await expect(plugin).toHaveCSS('background-color', 'rgb(240, 220, 200)')
    await expect(plugin).not.toHaveAttribute('data-prts-floating-input')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    await expectNativeBackdrop(shell)
  })
}


for (const width of [1440, 390]) {
  test('file jacket numbering follows native categories and its graphics stay inert (' + width + ')', async ({ page }) => {
    const shell = await openShell(page, 'dark', width)
    const frame = shell.locator('[data-prts-settings-jacket]')
    await expect(frame).toHaveCount(1)
    await expect(frame).toHaveAttribute('aria-hidden', 'true')
    await expect(frame).toHaveCSS('pointer-events', 'none')
    await expect(frame.locator('[id], button, input, svg')).toHaveCount(0)
    const emblem = frame.locator('[data-prts-settings-emblem] img')
    await expect(emblem).toHaveJSProperty('complete', true)
    await expect(emblem).toHaveJSProperty('naturalWidth', 95)
    await expect(emblem).toHaveJSProperty('naturalHeight', 81)
    await expect(emblem).toHaveAttribute('src', /^data:image\/png;base64,/)
    await expect(emblem).toHaveCSS('object-fit', 'contain')
    await expect(frame.locator('[data-prts-settings-pagination]')).toHaveText('01 / 06')
    await shell.getByRole('button', { name: '模型', exact: true }).click()
    await expect(frame.locator('[data-prts-settings-pagination]')).toHaveText('02 / 06')
    await expect(frame.locator('[data-prts-settings-markers] > :nth-child(2)')).toHaveAttribute('data-prts-settings-active', '')
    await shell.evaluate(node => node.querySelector('nav > div').prepend(document.createElement('button')))
    await expect(frame.locator('[data-prts-settings-pagination]')).toHaveText('03 / 07')
    await expect(frame.locator('[data-prts-settings-markers] > i')).toHaveCount(7)
    const clearance = await shell.evaluate(node => {
      const graphic = node.querySelector('[data-prts-settings-jacket]')
      const footer = graphic.querySelector('[data-prts-settings-footer]').getBoundingClientRect()
      const content = node.querySelector('[data-slot="settings.section"]').parentElement.getBoundingClientRect()
      const side = graphic.querySelector('[data-prts-settings-side]').getBoundingClientRect()
      const bounds = graphic.getBoundingClientRect()
      const sheet = node.querySelector('[data-prts-settings-depth="0"]').getBoundingClientRect()
      return { footer: footer.top - content.bottom, right: side.width, viewport: document.documentElement.scrollWidth, height: bounds.height, sheetHeight: sheet.height, clip: getComputedStyle(graphic).clipPath, before: getComputedStyle(graphic, '::before').content }
    })
    expect(clearance.footer).toBeGreaterThanOrEqual(7)
    expect(clearance.right).toBe(width < 768 ? 14 : 19)
    expect(clearance.viewport).toBe(width)
    expect(clearance.height).toBe(clearance.sheetHeight)
    expect(clearance.clip).toBe('none')
    expect(clearance.before).toBe('none')
  })

  test('same-page host refreshes keep the shell static (' + width + ')', async ({ page }) => {
    const shell = await openShell(page, 'dark', width, 'standard', 'full')
    await shell.getByRole('button', { name: '模型', exact: true }).click()
    await expect(shell).not.toHaveAttribute('data-prts-settings-turn')
    await shell.evaluate(node => {
      window.settingsRefreshAnimations = []
      node.addEventListener('animationstart', event => window.settingsRefreshAnimations.push(event.animationName))
      node.querySelector('.native-content input').value = 'unsaved input'
      const content = node.querySelector('.native-content')
      const filler = document.createElement('span')
      filler.style.cssText = 'display:block;height:1200px'
      content.querySelector('[data-slot="settings.section"]').append(filler)
      content.scrollTop = 300
      window.settingsRefreshScroll = content.scrollTop
    })
    for (let cycle = 0; cycle < 3; cycle++) {
      await shell.evaluate(node => {
        const navigation = node.querySelector('nav > div')
        navigation.replaceWith(navigation.cloneNode(true))
        const toolbar = node.querySelector('.native-tools')
        toolbar.replaceWith(toolbar.cloneNode(true))
        const section = node.querySelector('[data-slot="settings.section"]')
        section.append(document.createElement('span'))
      })
      await page.waitForTimeout(400)
      await expect(shell).not.toHaveAttribute('data-prts-settings-turn')
    }
    const state = await shell.evaluate(node => ({
      animations: window.settingsRefreshAnimations,
      value: node.querySelector('.native-content input').value,
      scroll: node.querySelector('.native-content').scrollTop,
      initialScroll: window.settingsRefreshScroll,
      frameCount: node.querySelectorAll('[data-prts-settings-jacket]').length,
    }))
    expect(state.animations).toEqual([])
    expect(state.value).toBe('unsaved input')
    expect(state.initialScroll).toBe(300)
    expect(state.scroll).toBe(state.initialScroll)
    expect(state.frameCount).toBe(1)
    await shell.evaluate(node => {
      const content = node.querySelector('.native-content')
      content.replaceWith(content.cloneNode(true))
    })
    await page.waitForTimeout(350)
    expect(await page.evaluate(() => window.settingsRefreshAnimations)).toEqual([])
  })
}


for (const scheme of ['dark', 'light']) for (const width of [1440, 390]) {
  test('colored index tabs share the jacket print language without moving their labels (' + scheme + ', ' + width + ')', async ({ page }) => {
    const shell = await openShell(page, scheme, width)
    const tabs = shell.locator('nav button')
    const appearance = await tabs.evaluateAll(nodes => nodes.map(node => {
      const style = getComputedStyle(node)
      const print = getComputedStyle(node, '::before')
      return {
        current: node.hasAttribute('aria-current'),
        color: style.backgroundColor,
        radius: style.borderTopLeftRadius,
        shadow: style.boxShadow,
        print: { content: print.content, events: print.pointerEvents, color: print.borderTopColor, line: print.borderTopStyle, width: parseFloat(print.width), height: parseFloat(print.height) },
      }
    }))
    expect(new Set(appearance.map(tab => tab.color)).size).toBe(6)
    for (const tab of appearance) {
      expect(tab.radius).toBe('1px')
      expect(tab.shadow).toContain('0px 0px')
      expect(tab.print.content).toBe('""')
      expect(tab.print.events).toBe('none')
      expect(tab.print.line).toBe('solid')
      expect(width < 768 ? tab.print.width > tab.print.height : tab.print.height > tab.print.width).toBe(true)
    }
    expect(appearance[0].print.color).not.toBe(appearance[1].print.color)
    const model = tabs.nth(1)
    const original = await model.boundingBox()
    await model.hover()
    expect(await model.boundingBox()).toEqual(original)
    await model.click()
    await expect(model).toHaveAttribute('aria-current', 'true')
    await expect(shell.locator('[data-prts-settings-depth="0"]')).toHaveAttribute('data-prts-settings-page', '2')
    expect(await model.evaluate(node => getComputedStyle(node, '::before').borderTopColor)).toBe(appearance[0].print.color)
    await expect(model).toHaveAccessibleName('模型')
  })
}
