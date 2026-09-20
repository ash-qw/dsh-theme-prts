import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'

import {
  configureSessionLifeline,
  createSessionLifelineAnimator,
  createSessionLifelinePath,
} from '../src/client/session-lifeline.js'

test('models a continuous three-strand flow with fixed endpoints', () => {
  const geometry = { start: 40, end: 228, baseline: 33, lift: 5.4 }
  const back = createSessionLifelinePath(geometry, 2.4, 1, -1)
  const core = createSessionLifelinePath(geometry, 2.4, 1, 0)
  const front = createSessionLifelinePath(geometry, 2.4, 1, 1)
  const later = createSessionLifelinePath(geometry, 6.7, 1, 0)
  const straight = createSessionLifelinePath(geometry, 2.4, 0, 0)
  for (const path of [back, core, front, later, straight]) {
    assert.match(path, /^M 40 33 C /)
    assert.match(path, / 228 33$/)
    assert.equal((path.match(/ C /g) || []).length, 8)
    assert.equal((path.match(/ L /g) || []).length, 0)
  }
  assert.equal(new Set([back, core, front]).size, 3)
  assert.notEqual(core, later)
  const yCoordinates = straight.match(/-?\d+(?:\.\d+)?/g).map(Number).filter((_value, index) => index % 2 === 1)
  assert.ok(yCoordinates.every(value => value === 33))
})

test('deforms a fixed filament only while the selected session is active and visible', async () => {
  const dom = new JSDOM(`<!doctype html><html data-prts-motion="full"><body>
    <div id="row" aria-selected="true"><svg><g id="lifeline">
      <path data-prts-session-lifeline-filament="back"></path>
      <path data-prts-session-lifeline-filament="core"></path>
      <path data-prts-session-lifeline-filament="front"></path>
    </g></svg></div>
  </body></html>`, { pretendToBeVisual: true })
  const { document } = dom.window
  const row = document.querySelector('#row')
  const lifeline = document.querySelector('#lifeline')
  const filaments = Array.from(lifeline.querySelectorAll('[data-prts-session-lifeline-filament]'))
  configureSessionLifeline(lifeline, { start: 20, end: 68, baseline: 31, lift: 5 })

  let frameId = 0
  const frames = new Map()
  const mediaListeners = new Set()
  const media = {
    matches: false,
    addEventListener: (_type, listener) => mediaListeners.add(listener),
    removeEventListener: (_type, listener) => mediaListeners.delete(listener),
  }
  const window = {
    MutationObserver: dom.window.MutationObserver,
    requestAnimationFrame(callback) {
      const id = ++frameId
      frames.set(id, callback)
      return id
    },
    cancelAnimationFrame(id) {
      frames.delete(id)
    },
    matchMedia: () => media,
  }
  const runFrame = time => {
    const entry = frames.entries().next().value
    assert.ok(entry, 'expected a scheduled animation frame')
    const [id, callback] = entry
    frames.delete(id)
    callback(time)
  }

  const animator = createSessionLifelineAnimator({ document, window })
  animator.start()
  animator.setTarget(row, lifeline)
  assert.equal(frames.size, 1)
  const initialPaths = filaments.map(filament => filament.getAttribute('d'))
  assert.ok(initialPaths.every(path => /^M .* C /.test(path)))
  runFrame(0)
  runFrame(50)
  assert.notDeepEqual(filaments.map(filament => filament.getAttribute('d')), initialPaths)
  assert.equal(lifeline.getAttribute('data-prts-lifeline-baseline'), '31')
  assert.equal(lifeline.getAttribute('data-prts-lifeline-lift'), '5')

  document.documentElement.dataset.prtsSessionFlow = 'off'
  await new Promise(resolve => dom.window.setTimeout(resolve, 0))
  assert.equal(frames.size, 0, 'disabling the setting suspends the flow')
  document.documentElement.dataset.prtsSessionFlow = 'on'
  await new Promise(resolve => dom.window.setTimeout(resolve, 0))
  assert.equal(frames.size, 1, 're-enabling the setting resumes the flow')

  row.dispatchEvent(new dom.window.Event('pointerenter'))
  runFrame(100)
  runFrame(200)
  runFrame(320)
  assert.equal(frames.size, 0, 'hover settles to a straight, stationary filament')
  const hoveredPaths = filaments.map(filament => filament.getAttribute('d'))
  for (const path of hoveredPaths) {
    assert.match(path, /M 20 31 C .* 68 31$/)
    const yCoordinates = path.match(/-?\d+(?:\.\d+)?/g).map(Number).filter((_value, index) => index % 2 === 1)
    assert.ok(yCoordinates.every(value => value === 31))
  }

  row.dispatchEvent(new dom.window.Event('pointerleave'))
  assert.equal(frames.size, 1)
  runFrame(370)
  runFrame(470)
  assert.notDeepEqual(filaments.map(filament => filament.getAttribute('d')), hoveredPaths)

  document.documentElement.dataset.prtsMotion = 'reduced'
  await new Promise(resolve => dom.window.setTimeout(resolve, 0))
  assert.equal(frames.size, 0)
  const reducedPaths = filaments.map(filament => filament.getAttribute('d'))
  assert.deepEqual(reducedPaths, initialPaths, 'reduced motion restores the static tensioned contour')
  await new Promise(resolve => dom.window.setTimeout(resolve, 24))
  assert.deepEqual(filaments.map(filament => filament.getAttribute('d')), reducedPaths)

  animator.dispose()
  assert.equal(frames.size, 0)
  assert.equal(mediaListeners.size, 0)
})
