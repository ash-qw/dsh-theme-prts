import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { JSDOM } from 'jsdom'
import test from 'node:test'

import { PARTICLE_DENSITY_PROFILES, createOrthogonalTargets, createParticleFieldAdapter, findAlphaBounds, inspectOrthogonalCoverage, pointerRadiusForFieldSize } from '../src/client/particle-field-adapter.js'
import { createExactEmblemMask } from '../scripts/png-alpha.mjs'

function fixture(width = 1440, reduced = false) {
  const dom = new JSDOM(`<!doctype html><html><body>
    <main data-prts-region="operation">
      <div data-slot="conversation">
        <div data-conversation-scroll>
          <article data-chat-flow-kind="assistant-step"><div data-prts-ai-surface>回复</div></article>
        </div>
      </div>
    </main>
  </body></html>`, { pretendToBeVisual: true })
  Object.defineProperty(dom.window, 'innerWidth', { configurable: true, value: width })
  Object.defineProperty(dom.window, 'innerHeight', { configurable: true, value: 800 })
  dom.window.matchMedia = () => ({ matches: reduced, addEventListener() {}, removeEventListener() {} })

  const scroller = dom.window.document.querySelector('[data-conversation-scroll]')
  Object.defineProperty(scroller, 'clientHeight', { configurable: true, value: 800 })

  let now = 0
  const frames = new Map()
  let nextFrameId = 1
  Object.defineProperty(dom.window.performance, 'now', { configurable: true, value: () => now })
  dom.window.requestAnimationFrame = callback => { const id = nextFrameId++; frames.set(id, callback); return id }
  dom.window.cancelAnimationFrame = id => frames.delete(id)

  return {
    dom,
    scroller,
    step(ms = 16) {
      now += ms
      const callbacks = [...frames.values()]
      frames.clear()
      for (const callback of callbacks) callback(now)
    },
    pendingFrames() {
      return frames.size
    },
  }
}

function masksFor(emblems = [{ key: 'rhodes-island' }]) {
  const width = 96
  const height = 96
  const alpha = new Uint8Array(width * height)
  for (let y = 8; y < 88; y += 1) {
    for (let x = 8; x < 88; x += 1) alpha[y * width + x] = 255
  }
  const encoded = Buffer.from(alpha).toString('base64')
  return emblems.map(entry => ({ key: entry.key, width, height, alpha: encoded, opticalScale: 0.86 }))
}

test('scales pointer repulsion with the current emblem size inside a local interaction range', () => {
  assert.equal(pointerRadiusForFieldSize(230), 56)
  assert.equal(pointerRadiusForFieldSize(280), 56)
  assert.equal(pointerRadiusForFieldSize(320), 64)
  assert.equal(pointerRadiusForFieldSize(480), 96)
  assert.equal(pointerRadiusForFieldSize(580), 96)
})

test('uses ResizeObserver as the particle field\'s only viewport size source', async () => {
  const source = await readFile(new URL('../src/client/particle-field-adapter.js', import.meta.url), 'utf8')
  assert.match(source, /new window\.ResizeObserver\(onOperationResize\)/)
  assert.doesNotMatch(source, /addEventListener\?\.\('resize'/)
  assert.doesNotMatch(source, /addEventListener\('resize'/)
})

test('mounts one ambient field and particle canvas, then removes every owned layer', () => {
  const { dom } = fixture()
  const adapter = createParticleFieldAdapter({
    document: dom.window.document,
    window: dom.window,
    emblem: '<svg viewBox="0 0 10 10"><path d="M0 0h10v10H0z"/></svg>',
    emblemMasks: masksFor(),
  })

  adapter.update({ enabled: true, texture: 'full', motion: 'full' })

  const ambient = dom.window.document.querySelector('[data-prts-ambient-layer]')
  const canvas = dom.window.document.querySelector('[data-prts-particle-layer]')
  assert.ok(ambient)
  assert.ok(ambient.querySelector('[data-prts-ambient-glow]'))
  assert.equal(ambient.querySelectorAll('[data-prts-ambient-edge]').length, 2)
  assert.equal(canvas?.tagName, 'CANVAS')
  assert.equal(canvas.hasAttribute('data-prts-particle-ready'), true)
  assert.equal(adapter.inspect().firstFrameReady, true)
  assert.equal(adapter.inspect().mounted, true)

  adapter.dispose()
  assert.equal(dom.window.document.querySelector('[data-prts-ambient-layer]'), null)
  assert.equal(dom.window.document.querySelector('[data-prts-particle-layer]'), null)
})

test('sleeps after the particle field visually settles and wakes for interaction', () => {
  const { dom, step, pendingFrames } = fixture()
  const operation = dom.window.document.querySelector('[data-prts-region="operation"]')
  dom.window.CanvasRenderingContext2D = class {}
  dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    setTransform() {},
    clearRect() {},
    beginPath() {},
    arc() {},
    fill() {},
    set fillStyle(value) {},
  })
  const adapter = createParticleFieldAdapter({
    document: dom.window.document,
    window: dom.window,
    emblem: '<svg />',
    emblemMasks: masksFor(),
  })
  adapter.update({
    enabled: true,
    texture: 'full',
    motion: 'system',
    conversationParticleDensity: 'sparse',
    heroParticleDensity: 'light',
  })

  for (let index = 0; index < 20; index += 1) step(16)
  assert.equal(adapter.inspect().sleeping, true)
  assert.equal(pendingFrames(), 0)

  operation.dispatchEvent(new dom.window.MouseEvent('pointermove', {
    clientX: 420,
    clientY: 320,
    bubbles: true,
  }))
  assert.equal(adapter.inspect().sleeping, false)
  assert.equal(pendingFrames(), 1)
  step(16)
  assert.equal(adapter.inspect().pointer.active, true)

  operation.dispatchEvent(new dom.window.MouseEvent('pointerleave', { bubbles: true }))
  assert.equal(pendingFrames(), 1)
  adapter.dispose()
})

test('pauses particle rendering during bulk hydration and resumes after stable frames', async () => {
  const { dom, scroller, step } = fixture()
  const adapter = createParticleFieldAdapter({
    document: dom.window.document,
    window: dom.window,
    emblem: '<svg />',
    emblemMasks: masksFor(),
  })
  adapter.update({ enabled: true, texture: 'full', motion: 'full' })

  const fragment = dom.window.document.createDocumentFragment()
  for (let index = 0; index < 20; index += 1) {
    const turn = dom.window.document.createElement('article')
    turn.setAttribute('data-chat-flow-kind', 'assistant-step')
    turn.textContent = 'hydrated turn'
    fragment.appendChild(turn)
  }
  scroller.appendChild(fragment)
  await Promise.resolve()
  assert.equal(adapter.inspect().hydrationPaused, true)

  await new Promise(resolve => dom.window.setTimeout(resolve, 130))
  step()
  step()
  assert.equal(adapter.inspect().hydrationPaused, false)
  adapter.dispose()
})


test('performs zero layout and computed-style reads inside a particle animation frame', () => {
  const { dom, step } = fixture()
  const operation = dom.window.document.querySelector('[data-prts-region="operation"]')
  let rectReads = 0
  let styleReads = 0
  const originalRect = dom.window.Element.prototype.getBoundingClientRect
  const originalComputedStyle = dom.window.getComputedStyle.bind(dom.window)
  dom.window.Element.prototype.getBoundingClientRect = function () {
    rectReads += 1
    if (this === operation) return { left: 0, top: 0, width: 1440, height: 800 }
    return originalRect.call(this)
  }
  dom.window.getComputedStyle = (...args) => {
    styleReads += 1
    return originalComputedStyle(...args)
  }
  dom.window.CanvasRenderingContext2D = class {}
  dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    setTransform() {},
    clearRect() {},
    beginPath() {},
    arc() {},
    fill() {},
    set fillStyle(value) {},
  })
  const adapter = createParticleFieldAdapter({
    document: dom.window.document,
    window: dom.window,
    emblem: '<svg />',
    emblemMasks: masksFor(),
  })
  adapter.update({
    enabled: true,
    texture: 'full',
    motion: 'full',
    conversationParticleDensity: 'ultra',
    heroParticleDensity: 'ultra',
  })
  operation.dispatchEvent(new dom.window.MouseEvent('pointermove', {
    clientX: 420,
    clientY: 320,
    bubbles: true,
  }))
  rectReads = 0
  styleReads = 0
  step(16)
  assert.equal(rectReads, 0)
  assert.equal(styleReads, 0)
  adapter.dispose()
})
test('clears stationary pointer force while a resized canvas is waiting for its final commit', async () => {
  const { dom, step } = fixture()
  const operation = dom.window.document.querySelector('[data-prts-region="operation"]')
  let left = 100
  let operationWidth = 1000
  let resizeCallback
  dom.window.ResizeObserver = class {
    constructor(callback) { resizeCallback = callback }
    observe() {}
    disconnect() {}
  }
  operation.getBoundingClientRect = () => ({
    left,
    top: 20,
    right: left + operationWidth,
    bottom: 820,
    width: operationWidth,
    height: 800,
  })
  const adapter = createParticleFieldAdapter({
    document: dom.window.document,
    window: dom.window,
    emblem: '<svg />',
    emblemMasks: masksFor(),
  })
  adapter.update({ enabled: true, texture: 'full', motion: 'full' })
  const canvas = dom.window.document.querySelector('[data-prts-particle-layer]')
  canvas.getBoundingClientRect = () => ({
    left,
    top: 20,
    right: left + operationWidth,
    bottom: 820,
    width: operationWidth,
    height: 800,
  })

  operation.dispatchEvent(new dom.window.MouseEvent('pointermove', {
    clientX: 600,
    clientY: 420,
    bubbles: true,
  }))
  assert.deepEqual(adapter.inspect().pointer, {
    active: true,
    clientX: 600,
    clientY: 420,
    x: 500,
    y: 400,
  })

  left = 220
  operationWidth = 900
  resizeCallback([{ target: operation, contentRect: { width: 900, height: 800 } }])
  step()
  assert.equal(adapter.inspect().resizing, true)
  assert.equal(adapter.inspect().pointer.active, false)
  assert.equal(adapter.inspect().pointer.clientX, 600)
  await new Promise(resolve => dom.window.setTimeout(resolve, 170))
  step()
  step()
  assert.equal(adapter.inspect().resizing, false)
  assert.equal(adapter.inspect().fieldWidth, 900)
  assert.equal(adapter.inspect().resizeCommits, 1)
  adapter.dispose()
})

test('enforces standard density as the minimum for the complete hero mark', () => {
  const { dom, scroller } = fixture()
  scroller.innerHTML = '<section data-phase="hero"><span data-slot="conversation.hero.brand.mark"></span><div data-composer-seat></div></section>'
  const adapter = createParticleFieldAdapter({
    document: dom.window.document,
    window: dom.window,
    emblem: '<svg />',
    emblemMasks: masksFor(),
  })
  adapter.update({
    enabled: true,
    texture: 'full',
    motion: 'full',
    conversationParticleDensity: 'light',
    heroParticleDensity: 'light',
  })
  assert.equal(adapter.inspect().hero, true)
  assert.equal(adapter.inspect().density, 'standard')
  assert.ok(adapter.inspect().particles > 289)
  adapter.dispose()
})

test('alternates sides at viewport boundaries and keeps upward reassembly at the new top endpoint', () => {
  const { dom, scroller, step } = fixture()
  const adapter = createParticleFieldAdapter({ document: dom.window.document, window: dom.window, emblem: '<svg />', emblemMasks: masksFor() })
  adapter.update({ enabled: true, texture: 'full', motion: 'full' })

  scroller.scrollTop = 824
  scroller.dispatchEvent(new dom.window.Event('scroll'))
  assert.deepEqual(adapter.inspect().transition, { fromSide: -1, toSide: 1, direction: 1 })
  for (let index = 0; index < 70; index += 1) step(16)
  assert.equal(adapter.inspect().side, 1)

  scroller.scrollTop = 776
  scroller.dispatchEvent(new dom.window.Event('scroll'))
  assert.deepEqual(adapter.inspect().transition, { fromSide: 1, toSide: -1, direction: -1 })
  for (let index = 0; index < 55; index += 1) step(16)
  assert.ok(adapter.inspect().anchor.verticalProgress > 0.95)
  for (let index = 0; index < 15; index += 1) step(16)
  const state = adapter.inspect()
  assert.equal(state.side, -1)
  assert.ok(state.anchor.verticalProgress > 0.95)
  adapter.dispose()
})

test('cycles official faction emblems as boundary transitions complete in either scroll direction', () => {
  const { dom, scroller, step } = fixture()
  const emblems = [
    { key: 'rhodes-island', label: '罗德岛', source: 'data:image/png;base64,AA==' },
    { key: 'lungmen', label: '龙门', source: 'data:image/png;base64,AA==' },
    { key: 'penguin-logistics', label: '企鹅物流', source: 'data:image/png;base64,AA==' },
  ]
  const adapter = createParticleFieldAdapter({ document: dom.window.document, window: dom.window, emblems, emblemMasks: masksFor(emblems) })
  adapter.update({ enabled: true, texture: 'full', motion: 'full' })
  assert.equal(adapter.inspect().emblemKey, 'rhodes-island')

  scroller.scrollTop = 824
  scroller.dispatchEvent(new dom.window.Event('scroll'))
  assert.equal(adapter.inspect().nextEmblemKey, 'lungmen')
  for (let index = 0; index < 70; index += 1) step(16)
  assert.equal(adapter.inspect().emblemKey, 'lungmen')

  scroller.scrollTop = 1624
  scroller.dispatchEvent(new dom.window.Event('scroll'))
  for (let index = 0; index < 70; index += 1) step(16)
  assert.equal(adapter.inspect().emblemKey, 'penguin-logistics')

  scroller.scrollTop = 776
  scroller.dispatchEvent(new dom.window.Event('scroll'))
  for (let index = 0; index < 70; index += 1) step(16)
  assert.equal(adapter.inspect().emblemKey, 'rhodes-island')
  adapter.dispose()
})

test('uses a centered static emblem on phones and when reduced motion is requested', () => {
  for (const [width, reduced] of [[390, false], [1440, true]]) {
    const { dom, scroller } = fixture(width, reduced)
    const adapter = createParticleFieldAdapter({ document: dom.window.document, window: dom.window, emblem: '<svg />', emblemMasks: masksFor() })
    adapter.update({ enabled: true, texture: 'restrained', motion: reduced ? 'system' : 'full' })
    scroller.scrollTop = 900
    scroller.dispatchEvent(new dom.window.Event('scroll'))
    const state = adapter.inspect()
    if (width <= 640) assert.equal(state.anchor.horizontalProgress, 0.5)
    assert.equal(state.transition, null)
    adapter.dispose()
  }
})

test('pins a fresh conversation hero to a large Rhodes Island mark and resets traversal state', async () => {
  const { dom, scroller, step } = fixture()
  scroller.innerHTML = `<section data-phase="hero">
    <span data-slot="conversation.hero.brand.mark"><svg></svg></span>
    <h1>探索未至之境</h1>
    <div data-composer-seat></div>
  </section>`
  const emblems = [
    { key: 'lungmen', label: '龙门', source: 'data:image/png;base64,AA==' },
    { key: 'rhodes-island', label: '罗德岛', source: 'data:image/png;base64,AA==' },
  ]
  const adapter = createParticleFieldAdapter({ document: dom.window.document, window: dom.window, emblems, emblemMasks: masksFor(emblems) })
  adapter.update({ enabled: true, texture: 'full', motion: 'full' })

  assert.equal(scroller.hasAttribute('data-prts-hero-active'), true)
  assert.equal(adapter.inspect().hero, true)
  assert.equal(adapter.inspect().emblemKey, 'rhodes-island')
  assert.equal(adapter.inspect().anchor.horizontalProgress, 0.5)

  scroller.scrollTop = 1640
  scroller.dispatchEvent(new dom.window.Event('scroll'))
  assert.equal(adapter.inspect().segment, 0)
  assert.equal(adapter.inspect().transition, null)

  scroller.replaceChildren(Object.assign(dom.window.document.createElement('article'), { textContent: '第一条回复' }))
  await new Promise(resolve => dom.window.setTimeout(resolve, 0))
  step(0)
  assert.equal(adapter.inspect().hero, false)
  assert.deepEqual(adapter.inspect().transition, { fromSide: -1, toSide: -1, direction: 1 })
  for (let index = 0; index < 70; index += 1) step(16)

  scroller.scrollTop = 824
  scroller.dispatchEvent(new dom.window.Event('scroll'))
  for (let index = 0; index < 70; index += 1) step(16)
  assert.equal(adapter.inspect().segment, 1)

  const nextHero = dom.window.document.createElement('section')
  nextHero.dataset.phase = 'hero'
  nextHero.innerHTML = '<span data-slot="conversation.hero.brand.mark"><svg></svg></span><div data-composer-seat></div>'
  scroller.replaceChildren(nextHero)
  await new Promise(resolve => dom.window.setTimeout(resolve, 0))
  step(0)
  assert.equal(adapter.inspect().hero, true)
  assert.equal(adapter.inspect().segment, 0)
  assert.equal(adapter.inspect().side, -1)
  assert.equal(adapter.inspect().emblemKey, 'rhodes-island')
  assert.equal(adapter.inspect().layoutPhase, null)
  adapter.dispose()
})

test('debounces density changes and reassembles the current emblem without changing scene', async () => {
  const { dom, step } = fixture()
  const adapter = createParticleFieldAdapter({ document: dom.window.document, window: dom.window, emblem: '<svg />', emblemMasks: masksFor() })
  const standard = {
    enabled: true,
    texture: 'full',
    motion: 'full',
    conversationParticleDensity: 'standard',
    heroParticleDensity: 'dense',
  }
  adapter.update(standard)
  assert.equal(adapter.inspect().particles, 400)

  adapter.update({ ...standard, conversationParticleDensity: 'ultra' })
  assert.equal(adapter.inspect().densityPending, true)
  assert.equal(adapter.inspect().particles, 400, 'the old emblem remains intact during the 180ms debounce')
  await new Promise(resolve => dom.window.setTimeout(resolve, 200))
  assert.deepEqual(adapter.inspect().densityTransition, { mode: 'reassemble', from: 400, to: 625 })
  for (let index = 0; index < 55; index += 1) step(16)
  assert.equal(adapter.inspect().particles, 625)
  assert.equal(adapter.inspect().densityCapped, false)
  assert.equal(adapter.inspect().segment, 0)
  assert.equal(adapter.inspect().side, -1)

  adapter.update({ ...standard, conversationParticleDensity: 'sparse' })
  await new Promise(resolve => dom.window.setTimeout(resolve, 200))
  for (let index = 0; index < 55; index += 1) step(16)
  assert.equal(adapter.inspect().particles, 225)

  adapter.update({ ...standard, conversationParticleDensity: 'sparse', heroParticleDensity: 'ultra' })
  assert.equal(adapter.inspect().densityPending, false, 'changing the inactive hero density must not disturb the conversation emblem')
  assert.equal(adapter.inspect().densityTransition, null)
  adapter.dispose()
})

test('shrinks particle radius while a denser complete lattice is assembled', async () => {
  const { dom, step } = fixture()
  let radii = []
  dom.window.CanvasRenderingContext2D = class {}
  dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    setTransform() {},
    clearRect() { radii = [] },
    beginPath() {},
    arc(x, y, radius) { radii.push(radius) },
    fill() {},
    set fillStyle(value) {},
  })
  const adapter = createParticleFieldAdapter({
    document: dom.window.document,
    window: dom.window,
    emblem: '<svg />',
    emblemMasks: masksFor(),
  })
  const preferences = {
    enabled: true,
    texture: 'full',
    motion: 'full',
    conversationParticleDensity: 'standard',
    heroParticleDensity: 'light',
  }
  adapter.update(preferences)
  step(16)
  assert.deepEqual([...new Set(radii.map(radius => radius.toFixed(3)))], ['0.820'])

  adapter.update({ ...preferences, conversationParticleDensity: 'ultra' })
  await new Promise(resolve => dom.window.setTimeout(resolve, 200))
  step(16)
  step(390)
  const midpoint = adapter.inspect()
  assert.ok(midpoint.particles > 400 && midpoint.particles < 625)
  assert.ok(radii.every(radius => radius < 0.82 && radius > 0.65))

  for (let index = 0; index < 30; index += 1) step(16)
  assert.equal(adapter.inspect().particles, 625)
  assert.deepEqual([...new Set(radii.map(radius => radius.toFixed(3)))], ['0.650'])
  adapter.dispose()
})

test('uses the hero density and a composer-safe Rhodes Island stage independently', async () => {
  const { dom, scroller, step } = fixture()
  Object.defineProperty(dom.window, 'innerHeight', { configurable: true, value: 1080 })
  scroller.innerHTML = `<section data-phase="hero">
    <span data-slot="conversation.hero.brand.mark"><svg></svg></span>
    <h1>探索未至之境</h1>
    <div data-composer-seat></div>
  </section>`
  const adapter = createParticleFieldAdapter({ document: dom.window.document, window: dom.window, emblem: '<svg />', emblemMasks: masksFor() })
  adapter.update({
    enabled: true,
    texture: 'full',
    motion: 'full',
    conversationParticleDensity: 'light',
    heroParticleDensity: 'dense',
  })
  assert.equal(adapter.inspect().particles, 484)
  assert.ok(adapter.inspect().heroSize >= 450 && adapter.inspect().heroSize <= 454)

  scroller.replaceChildren(Object.assign(dom.window.document.createElement('article'), { textContent: '第一条回复' }))
  await new Promise(resolve => dom.window.setTimeout(resolve, 0))
  step(0)
  assert.equal(adapter.inspect().hero, false)
  for (let index = 0; index < 70; index += 1) step(16)
  assert.equal(adapter.inspect().particles, 289)
  assert.equal(adapter.inspect().density, 'light')
  adapter.dispose()
})

test('pauses while hidden or offscreen and resolves an interrupted resize at its final anchor', async () => {
  const { dom, step } = fixture()
  const operation = dom.window.document.querySelector('[data-prts-region="operation"]')
  let operationWidth = 1440
  operation.getBoundingClientRect = () => ({ left: 0, top: 0, width: operationWidth, height: 800 })
  let resizeCallback
  dom.window.ResizeObserver = class {
    constructor(callback) { resizeCallback = callback }
    observe() {}
    disconnect() {}
  }
  let intersectionCallback
  dom.window.IntersectionObserver = class {
    constructor(callback) { intersectionCallback = callback }
    observe() {}
    disconnect() {}
  }
  const adapter = createParticleFieldAdapter({ document: dom.window.document, window: dom.window, emblem: '<svg />', emblemMasks: masksFor() })
  adapter.update({ enabled: true, texture: 'full', motion: 'full' })

  operationWidth = 1200
  resizeCallback([])
  step()
  assert.equal(adapter.inspect().resizing, true)
  assert.equal(adapter.inspect().layoutPhase, null)
  assert.equal(adapter.inspect().layoutReassemblies, 0)

  intersectionCallback([{ isIntersecting: false, intersectionRatio: 0 }])
  assert.equal(adapter.inspect().suspended, true)
  intersectionCallback([{ isIntersecting: true, intersectionRatio: 1 }])
  assert.equal(adapter.inspect().suspended, true)

  await new Promise(resolve => dom.window.setTimeout(resolve, 170))
  step()
  step()
  assert.equal(adapter.inspect().suspended, false)
  assert.equal(adapter.inspect().resizing, false)
  assert.equal(adapter.inspect().fieldWidth, 1200)
  assert.equal(adapter.inspect().layoutPhase, null)
  assert.equal(adapter.inspect().layoutReassemblies, 0)
  Object.defineProperty(dom.window.document, 'visibilityState', { configurable: true, value: 'hidden' })
  dom.window.document.dispatchEvent(new dom.window.Event('visibilitychange'))
  assert.equal(adapter.inspect().suspended, true)
  Object.defineProperty(dom.window.document, 'visibilityState', { configurable: true, value: 'visible' })
  dom.window.document.dispatchEvent(new dom.window.Event('visibilitychange'))
  assert.equal(adapter.inspect().suspended, false)
  adapter.dispose()
})

test('uses the same single-commit resize transaction in reduced-motion mode', async () => {
  const { dom, step } = fixture(1440, true)
  const operation = dom.window.document.querySelector('[data-prts-region="operation"]')
  let operationWidth = 1440
  operation.getBoundingClientRect = () => ({ left: 0, top: 0, width: operationWidth, height: 800 })
  let resizeCallback
  dom.window.ResizeObserver = class {
    constructor(callback) { resizeCallback = callback }
    observe() {}
    disconnect() {}
  }
  let paintedAlphas = []
  let paintPasses = 0
  dom.window.CanvasRenderingContext2D = class {}
  dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    setTransform() {},
    clearRect() { paintedAlphas = []; paintPasses += 1 },
    beginPath() {},
    arc() {},
    fill() {},
    set fillStyle(value) {
      paintedAlphas.push(Number(value.match(/,([0-9.]+)\)$/)?.[1] || 0))
    },
  })
  const adapter = createParticleFieldAdapter({
    document: dom.window.document,
    window: dom.window,
    emblem: '<svg />',
    emblemMasks: masksFor(),
  })
  adapter.update({
    enabled: true,
    texture: 'full',
    motion: 'system',
    conversationParticleDensity: 'sparse',
    heroParticleDensity: 'light',
    particlePattern: 'orthogonal',
  })

  const initialPaintPasses = paintPasses
  operationWidth = 1200
  resizeCallback([])
  step(16)
  assert.equal(adapter.inspect().resizing, true)
  assert.equal(dom.window.document.querySelector('[data-prts-particle-layer]').hasAttribute('data-prts-resizing'), true)
  assert.equal(dom.window.document.documentElement.hasAttribute('data-prts-resizing'), false)
  for (let index = 0; index < 7; index += 1) step(16)
  assert.equal(paintPasses, initialPaintPasses)
  assert.equal(adapter.inspect().layoutPhase, null)

  await new Promise(resolve => dom.window.setTimeout(resolve, 180))
  step()
  step()
  assert.equal(paintPasses, initialPaintPasses + 1)
  assert.ok(Math.max(...paintedAlphas) > 0.1)
  assert.equal(adapter.inspect().fieldWidth, 1200)
  assert.equal(adapter.inspect().layoutPhase, null)
  assert.equal(adapter.inspect().layoutReassemblies, 0)
  adapter.dispose()
})

test('queues density reassembly behind faction travel and crossfades in reduced-motion mode', async () => {
  const { dom, scroller, step } = fixture()
  const adapter = createParticleFieldAdapter({ document: dom.window.document, window: dom.window, emblem: '<svg />', emblemMasks: masksFor() })
  const standard = {
    enabled: true,
    texture: 'full',
    motion: 'full',
    conversationParticleDensity: 'standard',
    heroParticleDensity: 'dense',
  }
  adapter.update(standard)
  scroller.scrollTop = 824
  scroller.dispatchEvent(new dom.window.Event('scroll'))
  adapter.update({ ...standard, conversationParticleDensity: 'ultra' })
  await new Promise(resolve => dom.window.setTimeout(resolve, 200))
  assert.ok(adapter.inspect().transition)
  assert.equal(adapter.inspect().densityTransition, null)
  assert.equal(adapter.inspect().densityPending, true)
  for (let index = 0; index < 70; index += 1) step(16)
  assert.deepEqual(adapter.inspect().densityTransition, { mode: 'reassemble', from: 400, to: 625 })
  for (let index = 0; index < 55; index += 1) step(16)
  assert.equal(adapter.inspect().particles, 625)
  assert.equal(adapter.inspect().segment, 1)
  adapter.dispose()

  const reducedFixture = fixture(1440, true)
  const reducedAdapter = createParticleFieldAdapter({ document: reducedFixture.dom.window.document, window: reducedFixture.dom.window, emblem: '<svg />', emblemMasks: masksFor() })
  reducedAdapter.update({ ...standard, motion: 'system' })
  reducedAdapter.update({ ...standard, motion: 'system', conversationParticleDensity: 'ultra' })
  await new Promise(resolve => reducedFixture.dom.window.setTimeout(resolve, 200))
  assert.deepEqual(reducedAdapter.inspect().densityTransition, { mode: 'crossfade', from: 400, to: 625 })
  for (let index = 0; index < 12; index += 1) reducedFixture.step(16)
  assert.equal(reducedAdapter.inspect().particles, 625)
  reducedAdapter.dispose()
})

test('trims transparent emblem padding before fitting the optical stage', () => {
  const width = 12
  const height = 10
  const pixels = new Uint8ClampedArray(width * height * 4)
  for (let y = 3; y <= 8; y += 1) {
    for (let x = 2; x <= 9; x += 1) pixels[(y * width + x) * 4 + 3] = 255
  }
  assert.deepEqual(findAlphaBounds(pixels, width, height), {
    left: 2, top: 3, right: 9, bottom: 8, width: 8, height: 6,
  })
  assert.equal(findAlphaBounds(new Uint8Array(width * height), width, height), null)
})

test('creates deterministic complete orthogonal lattices with density-driven size and count', () => {
  const width = 96
  const height = 96
  const alpha = new Uint8Array(width * height)
  for (let y = 10; y < 86; y += 1) {
    for (let x = 10; x < 86; x += 1) alpha[y * width + x] = 255
  }
  const mask = { width, height, alpha }
  const counts = []
  const radii = []
  for (const density of ['sparse', 'light', 'standard', 'dense', 'ultra']) {
    const targets = createOrthogonalTargets(mask, density)
    assert.deepEqual(createOrthogonalTargets(mask, density), targets)
    assert.equal(new Set(targets.map(point => point.latticeColumn + ':' + point.latticeRow)).size, targets.length)
    for (const point of targets) {
      const x = Math.round(point.x * width + width / 2)
      const y = Math.round(point.y * height + height / 2)
      assert.ok(alpha[y * width + x] > 40)
    }
    counts.push(targets.length)
    radii.push(PARTICLE_DENSITY_PROFILES[density].radius)
  }
  assert.deepEqual([...counts].sort((left, right) => left - right), counts)
  assert.deepEqual([...radii].sort((left, right) => right - left), radii)
})

test('covers every significant structure in all five official emblem masks', async () => {
  const definitions = [
    ['rhodes-island', 0.86, [963, 1215, 1578, 2023, 2604]],
    ['lungmen', 0.84, [916, 1152, 1482, 1895, 2470]],
    ['penguin-logistics', 0.87, [1052, 1322, 1710, 2201, 2860]],
    ['rhine-lab', 0.87, [714, 904, 1172, 1507, 1952]],
    ['reunion', 0.85, [383, 492, 625, 811, 1030]],
  ]
  const densities = ['sparse', 'light', 'standard', 'dense', 'ultra']
  for (const [key, opticalScale, expectedCounts] of definitions) {
    const input = await readFile(new URL('../src/assets/faction-emblems/' + key + '.png', import.meta.url))
    const mask = createExactEmblemMask(input, { opticalScale })
    const counts = []
    for (const density of densities) {
      const coverage = inspectOrthogonalCoverage(mask, density)
      counts.push(coverage.targets.length)
      assert.equal(coverage.coveredComponents, coverage.requiredComponents, key + '/' + density)
      assert.deepEqual(coverage.missingComponents, [])
    }
    assert.deepEqual(counts, expectedCounts)
  }
})

test('ignores retired algorithm preferences and remains orthogonal', () => {
  const { dom } = fixture()
  const adapter = createParticleFieldAdapter({ document: dom.window.document, window: dom.window, emblem: '<svg />', emblemMasks: masksFor() })
  const preferences = {
    enabled: true,
    texture: 'full',
    motion: 'full',
    conversationParticleDensity: 'standard',
    heroParticleDensity: 'dense',
    particlePattern: 'organic',
  }
  adapter.update(preferences)
  const population = adapter.inspect().particles
  adapter.update({ ...preferences, particlePattern: 'hex' })
  assert.equal(adapter.inspect().densityPending, false)
  assert.equal(adapter.inspect().pattern, 'orthogonal')
  assert.equal(adapter.inspect().particles, population)
  adapter.dispose()
})


test('never substitutes a simplified emblem when exact mask data is unavailable', () => {
  const { dom } = fixture()
  const adapter = createParticleFieldAdapter({
    document: dom.window.document,
    window: dom.window,
    emblems: [{ key: 'rhodes-island', label: '罗德岛', source: 'data:image/png;base64,AA==' }],
    emblemMasks: [],
  })
  adapter.update({
    enabled: true,
    texture: 'full',
    motion: 'reduced',
    conversationParticleDensity: 'standard',
    heroParticleDensity: 'dense',
    particlePattern: 'orthogonal',
  })
  const state = adapter.inspect()
  assert.equal(state.phase, 'error')
  assert.equal(state.error, '徽记资源异常')
  assert.equal(state.particles, 0)
  assert.equal(state.appliedPattern, null)
  adapter.dispose()
})

test('renders visibly aligned canvas coordinates for the orthogonal algorithm', () => {
  const { dom, step } = fixture(1440, true)
  let arcs = []
  dom.window.CanvasRenderingContext2D = class {}
  dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    setTransform() {},
    clearRect() { arcs = [] },
    beginPath() {},
    arc(x, y) { arcs.push([x, y]) },
    fill() {},
    set fillStyle(value) {},
  })
  const adapter = createParticleFieldAdapter({
    document: dom.window.document,
    window: dom.window,
    emblem: '<svg />',
    emblemMasks: masksFor(),
  })
  adapter.update({
    enabled: true,
    texture: 'full',
    motion: 'system',
    conversationParticleDensity: 'sparse',
    heroParticleDensity: 'light',
  })
  step(16)
  const state = adapter.inspect()
  const rows = new Set(arcs.map(([, y]) => y.toFixed(2)))
  const columns = new Set(arcs.map(([x]) => x.toFixed(2)))
  assert.equal(state.phase, 'applied')
  assert.equal(state.appliedPattern, 'orthogonal')
  assert.ok(rows.size < state.particles / 4)
  assert.ok(columns.size < state.particles / 4)
  adapter.dispose()
})
test('freezes rapid resize bursts, preserves the backing store, and commits the final size once', async () => {
  const { dom, step } = fixture()
  const operation = dom.window.document.querySelector('[data-prts-region="operation"]')
  let operationWidth = 1440
  let operationHeight = 800
  operation.getBoundingClientRect = () => ({ left: 0, top: 0, width: operationWidth, height: operationHeight })

  let resizeCallback
  dom.window.ResizeObserver = class {
    constructor(callback) { resizeCallback = callback }
    observe() {}
    disconnect() {}
  }

  let backingStoreUpdates = 0
  let arcsSinceClear = 0
  dom.window.CanvasRenderingContext2D = class {}
  dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    setTransform() { backingStoreUpdates += 1 },
    clearRect() { arcsSinceClear = 0 },
    beginPath() {},
    arc() { arcsSinceClear += 1 },
    fill() {},
    set fillStyle(value) {},
  })

  const adapter = createParticleFieldAdapter({
    document: dom.window.document,
    window: dom.window,
    emblem: '<svg />',
    emblemMasks: masksFor(),
  })
  adapter.update({
    enabled: true,
    texture: 'full',
    motion: 'full',
    conversationParticleDensity: 'standard',
    heroParticleDensity: 'dense',
    particlePattern: 'orthogonal',
  })

  const initial = adapter.inspect()
  const initialBackingStoreUpdates = backingStoreUpdates
  assert.equal(initial.emblemKey, 'rhodes-island')
  assert.equal(initial.segment, 0)
  assert.equal(initial.pattern, 'orthogonal')

  operationWidth = 1340
  resizeCallback([{ target: operation, contentRect: { width: 1340, height: 800 } }])
  step(16)
  assert.equal(adapter.inspect().resizePending, true)
  assert.equal(adapter.inspect().resizing, true)
  assert.equal(adapter.inspect().layoutPhase, null)
  assert.equal(adapter.inspect().densityTransition, null)
  assert.equal(adapter.inspect().layoutReassemblies, 0)
  assert.equal(dom.window.document.querySelector('[data-prts-particle-layer]').hasAttribute('data-prts-resizing'), true)
  assert.equal(dom.window.document.documentElement.hasAttribute('data-prts-resizing'), false)

  arcsSinceClear = 0
  for (const nextWidth of [1260, 1160]) {
    operationWidth = nextWidth
    resizeCallback([{ target: operation, contentRect: { width: nextWidth, height: 800 } }])
    step(16)
    assert.equal(arcsSinceClear, 0, 'particle painting stays frozen throughout the resize burst')
    assert.equal(backingStoreUpdates, initialBackingStoreUpdates)
    assert.equal(adapter.inspect().particles, initial.particles)
    assert.equal(adapter.inspect().emblemKey, initial.emblemKey)
    assert.equal(adapter.inspect().segment, initial.segment)
    assert.equal(adapter.inspect().fieldWidth, 1440)
  }

  assert.equal(adapter.inspect().canvasWidth, 1440)
  operationWidth = 1200
  operationHeight = 720
  resizeCallback([{ target: operation, contentRect: { width: 1200, height: 720 } }])
  step(16)
  assert.equal(adapter.inspect().resizeObservations, 4)
  assert.equal(backingStoreUpdates, initialBackingStoreUpdates)

  await new Promise(resolve => dom.window.setTimeout(resolve, 180))
  step()
  step()
  const settled = adapter.inspect()
  assert.ok(arcsSinceClear > 0)
  assert.equal(backingStoreUpdates, initialBackingStoreUpdates + 1)
  assert.equal(settled.canvasHeight, 720)
  assert.equal(settled.fieldHeight, 720)
  assert.equal(settled.canvasWidth, 1200)
  assert.equal(settled.fieldWidth, 1200)
  assert.equal(settled.resizePending, false)
  assert.equal(settled.resizeCommits, 1)
  assert.equal(settled.densityTransition, null)
  assert.equal(settled.layoutPending, false)
  assert.equal(settled.layoutReassemblies, 0)
  assert.equal(settled.emblemKey, initial.emblemKey)
  assert.equal(settled.layoutPhase, null)
  assert.equal(settled.segment, initial.segment)
  assert.equal(settled.pattern, initial.pattern)
  adapter.dispose()
})

test('keeps the normalized particle population fixed through the resize freeze and final commit', async () => {
  const { dom, step } = fixture(1440)
  const operation = dom.window.document.querySelector('[data-prts-region="operation"]')
  let operationWidth = 1000
  operation.getBoundingClientRect = () => ({ left: 0, top: 0, width: operationWidth, height: 800 })

  let resizeCallback
  dom.window.ResizeObserver = class {
    constructor(callback) { resizeCallback = callback }
    observe() {}
    disconnect() {}
  }

  let paintedAlphas = []
  dom.window.CanvasRenderingContext2D = class {}
  dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    setTransform() {},
    clearRect() { paintedAlphas = [] },
    beginPath() {},
    arc() {},
    fill() {},
    set fillStyle(value) {
      paintedAlphas.push(Number(value.match(/,([0-9.]+)\)$/)?.[1] || 0))
    },
  })

  const adapter = createParticleFieldAdapter({
    document: dom.window.document,
    window: dom.window,
    emblem: '<svg />',
    emblemMasks: masksFor(),
  })
  adapter.update({
    enabled: true,
    texture: 'full',
    motion: 'full',
    conversationParticleDensity: 'standard',
    heroParticleDensity: 'dense',
    particlePattern: 'orthogonal',
  })
  const initialCount = adapter.inspect().particles
  assert.equal(initialCount, 400)

  operationWidth = 1200
  resizeCallback([{ target: operation, contentRect: { width: 1200, height: 800 } }])
  for (let index = 0; index < 12; index += 1) step(16)
  const whilePanelMoves = adapter.inspect()
  assert.equal(whilePanelMoves.resizing, true)
  assert.equal(whilePanelMoves.layoutPhase, null)
  assert.equal(whilePanelMoves.particles, 400)
  assert.ok(paintedAlphas.filter(alpha => alpha > 0.001).length === initialCount)
  await new Promise(resolve => dom.window.setTimeout(resolve, 180))
  step()
  step()

  const settled = adapter.inspect()
  assert.equal(settled.particles, 400)
  assert.equal(settled.densityTransition, null)
  assert.equal(settled.layoutPhase, null)
  assert.equal(settled.layoutReassemblies, 0)
  assert.equal(settled.resizeCommits, 1)
  assert.equal(settled.fieldWidth, 1200)
  assert.equal(paintedAlphas.length, 400)
  assert.ok(
    paintedAlphas.filter(alpha => alpha > 0.001).length === initialCount,
    'the complete population should be visible immediately after the final size commit',
  )
  adapter.dispose()
})


test("uses the density radius and stable alpha across message and composer surfaces", () => {
  const snapshots = []
  for (const [scheme, expectedAlpha, expectedRadius] of [
    ["dark", "0.72", "1.040"],
    ["light", "0.66", "1.165"],
  ]) {
    const { dom, step } = fixture(1440, true)
    dom.window.document.documentElement.dataset.prtsScheme = scheme
    const scroller = dom.window.document.querySelector("[data-conversation-scroll]")
    scroller.insertAdjacentHTML("beforeend", '<article data-message-role="user">提问</article><div data-composer-seat>输入</div>')
    let radii = []
    let fillStyles = []
    dom.window.CanvasRenderingContext2D = class {}
    dom.window.HTMLCanvasElement.prototype.getContext = () => ({
      setTransform() {},
      clearRect() { radii = []; fillStyles = [] },
      beginPath() {},
      arc(x, y, radius) { radii.push(radius) },
      fill() {},
      set fillStyle(value) { fillStyles.push(value) },
    })
    const adapter = createParticleFieldAdapter({
      document: dom.window.document,
      window: dom.window,
      emblem: "<svg />",
      emblemMasks: masksFor(),
    })
    adapter.update({
      enabled: true,
      texture: "full",
      motion: "system",
      conversationParticleDensity: "sparse",
      heroParticleDensity: "light",
    })
    step(16)
    const uniqueRadii = [...new Set(radii.map(value => value.toFixed(3)))]
    const uniqueAlphas = [...new Set(fillStyles.map(value => value.match(/,([0-9.]+)\)$/)?.[1]))]
    assert.deepEqual(uniqueRadii, [expectedRadius])
    assert.deepEqual(uniqueAlphas, [expectedAlpha])
    snapshots.push({ scheme, uniqueRadii, uniqueAlphas })
    adapter.dispose()
  }
  assert.equal(snapshots.length, 2)
})

test('keeps the fresh-session emblem size continuous across the former phone breakpoint', () => {
  const heroSizeAt = width => {
    const { dom, scroller } = fixture(width, true)
    scroller.innerHTML = `<section data-phase="hero">
      <span data-slot="conversation.hero.brand.mark"><svg></svg></span>
      <div data-composer-seat></div>
    </section>`
    const adapter = createParticleFieldAdapter({
      document: dom.window.document,
      window: dom.window,
      emblem: '<svg />',
      emblemMasks: masksFor(),
    })
    adapter.update({
      enabled: true,
      texture: 'full',
      motion: 'system',
      conversationParticleDensity: 'standard',
      heroParticleDensity: 'standard',
    })
    const size = adapter.inspect().heroSize
    adapter.dispose()
    return size
  }

  const sizes = [639, 640, 641].map(heroSizeAt)
  assert.ok(sizes.every(Number.isFinite))
  assert.ok(Math.abs(sizes[1] - sizes[0]) < 1)
  assert.ok(Math.abs(sizes[2] - sizes[1]) < 1)
})
