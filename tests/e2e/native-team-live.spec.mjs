import { expect, test } from '@playwright/test'

test.use({ locale: 'zh-CN', storageState: process.env.PRTS_RC022_STATE || undefined })
test.beforeEach(async ({ page }) => {
  test.skip(!process.env.PRTS_RC022_STATE, 'Requires authenticated local 0.2.2 storage state')
  test.setTimeout(60_000)
  await page.addInitScript(() => {
    let facade
    const wrapped = new WeakSet()
    Object.defineProperty(window, '__ModuleLoader__', {
      configurable: true,
      get: () => facade,
      set(value) {
        facade = value
        let load = value.load
        Object.defineProperty(value, 'load', {
          configurable: true,
          get: () => registration => {
            if (registration.id === '@ash-qw/dsh-theme-prts' && !registration.chunk && !wrapped.has(registration)) {
              wrapped.add(registration)
              const factory = registration.factory
              registration.factory = require => {
                const exports = factory(require)
                window.__prtsNativeRequire = require
                return exports
              }
            }
            return load.call(value, registration)
          },
          set(next) { load = next },
        })
      },
    })
  })
})

async function openProbe(page, scheme, width) {
  const errors = []
  const writes = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/api/settings/describe', async route => {
    const response = await route.fetch()
    const packet = await response.json()
    expect(packet.result?.ok).toBe(true)
    packet.result.value.writable = false
    for (const namespace of packet.result.value.namespaces) {
      if (namespace.ns === 'theme-prts') namespace.value = {
        ...namespace.value, enabled: true, preferencesInitialized: true, bootAnimation: false, motion: 'reduced',
      }
      if (namespace.ns === 'ui-theme') namespace.value = { ...namespace.value, preference: scheme }
    }
    return route.fulfill({ response, json: packet })
  })
  await page.route('**/api/settings/mutate', route => {
    writes.push(route.request().url())
    return route.abort('blockedbyclient')
  })
  await page.setViewportSize({ width, height: 560 })
  await page.goto(process.env.PRTS_LIVE_URL || 'http://127.0.0.1:3080')
  await expect.poll(() => page.evaluate(() => typeof window.__prtsNativeRequire), { timeout: 20_000 }).toBe('function')
  await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', scheme)
  await page.locator('[data-prts-startup]').waitFor({ state: 'hidden' })
  await page.evaluate(() => {
    const require = window.__prtsNativeRequire
    const React = require('react')
    const ReactDOM = require('react-dom')
    const registrations = new Map()
    const dictionaries = new Map()
    const noop = () => {}
    const translate = namespace => (key, params = {}) => {
      const text = dictionaries.get(namespace)?.zh[key]
      if (text === undefined) throw new Error(`Missing native translation: ${namespace}/${key}`)
      return text.replace(/\{(\w+)\}/g, (_match, name) => String(params[name] ?? ''))
    }
    const context = {
      effect: effect => effect(),
      inject: (_dependencies, callback) => callback(context),
      locale: { register: (namespace, value) => { dictionaries.set(namespace, value); return noop }, bind: translate },
      resources: { register: () => noop },
      sidebarRightTabs: { register: () => noop },
      slots: {
        inject: (_name, callback) => {
          const result = callback()
          if (result?.next) for (const _value of result) {}
          return noop
        },
        register: (registration, Component) => {
          registrations.set(registration.id ?? registration.key ?? registration.name, { ...registration, Component })
          registrations.set(`${registration.name}:${registration.id ?? registration.key ?? ''}`, { ...registration, Component })
          return noop
        },
        entries: () => [], subscribe: () => noop,
      },
    }
    require('@deepseek-ai/dsh-client-ui-subagent').apply(context)
    require('@deepseek-ai/dsh-client-ui-agent-team').apply(context)
    const stage = document.createElement('section')
    stage.dataset.nativeTeamProbe = ''
    stage.style.cssText = 'position:fixed;z-index:1200;top:20px;left:16px;right:16px;max-width:680px;color:var(--prts-ink);background:var(--prts-panel)'
    document.body.append(stage)
    const root = ReactDOM.createRoot(stage)
    const entries = [
      { id: 'probe-active', name: '分析员', label: '正在分析', mode: 'continuable' },
      { id: 'probe-done', label: '已完成记录', mode: 'one-shot' },
      { id: 'probe-inactive', name: '待续接', label: '等待继续', mode: 'continuable' },
      { id: 'probe-external', name: '外部任务', mode: 'external' },
      { id: 'probe-unknown', label: '模式未知记录', mode: 'unknown' },
    ]
    const tasks = [
      { id: 'pending', subject: '被依赖阻塞的任务', status: 'pending', ready: false, description: '等待前置任务。' },
      { id: 'active', subject: `窄屏长任务标题_${'long_task_'.repeat(14)}`, status: 'in_progress', ready: true,
        description: `长描述_${'description_'.repeat(30)}`, ownerName: '很长的负责人名称_'.repeat(12) },
      { id: 'done', subject: '已完成任务', status: 'completed', ready: true },
      { id: 'deleted', subject: '不可见的已删除任务', status: 'deleted', ready: true },
    ]
    const snapshot = {
      byId: Object.fromEntries(entries.map(entry => [entry.id, {
        origin: 'subagent', parentId: 'probe-root', running: entry.id === 'probe-active',
        projectionValues: {
          tokenUsage: { uncachedInputTokens: 1200, outputTokens: 300, cacheReadTokens: 0, cacheWriteTokens: 0 },
          subagentTiming: { settledMs: 12000, lastTurnCompleted: entry.id === 'probe-done' },
        },
      }])),
      projectionsBySession: {
        'probe-root': { state: 'ready', error: null, values: {
          subagentCatalog: entries, agentTeam: { enabled: true, tasks }, modelSelection: { lastUsed: 'probe-model' },
        } },
        'probe-active': { state: 'ready', error: null, values: {
          subagentCatalog: [{ id: 'probe-grandchild', mode: 'one-shot', label: '嵌套执行记录' }],
        } },
      },
    }
    const state = { opened: [], aside: [], prepared: [], disabled: [], selections: [], request: null, mode: 'catalog' }
    const listeners = new Set()
    let version = 0
    const subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener) }
    const changed = () => { version++; for (const listener of listeners) listener() }
    const useValue = selector => {
      React.useSyncExternalStore(subscribe, () => version)
      return selector(snapshot)
    }
    const session = { subagent: null }
    const statuses = new Map()
    const shared = {
      sessionId: 'probe-root',
      useSession: selector => { useValue(() => null); return selector(session) },
      useSessions: useValue,
      useProjection: (name, selector = value => value) => useValue(value => selector(value.projectionsBySession['probe-root'].values[name])),
      useSessionStatus: selector => selector(statuses),
      useFooterAvailable: selector => selector(true),
      openChild: address => state.opened.push(address),
      openChildAside: address => state.aside.push(address),
      prepareCatalog: async sessionId => { state.prepared.push(sessionId) },
      refreshProjection: sessionId => state.prepared.push(sessionId),
    }
    const element = (id, props = {}) => {
      const registration = registrations.get(id)
      if (!registration) throw new Error(`Missing native registration: ${id}`)
      return React.createElement(registration.Component, { ...shared, t: translate(registration.locale), ...props })
    }
    function Probe() {
      useValue(() => null)
      if (state.mode === 'catalog') return element('subagent-catalog', { renderSlot: () => element('agent-team') })
      if (state.mode === 'lineage') return element('conversation.session.header.lineage', {
        lineageSessionId: 'probe-inactive', displayTitle: '等待继续',
      })
      if (state.mode === 'readonly') return element('conversation.composer', { matched: { reason: state.reason } })
      if (state.mode === 'controls') return React.createElement(React.Fragment, null,
        element('conversation.input.model.options:agent-team', {
          locked: false, dismiss: noop, reportFailure: message => { throw new Error(message) },
          selectTeamMode: async enabled => { state.selections.push(enabled); return null },
          requestDisableConfirmation: () => { state.request = { sessionId: 'probe-root' }; changed() },
        }),
        element('agent-team.disable', {
          useDisableRequest: selector => { useValue(() => null); return selector(state.request) },
          cancelDisable: sessionId => { state.disabled.push(sessionId); state.request = null; changed() },
          disableTeam: async sessionId => { state.selections.push(sessionId); return '隔离验收失败信息' },
        }))
      if (state.mode === 'command') return element('team', { node: { outcome: state.outcome } })
      throw new Error(`Unknown probe mode: ${state.mode}`)
    }
    window.__prtsTeamProbe = state
    window.__prtsTeamRender = (mode, options = {}) => {
      state.mode = mode
      Object.assign(state, options)
      changed()
    }
    window.__prtsTeamCatalog = catalogState => {
      const projection = snapshot.projectionsBySession['probe-root']
      snapshot.projectionsBySession = { ...snapshot.projectionsBySession, 'probe-root': {
        ...projection, state: catalogState,
        error: catalogState === 'error' ? { message: '隔离目录读取失败' } : null,
        values: { ...projection.values, subagentCatalog: catalogState === 'ready' ? entries : [] },
      } }
      changed()
    }
    window.__prtsTeamSelectReadOnly = mode => registrations.get('conversation.composer').select({
      session: { subagent: { address: { parentSessionId: 'probe-root', childSessionId: 'probe-inactive', mode } } },
    })
    window.__prtsTeamFailure = () => {
      snapshot.projectionsBySession['probe-root'].values.agentTeam.failure = '隔离任务板错误'
      changed()
    }
    root.render(React.createElement(Probe))
    window.__prtsDisposeTeamProbe = () => { root.unmount(); stage.remove() }
  })
  return {
    errors, writes,
    stage: page.locator('[data-native-team-probe]'),
    panel: page.locator('[data-subagent-panel]'),
    dispose: () => page.evaluate(() => window.__prtsDisposeTeamProbe?.()),
  }
}

async function expectInsideViewport(locator) {
  const bounds = await locator.evaluate(node => {
    const rect = node.getBoundingClientRect()
    return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: innerWidth, height: innerHeight }
  })
  expect(bounds.left).toBeGreaterThanOrEqual(-1)
  expect(bounds.top).toBeGreaterThanOrEqual(-1)
  expect(bounds.right).toBeLessThanOrEqual(bounds.width + 1)
  expect(bounds.bottom).toBeLessThanOrEqual(bounds.height + 1)
}

async function expectTokenColor(locator, token, property = 'color') {
  const colors = await locator.evaluate((node, { token, property }) => {
    const sample = document.createElement('span')
    sample.style.color = `var(${token})`
    document.body.append(sample)
    const expected = getComputedStyle(sample).color
    sample.remove()
    return { actual: getComputedStyle(node)[property], expected }
  }, { token, property })
  expect(colors.actual).toBe(colors.expected)
}

for (const scheme of ['dark', 'light']) for (const width of [390, 1440]) {
  test(`native team board and subagent catalog (${scheme}, ${width}) @live-rc0222`, async ({ page }) => {
    const probe = await openProbe(page, scheme, width)
    try {
      const trigger = probe.stage.locator('[data-subagent-action] button[aria-haspopup="dialog"]')
      await trigger.click()
      await expect(probe.panel).toBeVisible()
      await expect(probe.panel).toHaveAttribute('data-prts-floating-glass', 'menu')
      await expect.poll(() => probe.panel.evaluate(node => getComputedStyle(node).backdropFilter)).toContain('blur(')
      await expect(probe.panel).toHaveCSS('border-radius', '4px')
      await expect(probe.panel.locator(':scope > [aria-hidden="true"][class*="_material_"]')).toHaveCSS('backdrop-filter', 'none')
      await expectInsideViewport(probe.panel)
      await expect(probe.panel.getByRole('treeitem', { level: 1 })).toHaveCount(5)
      await expect(probe.panel.getByRole('treeitem').filter({ hasText: '外部任务' })).toHaveAttribute('aria-disabled', 'true')
      await expect(probe.panel.locator('[data-team-task="deleted"]')).toHaveCount(0)
      await expect(probe.panel.locator('[data-team-task]')).toHaveCount(3)
      await expect(probe.panel.locator('[data-team-task="pending"] [data-state="warning"]')).toHaveCount(1)
      await expect(probe.panel.locator('[data-team-task="active"] [data-state="ongoing"]')).toHaveCount(1)
      await expect(probe.panel.locator('[data-team-task="done"] [data-state="done"]')).toHaveCount(1)
      await expectTokenColor(probe.panel.locator('[data-team-task="pending"] [data-state="warning"]'), '--dsw-alias-state-warn-primary')
      await expectTokenColor(probe.panel.locator('[data-team-task="done"] [data-state="done"]'), '--dsw-alias-state-success-primary')
      await probe.panel.locator('[data-team-task="active"] button').click()
      const details = probe.panel.locator('[data-team-task="active"] [data-team-task-details]')
      await expect(details).toBeVisible()
      expect(await details.evaluate(node => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1)
      await expectInsideViewport(probe.panel)
      await probe.panel.getByRole('button', { name: /展开.*正在分析/ }).click()
      await expect(probe.panel.getByRole('treeitem', { level: 2 })).toHaveCount(1)
      await probe.panel.getByRole('button', { name: '在侧边栏打开 等待继续', exact: true }).click()
      await expect(probe.panel).toHaveCount(0)
      expect(await page.evaluate(() => window.__prtsTeamProbe.aside)).toEqual([
        { parentSessionId: 'probe-root', childSessionId: 'probe-inactive', mode: 'continuable' },
      ])
      await page.evaluate(() => window.__prtsTeamRender('lineage'))
      await probe.stage.getByRole('button', { name: /等待继续/ }).press('ArrowDown')
      await expect(probe.panel.locator('[aria-current="true"]')).toContainText('等待继续')
      await expect(probe.panel.locator('[data-subagent-current]')).toHaveCount(1)
      await probe.panel.getByRole('treeitem').filter({ hasText: '已完成记录' }).press('Enter')
      expect(await page.evaluate(() => window.__prtsTeamProbe.opened)).toEqual([
        { parentSessionId: 'probe-root', childSessionId: 'probe-done', mode: 'one-shot' },
      ])
      await page.evaluate(() => window.__prtsTeamRender('catalog'))
      await trigger.click()
      await page.evaluate(() => window.__prtsTeamCatalog('loading'))
      await expect(probe.panel.getByRole('tree')).toContainText('正在加载')
      await page.evaluate(() => window.__prtsTeamCatalog('error'))
      await expect(probe.panel.getByRole('tree')).toContainText('隔离目录读取失败')
      await probe.panel.getByRole('button', { name: '重试' }).click()
      await page.evaluate(() => window.__prtsTeamCatalog('ready'))
      await expect(probe.panel.getByRole('treeitem', { level: 1 })).toHaveCount(5)
      await page.evaluate(() => window.__prtsTeamFailure())
      await expect(probe.panel.getByRole('alert')).toContainText('隔离任务板错误')
      await expectTokenColor(probe.panel.getByRole('alert'), '--dsw-alias-state-error-primary')
      await probe.panel.press('Escape')
      await expect(trigger).toBeFocused()
      expect(probe.errors).toEqual([])
      expect(probe.writes).toEqual([])
    } finally { await probe.dispose() }
  })

  test(`native read-only subagent and team command (${scheme}, ${width}) @live-rc0222`, async ({ page }) => {
    const probe = await openProbe(page, scheme, width)
    try {
      for (const [mode, reason] of [['one-shot', 'one-shot'], ['unknown', 'unknown'], ['continuable', null]]) {
        expect(await page.evaluate(mode => window.__prtsTeamSelectReadOnly(mode), mode)).toEqual(reason === null ? null : { reason })
        if (reason === null) continue
        await page.evaluate(reason => window.__prtsTeamRender('readonly', { reason }), reason)
        const notice = probe.stage.getByRole('status')
        await expect(notice).toBeVisible()
        await expect(notice).toContainText(reason === 'one-shot' ? '一次性子智能体记录' : '暂时只读')
        expect(await notice.evaluate(node => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1)
        await expectInsideViewport(notice)
        await expectTokenColor(notice.locator('strong'), '--prts-ink')
        await expectTokenColor(notice, '--prts-panel', 'backgroundColor')
      }
      await page.evaluate(() => window.__prtsTeamRender('command', { outcome: null }))
      await expect(probe.stage.locator('[data-team-command]')).toHaveAttribute('aria-busy', 'true')
      await page.evaluate(() => window.__prtsTeamRender('command', { outcome: { kind: 'error', text: '隔离命令失败\n保留完整错误详情' } }))
      const command = probe.stage.locator('[data-team-command]')
      await expect(command).toHaveAttribute('data-state', 'error')
      await command.getByRole('button').click()
      await expect(command.locator('pre')).toHaveText('隔离命令失败\n保留完整错误详情')
      expect(probe.errors).toEqual([])
      expect(probe.writes).toEqual([])
    } finally { await probe.dispose() }
  })

  test(`native team disable confirmation (${scheme}, ${width}) @live-rc0222`, async ({ page }) => {
    const probe = await openProbe(page, scheme, width)
    try {
      await page.evaluate(() => window.__prtsTeamRender('controls'))
      const toggle = probe.stage.getByRole('switch', { name: '启用智能体团队协作', exact: true })
      await expect(toggle).toBeChecked()
      await toggle.click()
      const dialog = page.getByRole('dialog', { name: '确认停用智能体团队协作？', exact: true })
      await expect(dialog).toHaveAttribute('data-prts-floating-glass', 'dialog')
      await expectInsideViewport(dialog)
      await expect(dialog.getByRole('button', { name: '取消', exact: true })).toBeFocused()
      await dialog.getByRole('button', { name: '确认停用', exact: true }).click()
      await expect(dialog.getByRole('alert')).toContainText('隔离验收失败信息')
      await expect(toggle).toBeChecked()
      expect(await page.evaluate(() => window.__prtsTeamProbe.selections)).toEqual(['probe-root'])
      await dialog.getByRole('button', { name: '取消', exact: true }).click()
      await expect(dialog).toHaveCount(0)
      expect(await page.evaluate(() => window.__prtsTeamProbe.disabled)).toEqual(['probe-root'])
      expect(probe.errors).toEqual([])
      expect(probe.writes).toEqual([])
    } finally { await probe.dispose() }
  })
}
