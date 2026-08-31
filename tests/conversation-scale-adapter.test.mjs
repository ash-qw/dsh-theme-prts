import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'

import {
  buildConversationScalePaths,
  calculateConversationJumpTop,
  collectConversationTurns,
  conversationScaleWaveLength,
  createConversationScaleAdapter,
  findConversationOlderButton,
  performConversationJump,
  getConversationScaleLayout,
  nearestVisibleConversationTick,
  resolveConversationJumpBehavior,
  resolveConversationJumpSettle,
  resolveConversationHistorySnapshot,
  resolveConversationScaleGeometry,
  resolveConversationScaleCalibrationState,
  resolveConversationScaleLengths,
  shouldFollowConversationScaleBottom,
  snapConversationScaleOffset,
  visibleConversationTickRange,
} from '../src/client/conversation-scale-adapter.js'

function flush(window, delay = 16) {
  return new Promise(resolve => window.setTimeout(resolve, delay))
}

function createFrameClock(step = 16) {
  let time = 0
  return {
    now: () => time,
    requestFrame(callback) {
      time += step
      queueMicrotask(() => callback(time))
      return time
    },
  }
}

test('collects each compatible user turn once', () => {
  const dom = new JSDOM(`<!doctype html><div data-conversation-scroll>
    <div data-chat-flow-kind="user"><div data-message-role="user">第一轮</div></div>
    <div data-chat-flow-kind="user-step">第二轮</div>
    <div data-message-role="user">第三轮</div>
    <div data-message-role="assistant">不应成为刻度</div>
    <div data-chat-flow-kind="user" hidden>隐藏轮次</div>
  </div>`)
  const turns = collectConversationTurns(dom.window.document.querySelector('[data-conversation-scroll]'))
  assert.deepEqual(turns.map(turn => turn.textContent.trim()), ['第一轮', '第二轮', '第三轮'])
})

test('detects native older-history controls and reads the current session snapshot', () => {
  const dom = new JSDOM(`<!doctype html><main>
    <div class="fixture_older"><button type="button">load</button></div>
  </main>`)
  const root = dom.window.document.querySelector('main')
  assert.equal(findConversationOlderButton(root)?.textContent, 'load')
  const session = {
    getSnapshot: () => ({ hasMore: true, loadingOlder: false }),
  }
  const sessions = {
    list: { getSnapshot: () => ({ current: 'session-1' }) },
    binding: id => id === 'session-1' ? { session } : undefined,
  }
  assert.deepEqual(resolveConversationHistorySnapshot(sessions), {
    key: 'session-1',
    hasMore: true,
    loading: false,
  })
  assert.deepEqual(resolveConversationHistorySnapshot(undefined), {})
})

test('centers short scales and preserves fixed eight-pixel spacing for long scales', () => {
  const short = getConversationScaleLayout(4, 100)
  assert.equal(short.maxOffset, 0)
  assert.equal(short.positions[0], 38)
  assert.deepEqual(short.positions.map((position, index) => index ? position - short.positions[index - 1] : 8), [8, 8, 8, 8])

  const long = getConversationScaleLayout(30, 85, Number.POSITIVE_INFINITY)
  assert.equal(long.maxOffset, 148)
  assert.equal(long.offset, 148)
  assert.equal(long.positions.at(-1), 84.5)
  assert.equal(long.positions.at(-1) - long.positions.at(-2), 8)
})

test('keeps the final tick yellow only while idle and uses one interaction accent', () => {
  const layout = getConversationScaleLayout(9, 80)
  const resting = buildConversationScalePaths(layout)
  assert.match(resting.yellow, /H6$/)
  assert.equal((resting.yellow.match(/M/g) || []).length, 1)

  const wave = buildConversationScalePaths(layout, 4)
  assert.equal((wave.yellow.match(/M/g) || []).length, 1)
  assert.match(wave.yellow, /H30/)
  assert.equal(conversationScaleWaveLength(0), 28)
  assert.equal(conversationScaleWaveLength(1), 16)
  assert.equal(conversationScaleWaveLength(2), 11)
  assert.equal(conversationScaleWaveLength(3), 7)
  assert.equal(conversationScaleWaveLength(4), 4)
  assert.doesNotMatch(wave.yellow, new RegExp(`M2 ${layout.positions.at(-1)}H6$`))

  const midway = buildConversationScalePaths(layout, 4, { center: 4, intensity: .5 })
  assert.match(midway.yellow, /H18/)
  assert.equal((midway.yellow.match(/M/g) || []).length, 1)

  assert.deepEqual(resolveConversationScaleLengths(0), [24, 18, 14, 10, 6])
  assert.deepEqual(resolveConversationScaleLengths(70), [28, 16, 11, 7, 4])
  assert.deepEqual(resolveConversationScaleLengths(100), [29, 15, 10, 6, 3])

  const partial = buildConversationScalePaths(layout, -1, { historyAvailable: true })
  assert.match(partial.history, /^M2 .*H6M10 .*H14$/)
  const lowContrastPartial = buildConversationScalePaths(
    layout, -1, { historyAvailable: true }, resolveConversationScaleLengths(0),
  )
  assert.match(lowContrastPartial.history, /^M2 .*H8M12 .*H18$/)
  const selectedHistory = buildConversationScalePaths(layout, 0, { historyAvailable: true, center: 0, intensity: 1 })
  assert.match(selectedHistory.history, /^M2 .*H14M16 .*H30$/)
  assert.equal(selectedHistory.yellow, '')
  const midwayHistory = buildConversationScalePaths(layout, 0, { historyAvailable: true, center: 0, intensity: .5 })
  assert.match(midwayHistory.history, /^M2 .*H10M13 .*H22$/)
  assert.equal((partial.gray.match(/M/g) || []).length, 7)
})

test('builds only visible scale ticks plus a small interaction buffer', () => {
  const layout = getConversationScaleLayout(1000, 800, Number.POSITIVE_INFINITY)
  const range = visibleConversationTickRange(layout)
  assert.ok(range.minimum > 800)
  assert.ok(range.maximum - range.minimum < 110)
  const paths = buildConversationScalePaths(layout)
  assert.ok((paths.gray.match(/M/g) || []).length < 110)
  assert.equal((paths.yellow.match(/M/g) || []).length, 1)
})

test('maps wide hit targets to real visible ticks and snaps only the scale offset', () => {
  const layout = getConversationScaleLayout(30, 85, 42)
  const firstVisible = nearestVisibleConversationTick(layout, 0)
  const middle = nearestVisibleConversationTick(layout, 43)
  const lastVisible = nearestVisibleConversationTick(layout, 85)
  assert.ok(firstVisible >= 6)
  assert.ok(middle > firstVisible)
  assert.ok(lastVisible > middle)
  assert.equal(snapConversationScaleOffset(44, layout.maxOffset), 48)
  assert.equal(snapConversationScaleOffset(200, layout.maxOffset), layout.maxOffset)
  assert.equal(shouldFollowConversationScaleBottom(layout.maxOffset - .5, layout.maxOffset), true)
  assert.equal(shouldFollowConversationScaleBottom(layout.maxOffset - 8, layout.maxOffset), false)
})

test('aligns a jumped user prompt at 28 percent of the visible conversation viewport', () => {
  assert.equal(calculateConversationJumpTop({
    scrollTop: 400,
    scrollHeight: 2000,
    clientHeight: 500,
    turnTop: 460,
    visibleTop: 100,
    visibleHeight: 400,
  }), 648)
  assert.equal(calculateConversationJumpTop({
    scrollTop: 0,
    scrollHeight: 2000,
    clientHeight: 500,
    turnTop: 20,
    visibleTop: 100,
    visibleHeight: 400,
  }), 0)
})

test('selects native smooth motion only for nearby jumps and stages long jumps', () => {
  assert.equal(resolveConversationJumpBehavior(600, 500), 'smooth')
  assert.equal(resolveConversationJumpBehavior(751, 500), 'auto')
  assert.equal(resolveConversationJumpBehavior(200, 500, true), 'auto')
  assert.deepEqual(resolveConversationJumpSettle(2000, 500), { offset: 60, duration: 180 })
  assert.deepEqual(resolveConversationJumpSettle(-2000, 500), { offset: -60, duration: 180 })
  assert.deepEqual(resolveConversationJumpSettle(600, 500), { offset: 0, duration: 0 })
})

test('releases sticky bottom before a nearby smooth jump and verifies the landing', async () => {
  const clock = createFrameClock()
  const writes = []
  const calls = []
  let scrollTop = 500
  const scroller = {
    scrollHeight: 1000,
    clientHeight: 500,
    get scrollTop() { return scrollTop },
    set scrollTop(value) { scrollTop = value; writes.push(value) },
    scrollTo(options) { calls.push(options); scrollTop = options.top },
  }
  const landed = await performConversationJump({
    scroller,
    getTargetTop: () => 100,
    requestFrame: clock.requestFrame,
    now: clock.now,
  })
  assert.equal(landed, true)
  assert.equal(writes[0], 499)
  assert.deepEqual(calls[0], { top: 100, behavior: 'smooth' })
  assert.equal(scroller.scrollTop, 100)
})

test('stages a long jump near the target and completes an interruptible ease-out', async () => {
  const clock = createFrameClock(30)
  const calls = []
  const scroller = {
    scrollHeight: 2500,
    clientHeight: 500,
    scrollTop: 0,
    scrollTo(options) { calls.push(options); this.scrollTop = options.top },
  }
  const landed = await performConversationJump({
    scroller,
    getTargetTop: () => 1800,
    requestFrame: clock.requestFrame,
    now: clock.now,
  })
  assert.equal(landed, true)
  assert.deepEqual(calls[0], { top: 1740, behavior: 'auto' })
  assert.equal(scroller.scrollTop, 1800)
  assert.equal(calls.some(call => call.behavior === 'smooth'), false)
})

test('corrects a native smooth jump that never reaches its target', async () => {
  const clock = createFrameClock()
  const calls = []
  const scroller = {
    scrollHeight: 1000,
    clientHeight: 500,
    scrollTop: 300,
    scrollTo(options) {
      calls.push(options)
      if (options.behavior === 'auto') this.scrollTop = options.top
    },
  }
  const landed = await performConversationJump({
    scroller,
    getTargetTop: () => 100,
    requestFrame: clock.requestFrame,
    now: clock.now,
  })
  assert.equal(landed, true)
  assert.deepEqual(calls[0], { top: 100, behavior: 'smooth' })
  assert.deepEqual(calls.at(-1), { top: 100, behavior: 'auto' })
  assert.equal(scroller.scrollTop, 100)
})

test('resolves configured, centered, hidden, and hysteretic scale geometry', () => {
  assert.deepEqual(resolveConversationScaleGeometry({
    operationWidth: 1000, contentLeft: 300, maximumDistance: 96,
  }), { visible: true, reason: 'ready', left: 96, centered: false })
  assert.deepEqual(resolveConversationScaleGeometry({
    operationWidth: 1000, contentLeft: 120, maximumDistance: 96,
  }), { visible: true, reason: 'ready', left: 44, centered: true })
  assert.equal(resolveConversationScaleGeometry({ operationWidth: 1000, contentLeft: 55 }).reason, 'corridor')
  assert.equal(resolveConversationScaleGeometry({ operationWidth: 1000, contentLeft: 70, previouslyHidden: true }).reason, 'corridor')
  assert.equal(resolveConversationScaleGeometry({ operationWidth: 1000, contentLeft: 72, previouslyHidden: true }).visible, true)
  assert.equal(resolveConversationScaleGeometry({ operationWidth: 450, contentLeft: 200 }).reason, 'preview')
  assert.equal(resolveConversationScaleGeometry({ operationWidth: 520, contentLeft: 200 }).visible, true)
  assert.equal(resolveConversationScaleGeometry({ operationWidth: 1000 }).reason, 'unmeasured')
})


test('describes configured, centered, and specifically hidden calibration states', () => {
  assert.deepEqual(resolveConversationScaleCalibrationState({
    operationWidth: 1000,
    contentLeft: 300,
    maximumDistance: 184,
    turnCount: 4,
    viewportWidth: 1440,
  }), {
    visible: true,
    reason: 'ready',
    left: 184,
    centered: false,
    mode: 'configured',
    maximumDistance: 184,
  })
  assert.equal(resolveConversationScaleCalibrationState({
    operationWidth: 1000,
    contentLeft: 120,
    maximumDistance: 184,
    turnCount: 4,
    viewportWidth: 1280,
  }).mode, 'centered')
  assert.equal(resolveConversationScaleCalibrationState({
    operationWidth: 1000,
    contentLeft: 300,
    turnCount: 1,
    viewportWidth: 1440,
  }).reason, 'turns')
  assert.equal(resolveConversationScaleCalibrationState({
    operationWidth: 1000,
    contentLeft: 300,
    turnCount: 4,
    drawerMode: 'overlay',
    viewportWidth: 1024,
  }).reason, 'drawer')
  assert.equal(resolveConversationScaleCalibrationState({
    operationWidth: 1000,
    contentLeft: 300,
    turnCount: 4,
    viewportWidth: 640,
  }).reason, 'phone')
})

test('mounts one SVG scale, isolates wheel input, supports click and keyboard jumps, and cleans up', async () => {
  const turnsHtml = Array.from({ length: 24 }, (_, index) =>
    `<div data-message-role="user" data-y="${index * 100}">第 ${index + 1} 轮</div>`).join('')
  const dom = new JSDOM(`<!doctype html><html><body>
    <main data-prts-region="operation">
      <div data-conversation-scroll>${turnsHtml}<div data-chat-flow-kind="assistant-step"><div data-markdown>稳定回复</div></div><div data-composer-seat>composer</div></div>
    </main>
  </body></html>`, { pretendToBeVisual: true })
  const { document } = dom.window
  const operation = document.querySelector('[data-prts-region="operation"]')
  const scroller = document.querySelector('[data-conversation-scroll]')
  const composer = document.querySelector('[data-composer-seat]')
  let resizeDisconnected = false
  const scrollCalls = []

  dom.window.requestAnimationFrame = callback => dom.window.setTimeout(callback, 0)
  let resizeCallback
  dom.window.cancelAnimationFrame = id => dom.window.clearTimeout(id)
  dom.window.matchMedia = () => ({ matches: true })
  dom.window.ResizeObserver = class {
    constructor(callback) { resizeCallback = callback }
    observe() {}
    unobserve() {}
    disconnect() { resizeDisconnected = true }
  }
  Object.defineProperties(scroller, {
    clientHeight: { configurable: true, value: 500 },
    scrollHeight: { configurable: true, value: 2600 },
  })
  scroller.scrollTo = options => {
    scrollCalls.push(options)
    scroller.scrollTop = options.top
  }
  let operationReads = 0
  operation.getBoundingClientRect = () => {
    operationReads += 1
    return { top: 0, bottom: 600, left: 100, right: 900, width: 800, height: 600 }
  }
  scroller.getBoundingClientRect = () => ({ top: 60, bottom: 560, left: 150, right: 850, width: 700, height: 500 })
  composer.getBoundingClientRect = () => ({ top: 220, bottom: 280, left: 150, right: 850, width: 700, height: 60 })
  let contentColumnLeft = 190
  for (const turn of collectConversationTurns(scroller)) {
    turn.getBoundingClientRect = () => {
      const top = 60 + Number(turn.dataset.y) - scroller.scrollTop
      return { top, bottom: top + 40, left: contentColumnLeft, right: 790, width: 790 - contentColumnLeft, height: 40 }
    }
  }

  const adapter = createConversationScaleAdapter({ document, window: dom.window })
  adapter.start()
  await flush(dom.window)

  const scale = document.querySelector('[data-prts-conversation-scale]')
  assert.ok(scale)
  assert.equal(scale.querySelectorAll('svg').length, 1)
  assert.equal(scale.querySelectorAll('path').length, 3)
  assert.ok(scale.querySelector('[data-prts-conversation-scale-history]'))
  assert.equal(scale.tabIndex, 0)
  assert.equal(scale.dataset.prtsScaleCount, '24')
  assert.equal(scale.dataset.prtsScaleOffset, scale.dataset.prtsScaleMaximum)
  assert.equal(scroller.hasAttribute('data-prts-conversation-scale-ready'), true)
  assert.equal(scale.style.left, "29px")

  const readsBeforeCalibration = operationReads
  adapter.getCalibrationState()
  assert.equal(operationReads, readsBeforeCalibration, 'settings calibration reuses rendered scale geometry')
  resizeCallback([{ target: scroller, contentRect: { width: 700, height: 500 } }])
  assert.equal(scale.hasAttribute('data-prts-resizing'), false, 'content-only observations do not start a viewport resize freeze')

  let orderChecks = 0
  for (const turn of collectConversationTurns(scroller)) {
    const compareDocumentPosition = turn.compareDocumentPosition.bind(turn)
    turn.compareDocumentPosition = other => {
      orderChecks += 1
      return compareDocumentPosition(other)
    }
  }
  await flush(dom.window)
  orderChecks = 0
  scroller.querySelector('[data-markdown]').append(document.createElement('span'))
  await flush(dom.window)
  assert.equal(orderChecks, 0, 'assistant body streaming must not reorder historical user turns')

  const recycledTurn = scroller.querySelector('[data-message-role="user"]')
  recycledTurn.setAttribute('data-message-role', 'assistant')
  await flush(dom.window)
  assert.equal(scale.dataset.prtsScaleCount, '23')
  recycledTurn.setAttribute('data-message-role', 'user')
  await flush(dom.window)
  assert.equal(scale.dataset.prtsScaleCount, '24')
  orderChecks = 0

  adapter.update({ conversationScaleMaxDistance: 16 })
  await flush(dom.window)
  assert.equal(scale.style.left, "16px")
  adapter.update({ conversationScaleMaxDistance: 96 })
  await flush(dom.window)
  assert.equal(scale.style.left, "29px")

  contentColumnLeft = 140
  resizeCallback([])
  assert.equal(scale.hasAttribute('data-prts-resizing'), true)
  assert.equal(document.documentElement.hasAttribute('data-prts-resizing'), false)
  await new Promise(resolve => dom.window.setTimeout(resolve, 170))
  await flush(dom.window)
  assert.equal(scale.hasAttribute('data-prts-resizing'), false)
  assert.equal(scale.hasAttribute('data-prts-conversation-scale-space-obstructed'), true)
  assert.equal(scale.tabIndex, -1)
  contentColumnLeft = 190
  resizeCallback([])
  await new Promise(resolve => dom.window.setTimeout(resolve, 170))
  await flush(dom.window)
  assert.equal(scale.hasAttribute('data-prts-conversation-scale-space-obstructed'), false)
  assert.equal(scale.tabIndex, 0)

  scale.getBoundingClientRect = () => ({ top: 72, bottom: 208, left: 158, right: 190, width: 32, height: 136 })

  const dialog = document.createElement('section')
  dialog.setAttribute('role', 'dialog')
  dialog.setAttribute('aria-modal', 'true')
  dialog.getBoundingClientRect = () => ({
    top: 60,
    bottom: 300,
    left: 300,
    right: 700,
    width: 400,
    height: 240,
  })
  operation.append(dialog)
  await flush(dom.window)
  assert.equal(scale.hasAttribute('data-prts-conversation-scale-blocked'), true)
  assert.equal(scale.hasAttribute('data-prts-conversation-scale-obstructed'), false)
  assert.equal(scale.tabIndex, -1)
  assert.equal(scale.getAttribute('aria-hidden'), 'true')
  dialog.removeAttribute('aria-modal')
  dialog.removeAttribute('role')
  await flush(dom.window)
  assert.equal(scale.hasAttribute('data-prts-conversation-scale-blocked'), false)
  dialog.remove()
  await flush(dom.window)
  assert.equal(scale.hasAttribute('data-prts-conversation-scale-blocked'), false)
  assert.equal(scale.tabIndex, 0)
  assert.equal(scale.hasAttribute('aria-hidden'), false)

  const foreignPanel = document.createElement('aside')
  foreignPanel.dataset.plugin = 'foreign-side-panel'
  foreignPanel.getBoundingClientRect = () => ({ top: 0, bottom: 600, left: 300, right: 420, width: 120, height: 600 })
  document.body.append(foreignPanel)
  await flush(dom.window)
  assert.equal(scale.hasAttribute('data-prts-conversation-scale-blocked'), false)
  assert.equal(scale.tabIndex, 0)
  foreignPanel.remove()
  await flush(dom.window)

  const shellOverlay = document.createElement('div')
  shellOverlay.setAttribute('data-shell-overlay', '')
  const shellOverlaySlot = document.createElement('div')
  shellOverlaySlot.dataset.slot = 'shell.overlay'
  const pluginModal = document.createElement('section')
  pluginModal.dataset.plugin = 'foreign-modal-plugin'
  pluginModal.getBoundingClientRect = () => ({ top: 40, bottom: 540, left: 300, right: 820, width: 520, height: 500 })
  shellOverlaySlot.append(pluginModal)
  shellOverlay.append(shellOverlaySlot)
  document.body.append(shellOverlay)
  await flush(dom.window)
  assert.equal(scale.hasAttribute('data-prts-conversation-scale-blocked'), true)
  assert.equal(scale.tabIndex, -1)
  assert.equal(scale.getAttribute('aria-hidden'), 'true')
  pluginModal.remove()
  await flush(dom.window)
  assert.equal(scale.hasAttribute('data-prts-conversation-scale-blocked'), false)
  assert.equal(scale.tabIndex, 0)
  assert.equal(scale.hasAttribute('aria-hidden'), false)
  shellOverlay.remove()

  const portal = document.createElement('div')
  portal.setAttribute('role', 'presentation')
  const menu = document.createElement('div')
  menu.setAttribute('role', 'menu')
  menu.getBoundingClientRect = () => ({ top: 60, bottom: 300, left: 140, right: 500, width: 360, height: 240 })
  portal.append(menu)
  document.body.append(portal)
  await flush(dom.window)
  assert.equal(scale.hasAttribute('data-prts-conversation-scale-obstructed'), true)
  portal.remove()
  await flush(dom.window)
  assert.equal(scale.hasAttribute('data-prts-conversation-scale-obstructed'), false)

  const beforeBodyScroll = scroller.scrollTop
  const wheel = new dom.window.WheelEvent('wheel', { deltaY: -24, bubbles: true, cancelable: true })
  assert.equal(scale.dispatchEvent(wheel), false)
  await flush(dom.window)
  assert.equal(scroller.scrollTop, beforeBodyScroll)
  assert.ok(Number(scale.dataset.prtsScaleOffset) < Number(scale.dataset.prtsScaleMaximum))

  scale.dispatchEvent(new dom.window.MouseEvent('click', { clientX: 170, clientY: 100, bubbles: true }))
  assert.equal(scrollCalls.at(-1).behavior, 'auto')
  assert.ok(scrollCalls.at(-1).top >= 0)

  scale.focus()
  scale.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'End', bubbles: true }))
  scale.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
  assert.equal(scale.getAttribute('aria-valuenow'), '24')
  assert.equal(scrollCalls.at(-1).top, 2100)

  adapter.dispose()
  assert.equal(resizeDisconnected, true)
  assert.equal(document.querySelector('[data-prts-conversation-scale]'), null)
  assert.equal(scroller.hasAttribute('data-prts-conversation-scale-ready'), false)
})

test('removes the scale while a workspace owns the conversation slot and recreates it on return', async () => {
  const dom = new JSDOM(`<!doctype html><html><body>
    <main data-prts-region="operation">
      <section data-slot="conversation"></section>
    </main>
  </body></html>`, { pretendToBeVisual: true })
  const { document } = dom.window
  const operation = document.querySelector('[data-prts-region="operation"]')
  const conversation = document.querySelector('[data-slot="conversation"]')

  dom.window.requestAnimationFrame = callback => dom.window.setTimeout(callback, 0)
  dom.window.cancelAnimationFrame = id => dom.window.clearTimeout(id)
  dom.window.matchMedia = () => ({ matches: true })
  dom.window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(dom.window, 'innerWidth', { configurable: true, value: 1440 })
  operation.getBoundingClientRect = () => ({
    top: 0, bottom: 700, left: 0, right: 900, width: 900, height: 700,
  })

  function createNativeConversation(label) {
    const scroller = document.createElement('div')
    scroller.setAttribute('data-conversation-scroll', '')
    scroller.innerHTML = `
      <div data-message-role="user">${label} 第一轮</div>
      <div data-chat-flow-kind="assistant-step">第一轮回复</div>
      <div data-message-role="user">${label} 第二轮</div>
      <div data-chat-flow-kind="assistant-step">第二轮回复</div>
      <div data-composer-seat>composer</div>
    `
    Object.defineProperties(scroller, {
      clientHeight: { configurable: true, value: 560 },
      scrollHeight: { configurable: true, value: 700 },
    })
    scroller.getBoundingClientRect = () => ({
      top: 40, bottom: 600, left: 0, right: 900, width: 900, height: 560,
    })
    scroller.querySelector('[data-composer-seat]').getBoundingClientRect = () => ({
      top: 620, bottom: 680, left: 240, right: 820, width: 580, height: 60,
    })
    for (const turn of collectConversationTurns(scroller)) {
      turn.getBoundingClientRect = () => ({
        top: 80, bottom: 124, left: 240, right: 820, width: 580, height: 44,
      })
    }
    return scroller
  }

  conversation.append(createNativeConversation('原生'))
  const adapter = createConversationScaleAdapter({ document, window: dom.window })
  adapter.start()
  await flush(dom.window)

  const firstScale = document.querySelector('[data-prts-conversation-scale]')
  assert.ok(firstScale)
  assert.equal(firstScale.dataset.prtsScaleCount, '2')
  assert.equal(firstScale.tabIndex, 0)
  assert.equal(document.querySelectorAll('[data-prts-conversation-preview]').length, 1)

  const knowledgeWorkspace = document.createElement('section')
  knowledgeWorkspace.dataset.knowledgeWorkspace = ''
  knowledgeWorkspace.textContent = '知识库工作区'
  conversation.replaceChildren(knowledgeWorkspace)
  await flush(dom.window)
  assert.equal(firstScale.isConnected, false)
  assert.equal(document.querySelector('[data-prts-conversation-scale]'), null)
  assert.equal(document.querySelector('[data-prts-conversation-preview]'), null)

  conversation.replaceChildren(createNativeConversation('知识库返回'))
  await flush(dom.window)
  const restoredFromKnowledge = document.querySelector('[data-prts-conversation-scale]')
  assert.ok(restoredFromKnowledge)
  assert.notEqual(restoredFromKnowledge, firstScale)
  assert.equal(restoredFromKnowledge.dataset.prtsScaleCount, '2')
  assert.equal(restoredFromKnowledge.tabIndex, 0)

  const sshWorkspace = document.createElement('section')
  sshWorkspace.textContent = 'SSH 工作台'
  conversation.replaceChildren(sshWorkspace)
  await flush(dom.window)
  assert.equal(document.querySelector('[data-prts-conversation-scale]'), null)
  assert.equal(document.querySelector('[data-prts-conversation-preview]'), null)

  conversation.replaceChildren(createNativeConversation('SSH 返回'))
  await flush(dom.window)
  const restoredFromSsh = document.querySelector('[data-prts-conversation-scale]')
  assert.ok(restoredFromSsh)
  assert.notEqual(restoredFromSsh, restoredFromKnowledge)
  assert.equal(restoredFromSsh.dataset.prtsScaleCount, '2')
  assert.equal(restoredFromSsh.tabIndex, 0)

  adapter.dispose()
})

test('represents unloaded history with a sentinel and loads through the native anchored control', async () => {
  const dom = new JSDOM(`<!doctype html><html><body>
    <main data-prts-region="operation">
      <div data-conversation-scroll>
        <div class="fixture_older"><button type="button">load older</button></div>
        <div data-message-role="user">第二轮</div>
        <div data-message-role="user">第三轮</div>
        <div data-composer-seat>composer</div>
      </div>
    </main>
  </body></html>`, { pretendToBeVisual: true })
  const { document } = dom.window
  const operation = document.querySelector('[data-prts-region="operation"]')
  const scroller = document.querySelector('[data-conversation-scroll]')
  const composer = document.querySelector('[data-composer-seat]')
  const older = document.querySelector('.fixture_older')
  const olderButton = older.querySelector('button')
  const sessionState = { hasMore: true, loadingOlder: false }
  const sessions = {
    list: { getSnapshot: () => ({ current: 'history-session' }) },
    binding: () => ({ session: { getSnapshot: () => sessionState } }),
  }
  let nativeClicks = 0

  dom.window.requestAnimationFrame = callback => dom.window.setTimeout(callback, 0)
  dom.window.cancelAnimationFrame = id => dom.window.clearTimeout(id)
  dom.window.matchMedia = () => ({ matches: true })
  dom.window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} }
  Object.defineProperties(scroller, {
    clientHeight: { configurable: true, value: 500 },
    scrollHeight: { configurable: true, value: 1200 },
  })
  scroller.scrollTo = options => { scroller.scrollTop = options.top }
  operation.getBoundingClientRect = () => ({ top: 0, bottom: 600, left: 0, right: 900, width: 900, height: 600 })
  scroller.getBoundingClientRect = () => ({ top: 50, bottom: 550, left: 0, right: 900, width: 900, height: 500 })
  composer.getBoundingClientRect = () => ({ top: 520, bottom: 580, left: 220, right: 800, width: 580, height: 60 })
  for (const turn of collectConversationTurns(scroller)) {
    turn.getBoundingClientRect = () => ({ top: 120, bottom: 160, left: 220, right: 800, width: 580, height: 40 })
  }
  olderButton.addEventListener('click', () => {
    nativeClicks += 1
    sessionState.loadingOlder = true
    olderButton.disabled = true
    dom.window.setTimeout(() => {
      const loaded = document.createElement('div')
      loaded.setAttribute('data-message-role', 'user')
      loaded.textContent = nativeClicks === 1 ? '更早一页' : '第一轮'
      loaded.getBoundingClientRect = () => ({ top: 80, bottom: 120, left: 220, right: 800, width: 580, height: 40 })
      older.after(loaded)
      sessionState.loadingOlder = false
      if (nativeClicks === 1) {
        olderButton.disabled = false
      } else {
        older.remove()
        sessionState.hasMore = false
      }
    }, 80)
  })

  const adapter = createConversationScaleAdapter({ document, window: dom.window, sessions })
  adapter.start()
  await flush(dom.window, 40)

  const scale = document.querySelector('[data-prts-conversation-scale]')
  const historyPath = scale.querySelector('[data-prts-conversation-scale-history]')
  const historyHint = document.querySelector('[data-prts-conversation-history-hint]')
  const historyTrigger = historyHint.querySelector('[data-prts-conversation-history-trigger]')
  const historyTooltip = historyHint.querySelector('[data-prts-conversation-history-tooltip]')
  const status = document.querySelector('[data-prts-conversation-history-status]')
  const historyConnector = historyTooltip.querySelector('[data-prts-conversation-history-tooltip-connector]')
  assert.equal(scale.hasAttribute('data-prts-conversation-scale-partial'), true)
  assert.notEqual(historyPath.getAttribute('d'), '')
  assert.equal(historyHint.hidden, false)
  assert.equal(historyTrigger.textContent, '')
  assert.equal(historyTrigger.tabIndex, -1)
  assert.equal(historyTooltip.hidden, true)
  assert.equal(historyHint.hasAttribute('data-prts-history-selected'), false)
  assert.equal(historyTrigger.hasAttribute('aria-describedby'), false)
  assert.equal(historyHint.style.left, scale.style.left, 'history hint must share the normal preview rail anchor')
  assert.equal(historyConnector.getAttribute('aria-hidden'), 'true')

  historyTrigger.dispatchEvent(new dom.window.Event('pointerenter'))
  await flush(dom.window)
  assert.equal(scale.hasAttribute('data-prts-conversation-history-selected'), true)
  assert.equal(historyHint.hasAttribute('data-prts-history-selected'), true)
  assert.equal(historyTooltip.hidden, false)
  assert.equal(
    historyTooltip.querySelector('[data-prts-conversation-history-tooltip-label]').textContent,
    '历史断点',
  )
  assert.equal(
    historyTooltip.querySelector('[data-prts-conversation-history-tooltip-content] strong').textContent,
    '更早内容尚未加载',
  )
  assert.equal(
    historyTooltip.querySelector('[data-prts-conversation-history-tooltip-content] span').textContent,
    '点击断点，载入历史并前往会话开头',
  )
  assert.equal(historyTrigger.getAttribute('aria-describedby'), historyTooltip.id)

  historyTrigger.dispatchEvent(new dom.window.Event('pointerleave'))
  await flush(dom.window)
  assert.equal(scale.hasAttribute('data-prts-conversation-history-selected'), false)
  assert.equal(historyHint.hasAttribute('data-prts-history-selected'), false)
  assert.equal(historyTooltip.hidden, true)
  assert.equal(historyTooltip.getAttribute('aria-hidden'), 'true')
  assert.equal(historyTrigger.hasAttribute('aria-describedby'), false)

  historyTrigger.focus()
  await flush(dom.window)
  assert.equal(historyTooltip.hidden, true, 'keyboard focus must not pin the mouse-only tooltip')
  assert.equal(historyHint.hasAttribute('data-prts-history-selected'), false)
  historyTrigger.blur()

  historyTrigger.dispatchEvent(new dom.window.Event('pointerenter'))
  await flush(dom.window)
  assert.equal(historyTooltip.hidden, false)

  scale.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Home', bubbles: true }))
  await flush(dom.window)
  assert.match(scale.getAttribute('aria-valuetext'), /更早内容尚未载入/)
  historyTrigger.click()
  assert.equal(historyHint.hidden, true)
  assert.equal(status.hidden, false)
  assert.match(status.textContent, /正在载入更早内容/)

  scroller.scrollTop = 73
  const wheel = new dom.window.WheelEvent('wheel', { deltaY: 24, bubbles: true, cancelable: true })
  scroller.dispatchEvent(wheel)
  assert.equal(wheel.defaultPrevented, false)
  assert.equal(nativeClicks, 1)
  assert.equal(scroller.scrollTop, 73)
  assert.equal(scale.hasAttribute('data-prts-conversation-scale-partial'), true)
  assert.equal(status.dataset.prtsHistoryPhase, 'paused')

  // Continue immediately while the cancelled native request is still finishing.
  status.querySelector('[data-prts-conversation-history-action]').click()
  assert.equal(status.dataset.prtsHistoryPhase, 'loading')
  await flush(dom.window, 320)
  assert.equal(nativeClicks, 2)
  assert.equal(scale.dataset.prtsScaleCount, '4')
  assert.equal(scale.hasAttribute('data-prts-conversation-scale-partial'), false)
  assert.equal(status.hidden, true)
  assert.equal(historyHint.hidden, true)

  adapter.dispose()
})
