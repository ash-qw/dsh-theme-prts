import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'
import { renderMobileBoot, registerMobileBoot } from '../src/server/mobile-boot.js'
import { createThemeController } from '../src/client/theme-controller-v2.js'

const original = '<!doctype html><html><head><meta charset="utf-8"><meta data-test="preserved" content="width=device-width, initial-scale=1, viewport-fit=contain, custom=a&amp;b" name="viewport"><meta name="apple-mobile-web-app-status-bar-style" content="default"><script type="module" src="./host.js"></script></head><body><div id="root"></div></body></html>'

test('initial document expands the viewport and declares standalone launch settings', () => {
  const output = renderMobileBoot(original)
  const dom = new JSDOM(output)
  const meta = name => dom.window.document.head.querySelector(`meta[name="${name}"]`)
  assert.equal(meta('viewport').content, 'width=device-width, initial-scale=1, custom=a&b, viewport-fit=cover')
  assert.equal(meta('viewport').dataset.test, 'preserved')
  assert.equal(meta('apple-mobile-web-app-capable').content, 'yes')
  assert.equal(meta('apple-mobile-web-app-status-bar-style').content, 'black-translucent')
  assert.equal(dom.window.document.querySelectorAll('meta[name="viewport"]').length, 1)
  assert.equal(renderMobileBoot(output), output)
  dom.window.close()
})

test('boot rendering leaves scripts, styles, comments and content outside the head intact', () => {
  const fake = '<meta name="viewport" content="fake">'
  const head = `<script>const sample = '${fake}'</script><style>/* ${fake} */</style><!-- ${fake} -->`
  const body = `<body>${fake}</body>`
  const output = renderMobileBoot(`<html><head>${head}</head>${body}</html>`)
  assert.ok(output.includes(head))
  assert.ok(output.includes(body))
  assert.equal(renderMobileBoot(body), body)
})

test('client disable removes server-owned declarations and restores the original viewport and status', () => {
  const before = new JSDOM(original)
  const dom = new JSDOM(renderMobileBoot(original), { pretendToBeVisual: true })
  const controller = createThemeController({ document: dom.window.document, window: dom.window, cssText: '' })
  controller.apply({ enabled: true })
  controller.apply({ enabled: false })
  dom.window.document.querySelector('style[data-plugin="dsh-theme-prts"]').remove()
  assert.equal(dom.window.document.head.innerHTML, before.window.document.head.innerHTML)
  controller.dispose()
  dom.window.close()
  before.window.close()
})

test('HTML hook reads the live enabled switch on each request and unregisters cleanly', () => {
  let enabled = false, transform
  const dispose = registerMobileBoot({ tapIndex(fn) { transform = fn; return () => { transform = undefined } } }, { enabled: { get: () => enabled } })
  assert.equal(transform(original), original)
  enabled = true
  assert.notEqual(transform(original), original)
  enabled = false
  assert.equal(transform(original), original)
  dispose()
  assert.equal(transform, undefined)
  assert.equal(typeof registerMobileBoot({}, { enabled: true }), 'function')
})

test('safe mode restores boot metadata before the theme has ever been enabled', () => {
  const before = new JSDOM(original)
  const dom = new JSDOM(renderMobileBoot(original), { pretendToBeVisual: true })
  const controller = createThemeController({ document: dom.window.document, window: dom.window, cssText: '' })
  controller.apply({ enabled: false })
  dom.window.document.querySelector('style[data-plugin="dsh-theme-prts"]').remove()
  assert.equal(dom.window.document.head.innerHTML, before.window.document.head.innerHTML)
  controller.dispose()
  dom.window.close()
  before.window.close()
})
