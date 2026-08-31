import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import test from 'node:test'

import { createTerrainMotionAdapter } from '../src/client/terrain-motion-adapter.js'

function fixture(width = 1440, reduced = false) {
  const dom = new JSDOM(`<!doctype html><html><body>
    <main data-prts-region="operation"><div data-slot="conversation"><div data-conversation-scroll></div></div></main>
  </body></html>`, { pretendToBeVisual: true })
  Object.defineProperty(dom.window, 'innerWidth', { configurable: true, value: width })
  dom.window.matchMedia = () => ({ matches: reduced, addEventListener() {}, removeEventListener() {} })
  let now = 0
  const frames = []
  dom.window.performance.now = () => now
  dom.window.requestAnimationFrame = callback => { frames.push(callback); return frames.length }
  dom.window.cancelAnimationFrame = () => {}
  return {
    dom,
    step(ms = 16) {
      now += ms
      const callback = frames.shift()
      callback?.(now)
    },
  }
}

test('creates an independent terrain layer and trails normal scrolling with a bounded lag', () => {
  const { dom, step } = fixture()
  const adapter = createTerrainMotionAdapter({ document: dom.window.document, window: dom.window })
  adapter.update({ enabled: true, texture: 'full', motion: 'full' })
  const scroller = dom.window.document.querySelector('[data-conversation-scroll]')
  const layer = dom.window.document.querySelector('[data-prts-terrain-layer]')
  assert.ok(layer)
  scroller.scrollTop = 500
  scroller.dispatchEvent(new dom.window.Event('scroll'))
  step()
  const state = adapter.inspect()
  assert.equal(state.target, 100)
  assert.ok(state.current >= 58 && state.current < 100, `expected bounded trail, got ${state.current}`)
  assert.match(layer.style.transform, /translate3d\(0, -/)
  adapter.dispose()
  assert.equal(dom.window.document.querySelector('[data-prts-terrain-layer]'), null)
})

test('snaps large jumps, disables delay for reduced motion, caps tablet lag and stays static on phones', () => {
  for (const [width, motion, scrollTop, expected] of [
    [1440, 'full', 2400, 480],
    [1440, 'reduced', 500, 100],
    [390, 'full', 500, 0],
  ]) {
    const { dom, step } = fixture(width)
    const adapter = createTerrainMotionAdapter({ document: dom.window.document, window: dom.window })
    adapter.update({ enabled: true, texture: 'full', motion })
    const scroller = dom.window.document.querySelector('[data-conversation-scroll]')
    scroller.scrollTop = scrollTop
    scroller.dispatchEvent(new dom.window.Event('scroll'))
    step()
    assert.equal(Math.round(adapter.inspect().current), expected)
    adapter.dispose()
  }

  const { dom, step } = fixture(900)
  const adapter = createTerrainMotionAdapter({ document: dom.window.document, window: dom.window })
  adapter.update({ enabled: true, texture: 'full', motion: 'full' })
  const scroller = dom.window.document.querySelector('[data-conversation-scroll]')
  scroller.scrollTop = 500
  scroller.dispatchEvent(new dom.window.Event('scroll'))
  step()
  assert.ok(100 - adapter.inspect().current <= 20.01)
  adapter.dispose()
})
