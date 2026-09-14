import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import test from 'node:test'

import { createPrtsStartupSequence, findNativeHarnessLoader } from '../src/client/startup-sequence.js'

async function waitFor(window, predicate, timeout = 1_000) {
  const deadline = Date.now() + timeout
  while (!predicate()) {
    if (Date.now() >= deadline) throw new Error('Timed out waiting for startup timeline state')
    await new Promise(resolve => window.setTimeout(resolve, 5))
  }
}

function createFixture({ boot = false } = {}) {
  const bootMarkup = boot ? '<div data-dsh-boot><span data-dsh-boot-spinner></span></div>' : ''
  const dom = new JSDOM(`<!doctype html><html data-dsh-prts><body><main data-host><button type="button">Settings</button>${bootMarkup}</main></body></html>`, {
    pretendToBeVisual: true,
  })
  dom.window.matchMedia = query => ({ matches: query.includes('reduce') ? false : true })
  return dom
}

function controlAnimationFrames(window) {
  let pendingFrame
  let nextId = 0
  window.requestAnimationFrame = callback => {
    pendingFrame = callback
    nextId += 1
    return nextId
  }
  window.cancelAnimationFrame = () => {
    pendingFrame = undefined
  }
  return {
    step(timestamp) {
      const callback = pendingFrame
      pendingFrame = undefined
      assert.equal(typeof callback, 'function', 'an animation frame must be pending')
      callback(timestamp)
    },
  }
}

function renderedProgress(fill) {
  return Number.parseFloat(fill.style.transform.match(/scaleX\(([^)]+)\)/)?.[1] ?? '0') * 100
}

function markHostTopLayer(document) {
  const host = document.querySelector('[data-host]')
  host.setAttribute('popover', 'manual')
  const matches = host.matches.bind(host)
  host.matches = selector => selector === ':popover-open' || matches(selector)
}

const fastTimings = Object.freeze({
  enter: 0,
  minimum: 0,
  intro: 0,
  approach: 10,
  finish: 5,
  copyFade: 0,
  readyHold: 40,
  exitLead: 5,
  exit: 20,
  completePadding: 5,
  reducedExit: 3,
  timeout: 200,
  timeoutHold: 20,
  watchdog: 300,
})

test('runs one coordinated sequence, preserves the exact emblem source, and restores interactivity', async () => {
  const dom = createFixture()
  const { document } = dom.window
  const button = document.querySelector('button')
  button.focus()
  const lifecycle = []
  const startup = createPrtsStartupSequence({
    document,
    window: dom.window,
    prtsEmblem: 'data:image/png;base64,EXACT-PRTS',
    rhodesEmblem: '<svg viewBox="0 0 10 10"></svg>',
    timings: { ...fastTimings, exitLead: 30, exit: 50 },
    onActiveChange(active) {
      lifecycle.push(`active:${active}`)
    },
    onReady() {
      lifecycle.push('ready')
    },
  })

  assert.equal(startup.play({ reduced: false }), true)
  assert.equal(startup.play({ reduced: false }), false, 'duplicate triggers must be ignored')
  const overlay = document.querySelector('[data-prts-startup]')
  assert.ok(overlay)
  assert.equal(overlay.hasAttribute('popover'), false)
  assert.equal(overlay.querySelector('[data-prts-startup-emblem]').getAttribute('src'), 'data:image/png;base64,EXACT-PRTS')
  assert.ok(overlay.querySelector('[data-prts-startup-signature] svg'))
  assert.equal(document.querySelector('[data-host]').hasAttribute('inert'), true)
  assert.equal(document.documentElement.hasAttribute('data-prts-startup-active'), true)
  assert.equal(overlay.hasAttribute('tabindex'), false)
  assert.equal(document.activeElement, button, 'startup must not synchronously steal focus')
  assert.deepEqual(lifecycle, ['active:true'])

  await waitFor(dom.window, () => overlay.dataset.stage === 'ready')
  assert.equal(overlay.dataset.stage, 'ready')
  assert.equal(overlay.querySelector('[data-prts-startup-percent]').textContent, '100%')
  assert.equal(overlay.querySelector('[data-prts-startup-label]').textContent, 'P.R.T.S. READY')
  assert.deepEqual(lifecycle, ['active:true', 'ready'])

  await waitFor(dom.window, () => overlay.hasAttribute('data-exit-content'))
  assert.equal(overlay.hasAttribute('data-exiting'), false, 'content must settle before the curtains open')
  await waitFor(dom.window, () => overlay.hasAttribute('data-exiting'))

  await waitFor(dom.window, () => document.querySelector('[data-prts-startup]') === null)
  assert.equal(document.querySelector('[data-prts-startup]'), null)
  assert.equal(document.querySelector('[data-host]').hasAttribute('inert'), false)
  assert.equal(document.documentElement.hasAttribute('data-prts-startup-active'), false)
  assert.equal(document.activeElement, button)
  assert.equal(startup.isActive(), false)
  assert.deepEqual(lifecycle, ['active:true', 'ready', 'active:false'])
})

test('keeps completion velocity continuous and skips duplicate percentage writes', () => {
  const dom = createFixture()
  const { document } = dom.window
  const frames = controlAnimationFrames(dom.window)
  const startup = createPrtsStartupSequence({ document, window: dom.window })

  assert.equal(startup.play({ reduced: false }), true)
  const overlay = document.querySelector('[data-prts-startup]')
  const fill = overlay.querySelector('[data-prts-startup-fill]')
  const percent = overlay.querySelector('[data-prts-startup-percent]')

  frames.step(0)
  const initialTextNode = percent.firstChild
  frames.step(1)
  assert.equal(percent.firstChild, initialTextNode, 'an unchanged rounded percentage must not rewrite text')
  assert.equal(overlay.style.getPropertyValue('--prts-startup-progress'), '')

  frames.step(544)
  const beforeSwitch = renderedProgress(fill)
  frames.step(560)
  const atSwitch = renderedProgress(fill)
  frames.step(576)
  const afterSwitch = renderedProgress(fill)
  const approachDelta = atSwitch - beforeSwitch
  const finishDelta = afterSwitch - atSwitch

  assert.ok(approachDelta > 0)
  assert.ok(finishDelta > 0)
  assert.ok(finishDelta < approachDelta * 2, `completion delta ${finishDelta} must remain close to approach delta ${approachDelta}`)
  startup.stop()
})

test('holds below completion until the native Harness boot surface leaves, then finishes', async () => {
  const dom = createFixture({ boot: true })
  const { document } = dom.window
  const nativeLoader = findNativeHarnessLoader(document)
  const startup = createPrtsStartupSequence({
    document,
    window: dom.window,
    timings: { ...fastTimings, readyHold: 30 },
  })

  assert.equal(nativeLoader?.hasAttribute('data-dsh-boot'), true)
  assert.equal(startup.play({ waitForReady: true, readyWhen: () => !nativeLoader.isConnected }), true)
  const overlay = document.querySelector('[data-prts-startup]')
  await waitFor(dom.window, () => Number.parseInt(overlay.querySelector('[data-prts-startup-percent]').textContent, 10) > 0)
  const waitingPercent = Number.parseInt(overlay.querySelector('[data-prts-startup-percent]').textContent, 10)
  assert.ok(waitingPercent > 0 && waitingPercent <= 90)
  assert.notEqual(overlay.dataset.stage, 'ready')

  nativeLoader.remove()
  await waitFor(dom.window, () => overlay.dataset.stage === 'ready')
  assert.equal(overlay.dataset.stage, 'ready')
  assert.equal(overlay.querySelector('[data-prts-startup-percent]').textContent, '100%')
  await waitFor(dom.window, () => document.querySelector('[data-prts-startup]') === null)
  assert.equal(document.querySelector('[data-prts-startup]'), null)
})

test('fails open without presenting a host readiness delay as an error', async () => {
  const dom = createFixture({ boot: true })
  const { document } = dom.window
  const nativeLoader = findNativeHarnessLoader(document)
  const startup = createPrtsStartupSequence({
    document,
    window: dom.window,
    timings: {
      ...fastTimings,
      timeout: 16,
      timeoutHold: 35,
      readyHold: 20,
      reducedExit: 30,
      watchdog: 180,
    },
  })

  startup.play({ reduced: true, waitForReady: true, readyWhen: () => !nativeLoader.isConnected })
  const overlay = document.querySelector('[data-prts-startup]')
  assert.equal(overlay.dataset.stage, 'visualOnline')
  assert.equal(overlay.querySelector('[data-prts-startup-label]').textContent, 'VISUAL LAYER ONLINE')
  assert.equal(overlay.querySelector('[data-prts-startup-detail]').textContent, '视觉层已上线')
  await waitFor(dom.window, () => overlay.hasAttribute('data-fail-open'))
  assert.notEqual(overlay.dataset.stage, 'timeout')
  assert.notEqual(overlay.querySelector('[data-prts-startup-label]').textContent, 'LINK TIMEOUT')
  assert.notEqual(overlay.querySelector('[data-prts-startup-detail]').textContent, '启动状态异常')
  assert.equal(nativeLoader.isConnected, true)
  await waitFor(dom.window, () => document.querySelector('[data-prts-startup]') === null)
  assert.equal(document.querySelector('[data-prts-startup]'), null)
  assert.equal(nativeLoader.closest('[data-host]').hasAttribute('inert'), false)
})

test('promotes the overlay to the top layer and leaves it safely on cleanup', () => {
  const dom = createFixture()
  const { document, HTMLElement } = dom.window
  markHostTopLayer(document)
  let showCalls = 0
  let hideCalls = 0
  HTMLElement.prototype.showPopover = function showPopover() {
    showCalls += 1
    this.setAttribute('data-test-top-layer', '')
  }
  HTMLElement.prototype.hidePopover = function hidePopover() {
    hideCalls += 1
    this.removeAttribute('data-test-top-layer')
  }
  const startup = createPrtsStartupSequence({ document, window: dom.window })

  assert.equal(startup.play({ reduced: false }), true)
  const overlay = document.querySelector('[data-prts-startup]')
  assert.equal(showCalls, 1)
  assert.equal(overlay.hasAttribute('data-test-top-layer'), true)
  startup.stop()
  assert.equal(hideCalls, 1)
  assert.equal(document.querySelector('[data-prts-startup]'), null)
})

test('keeps the fixed fallback visible when top-layer promotion fails', () => {
  const dom = createFixture()
  const { document, HTMLElement } = dom.window
  markHostTopLayer(document)
  HTMLElement.prototype.showPopover = () => {
    throw new dom.window.DOMException('Unavailable', 'InvalidStateError')
  }
  const startup = createPrtsStartupSequence({ document, window: dom.window })

  assert.equal(startup.play({ reduced: false }), true)
  const overlay = document.querySelector('[data-prts-startup]')
  assert.equal(overlay.hasAttribute('popover'), false)
  startup.stop()
})

test('uses a static brand screen and no artificial minimum for reduced motion', async () => {
  const dom = createFixture()
  const { document } = dom.window
  const startup = createPrtsStartupSequence({
    document,
    window: dom.window,
    timings: fastTimings,
  })

  assert.equal(startup.play({ reduced: true }), true)
  const overlay = document.querySelector('[data-prts-startup]')
  assert.equal(overlay.hasAttribute('data-reduced-motion'), true)
  assert.equal(overlay.dataset.stage, 'visualOnline')
  assert.equal(overlay.querySelector('[data-prts-startup-percent]').textContent, '090%')
  await waitFor(dom.window, () => document.querySelector('[data-prts-startup]') === null)
  assert.equal(document.querySelector('[data-prts-startup]'), null)
})

test('cleans up immediately when the page becomes hidden', () => {
  const dom = createFixture()
  const { document } = dom.window
  const startup = createPrtsStartupSequence({ document, window: dom.window })
  startup.play({ reduced: false })
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })
  document.dispatchEvent(new dom.window.Event('visibilitychange'))
  assert.equal(document.querySelector('[data-prts-startup]'), null)
  assert.equal(document.querySelector('[data-host]').hasAttribute('inert'), false)
  assert.equal(startup.isActive(), false)
})
