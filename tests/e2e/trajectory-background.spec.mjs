import { expect, test } from '@playwright/test'
import sharp from 'sharp'

async function mountTrajectory(page, scheme, width) {
  await page.setViewportSize({ width, height: 900 })
  await page.addInitScript(scheme => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
    version: 12, enabled: true, scheme, motion: 'reduced', bootAnimation: false,
  })), scheme)
  await page.goto('/tests/fixtures/rc2-harness.html')
  await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
  await page.addStyleTag({ content: `
    :root { --dsw-alias-bg-layer-1:#f8f8f8;--dsw-alias-bg-layer-2:#f0f0f0; }
    .trajectoryRoot { display:flex;flex-direction:column;height:100vh;min-height:0;background:var(--dsw-alias-bg-layer-1); }
    .trajectoryToolbar { position:sticky;top:0;min-height:32px;flex:none;background:var(--dsw-alias-bg-layer-1); }
    .trajectoryPlot { height:50px;background:var(--dsw-alias-bg-layer-2); }
    .trajectoryLedger, .trajectorySplit { display:flex;flex:1;min-height:0; }
    .trajectorySplit, .trajectoryTable, .trajectoryDetails { background:var(--dsw-alias-bg-layer-1); }
    [data-trajectory-scroll] { flex:1;min-width:0;overflow:auto; }
    .trajectoryTable { width:100%;border-spacing:0; }
    .trajectoryTable td { height:30px; }
    .trajectoryTable tr[data-selected="true"] { background:var(--dsw-alias-interactive-bg-active); }
    .trajectoryDetails { width:180px;flex:none; }
    .trajectoryNotice { background:var(--dsw-alias-bg-layer-2); }
  ` })
  await page.evaluate(scheme => {
    document.documentElement.setAttribute('data-prts-scheme', scheme)
    const conversation = document.querySelector('[data-slot="main.conversation"]')
    conversation.innerHTML = `<div class="trajectoryRoot" data-conversation-composer-overlay>
      <div class="trajectoryToolbar"><button aria-pressed="false">时长</button><input aria-label="搜索轨迹" value="保留搜索"></div>
      <section aria-label="轨迹时间线"><div class="trajectoryPlot"><div data-timeline-domain><span data-timeline-span="tool">工具</span></div></div></section>
      <div class="trajectoryLedger"><div class="trajectorySplit">
        <div data-trajectory-scroll><table class="trajectoryTable"><tbody>
          <tr data-selected="true"><td>选中的记录</td></tr><tr><td>普通记录</td></tr>
          <tr data-virtual-spacer="bottom"><td style="height:1800px"></td></tr>
        </tbody></table></div>
        <aside class="trajectoryDetails">记录详情<div class="trajectoryNotice">状态提示</div></aside>
      </div></div>
    </div>`
    window.trajectoryRoot = conversation.firstElementChild
    window.trajectoryInput = conversation.querySelector('input')
  }, scheme)
}

async function setBackground(page, mode, asset = true) {
  await page.locator('html').evaluate((node, { mode, asset }) => {
    node.setAttribute('data-prts-background-mode', mode)
    for (const slot of ['full', 'conversation', 'sidebar']) {
      node.removeAttribute('data-prts-background-' + slot)
      node.style.setProperty('--prts-background-' + slot, 'linear-gradient(90deg, #f00, #00f)')
    }
    if (asset) node.setAttribute('data-prts-background-' + (mode === 'full' ? 'full' : mode === 'sidebar' ? 'sidebar' : 'conversation'), '')
    if (mode === 'sidebar') node.setAttribute('data-prts-background-mode', 'split')
  }, { mode, asset })
}

async function snapshot(page) {
  return page.locator('.trajectoryRoot').evaluate(node => {
    const plate = getComputedStyle(node, '::before')
    const color = selector => getComputedStyle(node.querySelector(selector)).backgroundColor
    return {
      plateContent: plate.content, plateFilter: plate.backdropFilter,
      platePointerEvents: plate.pointerEvents, plateIndex: plate.zIndex, plateColor: plate.backgroundColor,
      operationPlate: getComputedStyle(node.closest('[data-prts-region="operation"]'), '::before').content,
      root: getComputedStyle(node).backgroundColor,
      split: color('.trajectorySplit'), table: color('.trajectoryTable'),
      toolbar: color('.trajectoryToolbar'), plot: color('.trajectoryPlot'),
      selected: color('[data-selected="true"]'), details: color('.trajectoryDetails'), notice: color('.trajectoryNotice'),
      bodyLayer: getComputedStyle(document.body).getPropertyValue('--dsw-alias-bg-layer-1'),
      bodyBase: getComputedStyle(document.body).getPropertyValue('--dsw-alias-bg-base'),
      rootPreserved: window.trajectoryRoot === node, inputPreserved: window.trajectoryInput === node.querySelector('input'),
      filters: [node, node.querySelector('.trajectorySplit'), node.querySelector('[data-trajectory-scroll]')].map(element => getComputedStyle(element).backdropFilter),
    }
  })
}

for (const scheme of ['dark', 'light']) for (const width of [1440, 900, 390]) {
  test(`trajectory exposes active wallpaper without changing record materials (${scheme}, ${width})`, async ({ page }) => {
    await mountTrajectory(page, scheme, width)
    await setBackground(page, 'off', false)
    const baseline = await snapshot(page)
    expect(baseline.root).not.toBe('rgba(0, 0, 0, 0)')
    expect(baseline.plateContent).toBe('none')
    for (const mode of ['full', 'split']) {
      await setBackground(page, mode)
      const themed = await snapshot(page)
      expect(themed.root).toBe('rgba(0, 0, 0, 0)')
      expect(themed.split).toBe('rgba(0, 0, 0, 0)')
      expect(themed.table).toBe('rgba(0, 0, 0, 0)')
      expect(themed.toolbar).toContain('0.72')
      expect(themed.plot).toBe(themed.toolbar)
      for (const key of ['selected', 'details', 'notice', 'bodyLayer', 'bodyBase']) expect(themed[key]).toBe(baseline[key])
      expect(themed.rootPreserved).toBe(true)
      expect(themed.inputPreserved).toBe(true)
      expect(themed.filters).toEqual(['none', 'none', 'none'])
      expect(themed.plateContent).toBe('""')
      expect(themed.plateFilter).toBe('blur(8px)')
      expect(themed.platePointerEvents).toBe('none')
      expect(themed.plateIndex).toBe('-1')
      expect(themed.plateColor).toBe('rgba(0, 0, 0, 0)')
      expect(themed.operationPlate).toBe('none')
      await expect(page.getByRole('textbox', { name: '搜索轨迹' })).toHaveValue('保留搜索')
      await page.getByRole('button', { name: '时长', exact: true }).click()
      const scroller = page.locator('[data-trajectory-scroll]')
      await scroller.hover()
      await page.mouse.wheel(0, 360)
      await expect.poll(() => scroller.evaluate(node => node.scrollTop)).toBeGreaterThan(0)
      await scroller.evaluate(node => { node.scrollTop = 0 })
      await expect(page.getByRole('button', { name: '时长', exact: true })).toBeInViewport()
      await setBackground(page, mode, false)
      expect(await snapshot(page)).toEqual(baseline)
    }
    await setBackground(page, 'sidebar')
    expect(await snapshot(page)).toEqual(baseline)
    await setBackground(page, 'full')
    await page.locator('html').evaluate(node => node.removeAttribute('data-dsh-prts'))
    const disabled = await snapshot(page)
    expect(disabled.root).not.toBe('rgba(0, 0, 0, 0)')
    expect(disabled.plateContent).toBe('none')
    expect(disabled.split).toBe(disabled.root)
    expect(disabled.table).toBe(disabled.root)
  })
}

for (const mode of ['full', 'split']) {
  test(`trajectory background blur follows glass and accessibility preferences (${mode})`, async ({ page }) => {
    await mountTrajectory(page, 'dark', 1440)
    await setBackground(page, mode)
    for (const glass of ['soft', 'standard', 'clear', 'off']) {
      await page.locator('html').evaluate((node, glass) => node.setAttribute('data-prts-glass', glass), glass)
      const state = await snapshot(page)
      expect(state.plateFilter).toBe(glass === 'off' ? 'none' : 'blur(8px)')
      expect(state.plateColor).toBe('rgba(0, 0, 0, 0)')
      expect(state.filters).toEqual(['none', 'none', 'none'])
    }
    const session = await page.context().newCDPSession(page)
    await session.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }] })
    expect(await page.evaluate(() => matchMedia('(prefers-reduced-transparency: reduce)').matches)).toBe(true)
    for (const glass of ['soft', 'standard', 'clear', 'off']) {
      await page.locator('html').evaluate((node, glass) => node.setAttribute('data-prts-glass', glass), glass)
      const state = await snapshot(page)
      expect(state.plateFilter).toBe('none')
      expect(state.root).toBe('rgba(0, 0, 0, 0)')
      expect(state.plateColor).toBe('rgba(0, 0, 0, 0)')
    }
  })
}

test('trajectory blurs real wallpaper pixels while keeping foreground graphics and fixed controls sharp', async ({ page }) => {
  await mountTrajectory(page, 'dark', 1440)
  await setBackground(page, 'full')
  await page.evaluate(() => {
    document.querySelector('[data-prts-region="frame"]').style.background = 'repeating-linear-gradient(90deg, #ff0000 0px 4px, #0000ff 4px 8px)'
    const marker = document.createElement('div')
    marker.setAttribute('data-trajectory-foreground', '')
    marker.style.cssText = 'position:fixed;right:10px;bottom:10px;width:24px;height:10px;z-index:10;background:repeating-linear-gradient(90deg,#ff0000 0px 4px,#0000ff 4px 8px)'
    document.querySelector('.trajectoryRoot').append(marker)
  })
  const trajectory = page.locator('.trajectoryRoot')
  const bounds = await trajectory.boundingBox()
  const marker = await page.locator('[data-trajectory-foreground]').boundingBox()
  expect(marker.x + marker.width).toBe(1430)
  expect(marker.y + marker.height).toBe(890)
  const clip = { left: Math.ceil(bounds.x + 60), top: Math.ceil(bounds.y + 180), width: 24, height: 1 }
  const range = async (image, region) => {
    const pixels = await sharp(image).extract(region).removeAlpha().raw().toBuffer()
    const red = Array.from({ length: region.width }, (_, index) => pixels[index * 3])
    return Math.max(...red) - Math.min(...red)
  }
  const blurredImage = await page.screenshot()
  expect(await range(blurredImage, clip)).toBeLessThan(20)
  expect(await range(blurredImage, { left: marker.x, top: marker.y + 2, width: 24, height: 1 })).toBeGreaterThan(200)
  await page.locator('html').evaluate(node => node.setAttribute('data-prts-glass', 'off'))
  expect(await range(await page.screenshot(), clip)).toBeGreaterThan(200)
})
