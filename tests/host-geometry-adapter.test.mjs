import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import test from 'node:test'
import { createHostGeometryAdapter } from '../src/client/host-geometry-adapter.js'

test('projects host inset and shared sidebar wallpaper width and restores the previous value', async () => {
  const dom = new JSDOM('<!doctype html><html><body><div data-frame><div data-prts-region="sessions"></div></div></body></html>', { pretendToBeVisual: true })
  const { document } = dom.window
  const frame = document.querySelector('[data-frame]')
  const sidebar = frame.firstElementChild
  let width = 280
  sidebar.getBoundingClientRect = () => ({ width })
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
  assert.deepEqual(observed, [frame, sidebar])
  assert.equal(document.documentElement.style.getPropertyValue('--prts-sidebar-width'), '280px')

  top = 72.5
  resizeCallback([{ target: frame, contentRect: { height: 600 } }])
  await new Promise(resolve => dom.window.setTimeout(resolve, 8))
  assert.equal(document.documentElement.style.getPropertyValue('--prts-host-top-inset'), '72.5px')

  width = 340
  resizeCallback([{ target: sidebar, contentRect: { width } }])
  assert.equal(document.documentElement.style.getPropertyValue('--prts-sidebar-width'), '340px')
  adapter.dispose()
  assert.equal(document.documentElement.style.getPropertyValue('--prts-sidebar-width'), '')
  assert.equal(disconnected, 1)
  assert.equal(document.documentElement.style.getPropertyValue('--prts-host-top-inset'), '12px')
})
