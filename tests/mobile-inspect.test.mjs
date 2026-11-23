import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'
import { createMobileInspect } from '../src/client/mobile-inspect.js'

test('device readout is URL gated and contains CSS and colors without page content or image addresses', t => {
  const dom = new JSDOM('<html data-dsh-prts><head><meta name="theme-color" content="#123456"></head><body style="background-image:url(https://private.example/secret.png)">private chat sentinel</body></html>', { url: 'https://dsh.example/?prts-mobile-inspect=1' })
  t.after(() => dom.window.close())
  const { window } = dom
  const callbacks = [], requests = [], cancelled = []
  window.setTimeout = fn => callbacks.push(fn)
  window.clearTimeout = id => cancelled.push(id)
  window.matchMedia = () => ({ matches: true })
  window.fetch = async (url, options) => requests.push({ url, options })
  const inspect = createMobileInspect({ document: window.document, window })
  assert.equal(callbacks.length, 3)
  callbacks[0]()
  const url = new URL(requests[0].url), value = JSON.parse(url.searchParams.get('prts-mobile-readout'))
  assert.equal(url.origin, window.location.origin)
  assert.equal(url.pathname, '/favicon.svg')
  assert.equal(requests[0].options.cache, 'no-store')
  assert.equal(requests[0].options.method, undefined)
  assert.equal(value.colors[0].color, '#123456')
  assert.equal(value.image, true)
  assert.equal(value.themed, true)
  assert.doesNotMatch(JSON.stringify(value), /private chat|private.example|secret.png/)
  inspect.dispose()
  assert.deepEqual(cancelled, [2, 3])
  window.history.replaceState(null, '', '/')
  assert.equal(createMobileInspect({ document: window.document, window }), null)
  assert.equal(callbacks.length, 3)
})
