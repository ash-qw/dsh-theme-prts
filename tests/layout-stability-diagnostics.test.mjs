import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'

import { createLayoutStabilityDiagnostics } from '../src/client/layout-stability-diagnostics.js'

function flush(window) {
  return new Promise(resolve => window.setTimeout(resolve, 0))
}

test('stays inert unless layout diagnostics are explicitly enabled', () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>')
  const diagnostics = createLayoutStabilityDiagnostics({
    document: dom.window.document,
    window: dom.window,
  })
  assert.equal(diagnostics.start(), false)
  assert.equal(dom.window.__PRTS_LAYOUT_DIAGNOSTICS__, undefined)
})

test('records geometry and adapter styling only behind the development flag', async () => {
  const dom = new JSDOM(`<!doctype html><html data-prts-diagnostics="layout"><body>
    <main data-prts-region="operation">
      <div data-conversation-scroll>
        <div data-message-role="user">question</div>
        <button type="button">action</button>
      </div>
    </main>
  </body></html>`, { pretendToBeVisual: true })
  const { document } = dom.window
  const scroller = document.querySelector('[data-conversation-scroll]')
  const turn = document.querySelector('[data-message-role="user"]')
  const button = document.querySelector('button')
  let nextFrame
  let frameId = 0
  dom.window.requestAnimationFrame = callback => {
    nextFrame = callback
    frameId += 1
    return frameId
  }
  dom.window.cancelAnimationFrame = () => {}
  scroller.getBoundingClientRect = () => ({ top: 0, bottom: 500 })
  turn.getBoundingClientRect = () => ({ top: 100, bottom: 140 })
  Object.defineProperties(scroller, {
    scrollHeight: { configurable: true, value: 1000 },
    clientHeight: { configurable: true, value: 500 },
  })

  const diagnostics = createLayoutStabilityDiagnostics({ document, window: dom.window })
  assert.equal(diagnostics.start(), true)
  assert.ok(Array.isArray(dom.window.__PRTS_LAYOUT_DIAGNOSTICS__))
  nextFrame()
  scroller.scrollTop = 40
  nextFrame()
  button.setAttribute('data-prts-conversation-control', 'micro')
  await flush(dom.window)

  const records = dom.window.__PRTS_LAYOUT_DIAGNOSTICS__
  assert.ok(records.some(record => record.type === 'geometry' && record.scrollDelta === 40))
  assert.ok(records.some(record =>
    record.type === 'adapter-style'
      && record.attribute === 'data-prts-conversation-control'
  ))

  diagnostics.dispose()
  assert.equal(dom.window.__PRTS_LAYOUT_DIAGNOSTICS__, undefined)
})
