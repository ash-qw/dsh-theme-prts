import { expect, test } from '@playwright/test'
import sharp from 'sharp'

test.use({ locale: 'zh-CN', storageState: process.env.PRTS_RC022_STATE || undefined })
test.beforeEach(async ({ page }) => {
  test.skip(!process.env.PRTS_RC022_STATE, 'Requires authenticated local 0.2.2 storage state')
  test.setTimeout(60_000)
  await page.addInitScript(() => {
    let loader
    Object.defineProperty(window, '__ModuleLoader__', {
      configurable: true,
      get: () => loader,
      set(value) {
        loader = value
        let load = value.load
        Object.defineProperty(value, 'load', {
          configurable: true,
          get: () => registration => {
            if (registration.id === '@ash-qw/dsh-theme-prts' && !registration.chunk) {
              const factory = registration.factory
              registration.factory = require => { window.__prtsMenuRequire = require; return factory(require) }
            }
            return load.call(value, registration)
          },
          set(next) { load = next },
        })
      },
    })
  })
})

async function openHarness(page, scheme, width, enhanced = false, hero = false) {
  const errors = []
  const writes = []
  const blockedDraftCreates = []
  if (hero) await page.addInitScript(() => localStorage.removeItem('dsh.sessions.current'))
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/api/settings/describe', async route => {
    const response = await route.fetch()
    const packet = await response.json()
    expect(packet.result?.ok).toBe(true)
    packet.result.value.writable = false
    for (const namespace of packet.result.value.namespaces) {
      if (namespace.ns === 'theme-prts') namespace.value = {
        ...namespace.value, enabled: true, preferencesInitialized: true, bootAnimation: false, motion: 'reduced', composerGlass: enhanced, glass: 'standard',
      }
      if (namespace.ns === 'ui-theme') namespace.value = { ...namespace.value, preference: scheme }
    }
    return route.fulfill({ response, json: packet })
  })
  await page.route(/\/api\/(settings\/mutate|workspace\/(pinSession|unpinSession|archiveSession|unarchiveSession|insertSessionBefore)|session\/(rename|fork|prompt|create)|commands\/execute)(?:\?|$)/, route => {
    const url = route.request().url()
    if (new URL(url).pathname === '/api/session/create') blockedDraftCreates.push(url)
    else writes.push(url)
    return route.abort('blockedbyclient')
  })
  await page.setViewportSize({ width, height: 900 })
  await page.goto(process.env.PRTS_LIVE_URL || 'http://127.0.0.1:3080')
  await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', scheme, { timeout: 20_000 })
  await page.locator('[data-prts-startup]').waitFor({ state: 'hidden' })
  await expect.poll(() => page.evaluate(() => typeof window.__prtsMenuRequire)).toBe('function')
  if (hero) await expect(page.locator('[data-prts-hero-active]')).toBeVisible()
  await page.evaluate(hero => {
    const require = window.__prtsMenuRequire
    const React = require('react')
    const ReactDOM = require('react-dom')
    const { Menu } = require('@deepseek-ai/dsh-client-ui-primitives')
    const registrations = new Map()
    const dictionaries = new Map()
    const noop = () => {}
    const context = {
      effect: callback => callback(), plugin: noop,
      inject: (dependencies, callback) => { if (dependencies.includes('slots')) callback(context) },
      locale: {
        register: (name, dictionary) => { dictionaries.set(name, dictionary); return noop },
        bind: name => (key, values = {}) => dictionaries.get(name).zh[key].replace(/\{(\w+)\}/g, (_match, token) => values[token] ?? ''),
      },
      slots: {
        inject: (_name, callback) => callback(),
        register: (definition, Component) => { registrations.set(definition.name, Component); return noop },
      },
    }
    require('@deepseek-ai/dsh-client-ui-model-selection').apply(context)
    require('@deepseek-ai/dsh-client-ui-input-trigger').apply(context)
    const ModelSelect = registrations.get('conversation.input.model')
    const MenuView = registrations.get('conversation.input.overlay')
    const snapshot = {
      status: 'ready', failures: [], error: null, pending: null,
      current: { provider: 'preview', model: 'current', reasoningEffort: 'high' },
      groups: [{ id: 'preview', name: '主题验收模型', models: [
        { id: 'current', name: 'DeepSeek-V4-Flash', reasoning: { defaultEffort: 'high', efforts: [{ id: 'low', name: 'Low' }, { id: 'high', name: 'High' }] } },
        ...Array.from({ length: 18 }, (_value, index) => ({ id: `preview-${index}`, name: `预览模型 ${index + 1}：${'长名称'.repeat(10)}` })),
      ] }],
    }
    const state = { selected: [] }
    const stage = document.createElement('section')
    stage.dataset.credentialProbe = ''
    stage.style.cssText = hero
      ? 'position:absolute;bottom:0;left:0;right:0;padding:12px;background:var(--prts-panel);color:var(--prts-ink)'
      : 'position:fixed;z-index:1000;bottom:40px;left:20px;right:20px;padding:12px;background:var(--prts-panel);color:var(--prts-ink)'
    document.querySelector(hero ? '[data-prts-hero-active] [data-slot="conversation.composer.bar"]' : '[data-prts-region="operation"], [data-slot="main.conversation"]').append(stage)
    const root = ReactDOM.createRoot(stage)
    function Picker({ permission }) {
      const [open, setOpen] = React.useState(false)
      return React.createElement(Menu, {
        open, portal: true, autoFocus: true, contextual: !permission, side: 'top',
        anchor: React.createElement('button', { type: 'button', [permission ? 'data-credential-permission-trigger' : 'data-credential-session-trigger']: '', onClick: () => setOpen(value => !value) }, permission ? '权限菜单验收' : '会话菜单验收'),
        selectedId: permission ? 'workspace-write' : undefined,
        items: permission ? [
          { id: 'read-only', label: '仅可查看' }, { id: 'workspace-write', label: '工作区内修改' }, { id: 'full-access', label: '完全权限' },
        ] : [
          { id: 'pin', label: '取消置顶' }, { id: 'rename', label: '重命名' }, { id: 'fork', label: '分叉会话' },
          { id: 'copy', label: '复制 Session ID', separatorBefore: true }, { id: 'archive', label: '归档会话', separatorBefore: true },
        ],
        onClose: () => setOpen(false), onSelect: id => { state.selected.push(id); setOpen(false) },
      })
    }
    const emptyHeaders = new Map()
    const headers = { subscribe: () => noop, getSnapshot: () => emptyHeaders }
    const commands = Array.from({ length: 24 }, (_value, index) => ({ name: `preview-${index}`, label: `验收指令 ${index + 1}`, description: '仅界面验收，不执行真实命令' }))
    function Commands() {
      const [open, setOpen] = React.useState(false)
      const [index, setIndex] = React.useState(0)
      const editor = React.useRef(null)
      const menu = React.useMemo(() => {
        const snapshot = { open, hit: null, generation: 1, groups: [{ source: 'command', status: 'ready', items: commands }], highlight: { source: 'command', index } }
        return { subscribe: () => noop, getSnapshot: () => snapshot }
      }, [open, index])
      return React.createElement(React.Fragment, null,
        React.createElement('button', { type: 'button', 'data-credential-action-trigger': '', 'aria-haspopup': 'listbox', 'aria-expanded': open,
          onClick: () => { setOpen(value => !value); editor.current.focus() } }, '+'),
        React.createElement('textarea', { ref: editor, 'aria-label': '验收指令输入', rows: 1,
          onKeyDown: event => {
            if (event.key === 'ArrowDown') { event.preventDefault(); setIndex(value => Math.min(commands.length - 1, value + 1)) }
            if (event.key === 'Escape') setOpen(false)
          } }),
        React.createElement('div', { 'data-composer-overlay': '', className: 'credential-native-overlay' },
          React.createElement('div', { 'data-slot': 'conversation.input.overlay' },
            React.createElement(MenuView, { menu, headers, t: context.locale.bind('slash.menu'), onHover: (_source, next) => setIndex(next),
              onDismiss: () => setOpen(false), onCrumb: noop,
              onPick: (source, picked) => { state.selected.push({ source, picked }); setOpen(false) },
            }))),
      )
    }
    root.render(React.createElement('div', { 'data-composer-card': '' },
      React.createElement('style', null, '.credential-native-overlay { position: absolute; inset: 0 0 auto; height: 0; }'),
      React.createElement('span', { 'data-slot': 'conversation.input.model' }, React.createElement(ModelSelect, {
        locked: false, available: true, directory: { subscribe: () => noop, getSnapshot: () => snapshot }, load: noop,
        select: async selection => { state.selected.push(selection); return { ok: true } },
        resolveText: text => text, t: context.locale.bind('model'), renderSlot: (_name, _owner, fallback) => fallback?.fallback ?? null,
      })),
      React.createElement('span', { 'data-slot': 'conversation.input.permission' }, React.createElement(Picker, { permission: true })),
      React.createElement(Picker, { permission: false }), React.createElement(Commands),
    ))
    window.__prtsMenuProbe = state
    window.__prtsDisposeMenuProbe = () => { root.unmount(); stage.remove() }
  }, hero)
  return { errors, writes, blockedDraftCreates }
}

async function expectCredential(menu, width, caption) {
  if (await menu.getAttribute('data-trigger-menu') !== null) await expect(menu).toHaveAttribute('data-prts-glass-menu', 'action')
  else await expect(menu).toHaveAttribute('data-prts-floating-glass', 'menu')
  await expect(menu).toHaveCSS('padding-top', '29px')
  await expect(menu).toHaveCSS('padding-left', '30px')
  await expect(menu).toHaveCSS('overflow-y', 'visible')
  const metrics = await menu.evaluate(node => {
    const rectangle = node.getBoundingClientRect()
    const material = node.querySelector(':scope > [aria-hidden="true"][class*="_material_"]')
    return {
      left: rectangle.left, right: rectangle.right, top: rectangle.top, bottom: rectangle.bottom,
      nativeBeforeBackground: getComputedStyle(node, '::before').backgroundImage,
      header: getComputedStyle(material, '::before').content,
      stamp: getComputedStyle(material, '::after').content,
      decorationEvents: getComputedStyle(material, '::after').pointerEvents,
      opacity: getComputedStyle(node).opacity,
    }
  })
  expect(metrics.left).toBeGreaterThanOrEqual(-1)
  expect(metrics.right).toBeLessThanOrEqual(width + 1)
  expect(metrics.top).toBeGreaterThanOrEqual(0)
  expect(metrics.bottom).toBeLessThanOrEqual(901)
  expect(metrics.header).toBe('"RHODES ISLAND"')
  expect(metrics.stamp).toBe(`"${caption}"`)
  expect(metrics.decorationEvents).toBe('none')
  expect(metrics.opacity).toBe('1')
  expect(metrics.nativeBeforeBackground).not.toContain('data:image/svg+xml')
  await expect(menu.locator('[data-prts-menu-card]')).toHaveCount(0)
}

async function screenshotCredential(menu, testInfo, name) {
  const bounds = await menu.boundingBox()
  const viewport = menu.page().viewportSize()
  const left = Math.max(0, Math.floor(bounds.x) - 2)
  const top = Math.max(0, Math.floor(bounds.y) - 2)
  const right = Math.min(viewport.width, Math.ceil(bounds.x + bounds.width) + 2)
  const bottom = Math.min(viewport.height, Math.ceil(bounds.y + bounds.height) + 2)
  await menu.page().screenshot({ path: testInfo.outputPath(name), clip: { x: left, y: top, width: right - left, height: bottom - top }, animations: 'disabled' })
}

async function closeMenus(page) {
  for (let attempt = 0; attempt < 3; attempt++) {
    if (!await page.locator('[data-menu-material]:visible').count()) return
    await page.keyboard.press('Escape')
  }
  await expect(page.locator('[data-menu-material]:visible')).toHaveCount(0)
}

async function expectBackdropTransmission(page, menu, testInfo, kind) {
  const bounds = await menu.boundingBox()
  const clip = { x: Math.ceil(bounds.x + 42), y: Math.floor(bounds.y + bounds.height - 5), width: 40, height: 3 }
  await menu.evaluate(node => {
    const rectangle = node.getBoundingClientRect()
    const backdrop = document.createElement('div')
    backdrop.dataset.credentialBackdrop = ''
    backdrop.style.cssText = `position:fixed;pointer-events:none;left:${rectangle.left - 80}px;top:${rectangle.top - 80}px;width:${rectangle.width + 160}px;height:${rectangle.height + 160}px;z-index:${getComputedStyle(node).zIndex};background:rgb(0,0,0)`
    node.before(backdrop)
  })
  try {
    for (const glass of ['soft', 'standard', 'clear', 'off']) {
      await page.locator('html').evaluate((node, value) => { node.dataset.prtsGlass = value }, glass)
      const samples = []
      for (const color of ['rgb(0, 0, 0)', 'rgb(255, 255, 255)']) {
        await page.locator('[data-credential-backdrop]').evaluate((node, value) => { node.style.background = value }, color)
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        samples.push(await sharp(await page.screenshot({ clip, animations: 'disabled' })).removeAlpha().raw().toBuffer())
      }
      const delta = samples[0].reduce((sum, channel, index) => sum + Math.abs(channel - samples[1][index]), 0) / samples[0].length
      testInfo.annotations.push({ type: 'transmission', description: `${kind} ${glass}: ${delta.toFixed(2)} mean RGB delta` })
      if (glass === 'off') expect(delta).toBeLessThan(2)
      else expect(delta).toBeGreaterThan({ soft: 75, standard: 105, clear: 140 }[glass])
    }
  } finally {
    await page.locator('[data-credential-backdrop]').evaluate(node => node.remove())
    await page.locator('html').evaluate(node => { node.dataset.prtsGlass = 'standard' })
  }
}

for (const scheme of ['dark', 'light']) {
  test(`credential preset selected copy remains readable (${scheme}) @live-rc0222`, async ({ page }, testInfo) => {
    const state = await openHarness(page, scheme, 1440, false, true)
    const trigger = page.locator('[data-slot="conversation.hero.agentPreset"] button[aria-haspopup="menu"]')
    await trigger.click()
    const popup = page.locator('[data-menu-material]:visible').last()
    await expect(popup).toHaveAttribute('data-prts-glass-menu', 'preset')
    await expectCredential(popup, 1440, 'MODE')
    const selected = popup.locator('[role="menuitem"][class*="_selected"]')
    await expect(selected).toHaveCount(1)
    const secondary = popup.locator('[role="menuitem"]:not([class*="_selected"]) [class*="_itemDesc"]').first()
    await expect(secondary).toHaveCSS('color', scheme === 'dark' ? 'rgb(184, 194, 200)' : 'rgb(70, 83, 92)')
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 })
      for (const glass of ['soft', 'standard', 'clear', 'off']) {
        await page.locator('html').evaluate((node, value) => { node.dataset.prtsGlass = value }, glass)
        const ink = await selected.evaluate(node => getComputedStyle(node).color)
        await expect(selected.locator('[class*="_itemName"]')).toHaveCSS('color', ink)
        const contrast = await selected.evaluate(node => {
          const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
          const rgba = value => {
            context.clearRect(0, 0, 1, 1)
            context.fillStyle = value
            context.fillRect(0, 0, 1, 1)
            return [...context.getImageData(0, 0, 1, 1).data]
          }
          const composite = (foreground, background) => foreground.slice(0, 3).map((channel, index) => channel * foreground[3] / 255 + background[index] * (1 - foreground[3] / 255))
          const luminance = color => color.map(channel => channel / 255).map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4).reduce((sum, channel, index) => sum + channel * [.2126, .7152, .0722][index], 0)
          const fill = rgba(getComputedStyle(node).backgroundColor)
          return [...node.querySelectorAll('[class*="_itemName"], [class*="_itemDesc"]')].flatMap(text => [0, 255].map(channel => {
            const background = composite(fill, [channel, channel, channel])
            const foreground = composite(rgba(getComputedStyle(text).color), background)
            const values = [luminance(background), luminance(foreground)].sort((left, right) => right - left)
            return (values[0] + .05) / (values[1] + .05)
          }))
        })
        expect(contrast).toHaveLength(4)
        for (const ratio of contrast) expect(ratio).toBeGreaterThanOrEqual(4.5)
      }
      await page.locator('html').evaluate(node => { node.dataset.prtsGlass = 'standard' })
      await screenshotCredential(popup, testInfo, `preset-${scheme}-${width}.png`)
    }
    await expectBackdropTransmission(page, popup, testInfo, 'preset')
    await closeMenus(page)
    await expect(trigger).toBeFocused()
    expect(state.errors).toEqual([])
    expect(state.writes).toEqual([])
    expect(await page.evaluate(() => window.__prtsMenuProbe.selected)).toEqual([])
    await page.evaluate(() => window.__prtsDisposeMenuProbe())
  })
}

for (const scheme of ['dark', 'light']) for (const width of [1440, 390]) for (const enhanced of [false, true]) {
  test(`hero command menu paints above particle emblem (${scheme}, ${width}, ${enhanced ? 'enhanced' : 'basic'}) @live-rc0222`, async ({ page }, testInfo) => {
    const state = await openHarness(page, scheme, width, enhanced, true)
    const probe = page.locator('[data-credential-probe]')
    await expect(probe).toHaveCSS('z-index', 'auto')
    const particle = page.locator('[data-prts-particle-layer]')
    await expect(particle).toBeVisible()
    await expect(particle).toHaveCSS('opacity', '1')
    await expect(particle).toHaveCSS('pointer-events', 'none')
    await probe.locator('[data-credential-action-trigger]').click()
    const actions = probe.locator('[data-trigger-menu]')
    await expect(actions).toBeVisible()
    for (const style of ['native', 'deck-chat']) {
      await page.locator('html').evaluate((node, value) => { node.dataset.prtsConversationStyle = value }, style)
      const stacking = await actions.evaluate(menu => {
        const particle = document.querySelector('[data-prts-particle-layer]')
        const original = particle.style.pointerEvents
        try {
          particle.style.pointerEvents = 'auto'
          const rect = menu.getBoundingClientRect()
          const elements = document.elementsFromPoint(rect.left + rect.width / 2, rect.top + Math.min(72, rect.height / 2))
          return { menu: elements.findIndex(node => menu.contains(node)), particle: elements.indexOf(particle) }
        } finally {
          particle.style.pointerEvents = original
        }
      })
      testInfo.annotations.push({ type: 'paint-order', description: JSON.stringify({ style, ...stacking }) })
      await page.screenshot({ path: testInfo.outputPath(`hero-action-layering-${style}.png`), animations: 'disabled' })
      expect(stacking.menu).toBeGreaterThanOrEqual(0)
      expect(stacking.particle).toBeGreaterThan(stacking.menu)
    }
    await expect(particle).toHaveCSS('pointer-events', 'none')
    await expect(actions).toHaveCSS('padding-top', '29px')
    await closeMenus(page)
    await expect(particle).toBeVisible()
    expect(state.errors).toEqual([])
    expect(state.writes).toEqual([])
    expect(await page.evaluate(() => window.__prtsMenuProbe.selected)).toEqual([])
    await page.evaluate(() => window.__prtsDisposeMenuProbe())
  })

  test(`native command menu clears composer (${scheme}, ${width}, ${enhanced ? 'enhanced' : 'basic'}) @live-rc0222`, async ({ page }, testInfo) => {
    const state = await openHarness(page, scheme, width, enhanced)
    const card = page.locator('[data-credential-probe] [data-composer-card]')
    const anchor = card.locator('[data-composer-overlay]')
    const actions = card.locator('[data-trigger-menu]')
    const editor = page.getByRole('textbox', { name: '验收指令输入' })
    await page.locator('[data-credential-action-trigger]').click()
    await expect(actions).toBeVisible()
    const initial = await actions.evaluate(node => {
      const card = node.closest('[data-composer-card]')
      const anchor = node.closest('[data-composer-overlay]')
      return { gap: card.getBoundingClientRect().top - node.getBoundingClientRect().bottom, anchorPosition: getComputedStyle(anchor).position }
    })
    testInfo.annotations.push({ type: 'initial-geometry', description: JSON.stringify(initial) })
    await expect(anchor).toHaveCSS('position', 'absolute')
    await expect(anchor).toHaveCSS('height', '0px')
    await expect(anchor).toHaveCSS('z-index', '2')
    for (const [height, padding, editorHeight] of [[900, '8px 0 0', 52], [900, '10px 12px', 64], [560, '10px 12px', 128], [900, '24px 20px', 192]]) {
      await page.setViewportSize({ width, height })
      await card.evaluate((node, value) => { node.style.padding = value }, padding)
      await editor.evaluate((node, value) => { node.style.minHeight = `${value}px` }, editorHeight)
      await expect.poll(() => actions.evaluate(node => {
        const card = node.closest('[data-composer-card]').getBoundingClientRect()
        const menu = node.getBoundingClientRect()
        return { separated: menu.bottom <= card.top - 2 && menu.bottom >= card.top - 6, fits: menu.top >= 7 && menu.bottom <= innerHeight }
      })).toEqual({ separated: true, fits: true })
      await expect(editor).toBeFocused()
    }
    await page.keyboard.press('ArrowDown')
    await expect(actions.getByRole('option').nth(1)).toHaveAttribute('aria-selected', 'true')
    await expect(actions.getByRole('listbox')).toHaveCSS('overflow-y', 'auto')
    await actions.getByRole('listbox').evaluate(node => { node.scrollTop = node.scrollHeight })
    await expect(actions).not.toHaveAttribute('data-overflow-below')
    await closeMenus(page)
    await expect(editor).toBeFocused()
    expect(state.errors).toEqual([])
    expect(state.writes).toEqual([])
    expect(state.blockedDraftCreates.length).toBeLessThanOrEqual(1)
    expect(await page.evaluate(() => window.__prtsMenuProbe.selected)).toEqual([])
    await page.evaluate(() => window.__prtsDisposeMenuProbe())
  })

  test(`credential model, permission and session menus (${scheme}, ${width}, ${enhanced ? 'enhanced' : 'basic'}) @live-rc0222`, async ({ page }, testInfo) => {
    const state = await openHarness(page, scheme, width, enhanced)
    const model = page.locator('[data-credential-probe] [data-slot="conversation.input.model"] button').first()
    await model.click()
    const popup = page.locator('[data-menu-material]:visible').last()
    await expectCredential(popup, width, 'MODEL')
    await expectBackdropTransmission(page, popup, testInfo, 'model')
    await screenshotCredential(popup, testInfo, 'model-root.png')
    await popup.getByRole('menuitem').first().click()
    await expect(popup).toHaveAttribute('role', 'group')
    await expectCredential(popup, width, 'MODEL')
    await expect(popup.locator('[role="menu"]').first()).not.toHaveAttribute('data-prts-floating-glass')
    const selectedModel = popup.getByRole('menuitemradio', { checked: true })
    await expect(selectedModel).toHaveCount(1)
    await expect(selectedModel).toHaveCSS('background-color', scheme === 'dark' ? 'rgba(232, 237, 232, 0.86)' : 'rgba(34, 51, 61, 0.86)')
    await expect(selectedModel).toHaveCSS('opacity', '1')
    const groups = popup.locator('[role="menu"]').first()
    await expect(groups).toHaveCSS('overflow-y', 'auto')
    const search = popup.getByRole('searchbox')
    await search.fill('DeepSeek')
    await expect(popup.getByRole('menuitemradio')).toHaveCount(1)
    await search.fill('')
    await expect(popup.getByRole('menuitemradio')).toHaveCount(19)
    await screenshotCredential(popup, testInfo, 'model-list.png')
    await closeMenus(page)

    const permission = page.locator('[data-credential-permission-trigger]')
    await permission.click()
    await expectCredential(popup, width, 'ACCESS')
    await expect(popup).toHaveAttribute('data-prts-glass-menu', 'permission')
    const selectedPermission = popup.locator('[role="menuitem"][class*="_selected_"], [role="menuitem"][class$="_selected"]')
    await expect(selectedPermission).toHaveCount(1)
    await expect(selectedPermission).toHaveCSS('background-color', scheme === 'dark' ? 'rgba(232, 237, 232, 0.86)' : 'rgba(34, 51, 61, 0.86)')
    await page.keyboard.press('ArrowDown')
    await selectedPermission.focus()
    await expect(selectedPermission).toHaveCSS('outline-style', 'solid')
    const material = popup.locator(':scope > [aria-hidden="true"][class*="_material_"]')
    for (const [glass, filter, alpha] of [['soft', 'blur(14px) saturate(1.35)', [.6, .66]], ['standard', 'blur(20px) saturate(1.45)', [.46, .52]], ['clear', 'blur(24px) saturate(1.55)', [.34, .4]], ['off', 'none', [1, 1]]]) {
      await page.locator('html').evaluate((node, value) => { node.dataset.prtsGlass = value }, glass)
      await expect(popup).toHaveCSS('backdrop-filter', 'none')
      await expect(popup).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      await expect(material).toHaveCSS('backdrop-filter', filter)
      const actualAlpha = await material.evaluate(node => {
        const channels = getComputedStyle(node).backgroundColor.match(/[\d.]+/g).map(Number)
        return channels[3] ?? 1
      })
      expect(actualAlpha).toBe(alpha[scheme === 'dark' ? 0 : 1])
    }
    await expectBackdropTransmission(page, popup, testInfo, 'permission')
    await page.locator('html').evaluate(node => { node.dataset.prtsGlass = 'clear' })
    await screenshotCredential(popup, testInfo, 'permission.png')
    await closeMenus(page)
    await expect(permission).toBeFocused()

    const session = page.locator('[data-credential-session-trigger]')
    await session.click()
    await expectCredential(popup, width, 'ACTION')
    await expectBackdropTransmission(page, popup, testInfo, 'session')
    const items = popup.getByRole('menuitem')
    await expect(items.first()).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(items.nth(1)).toBeFocused()
    await expect(popup.getByRole('menuitem', { name: '归档会话', exact: true })).not.toHaveAttribute('data-prts-floating-danger')
    await screenshotCredential(popup, testInfo, 'session.png')
    await closeMenus(page)
    await expect(session).toBeFocused()

    await page.locator('[data-credential-action-trigger]').click()
    const actions = page.locator('[data-credential-probe] [data-trigger-menu]')
    await expectCredential(actions, width, 'ACTION')
    await expect(actions).not.toHaveAttribute('data-prts-floating-glass')
    const options = actions.getByRole('listbox')
    await expect(options).not.toHaveAttribute('data-prts-glass-menu')
    await expect(options).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(options).toHaveCSS('backdrop-filter', 'none')
    await expect(options).toHaveCSS('overflow-y', 'auto')
    await expect(options.getByRole('option')).toHaveCount(24)
    const editor = page.getByRole('textbox', { name: '验收指令输入' })
    await expect(editor).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(options.getByRole('option').nth(1)).toHaveAttribute('aria-selected', 'true')
    await expect(editor).toBeFocused()
    await expectBackdropTransmission(page, actions, testInfo, 'action')
    await expect(actions).toHaveAttribute('data-overflow-below')
    expect(await actions.evaluate(node => ({ rail: getComputedStyle(node, '::after').height, height: node.clientHeight })).then(metrics => Math.abs(parseFloat(metrics.rail) - metrics.height))).toBeLessThan(2)
    await options.evaluate(node => { node.scrollTop = node.scrollHeight })
    await expect(actions).not.toHaveAttribute('data-overflow-below')
    await screenshotCredential(actions, testInfo, 'action.png')
    await closeMenus(page)
    await expect(editor).toBeFocused()
    expect(state.errors).toEqual([])
    expect(state.writes).toEqual([])
    expect(state.blockedDraftCreates.length).toBeLessThanOrEqual(1)
    if (state.blockedDraftCreates.length) testInfo.annotations.push({ type: 'safety', description: 'Blocked a host draft-session creation request; no session was created.' })
    expect(await page.evaluate(() => window.__prtsMenuProbe.selected)).toEqual([])
    await page.evaluate(() => window.__prtsDisposeMenuProbe())
  })
}
