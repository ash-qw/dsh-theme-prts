import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'

import { createToBottomAdapter, TO_BOTTOM_ATTRIBUTE } from '../src/client/to-bottom-adapter.js'

function flush(window) {
  return new Promise(resolve => window.setTimeout(resolve, 24))
}

test('marks only the native class-token suffix and follows virtualized replacement', async () => {
  const dom = new JSDOM(`<!doctype html><html><body><main data-prts-region="operation">
    <button class="Md3f7G_toBottom hydrated" aria-label="回到底部"></button>
    <button class="Md3f7G_toolbar">工具</button>
  </main></body></html>`, { pretendToBeVisual: true })
  const { document } = dom.window
  const adapter = createToBottomAdapter({ document, window: dom.window })
  adapter.start()

  const first = document.querySelector('[aria-label="回到底部"]')
  assert.equal(first.hasAttribute(TO_BOTTOM_ATTRIBUTE), true)
  assert.equal(document.querySelector('.Md3f7G_toolbar').hasAttribute(TO_BOTTOM_ATTRIBUTE), false)

  first.remove()
  const replacement = document.createElement('button')
  replacement.className = 'future_toBottom complete'
  document.querySelector('[data-prts-region="operation"]').append(replacement)
  await flush(dom.window)

  assert.equal(first.hasAttribute(TO_BOTTOM_ATTRIBUTE), false)
  assert.equal(replacement.hasAttribute(TO_BOTTOM_ATTRIBUTE), true)
  adapter.dispose()
  assert.equal(replacement.hasAttribute(TO_BOTTOM_ATTRIBUTE), false)
})

test('does not depend on a localized aria label', () => {
  const dom = new JSDOM('<!doctype html><html><body><main data-prts-region="operation"><button class="X_toBottom" aria-label="To bottom"></button></main></body></html>')
  const adapter = createToBottomAdapter({ document: dom.window.document, window: dom.window })
  adapter.start()
  assert.ok(dom.window.document.querySelector(`[${TO_BOTTOM_ATTRIBUTE}]`))
  adapter.dispose()
})
