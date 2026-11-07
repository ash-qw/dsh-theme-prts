import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import sharp from 'sharp'
import { createRippleRefractionMap } from '../scripts/ripple-refraction.mjs'
import { createCursorAdapter } from '../src/client/cursor-adapter.js'

function setup(context, refractionSupport) {
  const dom = new JSDOM('<html><body><main></main><button>Action</button><input></body></html>')
  const { window } = dom
  const { document } = window
  Object.defineProperty(document, 'hidden', { value: false, configurable: true })
  document.documentElement.style.cursor = 'url(data:image/png;base64,AA),default'
  const computedStyle = window.getComputedStyle.bind(window)
  window.getComputedStyle = target => {
    const style = computedStyle(target)
    if (style.cursor) return style
    let parent = target.parentElement
    let cursor = ''
    while (parent && !cursor) {
      cursor = computedStyle(parent).cursor
      parent = parent.parentElement
    }
    return new Proxy(style, { get: (value, property) => property === 'cursor' ? cursor : Reflect.get(value, property) })
  }
  const animations = new Set()
  const timers = new Map()
  const changes = new Set()
  const media = { matches: false, addEventListener: (name, callback) => changes.add(callback), removeEventListener: (name, callback) => changes.delete(callback) }
  window.matchMedia = () => media
  window.setTimeout = callback => { const id = Symbol(); timers.set(id, callback); return id }
  window.clearTimeout = id => timers.delete(id)
  window.Element.prototype.animate = function (keyframes, options) {
    let resolve, reject
    const finished = new Promise((done, fail) => { resolve = done; reject = fail })
    const animation = {
      target: this, keyframes, options, finished,
      finish() { animations.delete(animation); resolve() },
      cancel() { animations.delete(animation); reject(new Error('cancelled')) },
    }
    animations.add(animation)
    return animation
  }
  const assets = { hotspot: [7, 6], hold: 'hold', press: [{ url: 'press', duration: 16 }, { url: 'end', duration: 60000 }], release: [{ url: 'release', duration: 16 }, { url: 'end', duration: 60000 }] }
  if (refractionSupport !== undefined) {
    assets.refractionMap = 'data:image/png;base64,AA'
    window.CSS = { supports: () => refractionSupport }
  }
  const adapter = createCursorAdapter({ document, window, assets })
  const preferences = { enabled: true, cursor: 'prts', motion: 'system' }
  adapter.update(preferences)
  const fire = (name = 'pointerdown', target = document.querySelector('main'), options = {}) => {
    const event = new window.Event(name, { bubbles: true })
    Object.assign(event, { pointerType: 'mouse', pointerId: 1, isPrimary: true, button: 0, buttons: 1, clientX: 160, clientY: 140 }, options)
    target.dispatchEvent(event)
  }
  const feedback = () => document.querySelector('[data-prts-cursor-feedback]')?.shadowRoot || document.createDocumentFragment()
  const ripples = () => [...feedback().querySelectorAll('[data-prts-click-ripple]')]
  context.after(() => { adapter.dispose(); dom.window.close() })
  return { window, document, feedback, adapter, preferences, fire, ripples, animations, timers, media, changes }
}

for (const count of [0, 128, 256, 257, 10000]) {
  test('passive click creates one bounded local ripple without counting descendants: ' + count, async context => {
    const fixture = setup(context)
    const target = fixture.document.querySelector('main')
    target.innerHTML = '<span>Content</span>'.repeat(count)
    target.getElementsByTagName = () => { throw Error('Do not count descendants') }
    const root = fixture.document.documentElement
    const observer = new fixture.window.MutationObserver(() => {})
    observer.observe(root, { attributes: true })
    observer.observe(target, { attributes: true })
    fixture.fire()
    assert.equal(fixture.ripples().length, 1)
    const [ripple] = fixture.ripples()
    assert.equal(ripple.children.length, 3)
    assert.equal(ripple.getAttribute('aria-hidden'), 'true')
    assert.equal(ripple.style.transform, 'translate3d(80px, 60px, 0)')
    assert.equal(fixture.document.querySelector('[data-prts-hand-active]'), null)
    assert.equal(fixture.timers.size, 0)
    assert.equal(observer.takeRecords().length, 0)
    assert.equal(fixture.animations.size, 3)
    for (const animation of fixture.animations) {
      for (const frame of animation.keyframes) assert.ok(Object.keys(frame).every(key => ['transform', 'opacity', 'offset'].includes(key)))
      assert.equal(animation.options.duration, 560)
    }
    fixture.fire('pointerup')
    fixture.fire('pointermove', target, { clientX: 800, clientY: 600, buttons: 0 })
    assert.equal(ripple.style.transform, 'translate3d(80px, 60px, 0)')
    for (const animation of [...fixture.animations]) animation.finish()
    await Promise.resolve()
    assert.equal(fixture.ripples().length, 0)
    assert.equal(fixture.animations.size, 0)
    observer.disconnect()
  })
}

test('wave crests use a stronger leading highlight and lighter trailing arcs without extra layers', context => {
  const fixture = setup(context, true)
  fixture.fire()
  const animations = [...fixture.animations]
  const peaks = animations.slice(0, 3).map(animation => animation.keyframes[1].opacity)
  assert.deepEqual(peaks, [.82, .5, .28])
  assert.equal(animations.length, 4)
  for (const animation of animations.slice(0, 3)) {
    assert.equal(animation.keyframes[2].opacity, animation.keyframes[1].opacity * .22)
    assert.equal(animation.keyframes[2].offset, .62)
    assert.equal(animation.keyframes.at(-1).opacity, 0)
  }
  assert.deepEqual(animations[3].keyframes.slice(1, 3), [{ opacity: 1, offset: .06 }, { opacity: 1, offset: .88 }])
  assert.equal(fixture.ripples()[0].children.length, 4)
  assert.equal(fixture.timers.size, 0)
})

for (const tag of ['body', 'html']) test('page background clicks never animate inherited cursors: ' + tag, context => {
  const fixture = setup(context)
  const target = fixture.document.querySelector(tag)
  target.getElementsByTagName = () => { throw Error('Do not count descendants') }
  const cursor = target.style.cursor
  fixture.fire('pointerdown', target)
  assert.equal(fixture.ripples().length, 1)
  assert.equal(target.style.cursor, cursor)
  assert.equal(fixture.timers.size, 0)
})

for (const html of ['<button><svg style="cursor:url(data:image/png;base64,AA),pointer"><path></path></svg></button>', '<a href="#"><span>Link</span></a>', '<div role="menuitem"><span>Menu</span></div>', '<div data-prts-session-row><span>Session</span></div>', '<div style="cursor:url(data:image/png;base64,AA),pointer"><span>Custom action</span></div>']) {
  test('nested interactive targets retain native gesture frames: ' + html, context => {
    const fixture = setup(context)
    const host = fixture.document.querySelector('main')
    host.innerHTML = html
    const target = host.querySelector('path, span')
    fixture.fire('pointerdown', target)
    assert.match(target.style.cursor, /press/)
    assert.equal(fixture.ripples().length, 0)
    assert.equal(fixture.timers.size, 1)
    fixture.fire('pointermove', host)
    assert.equal(target.hasAttribute('data-prts-hand-active'), false)
    assert.equal(host.style.cursor, '')
    assert.equal(fixture.ripples().length, 0)
  })
}

test('fast clicks evict the oldest ripple instead of queuing an unbounded animation backlog', async context => {
  const fixture = setup(context)
  fixture.fire()
  const [oldest] = fixture.ripples()
  for (let index = 0; index < 20; index++) fixture.fire('pointerdown', undefined, { clientX: 200 + index })
  assert.equal(oldest.isConnected, false)
  assert.equal(fixture.ripples().length, 3)
  assert.equal(fixture.animations.size, 9)
  assert.equal(fixture.timers.size, 0)
  await Promise.resolve()
  assert.equal(fixture.ripples().length, 3)
})

for (const progress of [0, .04, .08, .3, .62, .8, 1]) test('interference matches the native highlight envelope at ' + progress, context => {
  const fixture = setup(context)
  const gpu = enableInterference(fixture)
  fixture.fire()
  fixture.fire('pointerdown', undefined, { clientX: 180, clientY: 140 })
  const animations = [...fixture.animations]
  for (const animation of animations) animation.effect.getComputedTiming = () => ({ progress })
  gpu.step()
  const uniforms = gpu.calls.uploads.at(-1)
  for (const [index, animation] of animations.entries()) {
    const frames = [{ opacity: 0, offset: 0 }, ...animation.keyframes.slice(1, 3), { opacity: 0, offset: 1 }]
    const end = frames.findIndex(frame => frame.offset >= progress)
    const start = Math.max(0, end - 1)
    const span = frames[end].offset - frames[start].offset
    const fraction = span ? (progress - frames[start].offset) / span : 0
    const expected = frames[start].opacity + (frames[end].opacity - frames[start].opacity) * fraction
    assert.ok(Math.abs(uniforms[index * 4 + 3] - expected) < 1e-6)
  }
})

for (const reason of ['blur', 'pointercancel', 'dragstart', 'hidden', 'disabled', 'system', 'animation', 'motion', 'media', 'dispose']) {
  test('ripple cleanup cancels every owned animation: ' + reason, async context => {
    const fixture = setup(context)
    fixture.fire()
    assert.equal(fixture.ripples().length, 1)
    assert.equal(fixture.animations.size, 3)
    if (reason === 'hidden') {
      Object.defineProperty(fixture.document, 'hidden', { value: true })
      fixture.document.dispatchEvent(new fixture.window.Event('visibilitychange'))
    } else if (reason === 'disabled') fixture.adapter.update({ ...fixture.preferences, enabled: false })
    else if (reason === 'system') fixture.adapter.update({ ...fixture.preferences, cursor: 'system' })
    else if (reason === 'animation') fixture.adapter.update({ ...fixture.preferences, cursorAnimation: false })
    else if (reason === 'motion') fixture.adapter.update({ ...fixture.preferences, motion: 'reduced' })
    else if (reason === 'media') { fixture.media.matches = true; for (const callback of fixture.changes) callback() }
    else if (reason === 'dispose') fixture.adapter.dispose()
    else fixture.fire(reason, reason === 'blur' ? fixture.window : undefined)
    assert.equal(fixture.ripples().length, 0)
    assert.equal(fixture.animations.size, 0)
    assert.equal(fixture.timers.size, 0)
    await Promise.resolve()
    if (reason === 'dispose') assert.equal(fixture.changes.size, 0)
  })
}

for (const cursor of ['text', 'vertical-text']) {
  for (const inherited of [false, true]) test('readable text has no click feedback: ' + cursor + ', inherited=' + inherited, context => {
    const fixture = setup(context)
    const target = fixture.document.querySelector('main')
    const owner = inherited ? fixture.document.body : target
    owner.style.cursor = 'url(data:image/png;base64,AA), ' + cursor
    fixture.fire()
    assert.equal(fixture.ripples().length, 0)
    assert.equal(target.hasAttribute('data-prts-hand-active'), false)
    assert.equal(fixture.animations.size, 0)
    assert.equal(fixture.timers.size, 0)
    assert.match(fixture.window.getComputedStyle(target).cursor, new RegExp(', ' + cursor + '$'))
  })
}

test('a text click leaves existing background ripples playing', context => {
  const fixture = setup(context)
  fixture.fire()
  const [existing] = fixture.ripples()
  const target = fixture.document.querySelector('main')
  target.style.cursor = 'url(data:image/png;base64,AA), text'
  fixture.fire()
  assert.deepEqual(fixture.ripples(), [existing])
  assert.equal(fixture.animations.size, 3)
  target.style.removeProperty('cursor')
  fixture.fire()
  assert.equal(fixture.ripples().length, 2)
})

for (const cursor of ['text', 'grab', 'grabbing', 'not-allowed', 'no-drop', 'col-resize', 'row-resize', 'nwse-resize']) {
  test('special control cursor is not replaced or covered by click feedback: ' + cursor, context => {
    const fixture = setup(context)
    const target = fixture.document.querySelector('input')
    target.style.cursor = 'url(data:image/png;base64,AA), ' + cursor
    fixture.fire('pointerdown', target)
    assert.equal(fixture.ripples().length, 0)
    assert.equal(target.hasAttribute('data-prts-hand-active'), false)
    assert.equal(fixture.timers.size, 0)
  })
}

for (const html of ['<button disabled><span>Disabled</span></button>', '<div role="button" aria-disabled="true"><span>Disabled</span></div>', '<div inert><span>Inert</span></div>', '<label for="disabled-input"><span>Label</span></label><input id="disabled-input" disabled>', '<div data-prts-region-stage><span>Crop</span></div>']) {
  test('disabled, inert and crop targets are left alone: ' + html, context => {
    const fixture = setup(context)
    fixture.document.querySelector('main').innerHTML = html
    fixture.fire('pointerdown', fixture.document.querySelector('main span'))
    assert.equal(fixture.ripples().length, 0)
    assert.equal(fixture.document.querySelector('[data-prts-hand-active]'), null)
    assert.equal(fixture.timers.size, 0)
  })
}

for (const options of [{ pointerType: 'touch' }, { pointerType: 'pen' }, { button: 2 }, { isPrimary: false }]) test('non-primary mouse input does not start ripples: ' + JSON.stringify(options), context => {
  const fixture = setup(context)
  fixture.fire('pointerdown', undefined, options)
  assert.equal(fixture.ripples().length, 0)
})

test('unsupported or failing animation APIs fail closed without leaking decorations', async context => {
  const fixture = setup(context)
  fixture.window.Element.prototype.animate = undefined
  fixture.fire()
  assert.equal(fixture.ripples().length, 0)
  fixture.window.Element.prototype.animate = () => { throw Error('Unsupported') }
  fixture.fire()
  assert.equal(fixture.ripples().length, 0)
  await Promise.resolve()
})

test('reduced motion and disabled animation prevent new expanding ripples', context => {
  const fixture = setup(context)
  fixture.document.documentElement.dataset.prtsMotion = 'reduced'
  fixture.fire()
  assert.equal(fixture.ripples().length, 0)
  fixture.document.documentElement.dataset.prtsMotion = 'system'
  fixture.adapter.update({ ...fixture.preferences, cursorAnimation: false })
  fixture.fire()
  assert.equal(fixture.ripples().length, 0)
})

function enableInterference(fixture, { available = true, linked = true, ready = true } = {}) {
  const idle = new Map()
  const frames = new Map()
  const calls = { draws: 0, contexts: 0, deleted: 0, uploads: [], shaders: [], inks: [] }
  const gl = {
    VERTEX_SHADER: 1, FRAGMENT_SHADER: 2, ARRAY_BUFFER: 3, STATIC_DRAW: 4, LINK_STATUS: 5, FLOAT: 6, TRIANGLES: 7,
    createProgram: () => ({}), createShader: () => ({}), createBuffer: () => ({}),
    shaderSource: (shader, source) => calls.shaders.push(source), compileShader() {}, attachShader() {}, linkProgram() {},
    getProgramParameter: () => linked, useProgram() {}, bindBuffer() {}, bufferData() {}, getAttribLocation: () => 0,
    enableVertexAttribArray() {}, vertexAttribPointer() {}, getUniformLocation: (program, name) => name,
    uniform3fv: (uniform, values) => calls.inks.push([...values]), uniform2f() {}, uniform1f() {}, uniform1i() {}, uniform2fv() {}, viewport() {},
    createTexture: () => ({}), bindTexture() {}, pixelStorei() {}, texImage2D() {}, texParameteri() {}, generateMipmap() {},
    deleteTexture: () => calls.deleted++,
    uniform4fv: (uniform, values) => calls.uploads.push([...values]), drawArrays: () => calls.draws++,
    deleteBuffer: () => calls.deleted++, deleteShader: () => calls.deleted++, deleteProgram: () => calls.deleted++,
    getExtension: () => null,
  }
  fixture.window.WebGLRenderingContext = function () {}
  fixture.window.requestIdleCallback = callback => { const key = Symbol(); idle.set(key, callback); return key }
  fixture.window.cancelIdleCallback = key => idle.delete(key)
  fixture.window.Image = class { set src(value) { this.onload?.() } }
  fixture.window.requestAnimationFrame = callback => { const key = Symbol(); frames.set(key, callback); return key }
  fixture.window.cancelAnimationFrame = key => frames.delete(key)
  fixture.window.HTMLCanvasElement.prototype.getContext = () => { calls.contexts++; return available ? gl : null }
  const animate = fixture.window.Element.prototype.animate
  fixture.window.Element.prototype.animate = function (...args) {
    const animation = animate.apply(this, args)
    animation.effect = { getComputedTiming: () => ({ progress: .4 }) }
    return animation
  }
  const step = () => {
    const pending = [...frames]
    frames.clear()
    for (const [key, callback] of pending) callback()
  }
  fixture.adapter.update(fixture.preferences)
  const warm = (budget = 50) => {
    const pending = [...idle.values()]
    idle.clear()
    for (const callback of pending) callback({ timeRemaining: () => budget })
  }
  if (ready) warm()
  return { frames, calls, idle, warm, step, layer: () => fixture.feedback().querySelector('[data-prts-ripple-interference]') }
}

test('interference is lazy, bounded to nearby waves, and samples animation phase without descendant scans', context => {
  const fixture = setup(context)
  const gpu = enableInterference(fixture, { ready: false })
  fixture.fire()
  assert.equal(gpu.calls.contexts, 0)
  fixture.fire('pointerdown', undefined, { clientX: 800, clientY: 700 })
  assert.equal(gpu.calls.contexts, 0)
  gpu.warm()
  assert.equal(gpu.calls.contexts, 1)
  fixture.fire('pointerdown', undefined, { clientX: 220, clientY: 140 })
  assert.equal(gpu.calls.contexts, 1)
  assert.equal(fixture.feedback().querySelectorAll('[data-prts-ripple-mixed]').length, 2)
  assert.equal(gpu.layer().width, 220)
  assert.equal(gpu.layer().height, 160)
  assert.equal(gpu.frames.size, 1)
  assert.equal(gpu.calls.uploads.at(-1).filter((value, index) => index % 4 === 3 && value > 0).length, 6)
  assert.equal(gpu.calls.shaders.some(source => source.includes('amplitude+=') && source.includes('texel.r-.42*texel.g') && !/exp\(|distance\(/.test(source)), true)
  gpu.step()
  assert.equal(gpu.frames.size, 1)
  assert.equal(gpu.calls.contexts, 1)
  fixture.adapter.dispose()
  assert.equal(gpu.layer(), null)
  assert.equal(gpu.frames.size, 0)
  assert.equal(gpu.calls.deleted, 5)
})

for (const reason of ['blur', 'pointercancel', 'dragstart', 'hidden', 'disabled', 'system', 'animation', 'motion', 'media', 'dispose']) {
  test('active interference restores rings and stops its frame loop on ' + reason, context => {
    const fixture = setup(context)
    const gpu = enableInterference(fixture)
    fixture.fire()
    fixture.fire('pointerdown', undefined, { clientX: 190 })
    assert.ok(gpu.layer())
    if (reason === 'hidden') {
      Object.defineProperty(fixture.document, 'hidden', { value: true })
      fixture.document.dispatchEvent(new fixture.window.Event('visibilitychange'))
    } else if (reason === 'disabled') fixture.adapter.update({ ...fixture.preferences, enabled: false })
    else if (reason === 'system') fixture.adapter.update({ ...fixture.preferences, cursor: 'system' })
    else if (reason === 'animation') fixture.adapter.update({ ...fixture.preferences, cursorAnimation: false })
    else if (reason === 'motion') fixture.adapter.update({ ...fixture.preferences, motion: 'reduced' })
    else if (reason === 'media') { fixture.media.matches = true; for (const callback of fixture.changes) callback() }
    else if (reason === 'dispose') fixture.adapter.dispose()
    else fixture.fire(reason, reason === 'blur' ? fixture.window : undefined)
    assert.equal(gpu.layer(), null)
    assert.equal(gpu.frames.size, 0)
    assert.equal(fixture.ripples().length, 0)
  })
}

test('interference ends with the last overlapping wave and resumes isolated compositor animation', async context => {
  const fixture = setup(context)
  const gpu = enableInterference(fixture)
  fixture.fire()
  const first = [...fixture.animations]
  fixture.fire('pointerdown', undefined, { clientX: 180 })
  for (const animation of first) animation.finish()
  await Promise.resolve()
  assert.equal(gpu.layer(), null)
  assert.equal(gpu.frames.size, 0)
  assert.equal(fixture.ripples().length, 1)
  assert.equal(fixture.feedback().querySelectorAll('[data-prts-ripple-mixed]').length, 0)
})

for (const failure of ['unavailable', 'compile', 'lost']) test('interference failure restores independent circular feedback: ' + failure, context => {
  const fixture = setup(context)
  const gpu = enableInterference(fixture, { available: failure !== 'unavailable', linked: failure !== 'compile' })
  fixture.fire()
  fixture.fire('pointerdown', undefined, { clientX: 190 })
  if (failure === 'lost') {
    assert.ok(gpu.layer())
    gpu.layer().dispatchEvent(new fixture.window.Event('webglcontextlost', { cancelable: true }))
  }
  assert.equal(gpu.layer(), null)
  assert.equal(gpu.frames.size, 0)
  assert.equal(fixture.ripples().length, 2)
  assert.equal(fixture.feedback().querySelectorAll('[data-prts-ripple-mixed]').length, 0)
})

test('short idle budgets defer warmup and clicks never compile a renderer synchronously', context => {
  const fixture = setup(context)
  const gpu = enableInterference(fixture, { ready: false })
  gpu.warm(2)
  assert.equal(gpu.idle.size, 1)
  fixture.fire()
  fixture.fire('pointerdown', undefined, { clientX: 180 })
  assert.equal(gpu.calls.contexts, 0)
  assert.equal(gpu.layer(), null)
  assert.equal(fixture.ripples().length, 2)
  gpu.warm()
  assert.equal(gpu.calls.contexts, 1)
  assert.ok(gpu.layer())
  assert.equal(gpu.idle.size, 0)
})

test('pending idle warmup is cancelled and cannot resurrect a disposed adapter', context => {
  const fixture = setup(context)
  const gpu = enableInterference(fixture, { ready: false })
  const [callback] = gpu.idle.values()
  fixture.adapter.dispose()
  assert.equal(gpu.idle.size, 0)
  callback({ timeRemaining: () => 50 })
  assert.equal(gpu.calls.contexts, 0)
  assert.equal(gpu.layer(), null)
})

test('animation and reduced-motion preferences cancel pending warmup', context => {
  const fixture = setup(context)
  const gpu = enableInterference(fixture, { ready: false })
  fixture.adapter.update({ ...fixture.preferences, cursorAnimation: false })
  assert.equal(gpu.idle.size, 0)
  fixture.adapter.update(fixture.preferences)
  assert.equal(gpu.idle.size, 1)
  fixture.adapter.update({ ...fixture.preferences, motion: 'reduced' })
  assert.equal(gpu.idle.size, 0)
  gpu.warm()
  assert.equal(gpu.calls.contexts, 0)
})

test('interference frames write only uniforms, leaving layer and target attributes unchanged', context => {
  const fixture = setup(context)
  const gpu = enableInterference(fixture)
  fixture.fire()
  fixture.fire('pointerdown', undefined, { clientX: 180 })
  const observer = new fixture.window.MutationObserver(() => {})
  observer.observe(fixture.feedback(), { attributes: true, childList: true, subtree: true })
  for (let index = 0; index < 10; index++) gpu.step()
  assert.equal(observer.takeRecords().length, 0)
  observer.disconnect()
})

test('nearby repeat clicks reuse the mounted canvas without resetting unchanged backing dimensions', context => {
  const fixture = setup(context)
  const gpu = enableInterference(fixture)
  fixture.fire()
  fixture.fire('pointerdown', undefined, { clientX: 180 })
  const canvas = gpu.layer()
  const observer = new fixture.window.MutationObserver(() => {})
  observer.observe(canvas, { attributes: true, attributeFilter: ['width', 'height'] })
  observer.observe(fixture.feedback(), { childList: true })
  fixture.fire('pointerdown', undefined, { clientX: 180 })
  const records = observer.takeRecords()
  assert.equal(gpu.layer(), canvas)
  assert.equal(records.some(record => record.type === 'attributes'), false)
  assert.equal(records.some(record => [...record.addedNodes, ...record.removedNodes].includes(canvas)), false)
  assert.equal(gpu.calls.contexts, 1)
  observer.disconnect()
})


test('ordinary clicks avoid synchronous top-layer promotion, while native dialog clicks retain it', context => {
  const fixture = setup(context)
  let promotions = 0
  fixture.window.HTMLElement.prototype.showPopover = () => promotions++
  fixture.fire()
  assert.equal(promotions, 0)
  const dialog = fixture.document.createElement('dialog')
  dialog.setAttribute('open', '')
  const content = fixture.document.createElement('div')
  dialog.append(content)
  fixture.document.body.append(dialog)
  fixture.fire('pointerdown', content)
  assert.equal(promotions, 1)
})


test('interference never reads computed styles from newly inserted ripple nodes', context => {
  const fixture = setup(context)
  const gpu = enableInterference(fixture)
  const computed = fixture.window.getComputedStyle
  fixture.window.getComputedStyle = target => {
    assert.equal(target.hasAttribute('data-prts-click-ripple'), false)
    assert.equal(target.hasAttribute('data-prts-ripple-interference'), false)
    return computed(target)
  }
  for (let index = 0; index < 12; index++) fixture.fire('pointerdown', undefined, { clientX: 160 + index % 3 * 20 })
  assert.equal(fixture.ripples().length, 3)
  assert.ok(gpu.layer())
  assert.equal(gpu.calls.draws, 11)
})


test('in-flight interference follows scheme changes without querying computed color', context => {
  const fixture = setup(context)
  const gpu = enableInterference(fixture)
  fixture.fire()
  fixture.fire('pointerdown', undefined, { clientX: 180 })
  fixture.window.getComputedStyle = () => { throw Error('Do not flush styles to obtain ripple colors') }
  fixture.document.documentElement.dataset.prtsScheme = 'light'
  gpu.step()
  assert.deepEqual(gpu.calls.inks.at(-1), [21, 25, 28].map(value => value / 255))
  fixture.document.documentElement.dataset.prtsScheme = 'dark'
  gpu.step()
  assert.deepEqual(gpu.calls.inks.at(-1), [237, 241, 242].map(value => value / 255))
})

test('feedback mutations stay inside a stable shadow host and disposal releases it', async context => {
  const fixture = setup(context, true)
  const host = fixture.document.querySelector('[data-prts-cursor-feedback]')
  assert.ok(host?.shadowRoot)
  assert.equal(fixture.feedback(), host.shadowRoot)
  fixture.adapter.update(fixture.preferences)
  assert.equal(fixture.document.querySelectorAll('[data-prts-cursor-feedback]').length, 1)
  const mutations = []
  const observer = new fixture.window.MutationObserver(records => mutations.push(...records))
  observer.observe(fixture.document.body, { subtree: true, childList: true, attributes: true })
  for (let index = 0; index < 8; index++) fixture.fire()
  assert.equal(fixture.ripples().length, 3)
  assert.equal(fixture.document.querySelector('[data-prts-click-ripple]'), null)
  for (const animation of [...fixture.animations]) animation.finish()
  await Promise.resolve()
  assert.equal(fixture.ripples().length, 0)
  assert.equal(mutations.length + observer.takeRecords().length, 0)
  observer.disconnect()
  fixture.adapter.dispose()
  assert.equal(host.isConnected, false)
  assert.equal(host.shadowRoot.querySelector('[data-prts-click-ripple]'), null)
  assert.equal(fixture.document.querySelector('[data-prts-cursor-feedback]'), null)
  fixture.adapter.update(fixture.preferences)
  assert.notEqual(fixture.document.querySelector('[data-prts-cursor-feedback]'), host)
})

test('interference setup, animation and teardown do not mutate the host document', async context => {
  const fixture = setup(context, true)
  const gpu = enableInterference(fixture)
  const mutations = []
  const observer = new fixture.window.MutationObserver(records => mutations.push(...records))
  observer.observe(fixture.document.body, { subtree: true, childList: true, attributes: true })
  fixture.fire()
  fixture.fire('pointerdown', undefined, { clientX: 180 })
  assert.ok(gpu.layer())
  gpu.step()
  for (const animation of [...fixture.animations]) animation.finish()
  await Promise.resolve()
  assert.equal(mutations.length + observer.takeRecords().length, 0)
  observer.disconnect()
})

test('build-time refraction map is compact, neutral at rest and has opposing radial displacements', async () => {
  const image = await createRippleRefractionMap()
  assert.ok(image.length < 5 * 1024)
  const { data, info } = await sharp(image).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  assert.equal(info.width, 96)
  assert.equal(info.height, 96)
  const channel = (horizontal, vertical, component) => data[(vertical * info.width + horizontal) * info.channels + component]
  assert.ok(Math.abs(channel(48, 48, 0) - 128) <= 1)
  assert.ok(Math.abs(channel(0, 0, 1) - 128) <= 1)
  for (let coordinate = 0; coordinate < 96; coordinate++) {
    for (const [horizontal, vertical] of [[coordinate, 0], [coordinate, 95], [0, coordinate], [95, coordinate]]) {
      assert.ok(Math.abs(channel(horizontal, vertical, 0) - 128) <= 1)
      assert.ok(Math.abs(channel(horizontal, vertical, 1) - 128) <= 1)
    }
  }
  assert.ok(channel(86, 48, 0) < 100)
  assert.ok(channel(90, 48, 0) > 150)
  assert.ok(channel(48, 86, 1) < 100)
  assert.ok(channel(48, 90, 1) > 150)
})

for (const supported of [false, true]) test('cached refraction filter has a bounded optional lifecycle: ' + supported, async context => {
  const fixture = setup(context, supported)
  const definitions = fixture.feedback().querySelectorAll('filter')
  assert.equal(definitions.length, supported ? 1 : 0)
  fixture.adapter.update(fixture.preferences)
  assert.equal(fixture.feedback().querySelectorAll('filter').length, definitions.length)
  fixture.fire()
  assert.equal(fixture.ripples()[0].querySelectorAll('[data-prts-ripple-refraction]').length, supported ? 1 : 0)
  assert.equal(fixture.animations.size, supported ? 4 : 3)
  if (supported) {
    const field = definitions[0].children[0]
    assert.equal(field.getAttribute('href'), 'data:image/png;base64,AA')
    assert.equal(definitions[0].children[1].getAttribute('scale'), '9')
    assert.deepEqual([...fixture.animations].at(-1).keyframes.at(-1), { transform: 'scale(1.45)', opacity: 0 })
    assert.deepEqual([...fixture.animations].at(-1).keyframes.slice(1, 3), [{ opacity: 1, offset: .06 }, { opacity: 1, offset: .88 }])
  }
  for (const animation of [...fixture.animations]) animation.finish()
  await Promise.resolve()
  assert.equal(fixture.ripples().length, 0)
  assert.equal(fixture.animations.size, 0)
})

for (const reason of ['blur', 'system', 'animation', 'reduced', 'dispose']) test('refraction cancellation leaves no animation or lens behind: ' + reason, async context => {
  const fixture = setup(context, true)
  for (let index = 0; index < 8; index++) fixture.fire()
  assert.equal(fixture.feedback().querySelectorAll('[data-prts-ripple-refraction]').length, 3)
  assert.equal(fixture.animations.size, 12)
  if (reason === 'system') fixture.adapter.update({ ...fixture.preferences, cursor: 'system' })
  else if (reason === 'animation') fixture.adapter.update({ ...fixture.preferences, cursorAnimation: false })
  else if (reason === 'reduced') fixture.adapter.update({ ...fixture.preferences, motion: 'reduced' })
  else if (reason === 'dispose') fixture.adapter.dispose()
  else fixture.fire('blur', fixture.window)
  await Promise.resolve()
  assert.equal(fixture.animations.size, 0)
  assert.equal(fixture.feedback().querySelector('[data-prts-ripple-refraction]'), null)
})
