import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import test from 'node:test'
import { createHostGeometryAdapter } from '../src/client/host-geometry-adapter.js'

test('projects only the host top inset and restores the previous value', async () => {
  const dom = new JSDOM('<!doctype html><html><body><div data-frame></div></body></html>', { pretendToBeVisual: true })
  const { document } = dom.window
  const frame = document.querySelector('[data-frame]')
  let top = 56
  frame.getBoundingClientRect = () => ({ top })
  const observed = []
  let disconnected = 0
  let resizeCallback
  dom.window.ResizeObserver = class {
    constructor(callback) { resizeCallback = callback }
    observe(target) { observed.push(target) }
    disconnect() { disconnected += 1 }
  }
  dom.window.requestAnimationFrame = callback => dom.window.setTimeout(callback, 0)
  dom.window.cancelAnimationFrame = id => dom.window.clearTimeout(id)
  document.documentElement.style.setProperty('--prts-host-top-inset', '12px', 'important')

  const adapter = createHostGeometryAdapter({ document, window: dom.window })
  assert.equal(adapter.start(frame), true)
  assert.equal(document.documentElement.style.getPropertyValue('--prts-host-top-inset'), '56px')
  assert.deepEqual(observed, [frame])

  top = 72.5
  resizeCallback([{ target: frame, contentRect: { height: 600 } }])
  await new Promise(resolve => dom.window.setTimeout(resolve, 8))
  assert.equal(document.documentElement.style.getPropertyValue('--prts-host-top-inset'), '72.5px')

  adapter.dispose()
  assert.equal(disconnected, 1)
  assert.equal(document.documentElement.style.getPropertyValue('--prts-host-top-inset'), '12px')
})
