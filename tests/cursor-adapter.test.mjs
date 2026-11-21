import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { createCursorAdapter } from '../src/client/cursor-adapter.js'

function setup() {
  const dom = new JSDOM('<html><body><button style="cursor:url(data:image/png;base64,AA),pointer">Press</button><input style="cursor:text"></body></html>')
  const { window } = dom
  const { document } = window
  const timers = new Map()
  let id = 0, now = 0
  Object.defineProperty(window.performance, "now", { value: () => now })
  window.setTimeout = (fn, delay=0) => { const due=now+delay;timers.set(++id, () => { now=Math.max(now,due);fn() }); return id }
  window.clearTimeout = key => timers.delete(key)
  window.matchMedia = () => ({ matches: false })
  const assets = { hotspot: [7, 6], textHotspot: [24, 24], textClick: [{ url: 'text-click', duration: 16 }, { url: 'end', duration: 60000 }], hold: 'hold', press: [{ url: 'press', duration: 16 }, { url: 'end', duration: 60000 }], release: [{ url: 'release', duration: 16 }, { url: 'end', duration: 60000 }] }
  const adapter = createCursorAdapter({ document, window, assets })
  const active = { enabled: true, cursor: 'prts' }
  adapter.update(active)
  const frame = () => document.querySelector('[data-prts-hand-active]')?.style.cursor ?? ''
  const fire = (name, overrides = {}, target = document.querySelector('button')) => {
    const event = new window.Event(name, { bubbles: true })
    Object.assign(event, { pointerType: 'mouse', button: 0, pointerId: 1, isPrimary: true, buttons: 1 }, overrides)
    target.dispatchEvent(event)
  }
  const tick = () => { const next = timers.entries().next().value; if (next) { timers.delete(next[0]); next[1]() } }
  return { dom, window, document, adapter, active, frame, fire, tick, timers, assets, advance:ms=>{now+=ms} }
}

test('normal press, hold and release preserve native text cursors and ignore secondary/touch input', () => {
  const s = setup()
  for (const event of [{ button: 2 }, { pointerType: 'touch' }]) s.fire('pointerdown', event)
  s.fire('pointerdown', {}, s.document.querySelector('input'))
  assert.equal(s.frame(), '')
  s.fire('pointerdown'); assert.match(s.frame(), /press/)
  s.tick(); assert.match(s.frame(), /hold/); assert.equal(s.timers.size, 0)
  s.fire('pointerup'); assert.match(s.frame(), /release/)
  s.tick(); assert.equal(s.frame(), ''); assert.equal(s.timers.size, 0)
  s.adapter.dispose(); s.dom.window.close()
})

test('fast repeat gestures, blur, cancellation, system selection and disposal never leave held frames', () => {
  const s = setup()
  s.fire('pointerdown'); s.fire('pointerup'); s.fire('pointerdown')
  assert.equal(s.timers.size, 1); s.tick(); assert.match(s.frame(), /hold/)
  for (const name of ['blur', 'pointercancel', 'dragstart']) {
    s.fire('pointerdown'); s.fire(name, {}, name === 'blur' ? s.window : undefined); assert.equal(s.frame(), ''); assert.equal(s.timers.size, 0)
  }
  s.fire('pointerdown'); s.fire('pointermove', { buttons: 0 }); assert.equal(s.frame(), '')
  s.fire('pointerdown'); s.adapter.update({ ...s.active, cursor: 'system' })
  s.fire('pointerdown'); assert.equal(s.frame(), ''); assert.equal(s.timers.size, 0)
  s.adapter.update(s.active); s.adapter.update(s.active)
  s.document.documentElement.dataset.prtsMotion = 'reduced'
  s.fire('pointerdown'); assert.match(s.frame(), /hold/); assert.equal(s.timers.size, 0)
  s.fire('pointerup'); assert.equal(s.frame(), '')
  s.fire('pointerdown'); s.adapter.dispose(); s.fire('pointerdown'); assert.equal(s.frame(), '')
  s.dom.window.close()
})

test('text cursor remains static through clicks, selection, exit and disposal', () => {
  const s = setup()
  const input = s.document.querySelector('input')
  input.style.cursor = 'url(data:image/png;base64,AA), text'
  const textFrame = () => s.document.documentElement.style.getPropertyValue('--prts-text-frame')
  const down = () => s.fire('pointerdown', { clientX: 10, clientY: 10 }, input)
  down(); assert.equal(textFrame(), ''); assert.equal(s.frame(), '')
  s.fire('pointerup', {}, input); assert.equal(textFrame(), '')
  s.tick(); assert.equal(textFrame(), ''); assert.equal(s.timers.size, 0)
  down(); down(); assert.equal(s.timers.size, 0)
  s.fire('pointermove', { clientX: 25, clientY: 10 }, input)
  assert.equal(textFrame(), ''); assert.equal(s.timers.size, 0)
  down(); s.fire('pointermove'); assert.equal(textFrame(), '')
  down(); s.fire('pointerout'); assert.equal(textFrame(), '')
  s.document.documentElement.dataset.prtsMotion = 'reduced'
  down(); assert.equal(textFrame(), ''); assert.equal(s.timers.size, 0)
  s.document.documentElement.dataset.prtsMotion = 'system'
  down(); s.adapter.dispose(); assert.equal(textFrame(), ''); assert.equal(s.timers.size, 0)
  s.dom.window.close()
})

test('file preview movement and scrolling never enter character hit testing, even inside a conversation', () => {
  for (const marker of ['data-textpreview-body', 'data-textpreview-plain', 'data-document-markdown', 'data-code-preview']) {
    const state = setup()
    state.document.body.insertAdjacentHTML('beforeend', `<article data-chat-flow-kind="assistant-step"><div ${marker}><div data-markdown><p id="preview-text" style="cursor:url(data:image/png;base64,AA),text">Source text</p></div></div></article>`)
    const target = state.document.querySelector('#preview-text')
    let caretQueries = 0, characterRanges = 0
    const createRange = state.document.createRange.bind(state.document)
    state.document.caretPositionFromPoint = () => { caretQueries++ }
    state.document.caretRangeFromPoint = () => { caretQueries++ }
    state.document.createRange = () => { characterRanges++; return createRange() }
    state.document.elementFromPoint = () => target
    for (let index = 0; index < 32; index++) {
      state.fire('pointermove', { clientX: index, clientY: 10 }, target)
      state.fire('scroll', {}, target)
    }
    state.fire('pointerdown', {}, target)
    state.fire('pointerup', {}, target)
    assert.equal(state.document.querySelectorAll('[data-prts-text-hit]').length, 0)
    assert.equal(caretQueries, 0)
    assert.equal(characterRanges, 0)
    assert.equal(state.frame(), '')
    assert.equal(state.timers.size, 0)
    state.adapter.dispose()
    state.dom.window.close()
  }
})

test('conversation bodies never query caret positions or create character ranges', () => {
  for (const markup of [
    '<article data-chat-flow-kind="assistant-step"><div data-markdown>Response</div></article>',
    '<article data-message-role="assistant"><div class="markdown-body">Legacy response</div></article>',
    '<article data-chat-flow-kind="user"><div data-message-bubble>User message</div></article>',
    '<div data-submission-echo><div class="host_bubble">Echo</div></div>',
    '<div data-pending-steering><div data-text-interaction-source>Pending</div></div>',
    '<article data-chat-flow-kind="steering"><div data-message-bubble>Steering</div></article>',
  ]) {
    const state = setup()
    const holder = state.document.createElement('div')
    holder.innerHTML = markup
    state.document.body.append(holder)
    const target = holder.firstElementChild.firstElementChild
    target.style.cursor = 'url(data:image/png;base64,AA),text'
    const unexpected = () => assert.fail('conversation text must not perform character hit testing')
    state.document.caretPositionFromPoint = unexpected
    state.document.caretRangeFromPoint = unexpected
    state.document.createRange = unexpected
    state.document.elementFromPoint = () => target
    for (let index = 0; index < 32; index++) {
      state.fire('pointermove', { clientX: index, clientY: 10 }, target)
      state.fire('scroll', {}, target)
      state.fire('resize', {}, state.window)
    }
    state.fire('pointerdown', {}, target)
    state.fire('pointerup', {}, target)
    assert.equal(state.document.querySelectorAll('[data-prts-text-hit]').length, 0)
    assert.equal(state.frame(), '')
    assert.equal(state.timers.size, 0)
    state.adapter.dispose()
    state.dom.window.close()
  }
})

test('theme settings and nested dialogs never enter generic probing or local observation', async () => {
  const state = setup()
  state.document.body.insertAdjacentHTML('beforeend', '<div data-prts-theme-settings><h3>Settings</h3><p>Description</p><div id="blank"></div><label><span>Control label</span><input></label><dialog open><strong>Nested dialog title</strong><p>Nested dialog text</p></dialog></div>')
  const unexpected = () => assert.fail('theme settings must use CSS cursors without text probing or observation')
  state.document.caretPositionFromPoint = unexpected
  state.document.caretRangeFromPoint = unexpected
  state.document.createRange = unexpected
  state.window.MutationObserver = class { constructor() { unexpected() } }
  state.window.ResizeObserver = class { constructor() { unexpected() } }
  for (const target of state.document.querySelectorAll('[data-prts-theme-settings], [data-prts-theme-settings] *')) {
    target.style.cursor = 'url(data:image/png;base64,AA),default'
    state.document.elementFromPoint = () => target
    state.fire('pointermove', { clientX: 10, clientY: 10, buttons: 0 }, target)
    state.fire('scroll', {}, target)
    state.fire('resize', {}, state.window)
  }
  state.document.querySelector('[data-prts-theme-settings] p').textContent = 'Updated description'
  await Promise.resolve()
  assert.equal(state.document.querySelectorAll('[data-prts-text-hit]').length, 0)
  assert.equal(state.timers.size, 0)
  state.adapter.dispose(); state.dom.window.close()
})

test('hero title keeps its existing precise text hit testing', () => {
  const state = setup()
  state.document.body.insertAdjacentHTML('beforeend', '<div data-phase="hero"><span class="host_titleGroup"><span id="title" style="cursor:url(data:image/png;base64,AA),default">Title</span></span></div>')
  const target = state.document.querySelector('#title')
  state.document.caretPositionFromPoint = () => ({ offsetNode: target.firstChild, offset: 0 })
  state.document.createRange = () => ({ setStart() {}, setEnd() {}, getClientRects: () => [{ width: 10, left: 0, right: 10, top: 0, bottom: 20 }] })
  state.fire('pointermove', { clientX: 5, clientY: 10 }, target)
  assert.equal(target.hasAttribute('data-prts-text-hit'), true)
  state.fire('pointermove', { clientX: 15, clientY: 10 }, target)
  assert.equal(target.hasAttribute('data-prts-text-hit'), false)
  state.adapter.dispose()
  state.dom.window.close()
})

function genericText(state, text = 'Generic plugin content with inline spaces') {
  const target = state.document.createElement('div')
  target.style.cursor = 'url(data:image/png;base64,AA),default'
  target.textContent = text
  target.getBoundingClientRect = () => ({ x: 0, y: 0, width: 400, height: 100 })
  state.document.body.append(target)
  const profile = { caret: 0, ranges: [] }
  state.document.elementFromPoint = () => target
  state.document.caretPositionFromPoint = () => { profile.caret++; return { offsetNode: target.firstChild, offset: 2 } }
  state.document.createRange = () => {
    const entry = {}
    return { setStart: (node, offset) => { entry.start = offset }, setEnd: (node, offset) => { entry.end = offset },
      getClientRects: () => { profile.ranges.push({ ...entry }); return [{ left: 0, right: 200, top: 0, bottom: 20, width: 200, height: 20 }] } }
  }
  return { target, profile, point: { clientX: 10, clientY: 10, buttons: 0 } }
}

test('generic text regions measure a bounded fragment and reuse cached line rectangles', () => {
  const state = setup(), { target, profile, point } = genericText(state)
  for (let index = 0; index < 100; index++) state.fire('pointermove', point, target)
  assert.equal(target.hasAttribute('data-prts-text-hit'), true)
  assert.equal(profile.caret, 1)
  assert.deepEqual(profile.ranges, [{ start: 0, end: target.firstChild.length }])
  state.fire('pointermove', { ...point, clientX: 300 }, target)
  assert.equal(target.hasAttribute('data-prts-text-hit'), false)
  for (let index = 0; index < 100; index++) state.fire('pointermove', { ...point, clientX: 250 + index }, target)
  assert.equal(profile.caret, 1)
  assert.equal(profile.ranges.length, 1)
  state.advance(200)
  state.fire('pointermove', point, target)
  assert.equal(profile.ranges.length, 2)
  state.adapter.dispose(); state.dom.window.close()
})

test('generic large text nodes never measure more than 2048 code units', () => {
  const state = setup(), { target, profile, point } = genericText(state, 'Large text '.repeat(100_000))
  state.document.caretPositionFromPoint = () => ({ offsetNode: target.firstChild, offset: 500_000 })
  state.fire('pointermove', point, target)
  assert.deepEqual(profile.ranges, [{ start: 498_976, end: 501_024 }])
  assert.equal(target.hasAttribute('data-prts-text-hit'), true)
  state.adapter.dispose(); state.dom.window.close()
})

test('generic excessive line fragments cool down without repeating range reads', () => {
  const state = setup(), { target, profile, point } = genericText(state)
  let measurements = 0
  state.document.createRange = () => ({ setStart() {}, setEnd() {}, getClientRects: () => { measurements++; return Array(129).fill({}) } })
  for (let index = 0; index < 100; index++) state.fire('pointermove', point, target)
  assert.equal(profile.caret, 1)
  assert.equal(measurements, 1)
  assert.equal(target.hasAttribute('data-prts-text-hit'), false)
  state.advance(260)
  state.fire('pointermove', point, target)
  assert.equal(measurements, 2)
  state.adapter.dispose(); state.dom.window.close()
})

test('generic probing excludes semantic controls, native cursors and non-selectable text', () => {
  for (const attributes of ['role="button"', 'role="toolbar"', 'tabindex="0" role="button"', 'contenteditable="true"', 'data-text-interaction-exclude', 'inert', 'aria-disabled="true"', 'data-code-block-banner']) {
    const state = setup(), { target, profile, point } = genericText(state)
    target.outerHTML = `<div ${attributes} style='cursor:url(data:image/png;base64,AA),default'>Control text</div>`
    state.fire('pointermove', point, state.document.body.lastElementChild)
    assert.equal(profile.caret, 0, attributes)
    state.adapter.dispose(); state.dom.window.close()
  }
  for (const cursor of ['pointer', 'grab', 'ew-resize', 'wait', 'url(other.png), default']) {
    const state = setup(), { target, profile, point } = genericText(state)
    target.style.cursor = cursor
    state.fire('pointermove', point, target)
    assert.equal(profile.caret, 0, cursor)
    state.adapter.dispose(); state.dom.window.close()
  }
  const state = setup(), { target, profile, point } = genericText(state)
  target.style.userSelect = 'none'
  state.fire('pointermove', point, target)
  assert.equal(profile.caret, 0)
  state.adapter.dispose(); state.dom.window.close()
})

test('generic probing refreshes on scroll, resize and local text changes, then disconnects', async () => {
  const state = setup(), { target, profile, point } = genericText(state)
  state.fire('pointermove', point, target)
  state.fire('scroll', {}, target)
  state.fire('resize', {}, state.window)
  assert.equal(profile.ranges.length, 1)
  assert.equal(state.timers.size, 1)
  state.tick()
  assert.equal(profile.ranges.length, 2)
  target.firstChild.appendData(' streamed')
  await Promise.resolve()
  state.tick()
  assert.equal(profile.ranges.length, 3)
  state.adapter.dispose()
  target.firstChild.appendData(' after disposal')
  await Promise.resolve()
  assert.equal(profile.ranges.length, 3)
  assert.equal(target.hasAttribute('data-prts-text-hit'), false)
  state.dom.window.close()
})

test('generic caret fallback tolerates missing and throwing browser APIs', () => {
  const state = setup(), { target, point } = genericText(state)
  state.document.caretPositionFromPoint = undefined
  state.document.caretRangeFromPoint = () => ({ startContainer: target.firstChild, startOffset: 0 })
  state.fire('pointermove', point, target)
  assert.equal(target.hasAttribute('data-prts-text-hit'), true)
  state.fire('pointerout')
  state.document.caretRangeFromPoint = () => { throw Error('Unavailable') }
  assert.doesNotThrow(() => state.fire('pointermove', point, target))
  assert.equal(target.hasAttribute('data-prts-text-hit'), false)
  state.document.caretRangeFromPoint = undefined
  assert.doesNotThrow(() => state.fire('pointermove', point, target))
  state.adapter.dispose(); state.dom.window.close()
})

test('generic move bursts probe only the latest point once per scheduled frame', () => {
  const state = setup(), { target, profile, point } = genericText(state)
  const frames = new Map()
  state.window.requestAnimationFrame = callback => { frames.set(1, callback); return 1 }
  state.window.cancelAnimationFrame = id => frames.delete(id)
  for (let index = 0; index < 500; index++) state.fire('pointermove', point, target)
  assert.equal(profile.caret, 0)
  assert.equal(frames.size, 1)
  frames.get(1)()
  assert.equal(profile.caret, 1)
  assert.equal(profile.ranges.length, 1)
  state.adapter.dispose(); state.dom.window.close()
})

test('generic empty and whitespace-only leaves skip caret work but still refresh when text arrives', async () => {
  for (const text of ['', ' \n\t ']) {
    const state = setup(), { target, profile, point } = genericText(state, text)
    for (let index = 0; index < 100; index++) state.fire('pointermove', point, target)
    assert.equal(profile.caret, 0)
    assert.equal(state.timers.size, 0)
    target.textContent = 'New text'
    await Promise.resolve()
    assert.equal(target.hasAttribute('data-prts-text-hit'), true)
    assert.equal(profile.caret, 1)
    state.adapter.dispose(); state.dom.window.close()
  }
})

test('generic uncached probes are rate limited with a single trailing refresh and no idle loop', () => {
  const state = setup(), { target, profile, point } = genericText(state, 'Large text '.repeat(1_000))
  for (let index = 0; index < 100; index++) {
    state.fire('pointermove', { ...point, clientX: 300 }, target)
    assert.ok(state.timers.size <= 1)
    state.advance(1)
  }
  assert.equal(profile.caret, 4)
  assert.equal(profile.ranges.length, 1)
  assert.equal(state.timers.size, 1)
  state.tick()
  assert.equal(profile.caret, 5)
  assert.equal(profile.ranges.length, 1)
  assert.equal(state.timers.size, 0)
  state.advance(1_000); state.tick()
  assert.equal(profile.caret, 5)
  state.adapter.dispose(); state.dom.window.close()
})

test('generic deferred refreshes preserve a still-valid partial-node geometry cache', () => {
  const state = setup(), { target, profile, point } = genericText(state, 'Large text '.repeat(1_000))
  state.fire('pointermove', { ...point, clientX: 300 }, target)
  for (let index = 0; index < 4; index++) {
    state.advance(1)
    state.fire('pointermove', { ...point, clientX: 300 }, target)
    state.tick()
  }
  assert.equal(profile.caret, 5)
  assert.equal(profile.ranges.length, 1)
  assert.equal(state.timers.size, 0)
  state.adapter.dispose(); state.dom.window.close()
})

test('generic slow native probes back off and recover once without polling', () => {
  const state = setup(), { target, profile, point } = genericText(state)
  let measurements = 0
  state.document.createRange = () => ({ setStart() {}, setEnd() {}, getClientRects: () => {
    measurements++
    state.advance(9)
    return [{ left: 0, right: 200, top: 0, bottom: 20, width: 200, height: 20 }]
  } })
  state.fire('pointermove', point, target)
  state.fire('scroll', {}, target)
  assert.equal(profile.caret, 1)
  assert.equal(state.timers.size, 1)
  state.advance(32)
  state.fire('pointermove', point, target)
  assert.equal(profile.caret, 1)
  state.tick()
  assert.equal(profile.caret, 2)
  assert.equal(measurements, 2)
  assert.equal(target.hasAttribute('data-prts-text-hit'), true)
  assert.equal(state.timers.size, 0)
  state.advance(1_000); state.tick()
  assert.equal(profile.caret, 2)
  state.adapter.dispose(); state.dom.window.close()
})

test('generic throttled movement refreshes the latest target even when the mouse stops', () => {
  const state = setup(), first = genericText(state), second = genericText(state)
  let current = first.target
  state.document.elementFromPoint = () => current
  state.document.caretPositionFromPoint = () => ({ offsetNode: current.firstChild, offset: 2 })
  state.fire('pointermove', first.point, first.target)
  assert.equal(first.target.hasAttribute('data-prts-text-hit'), true)
  current = second.target
  state.fire('pointermove', second.point, second.target)
  assert.equal(first.target.hasAttribute('data-prts-text-hit'), false)
  assert.equal(second.target.hasAttribute('data-prts-text-hit'), false)
  assert.equal(state.timers.size, 1)
  state.tick()
  assert.equal(second.target.hasAttribute('data-prts-text-hit'), true)
  assert.equal(state.timers.size, 0)
  state.adapter.dispose(); state.dom.window.close()
})

test('generic complete-node blank caching does not hide text in other child nodes', () => {
  const state = setup(), { target, profile, point } = genericText(state)
  const second = state.document.createElement('span')
  second.textContent = 'Other text'
  target.append(second)
  let measuredNode
  state.document.caretPositionFromPoint = clientX => { profile.caret++; return { offsetNode: clientX < 200 ? target.firstChild : second.firstChild, offset: 2 } }
  state.document.createRange = () => ({ setStart(node) { measuredNode = node }, setEnd() {}, getClientRects: () => {
    const left = measuredNode === target.firstChild ? 0 : 250
    return [{ left, right: left + 100, top: 0, bottom: 20, width: 100, height: 20 }]
  } })
  state.fire('pointermove', point, target)
  state.advance(32)
  state.fire('pointermove', { ...point, clientX: 300 }, target)
  assert.equal(target.hasAttribute('data-prts-text-hit'), true)
  assert.equal(profile.caret, 2)
  state.adapter.dispose(); state.dom.window.close()
})

test('generic deferred probes are cancelled on exit, controls, system mode and disposal', () => {
  for (const exit of [state => state.fire('pointerout'), state => state.fire('pointermove', { clientX: 0, clientY: 0 }),
    state => state.adapter.update({ ...state.active, cursor: 'system' }), state => state.adapter.dispose()]) {
    const state = setup(), { target, profile, point } = genericText(state)
    state.fire('pointermove', point, target)
    state.fire('scroll', {}, target)
    assert.equal(state.timers.size, 1)
    exit(state)
    assert.equal(state.timers.size, 0)
    state.tick()
    assert.equal(profile.caret, 1)
    state.adapter.dispose(); state.dom.window.close()
  }
})

test('generic scroll and resize bursts defer hit testing until the shared animation frame', () => {
  const state = setup(), { target, profile, point } = genericText(state)
  state.fire('pointermove', point, target)
  const frames = new Map()
  state.window.requestAnimationFrame = callback => { frames.set(1, callback); return 1 }
  state.window.cancelAnimationFrame = key => frames.delete(key)
  let hits = 0
  state.document.elementFromPoint = () => { hits++; return target }
  for (let index = 0; index < 200; index++) {
    state.fire('scroll', {}, target)
    state.fire('resize', {}, state.window)
  }
  assert.equal(hits, 0)
  assert.equal(profile.caret, 1)
  assert.equal(frames.size, 1)
  state.advance(32)
  frames.get(1)()
  assert.equal(hits, 1)
  assert.equal(profile.caret, 2)
  state.adapter.dispose(); state.dom.window.close()
})

test('focus changes inside the page do not cancel a new gesture, but window blur does', () => {
  const s = setup()
  s.fire('pointerdown')
  s.document.querySelector('input').dispatchEvent(new s.window.Event('blur'))
  assert.match(s.frame(), /press/)
  s.tick(); assert.match(s.frame(), /hold/)
  s.window.dispatchEvent(new s.window.Event('blur'))
  assert.equal(s.frame(), ''); assert.equal(s.timers.size, 0)
  s.adapter.dispose(); s.dom.window.close()
})

test('quick taps complete press and briefly hold before release, without queueing repeated clicks', () => {
  const s = setup()
  s.fire('pointerdown'); s.fire('pointerup')
  assert.match(s.frame(), /press/)
  s.tick(); assert.match(s.frame(), /hold/)
  s.tick(); assert.match(s.frame(), /release/)
  s.tick(); assert.equal(s.frame(), '')
  s.fire('pointerdown'); s.fire('pointerup'); s.tick()
  s.fire('pointerdown'); assert.match(s.frame(), /press/); assert.equal(s.timers.size, 1)
  s.tick(); assert.match(s.frame(), /hold/); assert.equal(s.timers.size, 0)
  s.adapter.dispose(); s.dom.window.close()
})

test('hand animation stays local, restores inline cursors and leaves passive backgrounds static', () => {
  const s = setup()
  const button = s.document.querySelector('button')
  const original = button.style.cursor
  const observer = new s.window.MutationObserver(() => {})
  observer.observe(s.document.documentElement, { attributes: true })
  s.fire('pointerdown')
  assert.match(button.style.cursor, /press/)
  s.tick(); s.fire('pointerup'); s.tick()
  assert.equal(button.style.cursor, original)
  assert.equal(observer.takeRecords().length, 0)
  const background = s.document.createElement('div')
  background.style.cursor = original.replace(/pointer$/, 'default')
  const backgroundCursor = background.style.cursor
  background.innerHTML = '<span>Content</span>'.repeat(257)
  s.document.body.append(background)
  s.fire('pointerdown', {}, background)
  assert.equal(s.timers.size, 0)
  assert.equal(background.style.cursor, backgroundCursor)
  assert.equal(s.frame(), '')
  s.fire('pointerdown')
  s.fire('pointermove', {}, background)
  assert.equal(button.style.cursor, original)
  assert.equal(background.style.cursor, backgroundCursor)
  s.fire('pointermove', {}, button)
  assert.match(button.style.cursor, /press/)
  s.adapter.dispose()
  assert.equal(button.style.cursor, original)
  observer.disconnect(); s.dom.window.close()
})

test('cleanup preserves a cursor changed by another plugin during a hand gesture', () => {
  const s = setup()
  const button = s.document.querySelector('button')
  s.fire('pointerdown')
  button.style.cursor = 'grab'
  s.adapter.dispose()
  assert.equal(button.style.cursor, 'grab')
  s.dom.window.close()
})

for (const change of ['value', 'priority', 'remove']) {
  for (const phase of ['press', 'hold', 'release']) {
    test(`host cursor ${change} during ${phase} stops animation without restoring stale state`, () => {
      const s = setup()
      const button = s.document.querySelector('button')
      s.fire('pointerdown')
      if (phase !== 'press') s.tick()
      if (phase === 'release') s.fire('pointerup')
      if (change === 'value') button.style.cursor = 'grab'
      if (change === 'priority') button.style.setProperty('cursor', button.style.cursor, 'important')
      if (change === 'remove') button.style.removeProperty('cursor')
      const value = button.style.cursor
      const priority = button.style.getPropertyPriority('cursor')
      if (phase === 'hold') s.fire('pointermove')
      else s.tick()
      assert.equal(s.frame(), '')
      assert.equal(s.timers.size, 0)
      s.fire('pointermove'); s.fire('pointerup'); s.tick(); s.adapter.dispose()
      assert.equal(button.style.cursor, value)
      assert.equal(button.style.getPropertyPriority('cursor'), priority)
      s.dom.window.close()
    })
  }
}

test('pointer bursts coalesce style reads and disposal cancels pending movement',()=>{
  const s=setup(),frames=new Map();let id=0,reads=0
  s.assets.resize={ew:"resize"}
  s.window.requestAnimationFrame=fn=>{frames.set(++id,fn);return id}
  s.window.cancelAnimationFrame=id=>frames.delete(id)
  const original=s.window.getComputedStyle.bind(s.window)
  s.window.getComputedStyle=(...args)=>{reads++;return original(...args)}
  for(let i=0;i<100;i++)s.fire('pointermove',{clientX:i,clientY:10})
  assert.equal(reads,0);assert.equal(frames.size,1)
  frames.values().next().value()
  assert.equal(reads,1);assert.equal(frames.size,0)
  s.fire('pointermove');s.adapter.dispose()
  assert.equal(frames.size,0)
  s.dom.window.close()
})

test('late animation callbacks skip expired frames and finish without replaying them',()=>{
  const s=setup()
  s.assets.press=[{url:'first',duration:16},{url:'second',duration:16},{url:'third',duration:16},{url:'end',duration:60000}]
  s.fire('pointerdown');assert.match(s.frame(),/first/)
  s.advance(35);s.tick();assert.match(s.frame(),/third/)
  s.advance(1000);s.tick();assert.match(s.frame(),/hold/)
  assert.equal(s.timers.size,0)
  s.fire('pointerup');s.advance(1000);s.tick()
  assert.equal(s.frame(),'');assert.equal(s.timers.size,0)
  s.adapter.dispose();s.dom.window.close()
})

test('identical adjacent frames do not rewrite the native cursor',()=>{
  const s=setup()
  s.assets.press=[{url:'same',duration:16},{url:'same',duration:16},{url:'end',duration:60000}]
  s.fire('pointerdown')
  const observer=new s.window.MutationObserver(()=>{})
  observer.observe(s.document.querySelector('button'),{attributes:true,attributeFilter:['style']})
  s.tick();assert.equal(observer.takeRecords().length,0)
  s.adapter.dispose();observer.disconnect();s.dom.window.close()
})


for (const count of [128, 129, 256, 257, 10000]) test('interactive cursor retains full feedback without counting descendants: ' + count, () => {
  const fixture = setup()
  const area = fixture.document.createElement('button')
  area.style.cursor = 'url(data:image/png;base64,AA),pointer'
  area.innerHTML = '<span>x</span>'.repeat(count)
  fixture.document.body.append(area)
  const original = area.style.cursor
  area.getElementsByTagName = () => { throw Error('A click must not enumerate descendants') }
  fixture.fire('pointerdown', {}, area)
  assert.match(area.style.cursor, /press/)
  fixture.tick()
  assert.match(area.style.cursor, /hold/)
  fixture.fire('pointerup', {}, area)
  assert.match(area.style.cursor, /release/)
  fixture.tick()
  assert.equal(area.style.cursor, original)
  assert.equal(fixture.timers.size, 0)
  fixture.adapter.dispose()
  fixture.dom.window.close()
})
