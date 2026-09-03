import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import test from 'node:test'

import { createResizeShieldAdapter } from '../src/client/resize-shield-adapter.js'

function delay(window, milliseconds) {
  return new Promise(resolve => window.setTimeout(resolve, milliseconds))
}

test('shields only registered operation surfaces during a resize burst and clears after settle', async () => {
  const dom = new JSDOM('<!doctype html><html><body><nav data-nav></nav><aside data-sidebar></aside><main data-operation></main><dialog data-settings></dialog><div data-backdrop></div></body></html>')
  const { window } = dom
  const document = window.document
  const operation = document.querySelector('[data-operation]')
  const settings = document.querySelector('[data-settings]')
  const backdrop = document.querySelector('[data-backdrop]')
  const nav = document.querySelector('[data-nav]')
  const sidebar = document.querySelector('[data-sidebar]')
  const adapter = createResizeShieldAdapter({ window, settleDelay: 20 })

  assert.equal(adapter.start([operation, settings, backdrop]), true)
  window.dispatchEvent(new window.Event('resize'))

  for (const node of [operation, settings, backdrop]) {
    assert.equal(node.hasAttribute('data-prts-resize-shield'), true)
  }
  assert.equal(nav.hasAttribute('data-prts-resize-shield'), false)
  assert.equal(sidebar.hasAttribute('data-prts-resize-shield'), false)

  await delay(window, 12)
  window.dispatchEvent(new window.Event('resize'))
  await delay(window, 12)
  assert.equal(operation.hasAttribute('data-prts-resize-shield'), true)

  await delay(window, 16)
  for (const node of [operation, settings, backdrop]) {
    assert.equal(node.hasAttribute('data-prts-resize-shield'), false)
  }

  adapter.dispose()
  dom.window.close()
})

test('does not hide operation surfaces for phone viewport resizes', () => {
  const dom = new JSDOM('<!doctype html><html><body><main data-operation></main></body></html>')
  const { window } = dom
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })
  const operation = window.document.querySelector('[data-operation]')
  const adapter = createResizeShieldAdapter({ window, settleDelay: 20 })

  adapter.start([operation])
  window.dispatchEvent(new window.Event('resize'))
  assert.equal(operation.hasAttribute('data-prts-resize-shield'), false)

  adapter.dispose()
  dom.window.close()
})

test('restarting and disposing remove shield state and stale listeners', () => {
  const dom = new JSDOM('<!doctype html><html><body><main data-first></main><main data-second></main></body></html>')
  const { window } = dom
  const first = window.document.querySelector('[data-first]')
  const second = window.document.querySelector('[data-second]')
  const adapter = createResizeShieldAdapter({ window, settleDelay: 20 })

  adapter.start([first])
  window.dispatchEvent(new window.Event('resize'))
  assert.equal(first.hasAttribute('data-prts-resize-shield'), true)

  adapter.start([second])
  assert.equal(first.hasAttribute('data-prts-resize-shield'), false)
  adapter.dispose()
  window.dispatchEvent(new window.Event('resize'))
  assert.equal(second.hasAttribute('data-prts-resize-shield'), false)
  dom.window.close()
})
