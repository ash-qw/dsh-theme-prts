import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import test from 'node:test'

import { createThemeController } from '../src/client/theme-controller-v2.js'

const enabled = {
  version: 8,
  enabled: true,
  texture: 'full',
  glass: 'standard',
  motion: 'system',
}

function deferred() {
  let resolve
  let reject
  const promise = new Promise((next, fail) => {
    resolve = next
    reject = fail
  })
  return { promise, resolve, reject }
}

function createDom({ reduced = false } = {}) {
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', { pretendToBeVisual: true })
  Object.defineProperty(dom.window, 'innerWidth', { configurable: true, value: 1200 })
  Object.defineProperty(dom.window, 'innerHeight', { configurable: true, value: 800 })
  dom.window.matchMedia = query => ({
    matches: reduced && query === '(prefers-reduced-motion: reduce)',
    addEventListener() {},
    removeEventListener() {},
  })
  return dom
}

function settle() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

test('waits for host confirmation and press feedback before revealing the confirmed theme', async t => {
  const dom = createDom()
  const host = deferred()
  const press = deferred()
  const finished = deferred()
  let current = 'dark'
  let transitions = 0
  const service = {
    getTheme: () => current,
    setTheme(id) {
      return host.promise.then(() => { current = id })
    },
  }
  dom.window.document.startViewTransition = update => {
    transitions += 1
    update()
    return { finished: finished.promise, skipTransition() {} }
  }
  const controller = createThemeController({
    document: dom.window.document,
    window: dom.window,
    cssText: '',
    service,
  })
  t.after(() => controller.dispose())
  controller.apply(enabled)
  const root = dom.window.document.documentElement

  const request = controller.setTheme('light', {
    animate: true,
    origin: { x: 30, y: 40 },
    ready: press.promise,
  })
  controller.sync('light')
  assert.equal(root.dataset.prtsScheme, 'dark')

  host.resolve()
  await settle()
  assert.equal(root.dataset.prtsScheme, 'dark')
  assert.equal(transitions, 0)

  press.resolve()
  assert.equal(await request, 'light')
  assert.equal(root.dataset.prtsScheme, 'light')
  assert.equal(root.getAttribute('data-prts-scheme-transition'), 'light')
  assert.equal(root.style.getPropertyValue('--prts-scheme-origin-x'), '30px')
  assert.equal(root.style.getPropertyValue('--prts-scheme-origin-y'), '40px')
  const expectedRadius = Math.hypot(1170, 760) + 2
  assert.ok(Math.abs(Number.parseFloat(root.style.getPropertyValue('--prts-scheme-radius')) - expectedRadius) < 0.01)
  assert.equal(transitions, 1)

  finished.resolve()
  await settle()
  assert.equal(root.hasAttribute('data-prts-scheme-transition'), false)
  assert.equal(root.style.getPropertyValue('--prts-scheme-radius'), '')
})

test('keeps external sync and reduced-motion theme changes instantaneous', () => {
  const dom = createDom()
  let current = 'dark'
  let transitions = 0
  const service = {
    getTheme: () => current,
    setTheme(id) { current = id },
  }
  dom.window.document.startViewTransition = () => {
    transitions += 1
    throw new Error('should not start')
  }
  const controller = createThemeController({
    document: dom.window.document,
    window: dom.window,
    cssText: '',
    service,
  })
  controller.apply(enabled)
  const root = dom.window.document.documentElement

  controller.sync('light')
  assert.equal(root.dataset.prtsScheme, 'light')
  controller.sync('dark')
  root.dataset.prtsMotion = 'reduced'
  assert.equal(controller.setTheme('light', { animate: true }), 'light')
  assert.equal(root.dataset.prtsScheme, 'light')
  assert.equal(transitions, 0)
  controller.dispose()
})

test('keeps the current theme when the host rejects a manual switch', async () => {
  const dom = createDom()
  const service = {
    getTheme: () => 'dark',
    setTheme: () => Promise.reject(new Error('host rejected theme')),
  }
  dom.window.document.startViewTransition = () => {
    throw new Error('should not start')
  }
  const controller = createThemeController({
    document: dom.window.document,
    window: dom.window,
    cssText: '',
    service,
  })
  controller.apply(enabled)
  const root = dom.window.document.documentElement

  assert.equal(await controller.setTheme('light', { animate: true }), 'dark')
  assert.equal(root.dataset.prtsScheme, 'dark')
  assert.equal(root.hasAttribute('data-prts-scheme-transition'), false)
  controller.dispose()
})

test('lets the latest manual switch replace an active reveal', async t => {
  const dom = createDom()
  let current = 'dark'
  const records = []
  const service = {
    getTheme: () => current,
    setTheme(id) { current = id },
  }
  dom.window.document.startViewTransition = update => {
    const finished = deferred()
    const record = { finished, skipped: 0 }
    records.push(record)
    update()
    return {
      finished: finished.promise,
      skipTransition() { record.skipped += 1 },
    }
  }
  const controller = createThemeController({
    document: dom.window.document,
    window: dom.window,
    cssText: '',
    service,
  })
  t.after(() => controller.dispose())
  controller.apply(enabled)
  const root = dom.window.document.documentElement

  await controller.setTheme('light', { animate: true, origin: { x: 10, y: 20 } })
  await controller.setTheme('dark', { animate: true, origin: { x: 10, y: 20 } })
  assert.equal(records.length, 2)
  assert.equal(records[0].skipped, 1)
  assert.equal(root.dataset.prtsScheme, 'dark')
  assert.equal(root.getAttribute('data-prts-scheme-transition'), 'dark')

  records[0].finished.resolve()
  await settle()
  assert.equal(root.getAttribute('data-prts-scheme-transition'), 'dark')
  records[1].finished.resolve()
  await settle()
  assert.equal(root.hasAttribute('data-prts-scheme-transition'), false)
})
