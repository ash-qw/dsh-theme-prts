import { expect, test } from '@playwright/test'

const fixturePath = '/tests/fixtures/rc7-harness.html'
const enabled = {
  version: 2,
  enabled: true,
  scheme: 'dark',
  texture: 'full',
  glass: 'standard',
  motion: 'reduced',
  density: 'tactical',
  panelOpen: true,
}

async function openRail(page) {
  const root = page.locator('html')
  const expectedMode = await page.evaluate(() => window.innerWidth >= 1180 ? 'docked' : 'overlay')
  await expect(root).toHaveAttribute('data-prts-rail-mode', expectedMode)
  if (expectedMode !== 'overlay') return
  if (await root.getAttribute('data-prts-rail-open') !== null) return
  await page.locator('[data-prts-rail-launcher]').click()
  await expect(root).toHaveAttribute('data-prts-rail-open', '')
  await expect(page.locator('[data-prts-nav-rail]')).toBeVisible()
  await page.waitForTimeout(200)
}

async function setPreferences(page, next = enabled) {
  await page.goto(fixturePath)
  await page.evaluate(value => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify(value)), next)
  await page.reload()
  if (next.enabled) {
    await page.waitForFunction(() => document.documentElement.hasAttribute('data-dsh-prts'))
    await page.waitForFunction(() => document.querySelector('[data-prts-ambient-layer]') && document.querySelector('[data-prts-particle-layer]'))
    const activeScheme = await page.locator('html').getAttribute('data-prts-scheme')
    if (next.scheme && activeScheme !== next.scheme) {
      await openRail(page)
      await page.locator('[data-prts-scheme-toggle]').click()
      await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', next.scheme)
    }
    await page.evaluate(async () => {
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    })
  }
}

async function openPrtsPluginSettings(page) {
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByRole('button', { name: 'Plugins', exact: true }).click()
  await page.getByRole('tab', { name: 'P.R.T.S.', exact: true }).click()
  const settings = page.locator('[data-prts-plugin-settings]')
  await expect(settings).toBeVisible()
  return settings
}

async function setNativeSidebarCollapsed(page, collapsed) {
  await page.locator('[data-prts-region="frame"]').evaluate((node, nextCollapsed) => {
    node.style.gridTemplateColumns = `${nextCollapsed ? 56 : 280}px minmax(0px, 1fr) 0px`
    if (nextCollapsed) node.setAttribute('data-sidebar-collapsed', 'true')
    else node.removeAttribute('data-sidebar-collapsed')
  }, collapsed)
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    offenders: [...document.querySelectorAll('body *')].flatMap(node => {
      const box = node.getBoundingClientRect()
      return box.right > window.innerWidth + 1 || box.left < -1
        ? [{ tag: node.tagName, hook: [...node.attributes].find(attribute => attribute.name.startsWith('data-prts'))?.name || '', left: Math.round(box.left), right: Math.round(box.right), width: Math.round(box.width) }]
        : []
    }).slice(0, 12),
  }))
  expect(metrics.scrollWidth <= metrics.innerWidth, JSON.stringify(metrics)).toBe(true)
}

async function expectReadableNativeComponents(page) {
  const problems = await page.locator([
    '[data-message-role]',
    '[data-composer-card]',
    'textarea',
    'button[aria-label="Send message"]',
    'button[aria-label="New session"]',
  ].join(',')).evaluateAll(nodes => nodes.flatMap(node => {
    const style = getComputedStyle(node)
    const box = node.getBoundingClientRect()
    const hidden = style.display === 'none'
      || style.visibility === 'hidden'
      || Number(style.opacity) === 0
      || Number.parseFloat(style.fontSize) === 0
      || box.width === 0
      || box.height === 0
    return hidden ? [node.outerHTML.slice(0, 120)] : []
  }))
  expect(problems).toEqual([])
}

async function contrastRatio(locator) {
  return locator.evaluate(node => {
    const channels = value => {
      const srgb = value.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/)
      if (srgb) return srgb.slice(1, 4).map(channel => Number(channel) * 255)
      return (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number)
    }
    const luminance = value => {
      const linear = channels(value).map(channel => {
        const normalized = channel / 255
        return normalized <= .04045 ? normalized / 12.92 : ((normalized + .055) / 1.055) ** 2.4
      })
      return .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2]
    }
    const foreground = getComputedStyle(node).color
    let surface = node
    let background = getComputedStyle(surface).backgroundColor
    while (surface.parentElement && /rgba?\([^)]*,\s*0\)/.test(background)) {
      surface = surface.parentElement
      background = getComputedStyle(surface).backgroundColor
    }
    const light = Math.max(luminance(foreground), luminance(background))
    const dark = Math.min(luminance(foreground), luminance(background))
    return (light + .05) / (dark + .05)
  })
}

async function populateGlassPreview(page) {
  await page.locator('[data-conversation-scroll]').evaluate(surface => {
    surface.querySelector('[data-glass-preview-flow]')?.remove()
    const legacy = surface.querySelector('[data-message-role="assistant"]')
    const flow = document.createElement('div')
    flow.dataset.glassPreviewFlow = ''
    flow.dataset.chatFlow = ''
    flow.innerHTML = `
      <div data-chat-flow-kind="user" data-chat-flow-key="user-preview">
        <div class="fixture_userRow" data-time-hover-root><div class="fixture_userStack">
          <div class="fixture_bubble">博士：将等高线情报整理为本次行动简报，并保留关键风险。</div>
        </div></div>
      </div>
      <div data-chat-flow-kind="assistant-step" data-glass-simple>
        <div class="fixture_root"><div class="fixture_body">收到，正在整理。</div></div>
      </div>
      <div data-chat-flow-kind="assistant-step" data-glass-complex data-chat-flow-key="assistant-preview">
        <div class="fixture_root"><div class="fixture_body"><div data-markdown>
          <h2>行动简报 / OPERATION BRIEF</h2>
          <p>地形资料已完成交叉核验。玻璃表面应透出连续等高线，同时保证正文稳定可读。</p>
          <blockquote>警告：北侧山脊存在高差，部署时保持通信链路。</blockquote>
          <table><tbody><tr><th>区域</th><th>状态</th></tr><tr><td>OP-06</td><td>READY</td></tr></tbody></table>
          <pre><code>const operation = { contour: 'continuous', status: 'ready' }</code></pre>
          <section data-testid="tool-call-card">工具调用</section>
          <section data-testid="subagent-card">子代理</section>
          <section data-testid="deliverable-card">交付物</section>
        </div></div></div>
      </div>
      <div data-chat-flow-kind="assistant-step" data-glass-fallback>
        <section class="future_runtime_content">未来运行时回复。</section>
      </div>
    `
    legacy.hidden = true
    legacy.before(flow)
  })
}

async function captureAssistantPresentation(page) {
  return page.evaluate(() => {
    const selectors = {
      simpleOuter: '[data-glass-simple]',
      simpleRoot: '[data-glass-simple] .fixture_root',
      simpleBody: '[data-glass-simple] .fixture_body',
      complexOuter: '[data-glass-complex]',
      complexRoot: '[data-glass-complex] .fixture_root',
      complexBody: '[data-glass-complex] .fixture_body',
      markdown: '[data-glass-complex] [data-markdown]',
      quote: '[data-glass-complex] blockquote',
      table: '[data-glass-complex] table',
      code: '[data-glass-complex] pre',
      tool: '[data-glass-complex] [data-testid="tool-call-card"]',
      subagent: '[data-glass-complex] [data-testid="subagent-card"]',
      deliverable: '[data-glass-complex] [data-testid="deliverable-card"]',
      fallbackOuter: '[data-glass-fallback]',
      fallbackBody: '[data-glass-fallback] .future_runtime_content',
    }
    const properties = [
      'display', 'position',
      'minWidth', 'maxWidth',
      'marginTop', 'marginBottom',
      'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
      'borderTopStyle', 'borderRightStyle', 'borderBottomStyle', 'borderLeftStyle',
      'borderRadius', 'backgroundColor', 'backgroundImage',
      'boxShadow', 'backdropFilter', 'overflow', 'overflowX', 'overflowY',
      'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing',
    ]
    return Object.fromEntries(Object.entries(selectors).map(([key, selector]) => {
      const node = document.querySelector(selector)
      if (!node) return [key, null]
      const style = getComputedStyle(node)
      return [key, Object.fromEntries(properties.map(property => [property, style[property]]))]
    }))
  })
}

test('stays visually absent until explicitly enabled', async ({ page }) => {
  await page.goto(fixturePath)
  await page.evaluate(() => localStorage.removeItem('dsh.ui.prts.v1'))
  await page.reload()
  await expect(page.locator('[data-prts-shell]')).toHaveCount(0)
  await expect(page.locator('[data-prts-details-grid]')).toHaveCount(0)
  await expect(page.locator('html')).not.toHaveAttribute('data-dsh-prts', '')
  await expect(page.getByRole('button', { name: 'New session' })).toHaveText('New Session')
})

test('plays the staged P.R.T.S. sequence only on manual enable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto(fixturePath)
  await page.evaluate(() => localStorage.removeItem('dsh.ui.prts.v1'))
  await page.reload()
  const pluginSettings = await openPrtsPluginSettings(page)
  await expect(pluginSettings.getByRole('switch', { name: '播放启动动画' })).toHaveAttribute('aria-checked', 'true')
  await pluginSettings.getByRole('switch', { name: '启用 P.R.T.S. 主题' }).click()

  const startup = page.locator('[data-prts-startup]')
  await expect(startup).toBeVisible()
  await expect(startup).toHaveAttribute('popover', 'manual')
  expect(await startup.evaluate(node => node.matches(':popover-open'))).toBe(true)
  await expect(page.locator('html')).toHaveAttribute('data-prts-startup-active', '')
  await expect(startup.locator('[data-prts-startup-emblem]')).toHaveJSProperty('naturalWidth', 180)
  await expect(startup.locator('[data-prts-startup-percent]')).toHaveText('100%', { timeout: 2_500 })
  await expect(startup.locator('[data-prts-startup-label]')).toHaveText('P.R.T.S. READY')
  await expect(startup).toHaveAttribute('data-exit-content', '')
  await expect(startup).toHaveAttribute('data-exiting', '')
  await expect(startup).toHaveCount(0, { timeout: 4_000 })
  await expect(page.locator('html')).not.toHaveAttribute('data-prts-startup-active', '')
  await expect(page.locator('[data-fixture-settings]')).toBeVisible()

  await page.reload()
  await expect(page.locator('[data-prts-shell]')).toHaveCount(1)
  await expect(page.locator('[data-prts-startup]')).toHaveCount(0)
})

test('takes over only an initial persisted-theme Harness boot surface', async ({ page }) => {
  await page.addInitScript(value => {
    localStorage.setItem('dsh.ui.prts.v1', JSON.stringify(value))
  }, { ...enabled, motion: 'full', bootAnimation: true })
  await page.route('**/tests/fixtures/rc7-harness.html', async route => {
    const response = await route.fetch()
    const body = (await response.text()).replace('<body>', '<body><div data-dsh-boot><span data-dsh-boot-spinner></span></div>')
    await route.fulfill({ response, body })
  })

  await page.goto(fixturePath)
  const startup = page.locator('[data-prts-startup]')
  await expect(page.locator('[data-dsh-boot]')).toHaveCount(1)
  await expect(startup).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
  await expect(page.locator('[data-prts-shell]')).toHaveCount(0)
  const startupStyle = await startup.evaluate(node => {
    const style = getComputedStyle(node)
    return { position: style.position, zIndex: style.zIndex, inset: style.inset }
  })
  expect(startupStyle).toEqual({ position: 'fixed', zIndex: '2147480000', inset: '0px' })
  await startup.evaluate(node => node.setAttribute('data-test-continuity', ''))

  await page.locator('[data-dsh-boot]').evaluate(node => node.remove())
  await expect(page.locator('[data-prts-shell]')).toHaveCount(1)
  await expect(startup).toHaveAttribute('data-test-continuity', '')
  await expect(startup.locator('[data-prts-startup-percent]')).toHaveText('100%')
  await expect(startup).toHaveCount(0, { timeout: 2_500 })
  await page.evaluate(() => {
    const lateBoot = document.createElement('div')
    lateBoot.setAttribute('data-dsh-boot', '')
    document.body.appendChild(lateBoot)
  })
  await page.waitForTimeout(200)
  await expect(page.locator('[data-prts-startup]')).toHaveCount(0)
})

test('keeps assistant output native while glass controls continue to theme user and composer surfaces', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await setPreferences(page, { ...enabled, enabled: false })
  await populateGlassPreview(page)
  const nativeAssistant = await captureAssistantPresentation(page)

  await setPreferences(page)
  await populateGlassPreview(page)
  expect(await captureAssistantPresentation(page)).toEqual(nativeAssistant)

  const root = page.locator('html')
  const messageOuter = page.locator('[data-glass-complex]')
  const simpleMessageOuter = page.locator('[data-glass-simple]')
  const userBubble = page.locator('[data-chat-flow-kind="user"] [class$="_bubble"]')
  const composer = page.locator('[data-composer-card]')
  await expect(root).toHaveAttribute('data-prts-glass', 'standard')
  await expect(userBubble).not.toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(userBubble).toHaveCSS('border-left-width', '4px')
  await expect(userBubble).toHaveCSS('border-radius', '3px')
  await expect(userBubble).toHaveCSS('padding', '10px 14px')
  await expect(messageOuter).toHaveCSS('max-width', '748px')
  await expect(simpleMessageOuter).toHaveCSS('max-width', '748px')
  await expect(page.locator('.fixture_userStack')).toHaveCSS('max-width', 'min(525px, 82%)')
  const nativeAxes = await page.evaluate(() => ({
    body: document.querySelector('[data-glass-complex]').getBoundingClientRect().width,
    composer: document.querySelector('[data-composer-seat]').getBoundingClientRect().width,
  }))
  expect(nativeAxes.body).toBeCloseTo(748, 0)
  expect(nativeAxes.composer).toBeCloseTo(780, 0)
  await expect.poll(() => composer.evaluate(node => ({
    outerFilter: getComputedStyle(node).backdropFilter,
    outerClip: getComputedStyle(node).clipPath,
    overflow: getComputedStyle(node).overflow,
    decorationFilter: getComputedStyle(node, '::after').backdropFilter,
    decorationClip: getComputedStyle(node, '::before').clipPath,
  }))).toEqual({
    outerFilter: 'none',
    outerClip: 'none',
    overflow: 'visible',
    decorationFilter: 'blur(22px) saturate(1.55)',
    decorationClip: expect.stringContaining('polygon'),
  })

  await page.getByRole('button', { name: 'P.R.T.S. 终端设置' }).click()
  const appearance = page.locator('[data-prts-theme-settings]')
  await expect(appearance).toBeVisible()
  await appearance.locator('[data-prts-settings-advanced] summary').click()
  const scaleDistance = appearance.locator('[data-prts-setting-range][data-prts-setting-key="conversationScaleMaxDistance"]')
  const scaleContrast = appearance.locator('[data-prts-setting-range][data-prts-setting-key="conversationScaleFocusContrast"]')
  await expect(scaleDistance).toHaveValue('96')
  await expect(scaleContrast).toHaveValue('70')
  const persistedScaleDistance = await page.evaluate(() => JSON.parse(localStorage.getItem('dsh.ui.prts.v1')).conversationScaleMaxDistance ?? null)
  const calibration = appearance.locator('[data-prts-scale-calibration]')
  await expect(calibration).toBeVisible()
  await expect(calibration.locator('[data-prts-scale-calibration-status]')).toContainText('当前视图')
  await expect(page.locator('[data-prts-conversation-scale]')).toBeHidden()
  await scaleDistance.evaluate(node => {
    node.value = '184'
    node.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await expect(appearance.locator('[data-prts-scale-distance-output]')).toHaveText('184 px')
  await expect(appearance.locator('[data-prts-scale-calibration-value]')).toHaveText('184 px')
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('dsh.ui.prts.v1')).conversationScaleMaxDistance ?? null)).toBe(persistedScaleDistance)
  await scaleDistance.evaluate(node => node.dispatchEvent(new Event('change', { bubbles: true })))
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('dsh.ui.prts.v1')).conversationScaleMaxDistance)).toBe(184)
  const persistedScaleContrast = await page.evaluate(() => JSON.parse(localStorage.getItem('dsh.ui.prts.v1')).conversationScaleFocusContrast)
  expect(persistedScaleContrast).toBe(70)
  await scaleContrast.evaluate(node => {
    node.value = '100'
    node.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await expect(appearance.locator('[data-prts-scale-focus-output]')).toHaveText('100')
  await expect.poll(() => appearance.locator('[data-prts-scale-focus-preview-tick]').evaluateAll(nodes => nodes.map(node => node.style.width))).toEqual([
    '29px',
    '15px',
    '10px',
    '6px',
    '3px',
  ])
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('dsh.ui.prts.v1')).conversationScaleFocusContrast)).toBe(70)
  await scaleContrast.evaluate(node => node.dispatchEvent(new Event('change', { bubbles: true })))
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('dsh.ui.prts.v1')).conversationScaleFocusContrast)).toBe(100)
  await appearance.locator('[data-prts-preset-card][data-prts-setting-value="quiet-reading"]').click()
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('dsh.ui.prts.v1')).conversationScaleFocusContrast)).toBe(100)

  const glassControls = appearance.locator('[data-prts-setting-row="glass"]')
  await glassControls.getByRole('button', { name: '柔和' }).click()
  await expect(root).toHaveAttribute('data-prts-glass', 'soft')
  await expect.poll(() => composer.evaluate(node => getComputedStyle(node, '::after').backdropFilter)).toBe('blur(18px) saturate(1.45)')
  expect(await captureAssistantPresentation(page)).toEqual(nativeAssistant)
  await glassControls.getByRole('button', { name: '清晰' }).click()
  await expect(root).toHaveAttribute('data-prts-glass', 'clear')
  await expect.poll(() => composer.evaluate(node => getComputedStyle(node, '::after').backdropFilter)).toBe('blur(28px) saturate(1.8)')
  expect(await captureAssistantPresentation(page)).toEqual(nativeAssistant)
  await glassControls.getByRole('button', { name: '关闭' }).click()
  await expect(root).toHaveAttribute('data-prts-glass', 'off')
  expect(await captureAssistantPresentation(page)).toEqual(nativeAssistant)
})

test('keeps theme settings readable from phone width through 4K desktop', async ({ page }) => {
  const viewports = [
    { width: 390, height: 844 },
    { width: 720, height: 900 },
    { width: 1024, height: 900 },
    { width: 1440, height: 1000 },
    { width: 2560, height: 1440 },
    { width: 3840, height: 2160 },
  ]
  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    await setPreferences(page)
    await openRail(page)
    await page.getByRole('button', { name: 'P.R.T.S. 终端设置' }).click()
    const settings = page.locator('[data-prts-theme-settings]')
    await expect(settings).toBeVisible()
    const metrics = await settings.evaluate(node => {
      const box = node.getBoundingClientRect()
      const sample = selector => {
        const target = node.querySelector(selector)
        return target ? Number.parseFloat(getComputedStyle(target).fontSize) : 0
      }
      return {
        left: box.left,
        right: box.right,
        width: box.width,
        viewportWidth: window.innerWidth,
        small: sample('[data-prts-theme-settings-header] small'),
        note: sample('[data-prts-setting-note]'),
        button: sample('button[data-prts-setting-key]'),
      }
    })
    expect(metrics.left).toBeGreaterThanOrEqual(-1)
    expect(metrics.right).toBeLessThanOrEqual(metrics.viewportWidth + 1)
    expect(metrics.small).toBeGreaterThanOrEqual(12)
    expect(metrics.note).toBeGreaterThanOrEqual(12)
    expect(metrics.button).toBeGreaterThanOrEqual(14)
    if (viewport.width === 390) expect(metrics.width).toBeCloseTo(390, 0)
    if (viewport.width >= 2560) expect(metrics.width).toBeGreaterThanOrEqual(1030)
    await expectNoHorizontalOverflow(page)
    await page.locator('[data-prts-theme-settings-close]').click()
  }
})

test('glassifies only identified composer controls and their inline menus', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await setPreferences(page)
  const composer = page.locator('[data-composer-card]')
  await composer.evaluate(node => {
    const controls = document.createElement('div')
    controls.dataset.fixtureComposerControls = ''
    controls.innerHTML = `
      <span><button type="button" class="Sh0Q9G_trigger">工作区写入</button><div role="menu"><button role="menuitem" class="fixture_selected_item">工作区写入</button></div></span>
      <div><button type="button" class="_7KE1Ra_trigger" aria-haspopup="menu" aria-expanded="true" aria-controls="fixture-model-menu">模型</button><div id="fixture-model-menu" role="menu" aria-busy="false"><button role="menuitemradio" aria-checked="true">MiniMax-M3</button></div></div>
      <button type="button" class="uV2eYG_add" aria-label="Commands" aria-haspopup="listbox" aria-expanded="true">+</button>
    `
    node.append(controls)

    const overflowPopup = document.createElement('div')
    overflowPopup.id = 'fixture-overflow-popup'
    overflowPopup.setAttribute('role', 'menu')
    overflowPopup.dataset.prtsGlassMenu = 'permission'
    overflowPopup.style.cssText = 'position:absolute;z-index:50;left:48px;top:-76px;width:190px;height:64px;padding:4px'
    overflowPopup.innerHTML = '<button role="menuitem" style="width:100%;height:100%">越界权限选项</button>'
    overflowPopup.querySelector('button').addEventListener('click', () => { overflowPopup.dataset.clicked = 'true' })
    node.append(overflowPopup)

    const overlay = document.createElement('div')
    overlay.dataset.slot = 'conversation.input.overlay'
    overlay.innerHTML = `
      <div class="mufS8W_card">
        <div role="listbox"><button role="option" aria-selected="true">命令参数</button></div>
      </div>
    `
    document.body.append(overlay)
  })

  const permission = composer.locator('[data-prts-glass-control="permission"]')
  const model = composer.locator('[data-prts-glass-control="model"]')
  const permissionMenu = composer.locator('[data-prts-glass-menu="permission"]')
  const modelMenu = composer.locator('[data-prts-glass-menu="model"]')
  await expect(permission).toHaveCSS('border-radius', '0px')
  const action = composer.locator('[data-prts-glass-control="action"]')
  const slashCard = page.locator('.mufS8W_card[data-prts-glass-menu="action"]')
  const slashList = page.locator('[role="listbox"][data-prts-glass-menu="action"]')
  await expect(permission).not.toHaveCSS('min-height', '36px')
  await expect(model).toHaveCSS('border-radius', '0px')
  await expect(permissionMenu).toHaveCSS('border-radius', '4px')
  await expect(modelMenu).toHaveCSS('border-radius', '4px')
  await expect(modelMenu).toHaveCSS('backdrop-filter', 'blur(22px) saturate(1.55)')
  await expect(modelMenu).not.toHaveCSS('background-color', 'rgb(53, 54, 56)')

  await expect(action).not.toHaveCSS('width', '36px')
  await expect(slashCard).toHaveCSS('border-radius', '4px')
  await expect(slashList).toHaveCSS('backdrop-filter', 'blur(22px) saturate(1.55)')
  await expect(slashList.getByRole('option', { name: '命令参数' })).toHaveCSS('border-radius', '0px')
  const send = page.getByRole('button', { name: 'Send message' })
  await expect(send).not.toHaveAttribute('data-prts-glass-control')
  await expect(send).toHaveCSS('background-color', 'rgb(240, 200, 0)')
  await expect(send).toHaveCSS('backdrop-filter', 'none')

  await page.locator('body').evaluate(node => {
    const outside = document.createElement('div')
    outside.id = 'fixture-outside-menu'
    outside.setAttribute('role', 'menu')
    node.append(outside)
  })
  await expect(page.locator('#fixture-outside-menu')).not.toHaveAttribute('data-prts-glass-menu')

  const overflowPopup = page.locator('#fixture-overflow-popup')
  await expect(overflowPopup).toBeVisible()
  const overflowGeometry = await overflowPopup.evaluate(node => {
    const popup = node.getBoundingClientRect()
    const composer = node.closest('[data-composer-card]').getBoundingClientRect()
    const hit = document.elementFromPoint(popup.left + popup.width / 2, popup.top + popup.height / 2)
    return {
      extendsAboveComposer: popup.top < composer.top,
      composerOverflow: getComputedStyle(node.closest('[data-composer-card]')).overflow,
      shadowVisible: getComputedStyle(node).boxShadow !== 'none',
      hitInsidePopup: node.contains(hit),
    }
  })
  expect(overflowGeometry).toEqual({
    extendsAboveComposer: true,
    composerOverflow: 'visible',
    shadowVisible: true,
    hitInsidePopup: true,
  })
  const popupBox = await overflowPopup.boundingBox()
  await page.mouse.click(popupBox.x + popupBox.width / 2, popupBox.y + popupBox.height / 2)
  await expect(overflowPopup).toHaveAttribute('data-clicked', 'true')
})

test('captures dark light and ultrawide clear glass approval surfaces', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await setPreferences(page, { ...enabled, glass: 'clear' })
  await populateGlassPreview(page)
  await expect(page.locator('[data-glass-complex] [data-prts-ai-surface]')).toHaveCSS('backdrop-filter', 'none')
  await expect(page).toHaveScreenshot('prts-glass-clear-dark-1440.png', { fullPage: true })

  await setPreferences(page, { ...enabled, scheme: 'light', glass: 'clear', particlePattern: 'orthogonal' })
  await populateGlassPreview(page)
  await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', 'light')
  await expect(page.locator('html')).toHaveAttribute('data-prts-particle-pattern', 'orthogonal')
  await expect(page).toHaveScreenshot('prts-glass-clear-light-1440.png', { fullPage: true })

  await page.setViewportSize({ width: 2560, height: 1200 })
  await setPreferences(page, { ...enabled, glass: 'clear' })
  await populateGlassPreview(page)
  await setNativeSidebarCollapsed(page, true)
  await expect(page.locator('[data-prts-region="operation"]')).toHaveScreenshot('prts-glass-clear-ultrawide-2560.png')
})

test("keeps the particle field mounted while long conversations cross viewport boundaries", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await setPreferences(page, { ...enabled, motion: 'system' })

  const surface = page.locator('[data-conversation-scroll]')
  const glow = page.locator('[data-prts-ambient-glow]')
  await surface.evaluate(node => {
    node.style.height = '720px'
    node.style.overflowY = 'auto'
    const log = document.createElement('section')
    log.dataset.fixtureLongParticles = ''
    Object.assign(log.style, { height: '2600px', position: 'relative' })
    const message = document.createElement('article')
    message.dataset.messageRole = 'assistant'
    message.textContent = '粒子迁移检查：消息文字必须保持清晰。'
    Object.assign(message.style, { position: 'absolute', top: '1500px', right: '8%', left: '8%' })
    log.append(message)
    node.insertBefore(log, node.querySelector('[data-composer-seat]'))
  })

  const before = await glow.evaluate(node => node.style.transform)
  await surface.evaluate(node => { node.scrollTop = 900 })
  await expect.poll(() => surface.evaluate(node => node.scrollTop)).toBe(900)
  await page.waitForTimeout(1100)
  await expect(page.locator('[data-prts-ambient-layer]')).toBeVisible()
  await expect(page.locator('[data-prts-particle-layer]')).toBeVisible()
  await expect.poll(() => glow.evaluate(node => node.style.transform)).not.toBe(before)
  await surface.evaluate(node => { node.scrollTop = 760 })
  await page.waitForTimeout(1100)
  await expect(page.getByText('粒子迁移检查：消息文字必须保持清晰。')).toBeVisible()
  await expect(page.locator('[data-message-role="assistant"]').last()).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expectReadableNativeComponents(page)
})

test("fills an ultrawide operation surface with ambient and particle layers", async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1200 })
  await setPreferences(page)

  await setNativeSidebarCollapsed(page, true)

  const operation = page.locator("[data-prts-region=\"operation\"]")
  const surface = page.locator("[data-conversation-scroll]")
  expect((await operation.boundingBox()).width).toBeGreaterThan(2000)
  await expect(page.locator('[data-prts-ambient-layer]')).toBeVisible()
  await expect(page.locator('[data-prts-particle-layer]')).toBeVisible()
  const ambientBox = await page.locator('[data-prts-ambient-layer]').boundingBox()
  const particleBox = await page.locator('[data-prts-particle-layer]').boundingBox()
  const operationBox = await operation.boundingBox()
  expect(ambientBox.width).toBeCloseTo(operationBox.width, 0)
  expect(particleBox.width).toBeCloseTo(operationBox.width, 0)
  await page.waitForTimeout(360)
  await expect(operation).toHaveScreenshot("prts-ultrawide-2560.png")
})

test('keeps daylight appearance controls distinct and readable', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await setPreferences(page, { ...enabled, scheme: 'light' })
  await page.getByRole('button', { name: 'P.R.T.S. 终端设置' }).click()
  const settings = page.locator('[data-prts-theme-settings]')
  await expect(settings.locator('[data-prts-settings-diagnostic]')).toHaveCount(0)
  await expect(settings.locator('[data-prts-option-sample="texture"]')).toHaveCount(3)
  await expect(settings.locator('[data-prts-option-sample="glass"]')).toHaveCount(4)
  const selected = settings.locator('[data-prts-setting-key].is-selected').first()
  const unselected = settings.locator('[data-prts-setting-key]:not(.is-selected)').first()
  expect(await contrastRatio(selected)).toBeGreaterThanOrEqual(4.5)
  expect(await contrastRatio(unselected)).toBeGreaterThanOrEqual(4.5)
  const materials = await page.evaluate(() => {
    const scope = document.querySelector('[data-prts-theme-settings]')
    const selectedNode = scope.querySelector('[data-prts-setting-key].is-selected')
    const unselectedNode = scope.querySelector('[data-prts-setting-key]:not(.is-selected)')
    const face = node => ({ background: getComputedStyle(node).backgroundColor, border: getComputedStyle(node).borderColor, color: getComputedStyle(node).color })
    return { selected: face(selectedNode), unselected: face(unselectedNode) }
  })
  expect(materials.selected).not.toEqual(materials.unselected)
  const visualOptions = settings.locator('[data-prts-settings-common] [data-prts-setting-key]')
  await expect(visualOptions).toHaveCount(11)
  const firstVisual = visualOptions.first()
  const visualContrast = await contrastRatio(firstVisual)
  const visualColors = await firstVisual.evaluate(node => ({
    color: getComputedStyle(node).color,
    background: getComputedStyle(node).backgroundColor,
    selected: node.classList.contains('is-selected'),
  }))
  expect(visualContrast, JSON.stringify(visualColors)).toBeGreaterThanOrEqual(4.5)
  const textureOff = settings.locator('[data-prts-setting-key="texture"][data-prts-setting-value="off"]')
  await textureOff.click()
  await expect(textureOff).toHaveAttribute('data-prts-setting-feedback', '')
  await expect(textureOff).not.toHaveAttribute('data-prts-setting-feedback', '')
  await expect(settings).toHaveScreenshot('prts-appearance-panel-light.png')
})

test('keeps the Rhodes Island rail brand inside its compact cell', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await setPreferences(page)
  const brand = page.locator('[data-prts-rail-brand]')
  await expect(brand).toContainText('P.R.T.S.')
  await expect(brand.locator('svg')).toBeVisible()
  expect(await brand.evaluate(node => node.scrollWidth <= node.clientWidth && node.scrollHeight <= node.clientHeight)).toBe(true)
})

test('keeps the native localized send action intact and inside the composer', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await setPreferences(page)
  const safety = await page.getByRole('button', { name: 'Send message' }).evaluate(node => {
    const button = node.getBoundingClientRect()
    const composer = node.closest('[data-composer-card]').getBoundingClientRect()
    return {
      contentFits: node.scrollWidth <= node.clientWidth,
      insideComposer: button.left >= composer.left && button.right <= composer.right,
    }
  })
  expect(safety).toEqual({ contentFits: true, insideComposer: true })
})

test('renders a readable light desktop console', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await setPreferences(page, { ...enabled, scheme: 'light' })
  await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', 'light')
  await expect(page.locator('[data-prts-region="operation"]')).not.toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expectReadableNativeComponents(page)
  expect(await contrastRatio(page.getByRole('button', { name: 'Settings' }))).toBeGreaterThanOrEqual(3)
  expect(await contrastRatio(page.getByRole('button', { name: 'New session' }))).toBeGreaterThanOrEqual(3)
  await expect(page).toHaveScreenshot('prts-light-1440.png', { fullPage: true })
})

test('preserves third-party settings button foreground and fill ownership in both schemes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })

  for (const scheme of ['light', 'dark']) {
    await setPreferences(page, { ...enabled, scheme })
    await page.addStyleTag({ content: [
      '.fixture-market-panel { padding: 12px; }',
      '.fixture-market-primary { color: #ffffff; background: #1769e0; }',
      '.fixture-market-danger { color: #ffffff; background: #b42318; }',
      '.fixture-market-tag { color: #082f49; background: #67e8f9; }',
    ].join('\n') })
    await page.locator('[data-slot="sidebar.settings"]').evaluate(container => {
      container.querySelector('[data-fixture-market-panel]')?.remove()
      container.insertAdjacentHTML('beforeend', [
        '<section class="fixture-market-panel" data-fixture-market-panel>',
        '<button class="fixture-market-primary">Install</button>',
        '<button class="fixture-market-primary">Update all</button>',
        '<button class="fixture-market-danger">Uninstall</button>',
        '<button class="fixture-market-tag">Active</button>',
        '</section>',
      ].join(''))
    })

    const expected = [
      ['Install', 'rgb(255, 255, 255)', 'rgb(23, 105, 224)'],
      ['Update all', 'rgb(255, 255, 255)', 'rgb(23, 105, 224)'],
      ['Uninstall', 'rgb(255, 255, 255)', 'rgb(180, 35, 24)'],
      ['Active', 'rgb(8, 47, 73)', 'rgb(103, 232, 249)'],
    ]
    for (const [name, color, background] of expected) {
      const button = page.getByRole('button', { name, exact: true })
      await expect(button).toHaveCSS('color', color)
      await expect(button).toHaveCSS('background-color', background)
      expect(await contrastRatio(button)).toBeGreaterThanOrEqual(4.5)
    }

    const nativeSettings = page.locator('[data-slot="sidebar.settings"] > button')
    await expect(nativeSettings).toHaveCSS('color', scheme === 'light' ? 'rgb(21, 25, 28)' : 'rgb(237, 241, 242)')
  }
})

test('preserves host dialog button foreground and background pairs in both schemes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })

  for (const scheme of ['light', 'dark']) {
    await setPreferences(page, { ...enabled, scheme })
    const colors = scheme === 'light'
      ? {
          primary: ['rgb(255, 255, 255)', 'rgb(17, 24, 39)'],
          secondary: ['rgb(17, 24, 39)', 'rgb(229, 231, 235)'],
          danger: ['rgb(255, 255, 255)', 'rgb(185, 28, 28)'],
        }
      : {
          primary: ['rgb(17, 24, 39)', 'rgb(248, 250, 252)'],
          secondary: ['rgb(249, 250, 251)', 'rgb(31, 41, 55)'],
          danger: ['rgb(255, 255, 255)', 'rgb(185, 28, 28)'],
        }
    await page.addStyleTag({ content: [
      `.fixture-host-dialog .fixture-host-primary { color: ${colors.primary[0]}; background: ${colors.primary[1]}; }`,
      `.fixture-host-dialog .fixture-host-secondary { color: ${colors.secondary[0]}; background: ${colors.secondary[1]}; }`,
      `.fixture-host-dialog .fixture-host-danger { color: ${colors.danger[0]}; background: ${colors.danger[1]}; }`,
    ].join('\n') })
    await page.evaluate(() => {
      const portal = document.createElement('div')
      portal.id = 'fixture-host-dialog-portal'
      portal.setAttribute('role', 'presentation')
      portal.innerHTML = [
        '<section class="fixture-host-dialog" role="dialog" aria-modal="true">',
        '<button class="fixture-host-primary">确认操作</button>',
        '<button class="fixture-host-secondary">取消操作</button>',
        '<button class="fixture-host-danger" data-danger="true">危险操作</button>',
        '</section>',
      ].join('')
      document.body.appendChild(portal)

      const preserved = document.createElement('section')
      preserved.id = 'fixture-preserved-dialog'
      preserved.className = 'fixture-host-dialog'
      preserved.dataset.prtsPreservePopupStyle = ''
      preserved.setAttribute('role', 'dialog')
      preserved.setAttribute('aria-modal', 'true')
      preserved.innerHTML = '<button class="fixture-host-primary">保留操作</button>'
      document.body.appendChild(preserved)
    })

    const dialog = page.locator('#fixture-host-dialog-portal [role="dialog"]')
    await expect(dialog).toHaveAttribute('data-prts-floating-glass', 'dialog')
    await expect(page.locator('#fixture-preserved-dialog')).not.toHaveAttribute('data-prts-floating-glass')

    const expected = [
      ['确认操作', ...colors.primary],
      ['取消操作', ...colors.secondary],
      ['危险操作', ...colors.danger],
      ['保留操作', ...colors.primary],
    ]
    for (const [name, color, background] of expected) {
      const button = page.getByRole('button', { name, exact: true })
      await expect(button).toHaveCSS('color', color)
      await expect(button).toHaveCSS('background-color', background)
      expect(await contrastRatio(button)).toBeGreaterThanOrEqual(4.5)
    }
  }
})

test('keeps the quick scheme control at the rail foot and glassifies real conversation utilities', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await setPreferences(page)

  const rail = page.locator('[data-prts-nav-rail]')
  const bottom = page.locator('[data-prts-nav-bottom]')
  const scheme = page.locator('[data-prts-scheme-toggle]')
  const geometry = await page.evaluate(() => {
    const box = selector => {
      const rect = document.querySelector(selector).getBoundingClientRect()
      return { top: rect.top, bottom: rect.bottom }
    }
    return {
      rail: box('[data-prts-nav-rail]'),
      bottom: box('[data-prts-nav-bottom]'),
    }
  })
  expect(geometry.rail.bottom - geometry.bottom.bottom).toBeLessThanOrEqual(14)
  const initialScheme = await page.locator('html').getAttribute('data-prts-scheme')
  await expect(scheme).toHaveAttribute('aria-label', initialScheme === 'dark' ? '切换到日间模式' : '切换到夜间模式')

  const sessionLog = page.getByRole('button', { name: 'Session log' })
  await expect(sessionLog).toHaveAttribute('data-prts-conversation-control', 'header')
  await expect(sessionLog).toHaveCSS('border-radius', '0px')
  await expect(sessionLog).toHaveCSS('min-height', '36px')
  await expect(sessionLog).toHaveCSS('backdrop-filter', 'none')
  await expect(sessionLog).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')

  await page.locator('[data-prts-region="operation"]').evaluate(node => {
    const row = document.createElement('div')
    row.dataset.producedFilesRow = ''
    const button = document.createElement('button')
    button.type = 'button'
    button.title = '/workspace/session_log'
    button.setAttribute('aria-label', '打开生成文件 session_log')
    button.textContent = 'session_log'
    button.addEventListener('click', () => { button.dataset.opened = 'true' })
    row.appendChild(button)
    node.appendChild(row)
  })
  const file = page.locator('[data-produced-files-row] > button[type="button"]')
  await expect(file).toHaveText('session_log')
  await expect(file).toHaveAttribute('data-prts-conversation-control', 'utility')
  await expect(file).toHaveCSS('border-radius', '0px')
  await expect(file).toHaveCSS('min-height', '36px')
  await expect(file).toHaveCSS('backdrop-filter', 'none')
  const controlContours = await page.evaluate(() => {
    const contour = node => ({
      border: getComputedStyle(node).borderStyle,
      outer: getComputedStyle(node).clipPath,
      inner: getComputedStyle(node, '::before').clipPath,
    })
    return {
      sessionLog: contour(document.querySelector('[data-prts-conversation-control="header"]')),
      file: contour(document.querySelector('[data-produced-files-row] > button[type="button"]')),
    }
  })
  for (const contour of Object.values(controlContours)) {
    expect(contour.border).toBe('none')
    expect(contour.outer).toContain('polygon')
    expect(contour.inner).toContain('polygon')
  }
  await file.click()
  await expect(file).toHaveAttribute('data-opened', 'true')

  await scheme.click()
  await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', initialScheme === 'dark' ? 'light' : 'dark')
  expect(await contrastRatio(file)).toBeGreaterThanOrEqual(3)
})

test('places only the two basic controls under Settings → Plugins', async ({ page }) => {
  await setPreferences(page)
  const pluginSettings = await openPrtsPluginSettings(page)
  await expect(pluginSettings.getByRole('switch')).toHaveCount(2)
  await expect(pluginSettings.getByRole('switch', { name: '启用 P.R.T.S. 主题' })).toHaveAttribute('aria-checked', 'true')
  await expect(pluginSettings.getByRole('switch', { name: '播放启动动画' })).toHaveAttribute('aria-checked', 'true')
  await expect(pluginSettings).toContainText('完整外观设置位于主界面左上角的罗德岛徽记。')
  await expect(pluginSettings.locator('[data-prts-settings-group]')).toHaveCount(0)
  await expect(pluginSettings).not.toContainText('插件版本')
  await expect(page.getByRole('button', { name: 'P.R.T.S. 终端', exact: true })).toHaveCount(0)

  await page.getByRole('button', { name: 'General' }).click()
  await expect(page.locator('[data-prts-plugin-settings]')).toHaveCount(0)
  await expect(page.locator('[data-fixture-general]')).toBeVisible()
})

test('stacks P.R.T.S. plugin settings vertically in a narrow host panel', async ({ page }) => {
  await setPreferences(page)
  const pluginSettings = await openPrtsPluginSettings(page)
  const rows = pluginSettings.locator('.prts-plugin-settings__row')
  await expect(rows.first()).toHaveCSS('flex-direction', 'row')

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(rows).toHaveCount(2)
  await expect(rows.first()).toHaveCSS('flex-direction', 'column')
  await expect(rows.first()).toHaveCSS('align-items', 'stretch')

  const geometry = await rows.evaluateAll(nodes => nodes.map(row => {
    const copy = row.querySelector('.prts-plugin-settings__copy').getBoundingClientRect()
    const control = row.querySelector('button[role="switch"]').getBoundingClientRect()
    const box = row.getBoundingClientRect()
    return {
      copyBottom: copy.bottom,
      copyWidth: copy.width,
      controlTop: control.top,
      controlRightInset: box.right - control.right,
    }
  }))
  for (const row of geometry) {
    expect(row.controlTop).toBeGreaterThanOrEqual(row.copyBottom)
    expect(row.copyWidth).toBeGreaterThan(40)
    expect(Math.abs(row.controlRightInset - 14)).toBeLessThanOrEqual(1)
  }
})


test('keeps navigation accessible without overflow on tablet', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 })
  await setPreferences(page)
  await expect(page.locator('[data-prts-topbar]')).toHaveCount(0)
  await expect(page.locator('[data-prts-nav-rail]')).toBeHidden()
  await expect(page.locator('[data-prts-rail-launcher]')).toBeVisible()
  await expect(page.locator('[data-prts-sessions-toggle]')).toHaveCount(0)
  await setNativeSidebarCollapsed(page, true)
  await expect.poll(async () => (await page.locator('[data-prts-region="sessions"]').boundingBox()).width).toBeLessThan(100)

  await openRail(page)
  await expect(page.locator('[data-prts-rail-brand]')).toBeVisible()
  await expectNoHorizontalOverflow(page)
  await expect(page).toHaveScreenshot('prts-tablet-1024.png', { fullPage: true })
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-prts-rail-launcher]')).toBeFocused()
})

test('keeps the composer reachable on phone and at 200 percent zoom', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await setPreferences(page)
  await setNativeSidebarCollapsed(page, true)
  await expect(page.locator('html')).not.toHaveAttribute('data-prts-drawer-open')
  await expect(page.locator('[data-composer-card]')).toBeVisible()
  await expect(page.locator('[data-prts-topbar]')).toHaveCount(0)
  await expect(page.locator('[data-prts-rail-brand]')).toBeHidden()
  await expect(page.locator('[data-prts-rail-launcher]')).toBeVisible()
  await expectNoHorizontalOverflow(page)
  const phoneLayout = await page.evaluate(() => {
    const width = selector => document.querySelector(selector).getBoundingClientRect().width
    return {
      operation: width('[data-prts-region="operation"]'),
      message: width('[data-message-role="assistant"]'),
      composer: width('[data-composer-card]'),
    }
  })
  expect(phoneLayout.operation, JSON.stringify(phoneLayout)).toBeGreaterThanOrEqual(240)
  expect(phoneLayout.message, JSON.stringify(phoneLayout)).toBeGreaterThanOrEqual(200)
  expect(phoneLayout.composer, JSON.stringify(phoneLayout)).toBeGreaterThanOrEqual(200)

  await setNativeSidebarCollapsed(page, true)
  await expect.poll(async () => (await page.locator('[data-prts-region="operation"]').boundingBox()).width).toBeGreaterThanOrEqual(240)


  await openRail(page)
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-prts-rail-launcher]')).toBeFocused()
  await expect(page.locator('html')).not.toHaveAttribute('data-prts-drawer-open')
  await expect(page.locator('[data-composer-card]')).toBeVisible()
  await expect(page).toHaveScreenshot('prts-phone-390.png', { fullPage: true })

  // A 640px physical viewport at 200% browser zoom exposes a 320px CSS viewport.
  await page.setViewportSize({ width: 320, height: 700 })
  await page.reload()
  await setNativeSidebarCollapsed(page, true)
  await expect.poll(async () => (await page.locator('[data-prts-region="operation"]').boundingBox()).width).toBeGreaterThanOrEqual(190)
  await expect(page.locator('[data-composer-card]')).toBeVisible()
  await expectNoHorizontalOverflow(page)
  const zoomLayout = await page.evaluate(() => {
    const width = selector => document.querySelector(selector).getBoundingClientRect().width
    return {
      operation: width('[data-prts-region="operation"]'),
      composer: width('[data-composer-card]'),
    }
  })
  expect(zoomLayout.operation, JSON.stringify(zoomLayout)).toBeGreaterThanOrEqual(190)
  expect(zoomLayout.composer, JSON.stringify(zoomLayout)).toBeGreaterThanOrEqual(180)
})

test('fully cleans up when disabled and safe mode blocks all visuals', async ({ page }) => {
  await setPreferences(page)
  await page.getByRole('button', { name: '关闭 P.R.T.S. 主题' }).click()
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('dsh.ui.prts.v1')).enabled)).toBe(false)
  await expect(page.locator('[data-prts-shell]')).toHaveCount(0)
  await page.reload()
  await expect(page.locator('[data-prts-shell]')).toHaveCount(0)
  await expect(page.locator('[data-prts-region]')).toHaveCount(0)
  await expect(page.locator('[data-plugin-css="dsh-theme-prts/prts.css"]')).toHaveCount(1)
  await expect(page.locator('html')).toHaveAttribute('data-dsh-prts-settings', '')
  await expect(page.locator('html')).not.toHaveAttribute('data-dsh-prts', '')
  const inactive = await openPrtsPluginSettings(page)
  await expect(inactive).toHaveAttribute('data-prts-settings-enabled', 'false')
  await expect(inactive.getByRole('switch', { name: '启用 P.R.T.S. 主题' })).toHaveAttribute('aria-checked', 'false')
  await expect(inactive.getByRole('switch', { name: '播放启动动画' })).toBeEnabled()
  await expect(inactive).not.toContainText('插件版本')

  await page.evaluate(value => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify(value)), enabled)
  await page.goto(`${fixturePath}?prts-safe=1`)
  await expect(page.locator('[data-prts-shell]')).toHaveCount(0)
  await expect(page.locator('[data-prts-region]')).toHaveCount(0)
  await expect(page.locator('html')).not.toHaveAttribute('data-dsh-prts', '')
  await expect(page.locator('[data-plugin-css="dsh-theme-prts/prts.css"]')).toHaveCount(1)
  await expect(page.locator('html')).toHaveAttribute('data-dsh-prts-settings', '')
  const safeSettings = await openPrtsPluginSettings(page)
  await expect(safeSettings).toContainText('安全模式已暂停主题。移除地址中的 ?prts-safe=1 后即可恢复。')
  await expect(safeSettings.getByRole('switch', { name: '启用 P.R.T.S. 主题' })).toBeDisabled()
  await expect(safeSettings.getByRole('switch', { name: '播放启动动画' })).toBeEnabled()
})

test('resets every fresh hero to a centered Rhodes particle mark above the operation record', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await setPreferences(page, { ...enabled, motion: 'reduced' })
  const surface = page.locator('[data-conversation-scroll]')

  await surface.evaluate(node => {
    const seat = node.querySelector('[data-composer-seat]')
    const spacer = document.createElement('div')
    spacer.style.height = '1800px'
    node.style.height = '760px'
    node.style.overflowY = 'auto'
    node.insertBefore(spacer, seat)
    node.scrollTop = 920
  })

  await surface.evaluate(node => {
    const seat = node.querySelector('[data-composer-seat]')
    const hero = document.createElement('section')
    hero.dataset.phase = 'hero'
    hero.innerHTML = '<span data-slot="conversation.hero.brand.mark"><svg viewBox="0 0 34 25" aria-label="DeepSeek"></svg></span><h1>探索未至之境</h1>'
    node.replaceChildren(hero, seat)
    node.scrollTop = 0
  })

  await expect(surface).toHaveAttribute('data-prts-hero-active', '')
  await expect(page.locator('[data-slot="conversation.hero.brand.mark"]')).toBeVisible()
  const geometry = await page.evaluate(() => {
    const canvas = document.querySelector('[data-prts-particle-layer]')
    const operation = document.querySelector('[data-prts-region="operation"]').getBoundingClientRect()
    const hero = document.querySelector('[data-phase="hero"]').getBoundingClientRect()
    const composer = document.querySelector('[data-composer-seat]').getBoundingClientRect()
    const context = canvas.getContext('2d')
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
    let minX = canvas.width
    let maxX = 0
    let minY = canvas.height
    let maxY = 0
    for (let y = 0; y < canvas.height; y += 2) {
      for (let x = 0; x < canvas.width; x += 2) {
        if (pixels[(y * canvas.width + x) * 4 + 3] < 12) continue
        minX = Math.min(minX, x); maxX = Math.max(maxX, x)
        minY = Math.min(minY, y); maxY = Math.max(maxY, y)
      }
    }
    const dpr = canvas.width / operation.width
    return {
      centerX: (minX + maxX) / 2 / dpr,
      particleBottom: maxY / dpr + operation.top,
      heroTop: hero.top,
      composerTop: composer.top,
      operationWidth: operation.width,
      reserve: Number.parseFloat(getComputedStyle(document.querySelector('[data-conversation-scroll]'), '::before').marginTop),
    }
  })
  expect(Math.abs(geometry.centerX - geometry.operationWidth / 2)).toBeLessThan(30)
  expect(geometry.particleBottom).toBeLessThanOrEqual(geometry.composerTop - 40)
  expect(geometry.reserve).toBeGreaterThanOrEqual(278)
  expect(geometry.reserve - 44).toBeGreaterThanOrEqual(299)
  expect(geometry.reserve - 44).toBeLessThanOrEqual(521)

  await surface.evaluate(node => {
    const seat = node.querySelector('[data-composer-seat]')
    const reply = document.createElement('article')
    reply.dataset.messageRole = 'assistant'
    reply.textContent = '第一条回复'
    node.replaceChildren(reply, seat)
  })
  await expect(surface).not.toHaveAttribute('data-prts-hero-active')
})

test('separates the native DeepSeek brand banner from animated session index rows', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await setPreferences(page, { ...enabled, motion: 'system' })
  await page.getByRole('button', { name: 'New session' }).evaluate(button => {
    button.innerHTML = '<span data-slot="sidebar.brand.mark"><svg viewBox="0 0 24 24"><path d="M2 2h20v20H2z" fill="currentColor"></path></svg></span><span data-slot="sidebar.brand.name"><svg viewBox="26 0 156 24"><path data-prts-test-wordmark d="M26 5h96v14H26z" fill="currentColor"></path><rect data-prts-test-badge x="129" y="5" width="52" height="14" fill="currentColor"></rect><path data-prts-test-badge-copy d="M134 9h42v6H134z" fill="var(--dsw-alias-label-primary-inverted)"></path></svg></span>'
    const tree = document.querySelector('[role="tree"]')
    for (let index = 2; index <= 6; index += 1) {
      const row = document.createElement('button')
      row.type = 'button'
      row.setAttribute('role', 'treeitem')
      row.textContent = `会话 ${index}`
      tree.appendChild(row)
    }
    const action = document.createElement('button')
    action.type = 'button'
    action.dataset.slot = 'session.action'
    action.setAttribute('aria-label', 'Session actions')
    action.textContent = '...'
    tree.appendChild(action)
  })

  const brand = page.getByRole('button', { name: 'New session' })
  await expect(brand).toHaveCSS('border-radius', '0px')
  const inspectBrandContrast = () => brand.evaluate(button => {
    const read = selector => getComputedStyle(button.querySelector(selector)).fill
    return {
      background: getComputedStyle(button).backgroundColor,
      wordmark: read('[data-prts-test-wordmark]'),
      badge: read('[data-prts-test-badge]'),
      badgeCopy: read('[data-prts-test-badge-copy]'),
    }
  })
  await page.locator('html').evaluate(node => { node.dataset.prtsScheme = 'dark' })
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const darkBrand = await inspectBrandContrast()
  expect(darkBrand.wordmark).not.toBe(darkBrand.background)
  expect(darkBrand.badgeCopy).not.toBe(darkBrand.badge)
  await page.locator('html').evaluate(node => { node.dataset.prtsScheme = 'light' })
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const lightBrand = await inspectBrandContrast()
  expect(lightBrand).not.toEqual(darkBrand)
  expect(lightBrand.wordmark).not.toBe(lightBrand.background)
  expect(lightBrand.badgeCopy).not.toBe(lightBrand.badge)
  await page.locator('html').evaluate(node => { node.dataset.prtsScheme = 'dark' })
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const brandBefore = await brand.boundingBox()
  await brand.hover()
  await page.waitForTimeout(120)
  const brandAfter = await brand.boundingBox()
  expect(Math.abs(brandAfter.x - brandBefore.x)).toBeLessThan(1)

  const rows = page.locator('[role="treeitem"]')
  const row = rows.nth(1)
  await expect(page.locator('[data-prts-session-projection]')).toHaveCount(0)
  expect(['none', '""']).toContain(await row.evaluate(node => getComputedStyle(node, '::before').content))
  const rowRadius = await row.evaluate(node => getComputedStyle(node).borderRadius)
  expect(rowRadius).toBe('0px')

  const rowBefore = await row.boundingBox()
  const rowTitle = row.locator('[data-prts-row-title]')
  const titleBefore = await rowTitle.boundingBox()
  await row.hover({ position: { x: 36, y: 22 } })
  await expect.poll(async () => (await row.boundingBox()).x, { timeout: 1_000 }).toBe(rowBefore.x)
  await expect.poll(async () => Math.round((await rowTitle.boundingBox()).x - titleBefore.x), { timeout: 1_000 }).toBe(6)
  await page.getByRole('button', { name: 'Session actions' }).hover()
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator('[data-prts-session-projection]')).toHaveCount(0)
})
test('@live installed rc.2 plugin mounts, preserves native text, and honors safe mode', async ({ page, request }) => {
  const liveUrl = process.env.PRTS_LIVE_URL
  test.skip(!liveUrl, 'PRTS_LIVE_URL is not configured')
  const response = await request.get(liveUrl)
  expect(response.ok()).toBe(true)
  expect(await response.text()).toContain('dsh-theme-prts')

  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(value => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify(value)), enabled)
  await page.goto(liveUrl)
  await expect(page.locator('[data-prts-shell]')).toHaveCount(1)
  await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', /^(dark|light)$/)
  await expect(page.getByRole('button', { name: /new session/i }).first()).toBeVisible()
  await expect(page.locator('[data-prts-dossier-overlay]')).toHaveCount(0)
  await expect(page.locator('[data-prts-region="sessions"]')).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expect(page.locator('[data-prts-sessions-toggle]')).toHaveCount(0)
  const liveWorkspaceRow = page.locator('[data-prts-workspace-row]').first()
  const liveSessionRow = page.locator('[data-prts-session-row]:has([data-prts-session-menu])').first()
  const liveCreate = page.locator('[data-prts-workspace-create]').first()
  const liveWorkspaceMenu = page.locator('[data-prts-workspace-menu]').first()
  const liveSessionMenu = page.locator('[data-prts-session-menu]').first()
  if (await liveWorkspaceRow.count() && await liveSessionRow.count()) {
  await expect(liveWorkspaceRow).toBeVisible()
  await expect(liveSessionRow).toBeVisible()
  await expect(liveCreate).toBeHidden()
  await expect(liveWorkspaceMenu).toBeHidden()
  await expect(liveSessionMenu).toBeHidden()

  const liveWorkspaceBefore = await liveWorkspaceRow.boundingBox()
  await liveWorkspaceRow.hover({ position: { x: 120, y: 24 } })
  await expect(liveCreate).toBeVisible()
  await expect(liveWorkspaceMenu).toBeVisible()
  await expect(liveSessionMenu).toBeHidden()
  await page.waitForTimeout(650)
  const liveWorkspaceGeometry = await page.locator([
    '[data-prts-workspace-create]',
    '[data-prts-workspace-menu]',
  ].join(',')).evaluateAll(tabs => tabs.map(tab => {
    const rowBox = tab.closest('[data-prts-workspace-row]').getBoundingClientRect()
    const tabBox = tab.getBoundingClientRect()
    const style = getComputedStyle(tab)
    const outline = tab.querySelector(':scope > [data-prts-facility-svg] [data-prts-facility-layer="outline"]')
    return {
      rowX: rowBox.x,
      rowHeight: rowBox.height,
      tabHeight: tabBox.height,
      backgroundImage: style.backgroundImage,
      clipPath: style.clipPath,
      vectorReady: tab.hasAttribute('data-prts-facility-vector'),
      outlinePath: outline?.getAttribute('d'),
      outlineWidth: outline?.getAttribute('stroke-width'),
      rowOverflow: getComputedStyle(tab.closest('[data-prts-workspace-row]')).overflow,
    }
  }))
  expect(liveWorkspaceGeometry.length).toBeGreaterThanOrEqual(2)
  for (const geometry of liveWorkspaceGeometry) {
    expect(geometry.rowX).toBe(liveWorkspaceBefore.x)
    expect(Math.abs(geometry.tabHeight - geometry.rowHeight)).toBeLessThan(1.1)
    expect(geometry.backgroundImage).toBe('none')
    expect(geometry.clipPath).toBe('none')
    expect(geometry.vectorReady).toBe(true)
    expect(geometry.outlinePath).toMatch(/^M .* Z$/)
    expect(geometry.outlineWidth).toBe('1')
    expect(geometry.rowOverflow).toBe('visible')
  }

  const liveSessionBefore = await liveSessionRow.boundingBox()
  await liveSessionRow.hover({ position: { x: 112, y: 22 } })
  await expect(liveCreate).toBeHidden()
  await expect(liveWorkspaceMenu).toBeHidden()
  await expect(liveSessionMenu).toBeVisible()
  await page.waitForTimeout(340)
  const liveSessionGeometry = await liveSessionMenu.evaluate(tab => {
    const row = tab.closest('[data-prts-session-row]').getBoundingClientRect()
    const box = tab.getBoundingClientRect()
    const style = getComputedStyle(tab)
    const surface = tab.querySelector(':scope > [data-prts-facility-svg] [data-prts-facility-layer="surface"]')
    const outline = tab.querySelector(':scope > [data-prts-facility-svg] [data-prts-facility-layer="outline"]')
    return {
      rowX: row.x,
      height: box.height,
      rowHeight: row.height,
      depthRatio: (Math.min(box.bottom, row.bottom) - row.top) / row.height,
      backgroundColor: style.backgroundColor,
      surfaceFill: getComputedStyle(surface).fill,
      clipPath: style.clipPath,
      vectorReady: tab.hasAttribute('data-prts-facility-vector'),
      outlinePath: outline?.getAttribute('d'),
      outlineWidth: outline?.getAttribute('stroke-width'),
      animationName: style.animationName,
      rowOverflow: getComputedStyle(tab.closest('[data-prts-session-row]')).overflow,
    }
  })
  expect(liveSessionGeometry.rowX).toBe(liveSessionBefore.x)
  expect(Math.abs(liveSessionGeometry.height - liveSessionGeometry.rowHeight)).toBeLessThan(1.1)
  expect(liveSessionGeometry.depthRatio).toBeGreaterThan(.96)
  expect(liveSessionGeometry.backgroundColor).toBe('rgba(0, 0, 0, 0)')
  expect(liveSessionGeometry.surfaceFill).not.toBe('none')
  expect(liveSessionGeometry.surfaceFill).not.toBe('rgba(0, 0, 0, 0)')
  expect(liveSessionGeometry.clipPath).toBe('none')
  expect(liveSessionGeometry.vectorReady).toBe(true)
  expect(liveSessionGeometry.outlinePath).toMatch(/^M .* Z$/)
  expect(liveSessionGeometry.outlineWidth).toBe('1')
  expect(liveSessionGeometry.animationName).toContain('prts-facility-button-dock')
  expect(liveSessionGeometry.rowOverflow).toBe('visible')
  } else {
    await expect(page.locator('[data-prts-region="sessions"] [role="tree"]')).toBeVisible()
  }

  const mapSurface = page.locator('[data-conversation-scroll]')
  await expect(page.locator('[data-prts-ambient-layer]')).toBeVisible()
  await expect(page.locator('[data-prts-particle-layer]')).toBeVisible()
  const mapSurfaceBox = await mapSurface.boundingBox()
  expect(mapSurfaceBox.width).toBeGreaterThan(0)
  expect(mapSurfaceBox.height).toBeGreaterThan(0)


  const frame = page.locator('[data-prts-region="frame"]')
  const sessions = page.locator('[data-prts-region="sessions"]')
  const operation = page.locator('[data-prts-region="operation"]')
  const sessionsBefore = await sessions.boundingBox()
  const operationBefore = await operation.boundingBox()
  expect(sessionsBefore).not.toBeNull()
  expect(operationBefore).not.toBeNull()

  await page.getByRole('button', { name: /collapse sidebar/i }).click()
  await expect(frame).toHaveAttribute('data-sidebar-collapsed', 'true')
  await expect.poll(async () => (await sessions.boundingBox()).width).toBeLessThan(sessionsBefore.width)
  await expect.poll(async () => {
    const before = (await operation.boundingBox()).width
    await page.waitForTimeout(80)
    const after = (await operation.boundingBox()).width
    return Math.abs(after - before)
  }, { timeout: 2_000 }).toBeLessThanOrEqual(.25)
  const afterNativeCollapse = await operation.boundingBox()
  expect(afterNativeCollapse.width).toBeGreaterThan(operationBefore.width)

  const liveSafety = await page.evaluate(() => {
    const brand = document.querySelector('[data-prts-rail-brand]')
    const send = document.querySelector('button[aria-label*="send" i]')
    const composer = send.closest('[data-composer-card]').getBoundingClientRect()
    const action = send.getBoundingClientRect()
    return {
      brandFits: brand.scrollWidth <= brand.clientWidth,
      executeFits: send.scrollWidth <= send.clientWidth && action.left >= composer.left && action.right <= composer.right,
    }
  })
  expect(liveSafety).toEqual({ brandFits: true, executeFits: true })

  await page.goto(`${liveUrl}${liveUrl.includes('?') ? '&' : '?'}prts-safe=1`)
  await expect(page.locator('[data-prts-shell]')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('@live-write rc.2 real composer menus, messages, streaming, and stop stay compatible', async ({ page }) => {
  test.setTimeout(180_000)
  const liveUrl = process.env.PRTS_LIVE_URL
  test.skip(!liveUrl || process.env.PRTS_LIVE_WRITE !== '1', 'writable live acceptance is not enabled')

  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.addInitScript(value => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify(value)), enabled)
  await page.goto(liveUrl)
  await expect(page.locator('[data-prts-shell]')).toHaveCount(1)
  expect(await page.evaluate(() => ({ secure: isSecureContext, randomUUID: typeof crypto.randomUUID })))
    .toEqual({ secure: true, randomUUID: 'function' })

  const input = page.locator('[data-composer-card] textarea')
  await expect(input).toBeEditable()

  const preset = page.locator('[data-slot="conversation.hero.agentPreset"] button[aria-haspopup="menu"]').first()
  await expect(preset).toHaveAttribute('data-prts-glass-control', 'preset')
  await preset.click()
  const presetMenu = page.locator('[role="menu"][data-prts-glass-menu="preset"]')
  await expect(presetMenu).toBeVisible()
  await expect(presetMenu).not.toHaveCSS('backdrop-filter', 'none')
  await page.keyboard.press('Escape')

  const commands = page.getByRole('button', { name: 'Commands' })
  await expect(commands).toHaveAttribute('data-prts-glass-control', 'action')
  await commands.click()
  await expect(page.locator('[role="listbox"][data-prts-glass-menu="action"]')).toBeVisible()
  await page.keyboard.press('Escape')

  const permission = page.getByRole('button', { name: /Access mode/ })
  await expect(permission).toHaveAttribute('data-prts-glass-control', 'permission')
  await permission.click()
  await expect(page.locator('[role="menu"][data-prts-glass-menu="permission"]')).toBeVisible()
  await page.keyboard.press('Escape')

  const model = page.getByRole('button', { name: /Select model/ })
  await expect(model).toHaveAttribute('data-prts-glass-control', 'model')
  await model.click()
  await expect(page.locator('[role="menu"][data-prts-glass-menu="model"]')).toBeVisible()
  await page.keyboard.press('Escape')

  const marker = Date.now().toString(36)
  const reply = `RC2_OK_${marker}`
  const prompt = `这是 PRTS rc.2 流式兼容验收。请先输出 ${reply}，随后逐行输出从 1 到 5000 的数字。`
  await input.fill(prompt)
  await page.getByRole('button', { name: 'Send message' }).click()

  const user = page.locator('[data-chat-flow-kind="user"]').filter({ hasText: prompt }).last()
  await expect(user).toBeVisible({ timeout: 30_000 })
  const userBubble = user.locator('[class$="_bubble"]')
  await expect(userBubble).not.toHaveCSS('backdrop-filter', 'none')

  const assistant = page.locator('[data-chat-flow-kind="assistant-step"]').last()
  await expect(assistant).toContainText(reply, { timeout: 120_000 })
  const assistantBody = assistant.locator('[data-prts-ai-surface]')
  await expect(assistant).toHaveAttribute('data-prts-ai-surface-state', 'body')
  await expect(assistantBody).toHaveAttribute('data-prts-ai-surface', 'body')
  await expect(assistantBody).not.toHaveCSS('backdrop-filter', 'none')

  const stop = page.locator('button[aria-label*="stop" i]').first()
  await expect(stop).toBeVisible({ timeout: 15_000 })
  await stop.click({ timeout: 5_000 })
  await expect(page.getByRole('button', { name: 'Send message' })).toBeVisible({ timeout: 30_000 })

  const widths = await page.evaluate(() => {
    const operation = document.querySelector('[data-prts-region="operation"]').getBoundingClientRect()
    const userStep = [...document.querySelectorAll('[data-chat-flow-kind="user"]')].at(-1)
    const user = userStep?.querySelector('[class$="_bubble"]')?.getBoundingClientRect()
    const assistant = [...document.querySelectorAll('[data-prts-ai-surface]')].at(-1)?.getBoundingClientRect()
    return { operation: operation.width, user: user?.width ?? 0, assistant: assistant?.width ?? 0 }
  })
  expect(widths.user).toBeGreaterThan(0)
  expect(widths.user).toBeLessThan(widths.operation)
  expect(widths.assistant).toBeGreaterThan(0)
  expect(widths.assistant).toBeLessThan(widths.operation)
  expect(errors).toEqual([])
})

test('@live-matrix rc.2 settings, daylight controls, and phone fallback stay readable', async ({ page }) => {
  const liveUrl = process.env.PRTS_LIVE_URL
  test.skip(!liveUrl, 'PRTS_LIVE_URL is not configured')

  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.addInitScript(value => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify(value)), enabled)
  await page.goto(liveUrl)
  const html = page.locator('html')
  await expect(html).toHaveAttribute('data-prts-scheme', /^(dark|light)$/)
  const initialScheme = await html.getAttribute('data-prts-scheme')
  const nextScheme = initialScheme === 'dark' ? 'light' : 'dark'
  let quickScheme = page.locator('[data-prts-scheme-toggle]')
  await expect(quickScheme).toHaveAttribute('aria-label', initialScheme === 'dark' ? '切换到日间模式' : '切换到夜间模式')
  await quickScheme.click()
  await expect(html).toHaveAttribute('data-prts-scheme', nextScheme)
  await page.waitForTimeout(1000)
  await page.reload()
  await expect(html).toHaveAttribute('data-prts-scheme', nextScheme)
  quickScheme = page.locator('[data-prts-scheme-toggle]')
  await expect(quickScheme).toHaveAttribute('aria-label', nextScheme === 'dark' ? '切换到日间模式' : '切换到夜间模式')
  await quickScheme.click()
  await expect(html).toHaveAttribute('data-prts-scheme', initialScheme)
  await page.waitForTimeout(1000)
  await page.reload()
  await expect(html).toHaveAttribute('data-prts-scheme', initialScheme)
  await expect(page.locator('[data-prts-dossier-overlay]')).toHaveCount(0)

  const pluginSettings = await openPrtsPluginSettings(page)
  await expect(pluginSettings.getByRole('switch')).toHaveCount(2)
  await expect(pluginSettings.getByRole('switch', { name: '启用 P.R.T.S. 主题' })).toHaveAttribute('aria-checked', 'true')
  await page.getByRole('button', { name: 'Close', exact: true }).click()

  await page.locator('[data-prts-rail-brand]').click()
  const settings = page.locator('[data-prts-theme-settings]')
  await expect(settings).toBeVisible()
  await expect(settings.locator('[data-prts-setting-row="particlePattern"]')).toHaveCount(0)
  await expect(settings).toContainText('粒子精度')
  await settings.locator('[data-prts-settings-advanced] summary').click()
  const scaleDistance = settings.locator('[data-prts-setting-range][data-prts-setting-key="conversationScaleMaxDistance"]')
  await expect(scaleDistance).toHaveValue('96')
  const persistedScaleDistance = await page.evaluate(() => JSON.parse(localStorage.getItem('dsh.ui.prts.v1')).conversationScaleMaxDistance ?? null)
  const calibration = settings.locator('[data-prts-scale-calibration]')
  await expect(calibration).toBeVisible()
  await expect(calibration.locator('[data-prts-scale-calibration-status]')).toContainText('当前视图')
  await scaleDistance.evaluate(node => {
    node.value = '184'
    node.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await expect(settings.locator('[data-prts-scale-distance-output]')).toHaveText('184 px')
  await expect(settings.locator('[data-prts-scale-calibration-value]')).toHaveText('184 px')
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('dsh.ui.prts.v1')).conversationScaleMaxDistance ?? null)).toBe(persistedScaleDistance)
  await scaleDistance.evaluate(node => node.dispatchEvent(new Event('change', { bubbles: true })))
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('dsh.ui.prts.v1')).conversationScaleMaxDistance)).toBe(184)

  const particleDetail = settings.locator('[data-prts-particle-detail]')
  await particleDetail.getByRole('radio', { name: '标准', exact: true }).click()
  await expect(particleDetail.getByRole('radio', { name: '标准', exact: true })).toBeChecked()
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('dsh.ui.prts.v1')).conversationParticleDensity)).toBe('light')
  await page.waitForTimeout(1000)
  await expect(page.locator('[data-prts-particle-layer]')).toBeVisible()
  const selectedDensity = particleDetail.getByRole('radio', { name: '标准', exact: true })
  await expect(selectedDensity).toHaveCSS('color', initialScheme === 'dark' ? 'rgb(237, 241, 242)' : 'rgb(21, 25, 28)')
  await expect(selectedDensity).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await page.locator('[data-prts-theme-settings-close]').click()

  const commands = page.getByRole('button', { name: 'Commands' })
  const expectedInk = initialScheme === 'dark' ? 'rgb(237, 241, 242)' : 'rgb(21, 25, 28)'
  await expect(commands).toHaveCSS('color', expectedInk)
  if (await commands.isEnabled()) {
    await commands.click()
    const menu = page.locator('[role="listbox"][data-prts-glass-menu="action"]')
    await expect(menu).toBeVisible()
    await expect(menu).toHaveCSS('color', expectedInk)
    await page.keyboard.press('Escape')
  } else {
    await expect(commands).toBeDisabled()
  }
  await expectNoHorizontalOverflow(page)

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator('html')).toHaveAttribute('data-prts-drawer-mode', 'overlay')
  const composer = page.locator('[data-composer-card]')
  await expect(composer).toBeVisible()
  await expect.poll(() => composer.evaluate(node => {
    const rect = node.getBoundingClientRect()
    return rect.left >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight
  })).toBe(true)
  const phone = await page.evaluate(() => {
    const composer = document.querySelector('[data-composer-card]').getBoundingClientRect()
    const particle = document.querySelector('[data-prts-particle-layer]').getBoundingClientRect()
    return {
      composerInside: composer.left >= 0 && composer.right <= innerWidth && composer.bottom <= innerHeight,
      particleInside: particle.left >= 0 && particle.right <= innerWidth,
    }
  })
  expect(phone).toEqual({ composerInside: true, particleInside: true })
  await expectNoHorizontalOverflow(page)
  expect(errors).toEqual([])
})
test('glassifies body portals while preserving complete third-party popup materials', async ({ page }) => {
  await setPreferences(page, { ...enabled, motion: 'system' })
  await page.evaluate(() => {
    const menu = document.createElement('div')
    menu.id = 'fixture-global-menu'
    menu.setAttribute('role', 'menu')
    menu.innerHTML = '<button role="menuitem">常规操作</button><button role="menuitem" data-danger="true">危险操作</button>'
    document.body.appendChild(menu)

    const listbox = document.createElement('div')
    listbox.id = 'fixture-global-listbox'
    listbox.setAttribute('role', 'listbox')
    listbox.innerHTML = '<button role="option" aria-selected="true">模型 A</button>'
    document.body.appendChild(listbox)

    const scrim = document.createElement('div')
    scrim.id = 'fixture-global-scrim'
    scrim.setAttribute('role', 'presentation')
    scrim.innerHTML = '<section role="dialog" aria-modal="true"><input value="重命名"><button data-danger="true">删除</button></section>'
    document.body.appendChild(scrim)

    const custom = document.createElement('div')
    custom.id = 'fixture-custom-popup'
    custom.dataset.plugin = 'third-party'
    custom.setAttribute('role', 'menu')
    custom.style.cssText = 'border-radius:20px;box-shadow:0 12px 30px rgba(0,0,0,.4);background:#473c68'
    custom.innerHTML = '<button role="menuitem">第三方材质</button>'
    document.body.appendChild(custom)

    const optedOut = document.createElement('div')
    optedOut.id = 'fixture-opted-out'
    optedOut.dataset.prtsPreservePopupStyle = ''
    optedOut.setAttribute('role', 'menu')
    document.body.appendChild(optedOut)
  })

  const menu = page.locator('#fixture-global-menu')
  const listbox = page.locator('#fixture-global-listbox')
  const dialog = page.locator('#fixture-global-scrim [role="dialog"]')
  await expect(menu).toHaveAttribute('data-prts-floating-glass', 'menu')
  await expect(listbox).toHaveAttribute('data-prts-floating-glass', 'listbox')
  await expect(dialog).toHaveAttribute('data-prts-floating-glass', 'dialog')
  await expect(page.locator('#fixture-global-scrim')).toHaveAttribute('data-prts-floating-scrim', '')
  await expect(menu).toHaveCSS('border-radius', '4px')
  await expect(dialog).toHaveCSS('border-radius', '4px')
  await expect(dialog.locator('input')).toHaveCSS('border-radius', '0px')
  expect(await menu.evaluate(node => getComputedStyle(node).backdropFilter)).toContain('blur(22px)')
  await expect(dialog).toHaveCSS('backdrop-filter', 'none')
  await expect(menu.getByRole('menuitem', { name: '危险操作' })).toHaveAttribute('data-prts-floating-danger', '')

  await expect(page.locator('#fixture-custom-popup')).toHaveAttribute('data-prts-floating-preserved', 'custom')
  await expect(page.locator('#fixture-custom-popup')).not.toHaveAttribute('data-prts-floating-glass')
  await expect(page.locator('#fixture-opted-out')).not.toHaveAttribute('data-prts-floating-glass')

  await page.locator('html').evaluate(root => { root.dataset.prtsScheme = 'light' })
  await expect(menu).toHaveCSS('color', 'rgb(21, 25, 28)')
})
