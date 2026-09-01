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

function createDom({ reduced = false, width = 1200, height = 800 } = {}) {
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', { pretendToBeVisual: true })
  Object.defineProperty(dom.window, 'innerWidth', { configurable: true, value: width })
  Object.defineProperty(dom.window, 'innerHeight', { configurable: true, value: height })
  dom.window.matchMedia = query => ({
    matches: reduced && query === '(prefers-reduced-motion: reduce)',
    addEventListener() {},
    removeEventListener() {},
  })
  return dom
}

function installViewTransitions(dom) {
  const animations = []
  const transitions = []
  dom.window.Element.prototype.animate = function (keyframes, options) {
    const finished = deferred()
    const record = { element: this, keyframes, options, finished, cancelled: 0 }
    animations.push(record)
    return {
      finished: finished.promise,
      cancel() { record.cancelled += 1 },
    }
  }
  dom.window.document.startViewTransition = update => {
    const finished = deferred()
    const updateCallbackDone = Promise.resolve().then(update)
    const record = { finished, updateCallbackDone, skipped: 0 }
    transitions.push(record)
    return {
      ready: updateCallbackDone,
      updateCallbackDone,
      finished: finished.promise,
      skipTransition() { record.skipped += 1 },
    }
  }
  return { animations, transitions }
}

function settle() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

test('reveals the host-confirmed theme from left to right with one soft View Transition boundary', async t => {
  const dom = createDom()
  const host = deferred()
  const transitionStates = []
  let current = 'dark'
  const records = installViewTransitions(dom)
  const controller = createThemeController({
    document: dom.window.document,
    window: dom.window,
    cssText: '',
    service: {
      getTheme: () => current,
      setTheme(id) {
        return host.promise.then(() => { current = id })
      },
    },
    onTransitionStateChange: active => transitionStates.push(active),
  })
  t.after(() => controller.dispose())
  controller.apply(enabled)
  const root = dom.window.document.documentElement

  const request = controller.setTheme('light', { animate: true, origin: { x: 30, y: 40 } })
  controller.sync('light')
  assert.equal(root.dataset.prtsScheme, 'dark')
  assert.equal(records.transitions.length, 1)
  assert.equal(dom.window.document.querySelector('[data-prts-scheme-reveal]'), null)

  host.resolve()
  await settle()
  assert.equal(root.dataset.prtsScheme, 'light')
  assert.equal(root.getAttribute('data-prts-scheme-transition'), 'light')
  assert.equal(root.getAttribute('data-prts-scheme-transition-mode'), 'view')
  assert.equal(root.style.getPropertyValue('--prts-scheme-origin-x'), '30px')
  assert.equal(root.style.getPropertyValue('--prts-scheme-origin-y'), '40px')
  assert.equal(root.style.getPropertyValue('--prts-scheme-duration'), '480ms')
  assert.equal(root.style.getPropertyValue('--prts-scheme-reveal-x'), '-32px')
  assert.equal(records.transitions.length, 1)
  assert.equal(records.animations.length, 7)
  const clip = records.animations.find(record => record.options.pseudoElement === '::view-transition-new(root)')
  const edge = records.animations.find(record => record.options.pseudoElement === '::view-transition-group(prts-scheme-edge)')
  const grid = records.animations.find(record => record.options.pseudoElement === '::view-transition-new(prts-scheme-grid)')
  assert.equal(clip.keyframes[0].clipPath, 'inset(0 1232px 0 0)')
  assert.equal(clip.keyframes.at(-1).clipPath, 'inset(0 0px 0 0)')
  assert.equal(clip.options.duration, 480)
  assert.equal(clip.options.easing, 'cubic-bezier(.4, 0, .2, 1)')
  assert.equal(edge.keyframes[0].translate, '-32px 0px')
  assert.equal(edge.keyframes.at(-1).translate, '1232px 0px')
  assert.equal(grid.keyframes[0].backgroundPosition, '252px 0px')
  assert.equal(grid.keyframes.at(-1).backgroundPosition, '-1012px 0px')
  assert.deepEqual(transitionStates, [true])

  for (const record of records.animations) record.finished.resolve()
  assert.equal(await request, 'light')
  assert.equal(records.transitions[0].skipped, 1)
  assert.equal(root.hasAttribute('data-prts-scheme-transition'), false)
  assert.equal(root.style.getPropertyValue('--prts-scheme-reveal-x'), '')
  assert.deepEqual(transitionStates, [true, false])
})

test('uses the compact reveal duration on phone viewports', async t => {
  const dom = createDom({ width: 390, height: 844 })
  let current = 'dark'
  const records = installViewTransitions(dom)
  const controller = createThemeController({
    document: dom.window.document,
    window: dom.window,
    cssText: '',
    service: {
      getTheme: () => current,
      setTheme(id) { current = id },
    },
  })
  t.after(() => controller.dispose())
  controller.apply(enabled)

  const request = controller.setTheme('light', { animate: true })
  await settle()
  const completion = records.animations.filter(record => record.options.duration === 351)
  const clip = completion.find(record => record.options.pseudoElement)
  assert.equal(clip.keyframes.at(-1).clipPath, 'inset(0 0px 0 0)')
  for (const record of completion) record.finished.resolve()
  assert.equal(await request, 'light')
})

test('tracks an interactive boundary in both directions and rolls back below 50 percent', async t => {
  const dom = createDom()
  let current = 'dark'
  let hostCommits = 0
  const records = installViewTransitions(dom)
  const controller = createThemeController({
    document: dom.window.document,
    window: dom.window,
    cssText: '',
    service: {
      getTheme: () => current,
      setTheme(id) {
        hostCommits += 1
        current = id
      },
    },
  })
  t.after(() => controller.dispose())
  controller.apply(enabled)
  const root = dom.window.document.documentElement

  const gesture = controller.beginThemeTransition('light', {
    origin: { x: 30, y: 40 },
    progress: .1,
  })
  await settle()
  assert.equal(root.dataset.prtsScheme, 'light')
  assert.equal(root.getAttribute('data-prts-scheme-transition-interactive'), '')
  assert.equal(root.style.getPropertyValue('--prts-scheme-reveal-x'), '120px')
  assert.equal(hostCommits, 1)
  const edgeScrub = records.animations.find(record => record.options.pseudoElement === '::view-transition-group(prts-scheme-edge)')
  assert.equal(edgeScrub.keyframes[0].translate, '0px 0px')
  assert.equal(edgeScrub.keyframes.at(-1).translate, '1200px 0px')

  gesture.update(.63)
  assert.equal(root.style.getPropertyValue('--prts-scheme-reveal-x'), '756px')
  assert.equal(root.style.getPropertyValue('--prts-scheme-control-progress'), '0.63')
  assert.equal(root.getAttribute('data-prts-scheme-transition-armed'), '')
  assert.equal(dom.window.document.querySelector('[data-prts-scheme-reveal-label]')?.textContent, 'CTRL')
  assert.equal(dom.window.document.querySelector('[data-prts-scheme-reveal-value]')?.textContent, '')
  assert.match(root.style.getPropertyValue('--prts-scheme-control-value-image'), /^url\("data:image\/svg\+xml,.*063/)
  assert.equal(dom.window.document.querySelector('[data-prts-scheme-reveal-grid]')?.parentElement?.hasAttribute('data-prts-scheme-reveal-edge'), true)

  controller.sync('dark')
  assert.equal(root.dataset.prtsScheme, 'light')
  gesture.update(.35)
  assert.equal(root.style.getPropertyValue('--prts-scheme-reveal-x'), '420px')
  assert.equal(root.style.getPropertyValue('--prts-scheme-control-progress'), '0.35')
  assert.equal(root.hasAttribute('data-prts-scheme-transition-armed'), false)
  assert.match(root.style.getPropertyValue('--prts-scheme-control-value-image'), /035/)

  const result = gesture.finish(false)
  await settle()
  const completion = records.animations.filter(record => record.options.duration === 121)
  const clip = completion.find(record => record.options.pseudoElement)
  assert.equal(clip.keyframes.at(-1).clipPath, 'inset(0 1232px 0 0)')
  for (const record of completion) record.finished.resolve()
  assert.equal(await result, 'dark')
  assert.equal(root.dataset.prtsScheme, 'dark')
  assert.equal(hostCommits, 2)
  assert.equal(current, 'dark')
  assert.equal(root.hasAttribute('data-prts-scheme-transition'), false)
  assert.equal(root.style.getPropertyValue('--prts-scheme-control-progress'), '')
  assert.equal(dom.window.document.querySelector('[data-prts-scheme-reveal]'), null)
})

test('commits an interactive reveal above 50 percent through the host authority', async t => {
  const dom = createDom()
  let current = 'dark'
  const hostTargets = []
  const records = installViewTransitions(dom)
  const controller = createThemeController({
    document: dom.window.document,
    window: dom.window,
    cssText: '',
    service: {
      getTheme: () => current,
      setTheme(id) {
        hostTargets.push(id)
        current = id
      },
    },
  })
  t.after(() => controller.dispose())
  controller.apply(enabled)
  const root = dom.window.document.documentElement

  const gesture = controller.beginThemeTransition('light', { progress: .12 })
  await settle()
  gesture.update(.63)
  const result = gesture.finish(true)
  await settle()
  assert.deepEqual(hostTargets, ['light'])
  const completion = records.animations.filter(record => record.options.duration === 178)
  const clip = completion.find(record => record.options.pseudoElement)
  assert.equal(clip.keyframes.at(-1).clipPath, 'inset(0 0px 0 0)')
  for (const record of completion) record.finished.resolve()

  assert.equal(await result, 'light')
  assert.equal(root.dataset.prtsScheme, 'light')
  assert.equal(root.hasAttribute('data-prts-scheme-transition'), false)
})

test('keeps external sync and reduced-motion theme changes instantaneous', async () => {
  const dom = createDom({ reduced: true })
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
  const gesture = controller.beginThemeTransition('light', { progress: .1 })
  gesture.update(.7)
  assert.equal(root.dataset.prtsScheme, 'dark')
  assert.equal(await gesture.finish(true), 'light')
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
  const records = installViewTransitions(dom)
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
  assert.equal(records.transitions.length, 1)
  assert.equal(records.transitions[0].skipped, 1)
  assert.equal(records.animations.length, 0)
  controller.dispose()
})
