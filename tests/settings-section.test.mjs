import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { JSDOM } from 'jsdom'
import test from 'node:test'

const fixture = await readFile(new URL('./fixtures/rc7-harness.html', import.meta.url), 'utf8')

async function load(path) {
  try { return await import(path) } catch { return null }
}

async function waitFor(predicate, timeout = 800) {
  const deadline = Date.now() + timeout
  while (!predicate()) {
    if (Date.now() >= deadline) return false
    await new Promise(resolve => setTimeout(resolve, 10))
  }
  return true
}

function createCtx(calls) {
  const theme = {
    getTheme() { return calls.themeCurrent || 'dark' },
    setTheme(id) { calls.themeSets ||= []; calls.themeSets.push(id); calls.themeCurrent = id },
  }
  return {
    theme,
    get(name) {
      if (name === 'theme') throw new Error('ctx.get is unavailable for injected services')
      return undefined
    },
    on(name, listener) {
      if (name !== 'theme/change') return undefined
      calls.themeListener = listener
      return () => { calls.themeListener = undefined }
    },
    get modelDirectories() {
      throw new Error('cannot get property "modelDirectories" without inject')
    },
    effect(fn) {
      const cleanup = fn()
      if (typeof cleanup === 'function') calls.cleanups.push(cleanup)
      return cleanup
    },
    locale: { register(ns, dict) { calls.locale = [ns, dict]; return () => {} } },
    slots: {
      inject(name, fn) { calls.injected.push(name); return fn() },
      register(options, component) { calls.registrations.push([options, component]); return () => {} },
    },
  }
}

test('shared store synchronizes preferences and status while ignoring stale revisions', async () => {
  const api = await load('../src/client/ui-store.js')
  assert.ok(api, 'shared UI store module should exist')
  let spec
  const store = api.createPrtsUiStore(value => { spec = value; return value })
  assert.equal(store, spec)
  const draft = spec.init()
  const first = { ...draft.preferences, enabled: true }
  const active = { ...draft.status, operation: 'OP-06' }
  spec.actions.sync(draft, first, active, 2)
  spec.actions.sync(draft, { ...first, enabled: false }, { ...active, operation: 'OP-05' }, 1)
  assert.equal(draft.preferences.enabled, true)
  assert.equal(draft.status.operation, 'OP-06')
  assert.equal(draft.revision, 2)
})

test('seeds a new scope store from the current runtime state', async () => {
  const api = await load('../src/client/ui-store.js')
  const preferences = { version: 1, enabled: true, preset: 'standard-tactical',  texture: 'full', glassEnabled: true,
    glass: 'standard', glassHighlight: true, motion: 'reduced', density: 'tactical', panelOpen: true }
  const status = { operation: 'OP-06', doctor: '未提供' }
  const store = api.createPrtsUiStore(value => value, { preferences, status, revision: 4 })
  const seeded = store.init()
  assert.equal(seeded.preferences.enabled, true)
  assert.equal(Object.hasOwn(seeded.preferences, 'scheme'), false)
  assert.equal(seeded.status.operation, 'OP-06')
  assert.equal(seeded.revision, 4)
  assert.notEqual(seeded.preferences, preferences)
  assert.notEqual(seeded.status, status)
})


test('plugin settings tab exposes only theme and startup switches', async () => {
  const api = await load('../src/client/settings-page.js')
  assert.ok(api, 'settings page module should exist')
  const React = { createElement: (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat() }) }
  const Page = api.createSettingsPage(React, { safeMode: false })
  const preferences = { version: 4, enabled: true, bootAnimation: true }
  const updates = []
  const tree = Page({
    useStore: select => select({ preferences }),
    updatePreference: (...args) => updates.push(args),
  })
  const buttons = []
  const text = []
  const visit = node => {
    if (typeof node === 'string') return text.push(node)
    if (!node || typeof node !== 'object') return
    if (node.type === 'button') buttons.push(node)
    for (const child of node.children ?? []) visit(child)
  }
  visit(tree)
  for (const label of [
    'P.R.T.S.',
    '完整外观设置位于主界面左上角的罗德岛徽记。',
    '启用 P.R.T.S. 主题',
    '控制 P.R.T.S. 外观是否加载',
    '播放启动动画',
    '刷新或启用主题时显示 P.R.T.S. 启动动画',
  ]) assert.ok(text.includes(label))
  assert.equal(buttons.length, 2)
  assert.ok(buttons.every(button => button.props.role === 'switch'))
  buttons.find(button => button.props['aria-label'] === '播放启动动画').props.onClick()
  buttons.find(button => button.props['aria-label'] === '启用 P.R.T.S. 主题').props.onClick()
  assert.deepEqual(updates, [['bootAnimation', false], ['enabled', false]])
  for (const retired of ['插件版本', '恢复外观默认', '玻璃强度', '粒子密度']) {
    assert.equal(text.includes(retired), false)
  }

  const SafePage = api.createSettingsPage(React, { safeMode: true })
  const safeTree = SafePage({ useStore: select => select({ preferences }), updatePreference: (...args) => updates.push(args) })
  const safeButtons = []
  const collectButtons = node => {
    if (!node || typeof node !== 'object') return
    if (node.type === 'button') safeButtons.push(node)
    for (const child of node.children ?? []) collectButtons(child)
  }
  collectButtons(safeTree)
  assert.equal(safeButtons.find(button => button.props['aria-label'] === '启用 P.R.T.S. 主题').props.disabled, true)
  assert.equal(safeButtons.find(button => button.props['aria-label'] === '播放启动动画').props.disabled, false)
})

test('registers a Settings → Plugins tab and applies updates immediately', async t => {
  const api = await load('../src/client/index.js')
  assert.ok(api, 'client assembly module should exist')
  const dom = new JSDOM(fixture, { url: 'http://localhost/', pretendToBeVisual: true })
  Object.defineProperty(dom.window, 'innerWidth', { configurable: true, value: 1440 })
  dom.window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} })
  const calls = { cleanups: [], injected: [], registrations: [] }
  t.after(() => calls.cleanups.splice(0).reverse().forEach(cleanup => cleanup()))
  const ctx = createCtx(calls)
  const React = { createElement() {} }
  api.applyPrtsPlugin(ctx, { document: dom.window.document, window: dom.window, React, defineStore: spec => spec, cssText: 'html[data-dsh-prts]{}', assets: {} })
  assert.deepEqual(calls.injected, ['settings.plugins.tab'])
  assert.equal(calls.locale, undefined)
  const [options] = calls.registrations.find(([value]) => value.id === 'prts-appearance')
  assert.equal(options.id, 'prts-appearance')
  assert.equal(options.name, 'settings.plugins.tab')
  assert.equal(options.order, 20)
  assert.equal(options.label(), 'P.R.T.S.')
  assert.equal(calls.registrations.some(([value]) => value.name === 'details'), false, 'theme must not compete for the shared details slot')
  const settingsSynced = []
  const actions = options.inject({ sync: (preferences, status, revision) => settingsSynced.push([preferences, status, revision]) })
  actions.updatePreference('enabled', true)
  assert.equal(dom.window.document.querySelectorAll('[data-prts-startup]').length, 1)
  assert.equal(dom.window.document.querySelector('[data-prts-startup]').dataset.stage, 'visualOnline')
  assert.equal(dom.window.document.documentElement.getAttribute('data-dsh-prts'), '')
  assert.equal(dom.window.document.querySelectorAll('[data-prts-shell]').length, 1)
  assert.equal(dom.window.document.documentElement.dataset.prtsScheme, 'dark')
  dom.window.document.querySelector('[data-prts-scheme-toggle]').click()
  assert.deepEqual(calls.themeSets, ['light'])
  calls.themeListener({ id: 'dark' })
  assert.equal(dom.window.document.documentElement.dataset.prtsScheme, 'dark')
  assert.equal(JSON.parse(dom.window.localStorage.getItem('dsh.ui.prts.v1')).enabled, true)
  assert.equal(settingsSynced.at(-1)[0].enabled, true)
  assert.equal(settingsSynced.at(-1)[1].connectionLabel, '未知')
  actions.updatePreference('glass', 'clear')
  assert.equal(dom.window.document.documentElement.dataset.prtsGlass, 'clear')
  assert.equal(dom.window.document.documentElement.hasAttribute('data-prts-glass-highlight'), false)
  assert.equal(JSON.parse(dom.window.localStorage.getItem('dsh.ui.prts.v1')).glass, 'clear')
  const brand = dom.window.document.querySelector('[data-prts-rail-brand]')
  brand.click()
  const appearancePanel = dom.window.document.querySelector('[data-prts-theme-settings]')
  appearancePanel.querySelector('[data-prts-setting-key="railDefaultHidden"][data-prts-setting-value="true"]').click()
  assert.equal(appearancePanel.hasAttribute('open'), true)
  assert.equal(dom.window.document.documentElement.dataset.prtsRailMode, 'overlay')
  assert.equal(dom.window.document.querySelector('[data-prts-nav-rail]').getAttribute('aria-hidden'), 'true')
  assert.equal(JSON.parse(dom.window.localStorage.getItem('dsh.ui.prts.v1')).railDefaultHidden, true)
  dom.window.document.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  actions.resetPreferences()
  assert.equal(dom.window.document.documentElement.hasAttribute('data-dsh-prts'), true)
  assert.equal(JSON.parse(dom.window.localStorage.getItem('dsh.ui.prts.v1')).glass, 'standard')
  assert.equal(JSON.parse(dom.window.localStorage.getItem('dsh.ui.prts.v1')).railDefaultHidden, false)
  assert.equal(dom.window.document.documentElement.dataset.prtsRailMode, 'docked')
  actions.updatePreference('enabled', false)
  assert.equal(dom.window.document.documentElement.hasAttribute('data-dsh-prts'), false)
  assert.equal(dom.window.document.querySelector('[data-prts-shell]'), null)
})

test('keeps the base theme active while a partial host defers the operations shell', async t => {
  const api = await load('../src/client/index.js')
  const dom = new JSDOM('<!doctype html><html><head></head><body><div data-slot="root"></div></body></html>', { url: 'http://localhost/' })
  dom.window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} })
  const warnings = []
  dom.window.console.warn = (...args) => warnings.push(args)
  dom.window.localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
    version: 1, enabled: true, scheme: 'dark',  texture: 'full', motion: 'reduced', density: 'tactical', panelOpen: true,
  }))
  const calls = { cleanups: [], injected: [], registrations: [] }
  t.after(() => calls.cleanups.splice(0).reverse().forEach(cleanup => cleanup()))

  api.applyPrtsPlugin(createCtx(calls), {
    document: dom.window.document,
    window: dom.window,
    React: { createElement() {} },
    defineStore: spec => spec,
    cssText: 'html[data-dsh-prts]{}',
    assets: {},
  })

  assert.ok(calls.injected.includes('settings.plugins.tab'))
  assert.equal(dom.window.document.documentElement.hasAttribute('data-dsh-prts'), true)
  assert.ok(dom.window.document.querySelector('[data-plugin-css="dsh-theme-prts/prts.css"]'))
  assert.equal(dom.window.document.documentElement.hasAttribute('data-dsh-prts-settings'), true)
  assert.equal(dom.window.document.querySelector('[data-prts-startup]'), null, 'restoring an enabled theme must not replay the startup sequence')
  assert.equal(dom.window.document.querySelector('[data-prts-shell]'), null)
  assert.ok(warnings.some(([message]) => message.includes('required layout slots are unavailable')))
  assert.ok(warnings.some(([message]) => message.includes('operations shell mount deferred; base theme remains active')))

  const complete = new JSDOM(fixture)
  complete.window.document.querySelector('[data-session-code]').remove()
  dom.window.document.body.innerHTML = complete.window.document.body.innerHTML
  await new Promise(resolve => dom.window.setTimeout(resolve, 40))
  assert.equal(dom.window.document.querySelectorAll('[data-prts-shell]').length, 1)
  assert.equal(dom.window.document.documentElement.getAttribute('data-dsh-prts'), '')
})

test('takes over a persisted-theme refresh only while the native Harness boot surface exists', async t => {
  const api = await load('../src/client/index.js')
  const dom = new JSDOM('<!doctype html><html><head></head><body><div id="root"><div data-dsh-boot><span data-dsh-boot-spinner></span></div></div></body></html>', { url: 'http://localhost/', pretendToBeVisual: true })
  dom.window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} })
  dom.window.localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
    version: 2, enabled: true, scheme: 'dark',  texture: 'full', motion: 'reduced', density: 'tactical', panelOpen: true, bootAnimation: true,
  }))
  const calls = { cleanups: [], injected: [], registrations: [] }
  t.after(() => calls.cleanups.splice(0).reverse().forEach(cleanup => cleanup()))

  api.applyPrtsPlugin(createCtx(calls), {
    document: dom.window.document,
    window: dom.window,
    React: { createElement() {} },
    defineStore: spec => spec,
    cssText: 'html[data-dsh-prts]{}',
    assets: {},
  })

  const startup = dom.window.document.querySelector('[data-prts-startup]')
  const nativeLoader = dom.window.document.querySelector('[data-dsh-boot]')
  assert.ok(startup, 'persisted enabled theme should take over an active native boot surface')
  assert.ok(startup.hasAttribute('data-reduced-motion'))
  assert.equal(nativeLoader.isConnected, true)
  assert.equal(dom.window.document.documentElement.hasAttribute('data-dsh-prts'), true, 'startup visuals must be themed before native boot completion')
  assert.equal(dom.window.document.querySelector('[data-prts-shell]'), null, 'non-startup UI must wait for native boot completion')
  const waitingProgress = Number.parseInt(startup.querySelector('[data-prts-startup-percent]').textContent, 10)
  nativeLoader.remove()
  await new Promise(resolve => dom.window.setTimeout(resolve, 30))
  assert.equal(dom.window.document.querySelector('[data-prts-startup]'), startup, 'startup overlay must continue instead of restarting')
  assert.ok(Number.parseInt(startup.querySelector('[data-prts-startup-percent]').textContent, 10) >= waitingProgress)
  assert.equal(await waitFor(() => dom.window.document.querySelector('[data-prts-startup]') === null), true)
  assert.equal(dom.window.document.querySelector('[data-prts-startup]'), null)
  assert.equal(dom.window.document.documentElement.hasAttribute('data-dsh-prts'), true)

  const disabledBoot = new JSDOM('<!doctype html><html><body><div data-dsh-boot></div></body></html>', { url: 'http://localhost/', pretendToBeVisual: true })
  disabledBoot.window.matchMedia = dom.window.matchMedia
  disabledBoot.window.localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({ version: 2, enabled: true, bootAnimation: false }))
  const disabledCalls = { cleanups: [], injected: [], registrations: [] }
  api.applyPrtsPlugin(createCtx(disabledCalls), { document: disabledBoot.window.document, window: disabledBoot.window, React: { createElement() {} }, defineStore: spec => spec })
  assert.equal(disabledBoot.window.document.querySelector('[data-prts-startup]'), null, 'disabled boot animation must leave the native loader untouched')
  disabledCalls.cleanups.splice(0).reverse().forEach(cleanup => cleanup())
})


test('mounts the visual shell when native boot finishes after startup fail-open', async t => {
  const api = await load('../src/client/index.js')
  const bootFixture = fixture.replace('<body>', '<body><div data-dsh-boot><span data-dsh-boot-spinner></span></div>')
  const dom = new JSDOM(bootFixture, { url: 'http://localhost/', pretendToBeVisual: true })
  dom.window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} })
  dom.window.localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
    version: 2, enabled: true, scheme: 'dark',  texture: 'full', motion: 'reduced', density: 'tactical', panelOpen: true, bootAnimation: true,
  }))
  const calls = { cleanups: [], injected: [], registrations: [] }
  t.after(() => calls.cleanups.splice(0).reverse().forEach(cleanup => cleanup()))

  api.applyPrtsPlugin(createCtx(calls), {
    document: dom.window.document,
    window: dom.window,
    React: { createElement() {} },
    defineStore: spec => spec,
    cssText: 'html[data-dsh-prts]{}',
    assets: {},
    startupTimings: {
      timeout: 10,
      timeoutHold: 10,
      reducedExit: 5,
      completePadding: 1,
      watchdog: 80,
    },
  })

  const nativeLoader = dom.window.document.querySelector('[data-dsh-boot]')
  await new Promise(resolve => dom.window.setTimeout(resolve, 120))
  assert.equal(dom.window.document.querySelector('[data-prts-startup]'), null, 'startup overlay should fail open')
  assert.equal(dom.window.document.querySelector('[data-prts-shell]'), null, 'visual shell must still wait for native boot')

  nativeLoader.remove()
  await new Promise(resolve => dom.window.setTimeout(resolve, 80))
  assert.equal(dom.window.document.querySelectorAll('[data-prts-shell]').length, 1)
})

test('disabling the theme disconnects every visual mutation observer', async t => {
  const api = await load('../src/client/index.js')
  const dom = new JSDOM(fixture, { url: 'http://localhost/', pretendToBeVisual: true })
  dom.window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} })
  dom.window.localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
    version: 1, enabled: true, scheme: 'dark',  texture: 'full', motion: 'reduced', density: 'tactical', panelOpen: true,
  }))
  const NativeObserver = dom.window.MutationObserver
  const observers = []
  dom.window.MutationObserver = class extends NativeObserver {
    constructor(callback) {
      super(callback)
      observers.push(this)
    }
    observe(...args) {
      this.active = true
      return super.observe(...args)
    }
    disconnect() {
      this.active = false
      return super.disconnect()
    }
  }
  const calls = { cleanups: [], injected: [], registrations: [] }
  t.after(() => calls.cleanups.splice(0).reverse().forEach(cleanup => cleanup()))
  api.applyPrtsPlugin(createCtx(calls), { document: dom.window.document, window: dom.window, React: { createElement() {} }, defineStore: spec => spec, cssText: 'html[data-dsh-prts]{}', assets: {} })
  assert.ok(observers.filter(observer => observer.active).length >= 2)

  const [settings] = calls.registrations.find(([value]) => value.id === 'prts-appearance')
  const actions = settings.inject({ sync() {} })
  actions.updatePreference('enabled', false)

  assert.equal(observers.filter(observer => observer.active).length, 0)
})

test('safe mode keeps the plugin settings tab but blocks every visual mount', async () => {
  const api = await load('../src/client/index.js')
  assert.ok(api, 'client assembly module should exist')
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', { url: 'http://localhost/?prts-safe=1' })
  const enabled = { version: 1, enabled: true, scheme: 'dark',  texture: 'full', motion: 'full', density: 'tactical', panelOpen: true }
  dom.window.localStorage.setItem('dsh.ui.prts.v1', JSON.stringify(enabled))
  const calls = { cleanups: [], injected: [], registrations: [] }
  api.applyPrtsPlugin(createCtx(calls), { document: dom.window.document, window: dom.window, React: { createElement() {} }, defineStore: spec => spec, cssText: 'html[data-dsh-prts]{}', assets: {} })
  assert.deepEqual(calls.injected, ['settings.plugins.tab'])
  assert.equal(calls.registrations[0][0].id, 'prts-appearance')
  assert.equal(dom.window.document.documentElement.hasAttribute('data-dsh-prts'), false)
  assert.ok(dom.window.document.querySelector('[data-plugin-css="dsh-theme-prts/prts.css"]'))
  assert.equal(dom.window.document.documentElement.hasAttribute('data-dsh-prts-settings'), true)
  assert.equal(dom.window.document.querySelector('[data-prts-shell]'), null)
})

test('Rhodes mark overlay owns the complete visual controls without retired options', async () => {
  const api = await load('../src/client/theme-settings-workbench.js')
  const dom = new JSDOM(`<!doctype html><body>${api.themeSettingsMarkup()}</body>`)
  const document = dom.window.document
  assert.equal(document.querySelector('[data-prts-theme-settings]').tagName, 'DIALOG')
  assert.equal(document.querySelectorAll('[data-prts-preset-card]').length, 3)
  assert.equal(document.querySelectorAll('[data-prts-settings-group]').length, 0)
  assert.ok(document.querySelector('[data-prts-settings-common]'))
  assert.equal(document.querySelector('[data-prts-settings-diagnostic]'), null)
  assert.equal(document.querySelectorAll('[data-prts-option-sample="texture"]').length, 3)
  assert.equal(document.querySelectorAll('[data-prts-option-sample="glass"]').length, 4)
  assert.equal(document.querySelectorAll('[data-prts-setting-row="motion"] [data-prts-option-sample]').length, 0)
  assert.equal(document.querySelectorAll('[data-prts-setting-row="dossier"] [data-prts-option-sample]').length, 0)
  const advanced = document.querySelector('[data-prts-settings-advanced]')
  assert.equal(document.querySelector('[data-prts-custom-state]'), null)
  assert.ok(advanced)
  assert.equal(advanced.open, false)
  assert.equal(document.querySelectorAll('[data-prts-setting-key="particleDetail"]').length, 3)
  assert.equal(document.querySelectorAll('[data-prts-setting-key="conversationParticleDensity"]').length, 0)
  assert.equal(document.querySelectorAll('[data-prts-setting-key="heroParticleDensity"]').length, 0)
  assert.equal(document.querySelectorAll('[data-prts-setting-key="particlePattern"]').length, 0)
  assert.equal(document.querySelectorAll('[data-prts-setting-key="glass"]').length, 4)
  assert.equal(document.querySelectorAll('[data-prts-setting-key="motion"]').length, 2)
  assert.equal(document.querySelectorAll('[data-prts-setting-key="railDefaultHidden"]').length, 2)
  assert.equal(document.querySelector('[data-prts-setting-row="railDefaultHidden"] [data-prts-setting-note]').textContent,
    '在任意窗口宽度下默认收起 P.R.T.S. 导航，可从左侧按钮临时展开')
  assert.equal(document.querySelectorAll('[data-prts-setting-key="dossier"]').length, 0)
  assert.equal(document.querySelectorAll('[data-prts-setting-key="bootAnimation"]').length, 0)
  assert.equal(document.querySelectorAll('[data-prts-preview-startup]').length, 0)
  assert.equal(document.querySelectorAll('[data-prts-reset-group]').length, 0)
  assert.equal(document.querySelectorAll('[data-prts-reset-visual]').length, 1)
  assert.equal(document.querySelectorAll('[data-prts-reset-confirm]').length, 1)
  assert.equal(document.querySelectorAll('[data-prts-retry-save]').length, 1)
  assert.equal(document.querySelectorAll('[data-prts-setting-key="conversationScaleMaxDistance"]').length, 0)
  assert.equal(document.querySelectorAll('[data-prts-setting-key="conversationScaleFocusContrast"]').length, 0)
  const traversalSpeed = document.querySelector('[data-prts-setting-range][data-prts-setting-key="particleTraversalSpeed"]')
  assert.equal(traversalSpeed.min, '0')
  assert.equal(traversalSpeed.max, '2')
  assert.equal(traversalSpeed.step, '0.25')
  assert.equal(traversalSpeed.value, '1')
  assert.equal(document.querySelector('[data-prts-particle-traversal-output]').textContent, '1× · 每 1 个视口重组')
  assert.equal(document.querySelector('[data-prts-setting-key="glassEnabled"]'), null)
  assert.equal(document.querySelector('[data-prts-setting-key="glassHighlight"]'), null)
  assert.equal(document.querySelector('[data-prts-particle-status]'), null)
  assert.equal(document.querySelector('[data-prts-particle-error]').hidden, true)
  assert.ok(document.querySelector('[data-prts-transparency-status]'))
  assert.ok(document.querySelector('[data-prts-effective-motion]'))
  assert.ok(document.querySelector('[data-prts-setting-row="glass"] [data-prts-transparency-status]'))
  assert.ok(document.querySelector('[data-prts-setting-row="motion"] [data-prts-effective-motion]'))
  assert.equal(document.querySelectorAll('[data-prts-scale-calibration]').length, 0)
  assert.match(advanced.querySelector('summary').textContent, /粒子效果/)
  assert.ok(document.querySelector('[data-prts-persistence-status]'))
})


test('particle traversal speed previews live and persists only when range interaction completes', async () => {
  const api = await load('../src/client/theme-settings-workbench.js')
  const dom = new JSDOM(`<!doctype html><html><body>
    <button type="button" data-trigger></button>
    ${api.themeSettingsMarkup()}
  </body></html>`, { pretendToBeVisual: true })
  dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
  const { document } = dom.window
  const previews = []
  const updates = []
  const overlay = api.createThemeSettingsOverlay({
    document,
    trigger: document.querySelector('[data-trigger]'),
    panel: document.querySelector('[data-prts-theme-settings]'),
    backdrop: document.querySelector('[data-prts-settings-backdrop]'),
    onPreferencePreview(key, value) { previews.push([key, value]) },
    onPreferenceChange(key, value) { updates.push([key, value]) },
  })
  overlay.update({
    preset: 'standard-tactical',
    conversationParticleDensity: 'sparse',
    heroParticleDensity: 'light',
    particleTraversalSpeed: 1,
  }, {})
  overlay.open()

  const range = document.querySelector('[data-prts-setting-range][data-prts-setting-key="particleTraversalSpeed"]')
  range.value = '0.25'
  range.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
  assert.deepEqual(previews, [['particleTraversalSpeed', 0.25]])
  assert.deepEqual(updates, [])
  assert.equal(document.querySelector('[data-prts-particle-traversal-output]').textContent, '0.25× · 每 4 个视口重组')

  range.dispatchEvent(new dom.window.Event('change', { bubbles: true }))
  assert.deepEqual(updates, [['particleTraversalSpeed', 0.25]])
  overlay.update({
    preset: 'standard-tactical',
    conversationParticleDensity: 'sparse',
    heroParticleDensity: 'light',
    particleTraversalSpeed: 0.25,
  }, {})

  range.value = '0'
  range.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
  assert.equal(document.querySelector('[data-prts-particle-traversal-output]').textContent, '0× · 静止 / 不重组')
  overlay.close()
  assert.deepEqual(updates.at(-1), ['particleTraversalSpeed', 0])
  overlay.dispose()
})

test('workbench uses inline reset confirmation and exposes persistence recovery', async () => {
  const api = await load('../src/client/theme-settings-workbench.js')
  const dom = new JSDOM(`<!doctype html><html><body>
    <button type="button" data-trigger></button>
    ${api.themeSettingsMarkup()}
  </body></html>`, { pretendToBeVisual: true })
  dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
  const { document } = dom.window
  const calls = { opened: 0, reset: 0, retries: 0, updates: [] }
  const trigger = document.querySelector('[data-trigger]')
  const panel = document.querySelector('[data-prts-theme-settings]')
  const backdrop = document.querySelector('[data-prts-settings-backdrop]')
  const overlay = api.createThemeSettingsOverlay({
    document,
    trigger,
    panel,
    backdrop,
    onOpen() { calls.opened += 1 },
    onPreferenceChange(...args) { calls.updates.push(args) },
    onResetVisual() { calls.reset += 1 },
    onRetrySave() { calls.retries += 1 },
  })

  overlay.update({
    enabled: true,
    preset: 'standard-tactical',

    texture: 'full',
    glass: 'standard',
    motion: 'system',
    bootAnimation: false,
    railDefaultHidden: false,
    conversationParticleDensity: 'sparse',
    heroParticleDensity: 'light',
  }, {}, { phase: 'error', revision: 1 })

  trigger.click()
  assert.equal(calls.opened, 1)
  assert.equal(panel.hasAttribute('open'), true)
  assert.equal(panel.hasAttribute('data-prts-dialog-fallback'), true)
  assert.equal(backdrop.hidden, false)
  assert.equal(document.querySelector('[data-prts-persistence-error]').hidden, false)
  assert.equal(document.querySelector('[data-prts-persistence-status]').hidden, true)

  const textureOff = document.querySelector('[data-prts-setting-key="texture"][data-prts-setting-value="off"]')
  textureOff.click()
  assert.deepEqual(calls.updates, [['texture', 'off']])
  assert.equal(textureOff.hasAttribute('data-prts-setting-feedback'), true)
  const railHiddenOff = document.querySelector('[data-prts-setting-key="railDefaultHidden"][data-prts-setting-value="false"]')
  const railHiddenOn = document.querySelector('[data-prts-setting-key="railDefaultHidden"][data-prts-setting-value="true"]')
  assert.equal(railHiddenOff.classList.contains('is-selected'), true)
  railHiddenOn.click()
  assert.deepEqual(calls.updates, [['texture', 'off'], ['railDefaultHidden', true]])
  assert.equal(panel.hasAttribute('open'), true)
  assert.equal(railHiddenOn.hasAttribute('data-prts-setting-feedback'), true)
  document.querySelector('[data-prts-retry-save]').click()
  assert.equal(calls.retries, 1)

  const reset = document.querySelector('[data-prts-reset-visual]')
  const confirmation = document.querySelector('[data-prts-reset-confirm]')
  reset.click()
  assert.equal(calls.reset, 0)
  assert.equal(reset.hidden, true)
  assert.equal(confirmation.hidden, false)
  document.querySelector('[data-prts-reset-cancel]').click()
  assert.equal(reset.hidden, false)
  reset.click()
  document.querySelector('[data-prts-reset-confirm-action]').click()
  assert.equal(calls.reset, 1)

  document.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  assert.equal(panel.hasAttribute('open'), false)
  assert.equal(document.activeElement, trigger)
  overlay.dispose()
})

test('workbench prefers the native modal top layer when available', async () => {
  const api = await load('../src/client/theme-settings-workbench.js')
  const dom = new JSDOM(`<!doctype html><html><body><button data-trigger></button>${api.themeSettingsMarkup()}</body></html>`)
  dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
  const { document } = dom.window
  const panel = document.querySelector('[data-prts-theme-settings]')
  let modalCalls = 0
  panel.showModal = () => { modalCalls += 1; panel.setAttribute('open', '') }
  panel.close = () => panel.removeAttribute('open')
  const overlay = api.createThemeSettingsOverlay({
    document,
    trigger: document.querySelector('[data-trigger]'),
    panel,
    backdrop: document.querySelector('[data-prts-settings-backdrop]'),
  })
  overlay.update({}, {})
  overlay.open()
  assert.equal(modalCalls, 1)

  assert.equal(panel.hasAttribute('data-prts-dialog-fallback'), false)
  assert.equal(document.querySelector('[data-prts-settings-backdrop]').hidden, true)
  overlay.close()
  assert.equal(panel.hasAttribute('open'), false)
  overlay.dispose()
})

test('workbench keeps system overrides contextual and success feedback transient', async () => {
  const api = await load('../src/client/theme-settings-workbench.js')
  const dom = new JSDOM(`<!doctype html><html><body>
    <button type="button" data-trigger></button>
    ${api.themeSettingsMarkup()}
  </body></html>`, { pretendToBeVisual: true })
  dom.window.matchMedia = query => ({
    matches: query.includes('prefers-reduced'),
    addEventListener() {},
    removeEventListener() {},
  })
  const { document } = dom.window
  const overlay = api.createThemeSettingsOverlay({
    document,
    trigger: document.querySelector('[data-trigger]'),
    panel: document.querySelector('[data-prts-theme-settings]'),
    backdrop: document.querySelector('[data-prts-settings-backdrop]'),
  })

  overlay.update({
    preset: 'standard-tactical',

    texture: 'full',
    glass: 'standard',
    motion: 'system',
    conversationParticleDensity: 'light',
    heroParticleDensity: 'standard',
  }, {}, { phase: 'saved', revision: 1 })

  assert.equal(document.querySelector('[data-prts-effective-motion]').hidden, false)
  assert.equal(document.querySelector('[data-prts-transparency-status]').hidden, false)
  assert.equal(document.querySelector('[data-prts-persistence-status]').hidden, false)
  assert.equal(document.querySelector('[data-prts-persistence-status]').textContent, '已保存')

  overlay.update({
    preset: 'custom',

    texture: 'off',
    glass: 'off',
    motion: 'reduced',
    conversationParticleDensity: 'light',
    heroParticleDensity: 'standard',
  }, {}, { phase: 'error', revision: 2 })

  assert.equal(document.querySelector('[data-prts-effective-motion]').hidden, true)
  assert.equal(document.querySelector('[data-prts-transparency-status]').hidden, true)
  assert.equal(document.querySelector('[data-prts-persistence-status]').hidden, true)
  assert.equal(document.querySelector('[data-prts-persistence-error]').hidden, false)
  overlay.dispose()
})
