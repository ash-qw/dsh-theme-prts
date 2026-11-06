import { expect, test } from '@playwright/test'
import sharp from 'sharp'

async function mountPage(page, { scheme = 'dark', width = 1440, current = true } = {}) {
  await page.setViewportSize({ width, height: 900 })
  await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' })
  await page.addInitScript(scheme => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
    version: 12, enabled: true, scheme, motion: 'reduced', bootAnimation: false,
  })), scheme)
  await page.goto('/tests/fixtures/rc2-harness.html')
  await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
  await page.addStyleTag({ content: `
    body { --dsw-alias-bg-module-platform:var(--dsw-alias-bg-layer-1);--dsw-alias-button-ghost-active-fill:var(--dsw-alias-bg-layer-2);--dsw-alias-settings-card-fill:var(--dsw-alias-bg-layer-2);--dsw-alias-settings-card-stroke:var(--dsw-alias-border-l4); }
    .pageMaterialRoot { height:100%;overflow:auto;background:var(--dsw-alias-bg-base); }
    .pageMaterialHeader { position:sticky;top:0;height:52px;background:var(--dsw-alias-bg-base); }
    .pageMaterialCard { padding:20px;background:var(--dsw-alias-settings-card-fill);border:1px solid var(--dsw-alias-settings-card-stroke); }
    .pageMaterialModule { background:var(--dsw-alias-bg-module-platform); }
    .pageMaterialChip { background:var(--dsw-alias-button-ghost-active-fill);border:1px solid var(--dsw-alias-button-ghost-active-border); }
    .pageMaterialCustom { --dsw-alias-bg-layer-2:rgb(60,80,100);background:var(--dsw-alias-bg-layer-2); }
    .pageMaterialFixed { position:fixed;right:10px;bottom:10px;width:50px;height:25px;z-index:20; }
    .pageMaterialPortal { position:fixed;right:10px;top:10px;z-index:1000;background:var(--dsw-alias-bg-layer-2); }
    [data-page-main] { height:100%;min-height:0; }
  ` })
  await page.evaluate(({ scheme, current }) => {
    document.documentElement.setAttribute('data-prts-scheme', scheme)
    const operation = document.querySelector('[data-prts-region="operation"]')
    const main = operation.querySelector('[data-slot="main"]')
    window.pageMaterialConversation = main.firstElementChild
    if (current) {
      const wrapper = document.createElement('div')
      wrapper.setAttribute('data-global-panel', '')
      wrapper.setAttribute('data-page-main', '')
      main.replaceWith(wrapper)
      wrapper.append(main)
    }
    main.setAttribute('data-page-main', '')
    main.innerHTML = '<section class="pageMaterialRoot" data-testid="task-manager-page"><header class="pageMaterialHeader"><button data-page-action>操作</button></header><article class="pageMaterialCard">插件市场 / 设置卡片</article><div class="pageMaterialModule">模块</div><span class="pageMaterialChip">分类</span><div class="pageMaterialCustom">第三方自定义材质</div><div class="pageMaterialDetail" style="background:var(--dsw-alias-bg-base)"><p class="pageMaterialNotice" style="background:var(--dsw-alias-bg-base)">自动化任务详情</p></div><div style="height:1800px"></div><button class="pageMaterialFixed">固定</button></section>'
    const portal = document.createElement('button')
    portal.className = 'pageMaterialPortal'
    portal.textContent = '外部弹层'
    document.body.append(portal)
  }, { scheme, current })
}

async function setBackground(page, mode, image = true) {
  await page.evaluate(({ mode, image }) => {
    const root = document.documentElement
    root.setAttribute('data-prts-background-mode', mode)
    root.removeAttribute('data-prts-background-full')
    root.removeAttribute('data-prts-background-conversation')
    root.style.setProperty('--prts-background-full', 'linear-gradient(90deg, #f00, #00f)')
    root.style.setProperty('--prts-background-conversation', 'linear-gradient(90deg, #f00, #00f)')
    if (image && mode !== 'off') root.setAttribute(mode === 'full' ? 'data-prts-background-full' : 'data-prts-background-conversation', '')
  }, { mode, image })
}

async function snapshot(page) {
  return page.evaluate(() => {
    const operation = document.querySelector('[data-prts-region="operation"]')
    const style = getComputedStyle(operation)
    const plate = getComputedStyle(operation, '::before')
    const color = selector => getComputedStyle(document.querySelector(selector)).backgroundColor
    const alpha = value => {
      const probe = document.createElement('canvas').getContext('2d')
      probe.fillStyle = value
      probe.fillRect(0, 0, 1, 1)
      return probe.getImageData(0, 0, 1, 1).data[3] / 255
    }
    return {
      operation: style.backgroundColor, canvas: style.getPropertyValue('--prts-canvas').trim(),
      cardAlpha: alpha(color('.pageMaterialCard')), card: color('.pageMaterialCard'), pageAlpha: alpha(color('.pageMaterialRoot')),
      headerAlpha: alpha(color('.pageMaterialHeader')), detailAlpha: alpha(color('.pageMaterialDetail')), noticeAlpha: alpha(color('.pageMaterialNotice')),
      moduleAlpha: alpha(color('.pageMaterialModule')), chipAlpha: alpha(color('.pageMaterialChip')),
      plateAlpha: alpha(plate.backgroundColor), plateContent: plate.content, plateFilter: plate.backdropFilter,
      platePointerEvents: plate.pointerEvents, ancestorFilter: style.backdropFilter, ancestorTransform: style.transform,
      bodyCard: getComputedStyle(document.body).getPropertyValue('--dsw-alias-settings-card-fill').trim(),
      bodyBase: getComputedStyle(document.body).getPropertyValue('--dsw-alias-bg-base').trim(),
      portal: color('.pageMaterialPortal'), custom: color('.pageMaterialCustom'),
    }
  })
}

for (const scheme of ['dark', 'light']) for (const width of [1440, 390]) for (const current of [true, false]) {
  test(`non-conversation page materials (${scheme}, ${width}, ${current ? 'global panel' : 'legacy main'})`, async ({ page }) => {
    await mountPage(page, { scheme, width, current })
    const baseline = await snapshot(page)
    for (const mode of ['off', 'split', 'full']) {
      await setBackground(page, mode)
      const state = await snapshot(page)
      expect(state.bodyBase).toBe(baseline.bodyBase)
      expect(state.bodyCard).toBe(baseline.bodyCard)
      expect(state.portal).toBe(baseline.portal)
      expect(state.custom).toBe('rgb(60, 80, 100)')
      expect(state.ancestorFilter).toBe('none')
      expect(state.ancestorTransform).toBe('none')
      expect(state.card).toBe(baseline.card)
      expect(state.moduleAlpha).toBe(baseline.moduleAlpha)
      expect(state.chipAlpha).toBe(baseline.chipAlpha)
      if (mode !== 'off') {
        expect(state.operation).toBe('rgba(0, 0, 0, 0)')
        for (const alpha of [state.pageAlpha, state.headerAlpha, state.detailAlpha, state.noticeAlpha, state.plateAlpha]) expect(alpha).toBe(0)
        expect(state.plateContent).toBe('""')
        expect(state.plateFilter).toBe('blur(8px)')
        expect(state.platePointerEvents).toBe('none')
      } else {
        expect(state.operation).not.toBe('rgba(0, 0, 0, 0)')
        expect(state.pageAlpha).toBe(1)
        expect(state.plateContent).toBe('none')
      }
    }
    await setBackground(page, 'full', false)
    expect((await snapshot(page)).cardAlpha).toBe(1)
    expect((await snapshot(page)).plateContent).toBe('none')
    await page.evaluate(() => document.documentElement.removeAttribute('data-dsh-prts'))
    expect((await snapshot(page)).plateContent).toBe('none')
  })
}

for (const current of [true, false]) test(`switching pages and both conversation slots clears page materials (${current})`, async ({ page }) => {
  await mountPage(page, { current })
  await setBackground(page, 'full')
  expect((await snapshot(page)).plateContent).toBe('""')
  for (const slot of ['main.conversation', 'conversation']) {
    await page.evaluate(slot => {
      const main = document.querySelector('[data-prts-region="operation"] [data-slot="main"]')
      window.pageMaterialPage = main.firstElementChild
      window.pageMaterialConversation.setAttribute('data-slot', slot)
      main.replaceChildren(window.pageMaterialConversation)
      main.parentElement.removeAttribute('data-global-panel')
    }, slot)
    await expect.poll(() => page.locator('[data-prts-region="operation"]').evaluate(element => getComputedStyle(element, '::before').content)).toBe('none')
    await expect(page.locator('[data-prts-region="operation"]')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await page.evaluate(current => {
      const main = document.querySelector('[data-prts-region="operation"] [data-slot="main"]')
      main.replaceChildren(window.pageMaterialPage)
      if (current) main.parentElement.setAttribute('data-global-panel', '')
    }, current)
    expect((await snapshot(page)).plateContent).toBe('""')
  }
  if (current) {
    await page.evaluate(() => document.querySelector('[data-slot="main"]').append(window.pageMaterialConversation))
    expect((await snapshot(page)).plateContent).toBe('""')
  }
})

test('disabling page blur never replaces transparent wallpaper with an opaque canvas', async ({ page }) => {
  await mountPage(page)
  for (const mode of ['split', 'full']) {
    await setBackground(page, mode)
    for (const glass of ['soft', 'standard', 'clear', 'off']) {
      await page.evaluate(glass => document.documentElement.setAttribute('data-prts-glass', glass), glass)
      const state = await snapshot(page)
      expect(state.plateFilter).toBe(glass === 'off' ? 'none' : 'blur(8px)')
      expect(state.plateAlpha).toBe(0)
      expect(state.pageAlpha).toBe(0)
      expect(state.detailAlpha).toBe(0)
      expect(state.noticeAlpha).toBe(0)
      expect(state.operation).toBe('rgba(0, 0, 0, 0)')
    }
  }
  const session = await page.context().newCDPSession(page)
  await session.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }] })
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-transparency: reduce)').matches)).toBe(true)
  for (const glass of ['soft', 'standard', 'clear', 'off']) {
    await page.evaluate(glass => document.documentElement.setAttribute('data-prts-glass', glass), glass)
    const reduced = await snapshot(page)
    expect(reduced.pageAlpha).toBe(0)
    expect(reduced.plateAlpha).toBe(0)
    expect(reduced.plateFilter).toBe('none')
  }
})

test('the single background plate preserves sticky actions, viewport fixed controls and portals', async ({ page }) => {
  await mountPage(page)
  await setBackground(page, 'full')
  const fixed = page.locator('.pageMaterialFixed')
  await expect(fixed).toHaveCSS('right', '10px')
  const bounds = await fixed.boundingBox()
  expect(bounds.x + bounds.width).toBe(1430)
  expect(bounds.y + bounds.height).toBe(890)
  await page.locator('.pageMaterialRoot').evaluate(element => { element.scrollTop = 700 })
  await expect(page.locator('[data-page-action]')).toBeInViewport()
  await page.locator('[data-page-action]').click()
  await fixed.click()
  await page.locator('.pageMaterialPortal').click()
  await page.locator('[data-page-action]').focus()
  await expect(page.locator('[data-page-action]')).toBeFocused()
  expect(await page.locator('[data-prts-region="operation"]').evaluate(element => {
    let ancestor = element
    while (ancestor && ancestor !== document.body) {
      const style = getComputedStyle(ancestor)
      if (style.backdropFilter !== 'none' || style.filter !== 'none') return false
      ancestor = ancestor.parentElement
    }
    return true
  })).toBe(true)
})

test('the page plate actually softens wallpaper without filtering page content', async ({ page }) => {
  await mountPage(page)
  await setBackground(page, 'full')
  await page.evaluate(() => {
    document.querySelector('[data-prts-region="frame"]').style.background = 'repeating-linear-gradient(90deg, #ff0000 0px 4px, #0000ff 4px 8px)'
    document.querySelector('[data-slot="main"]').style.visibility = 'hidden'
  })
  const operation = page.locator('[data-prts-region="operation"]')
  const bounds = await operation.boundingBox()
  const clip = { left: Math.ceil(bounds.x + 60), top: Math.ceil(bounds.y + 120), width: 24, height: 1 }
  const channelRange = async () => {
    const pixels = await sharp(await page.screenshot()).extract(clip).removeAlpha().raw().toBuffer()
    const red = Array.from({ length: 24 }, (_, index) => pixels[index * 3])
    return Math.max(...red) - Math.min(...red)
  }
  const blurred = await channelRange()
  await operation.evaluate(element => element.style.setProperty('--prts-page-filter', 'none'))
  const unblurred = await channelRange()
  expect(unblurred).toBeGreaterThan(80)
  expect(blurred).toBeLessThan(20)
})
