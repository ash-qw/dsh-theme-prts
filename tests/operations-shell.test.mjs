import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { JSDOM } from 'jsdom'
import test from 'node:test'
import { createRc7Adapter } from '../src/client/rc7-adapter.js'
import { createOperationsShell } from '../src/client/operations-shell-v2.js'

const fixture = await readFile(new URL('./fixtures/rc7-harness.html', import.meta.url), 'utf8')
const enabled = { version: 9, enabled: true, preset: 'standard-tactical', texture: 'full', glass: 'standard', motion: 'reduced', bootAnimation: true, railDefaultHidden: false, conversationStyle: 'deck-chat' }
const status = { connection: 'connected', connectionLabel: '已连接' }

test('updates responsive shell state only at the navigation breakpoint', async () => {
  const source = await readFile(new URL('../src/client/operations-shell-v2.js', import.meta.url), 'utf8')
  assert.match(source, /matchMedia\?\.\('\(min-width: 1180px\)'\)/)
  assert.doesNotMatch(source, /max-width: 1024px/)
  assert.doesNotMatch(source, /window\.addEventListener\('resize'/)
})

test('mounts the shell without an operator dossier and restores the host', async t => {
  const dom = new JSDOM(fixture, { url: 'http://localhost/session/op-06', pretendToBeVisual: true })
  Object.defineProperty(dom.window, 'innerWidth', { configurable: true, value: 800 })
  const mediaQueries = []
  dom.window.matchMedia = query => {
    const listeners = new Set()
    const result = {
      media: query,
      get matches() { return query.includes('min-width: 1180px') && dom.window.innerWidth >= 1180 },
      addEventListener(type, listener) { if (type === 'change') listeners.add(listener) },
      removeEventListener(type, listener) { if (type === 'change') listeners.delete(listener) },
      dispatch() {
        const event = { matches: result.matches, media: query }
        for (const listener of listeners) listener(event)
      },
    }
    mediaQueries.push(result)
    return result
  }
  const document = dom.window.document
  document.documentElement.dataset.prtsScheme = 'dark'
  const schemeToggles = []
  const schemeInteractions = []
  const schemeDrags = []
  const preferenceUpdates = []
  let disabled = 0
  let geometryFrame
  let geometryDisposed = 0
  const hostGeometry = {
    start(frame) {
      geometryFrame = frame
      return true
    },
    dispose() {
      if (geometryFrame) geometryDisposed += 1
      geometryFrame = undefined
    },
  }
  const shell = createOperationsShell({
    document,
    window: dom.window,
    assets: { emblem: '<svg></svg>' },
    adapter: createRc7Adapter({ document }),
    hostGeometry,
    onSchemeToggle(current, interaction) {
      schemeToggles.push(current)
      schemeInteractions.push(interaction)
    },
    onSchemeDragStart(current, interaction) {
      const record = { current, interaction, updates: [], commits: [], cancelled: 0 }
      schemeDrags.push(record)
      return {
        update(progress) { record.updates.push(progress) },
        finish(commit) {
          record.commits.push(commit)
          return Promise.resolve(current)
        },
        cancel() { record.cancelled += 1 },
      }
    },
    onThemeDisable: () => { disabled += 1 },
    onPreferenceChange: (...args) => preferenceUpdates.push(args),
  })
  t.after(() => shell.dispose())

  shell.update(enabled, status)
  shell.update(enabled, status)

  assert.equal(document.querySelectorAll('[data-prts-nav-rail]').length, 1)
  assert.equal(document.querySelector('[data-prts-details-toggle]'), null)
  assert.equal(document.querySelector('[data-prts-dossier-overlay]'), null)
  assert.equal(document.querySelector('[data-prts-runtime-model]'), null)
  assert.equal(geometryFrame, document.querySelector('[data-prts-region="frame"]'))
  for (const region of ['frame', 'sessions', 'operation', 'details']) {
    assert.ok(document.querySelector('[data-prts-region="' + region + '"]'))
  }
  assert.equal(document.querySelector('[data-slot="details"]').children.length, 0)
  assert.equal(document.querySelector('[data-prts-connection-label]').textContent, '已连接')
  assert.equal(document.querySelector('[data-prts-connection-indicator]').dataset.state, 'connected')

  const schemeToggle = document.querySelector('[data-prts-scheme-toggle]')
  assert.equal(schemeToggle.parentElement.hasAttribute('data-prts-nav-bottom'), true)
  assert.equal(schemeToggle.dataset.prtsSchemeCurrent, 'dark')
  schemeToggle.getBoundingClientRect = () => ({ left: 10, top: 20, width: 40, height: 60 })
  schemeToggle.click()
  assert.deepEqual(schemeToggles, ['light'])
  assert.deepEqual(schemeInteractions[0].origin, { x: 30, y: 50 })
  assert.equal('ready' in schemeInteractions[0], false)
  assert.equal(schemeToggle.hasAttribute('data-prts-scheme-press'), true)
  await new Promise(resolve => dom.window.setTimeout(resolve, 0))

  schemeToggle.dispatchEvent(new dom.window.MouseEvent('pointerdown', { clientX: 30, clientY: 50, button: 0, bubbles: true }))
  schemeToggle.dispatchEvent(new dom.window.MouseEvent('pointermove', { clientX: 500, clientY: 52, buttons: 1, bubbles: true, cancelable: true }))
  schemeToggle.dispatchEvent(new dom.window.MouseEvent('pointerup', { clientX: 500, clientY: 52, button: 0, bubbles: true }))
  schemeToggle.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
  assert.equal(schemeDrags.length, 1)
  assert.equal(schemeDrags[0].current, 'light')
  assert.deepEqual(schemeDrags[0].interaction.origin, { x: 30, y: 50 })
  assert.equal(schemeDrags[0].updates.at(-1), .625)
  assert.deepEqual(schemeDrags[0].commits, [true])
  assert.deepEqual(schemeToggles, ['light'])

  document.querySelector('[data-prts-theme-disable]').click()
  assert.equal(disabled, 1)

  const launcher = document.querySelector('[data-prts-rail-launcher]')
  const navRail = document.querySelector('[data-prts-nav-rail]')
  assert.equal(document.documentElement.dataset.prtsRailMode, 'overlay')
  assert.equal(navRail.getAttribute('aria-hidden'), 'true')
  launcher.click()
  await new Promise(resolve => dom.window.setTimeout(resolve, 24))
  assert.equal(document.documentElement.hasAttribute('data-prts-rail-open'), true)
  schemeToggle.click()
  assert.deepEqual(schemeToggles, ['light', 'light'])
  assert.equal(document.documentElement.hasAttribute('data-prts-rail-open'), true)

  const brand = document.querySelector('[data-prts-rail-brand]')
  brand.click()
  assert.equal(brand.getAttribute('aria-expanded'), 'true')
  assert.equal(document.documentElement.hasAttribute('data-prts-rail-open'), true)
  assert.equal(document.querySelectorAll('[data-prts-setting-key="dossier"]').length, 0)
  assert.equal(preferenceUpdates.length, 0)
  const settingsPanel = document.querySelector('[data-prts-theme-settings]')
  settingsPanel.querySelector('[data-prts-setting-key="texture"][data-prts-setting-value="off"]').click()
  settingsPanel.querySelector('[data-prts-setting-key="conversationStyle"][data-prts-setting-value="native"]').click()
  assert.deepEqual(preferenceUpdates, [['texture', 'off'], ['conversationStyle', 'native']])
  assert.equal(document.documentElement.hasAttribute('data-prts-rail-open'), true)
  document.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  assert.equal(brand.getAttribute('aria-expanded'), 'false')
  assert.equal(document.documentElement.hasAttribute('data-prts-rail-open'), false)
  launcher.click()
  await new Promise(resolve => dom.window.setTimeout(resolve, 24))
  brand.click()
  assert.equal(document.documentElement.hasAttribute('data-prts-rail-open'), true)
  settingsPanel.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
  assert.equal(brand.getAttribute('aria-expanded'), 'false')
  assert.equal(document.documentElement.hasAttribute('data-prts-rail-open'), false)

  launcher.click()
  await new Promise(resolve => dom.window.setTimeout(resolve, 24))
  document.querySelector('[data-prts-region="operation"]').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
  assert.equal(document.documentElement.hasAttribute('data-prts-rail-open'), false)

  Object.defineProperty(dom.window, 'innerWidth', { configurable: true, value: 1440 })
  for (const query of mediaQueries) query.dispatch()
  assert.equal(document.documentElement.dataset.prtsRailMode, 'docked')
  assert.equal(navRail.hasAttribute('aria-hidden'), false)

  shell.update({ ...enabled, railDefaultHidden: true }, status)
  assert.equal(document.documentElement.hasAttribute('data-prts-rail-default-hidden'), true)
  assert.equal(document.documentElement.dataset.prtsRailMode, 'overlay')
  assert.equal(navRail.getAttribute('aria-hidden'), 'true')
  assert.equal(launcher.getAttribute('aria-expanded'), 'false')

  launcher.click()
  await new Promise(resolve => dom.window.setTimeout(resolve, 24))
  assert.equal(document.documentElement.hasAttribute('data-prts-rail-open'), true)
  Object.defineProperty(dom.window, 'innerWidth', { configurable: true, value: 1000 })
  for (const query of mediaQueries) query.dispatch()
  assert.equal(document.documentElement.dataset.prtsRailMode, 'overlay')
  assert.equal(document.documentElement.hasAttribute('data-prts-rail-open'), false)

  Object.defineProperty(dom.window, 'innerWidth', { configurable: true, value: 1440 })
  for (const query of mediaQueries) query.dispatch()
  assert.equal(document.documentElement.dataset.prtsRailMode, 'overlay')
  assert.equal(navRail.getAttribute('aria-hidden'), 'true')
  shell.update(enabled, status)
  assert.equal(document.documentElement.dataset.prtsRailMode, 'docked')
  assert.equal(document.documentElement.hasAttribute('data-prts-rail-default-hidden'), false)

  shell.dispose()
  assert.equal(document.querySelector('[data-prts-shell]'), null)
  assert.equal(document.querySelector('[data-prts-region]'), null)
  assert.equal(document.documentElement.hasAttribute('data-prts-rail-mode'), false)
  assert.equal(document.documentElement.hasAttribute('data-prts-rail-open'), false)
  assert.equal(geometryDisposed, 1)
})

test('requires a held downward swipe on coarse phones while preserving keyboard activation', async t => {
  const dom = new JSDOM(fixture, { url: 'http://localhost/session/op-06', pretendToBeVisual: true })
  Object.defineProperty(dom.window, 'innerWidth', { configurable: true, value: 390 })
  dom.window.matchMedia = query => ({
    media: query,
    matches: query.includes('pointer: coarse') || query.includes('hover: none'),
    addEventListener() {},
    removeEventListener() {},
  })
  const document = dom.window.document
  const shell = createOperationsShell({
    document,
    window: dom.window,
    adapter: createRc7Adapter({ document }),
  })
  t.after(() => shell.dispose())
  shell.update(enabled, status)

  const root = document.documentElement
  const launcher = document.querySelector('[data-prts-rail-launcher]')
  const pointer = (type, { x = 4, y = 300, detail = 0 } = {}) => {
    const event = new dom.window.MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      button: 0,
      clientX: x,
      clientY: y,
      detail,
    })
    Object.defineProperty(event, 'pointerId', { value: 7 })
    return event
  }

  assert.equal(launcher.getAttribute('aria-label'), '长按并向下滑动打开 P.R.T.S. 导航')
  launcher.dispatchEvent(pointer('click', { detail: 1 }))
  assert.equal(root.hasAttribute('data-prts-rail-open'), false, 'a coarse pointer tap is ignored')

  launcher.dispatchEvent(pointer('pointerdown'))
  launcher.dispatchEvent(pointer('pointermove', { y: 309 }))
  assert.equal(launcher.hasAttribute('data-prts-rail-gesture-active'), false, 'movement before the hold threshold cancels recognition')

  launcher.dispatchEvent(pointer('pointerdown'))
  await new Promise(resolve => dom.window.setTimeout(resolve, 360))
  assert.equal(launcher.hasAttribute('data-prts-rail-gesture-active'), true)
  launcher.dispatchEvent(pointer('pointermove', { y: 332 }))
  assert.equal(launcher.hasAttribute('data-prts-rail-gesture-ready'), true)
  launcher.dispatchEvent(pointer('pointerup', { y: 332 }))
  assert.equal(root.hasAttribute('data-prts-rail-open'), true)
  assert.equal(launcher.hasAttribute('data-prts-rail-gesture-active'), false)

  document.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  assert.equal(root.hasAttribute('data-prts-rail-open'), false)
  launcher.dispatchEvent(pointer('click'))
  assert.equal(root.hasAttribute('data-prts-rail-open'), true, 'keyboard-generated click remains available')
})

test('leaves foreign details content and host sidebar geometry under host control', async t => {
  const dom = new JSDOM(fixture, { url: 'http://localhost/', pretendToBeVisual: true })
  dom.window.matchMedia = () => ({ addEventListener() {}, removeEventListener() {} })
  const document = dom.window.document
  const detailsSlot = document.querySelector('[data-slot="details"]')
  const detailsRegion = detailsSlot.parentElement
  const frame = document.querySelector('[data-slot="root"] > :first-child')
  const foreignPanel = document.createElement('section')
  foreignPanel.dataset.plugin = 'foreign-details-plugin'
  foreignPanel.textContent = 'Foreign plugin panel'
  detailsSlot.appendChild(foreignPanel)
  const originalColumns = frame.style.gridTemplateColumns
  const originalWidth = detailsRegion.style.width
  const shell = createOperationsShell({
    document,
    window: dom.window,
    adapter: createRc7Adapter({ document }),
  })
  t.after(() => shell.dispose())

  shell.update(enabled, status)
  assert.equal(detailsSlot.firstElementChild, foreignPanel)
  assert.equal(frame.style.gridTemplateColumns, originalColumns)
  assert.equal(detailsRegion.style.width, originalWidth)
  assert.equal(document.querySelector('[data-prts-dossier-overlay]'), null)

  frame.style.gridTemplateColumns = '280px minmax(0px, 1fr) 320px'
  detailsRegion.style.width = '320px'
  await new Promise(resolve => dom.window.setTimeout(resolve, 0))
  assert.equal(frame.style.gridTemplateColumns, '280px minmax(0px, 1fr) 320px')
  assert.equal(detailsRegion.style.width, '320px')
  assert.equal(detailsSlot.firstElementChild, foreignPanel)
})
