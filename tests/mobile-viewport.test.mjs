import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'
import { createThemeController } from '../src/client/theme-controller-v2.js'
import { createMobileViewport } from '../src/client/mobile-viewport.js'

const cssText = 'html[data-prts-scheme="dark"] { --prts-canvas: #080a0c } html[data-prts-scheme="light"] { --prts-canvas: #eef1f3 }'

function setup(t, head = '') {
  const dom = new JSDOM(`<!doctype html><html><head>${head}</head><body></body></html>`, { pretendToBeVisual: true })
  const controller = createThemeController({ document: dom.window.document, window: dom.window, cssText, service: { getTheme: () => 'dark' } })
  t.after(() => { controller.dispose(); dom.window.close() })
  const meta = name => dom.window.document.head.querySelector(`meta[name="${name}"]`)
  return { controller, document: dom.window.document, meta }
}

test('browser chrome follows committed schemes and restores all existing host metadata on disable', t => {
  const { controller, document, meta } = setup(t, '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=contain, interactive-widget=resizes-content"><meta name="apple-mobile-web-app-status-bar-style" content="black"><meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">')
  const before = document.head.innerHTML
  controller.apply({ enabled: true })
  assert.equal(meta('viewport').content, 'width=device-width, initial-scale=1, interactive-widget=resizes-content, viewport-fit=cover')
  assert.equal(meta('apple-mobile-web-app-status-bar-style').content, 'black-translucent')
  assert.equal(meta('apple-mobile-web-app-capable').content, 'yes')
  assert.equal(meta('theme-color').content, '#080a0c')
  assert.equal(document.querySelectorAll('meta[name="theme-color"]').length, 2)
  controller.sync('light')
  assert.equal(meta('theme-color').content, '#eef1f3')
  assert.equal(meta('apple-mobile-web-app-status-bar-style').content, 'black-translucent')
  controller.apply({ enabled: false })
  assert.equal(document.head.innerHTML.replace(/<style[\s\S]*?<\/style>/g, ''), before)
  controller.sync('dark')
  assert.equal(meta('theme-color').content, '#ffffff')
})

test('new browser metadata is removed on disposal and recreated once when re-enabled', t => {
  const { controller, document, meta } = setup(t)
  controller.apply({ enabled: false })
  assert.equal(document.querySelectorAll('meta').length, 0)
  controller.apply({ enabled: true })
  controller.apply({ enabled: true })
  assert.equal(document.querySelectorAll('meta').length, 4)
  controller.dispose()
  assert.equal(document.querySelectorAll('meta').length, 0)
  controller.apply({ enabled: true })
  assert.equal(document.querySelectorAll('meta').length, 4)
  assert.equal(meta('theme-color').content, '#080a0c')
})

test('Apple app metadata is present for standalone launch and removed on disable', t => {
  const { controller, document, meta } = setup(t)
  Object.defineProperty(document.defaultView.navigator, 'standalone', { value: true })
  controller.apply({ enabled: true })
  assert.equal(meta('apple-mobile-web-app-capable').content, 'yes')
  assert.equal(meta('apple-mobile-web-app-status-bar-style').content, 'black-translucent')
  controller.apply({ enabled: false })
  assert.equal(document.querySelectorAll('meta').length, 0)
})

test('server-owned Apple declarations survive activation and are removed on disable', t => {
  const { controller, meta } = setup(t, '<meta name="apple-mobile-web-app-capable" content="yes" data-prts-mobile-created><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" data-prts-mobile-created>')
  controller.apply({ enabled: true })
  assert.equal(meta('apple-mobile-web-app-capable').content, 'yes')
  assert.equal(meta('apple-mobile-web-app-status-bar-style').content, 'black-translucent')
  controller.apply({ enabled: false })
  assert.equal(meta('apple-mobile-web-app-capable'), null)
  assert.equal(meta('apple-mobile-web-app-status-bar-style'), null)
})

test('teardown preserves host changes made after the theme last wrote metadata', t => {
  const { controller, meta } = setup(t, '<meta name="viewport" content="width=device-width"><meta name="theme-color" content="#fff">')
  controller.apply({ enabled: true })
  meta('viewport').content = 'width=device-width, initial-scale=2'
  // The host retains its own meta node while the theme owns a preceding one.
  const nativeColor = [...meta('theme-color').parentElement.querySelectorAll('meta[name="theme-color"]')].at(-1)
  nativeColor.content = '#123456'
  controller.dispose()
  assert.equal(meta('viewport').content, 'width=device-width, initial-scale=2')
  assert.equal(meta('theme-color').content, '#123456')
})

test('delayed wallpaper load cannot recreate metadata or tint after disposal', async t => {
  const dom = new JSDOM('<html data-dsh-prts><head></head><body style="background-image:url(/wallpaper.png)"></body></html>', { pretendToBeVisual: true })
  const { window } = dom
  let onload
  window.Image = class { set src(value) { onload = this.onload } }
  const viewport = createMobileViewport({ document: window.document, window })
  t.after(() => { viewport.dispose(); window.close() })
  viewport.sync()
  assert.equal(typeof onload, 'function')
  viewport.dispose()
  onload()
  window.dispatchEvent(new window.Event('resize'))
  await new Promise(resolve => window.requestAnimationFrame(resolve))
  assert.equal(window.document.head.querySelectorAll('meta').length, 0)
  assert.equal(window.document.documentElement.style.getPropertyValue('--prts-browser-chrome-color'), '')
})

test('all host color candidates follow the theme and retain their media and original content', t => {
  const head = '<meta name="theme-color" content="#111" media="(prefers-color-scheme: dark)"><meta name="THEME-COLOR" content="#eee" media="(prefers-color-scheme: light)"><meta name="theme-color">'
  const { controller, document } = setup(t, head)
  const native = [...document.querySelectorAll('meta')]
  controller.apply({ enabled: true })
  for (const node of native) assert.equal(node.content, '#080a0c')
  controller.sync('light')
  for (const node of native) assert.equal(node.content, '#eef1f3')
  assert.equal(native[0].getAttribute('media'), '(prefers-color-scheme: dark)')
  assert.equal(native[1].getAttribute('media'), '(prefers-color-scheme: light)')
  controller.apply({ enabled: false })
  assert.equal(document.head.innerHTML.replace(/<style[\s\S]*?<\/style>/g, ''), head)
})

test('late host nodes and later host color changes stay synchronized and restore the latest host value', async t => {
  const { controller, document } = setup(t)
  controller.apply({ enabled: true })
  const native = document.createElement('meta')
  native.name = 'theme-color'; native.content = '#123456'
  document.head.append(native)
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(native.content, '#080a0c')
  native.content = '#654321'
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(native.content, '#080a0c')
  controller.sync('light')
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(native.content, '#eef1f3')
  controller.dispose()
  assert.equal(native.content, '#654321')
  assert.equal(document.querySelectorAll('meta').length, 1)
})

test('removed or repurposed host nodes are released without recreating them', async t => {
  const { controller, document } = setup(t, '<meta name="theme-color" content="#123456">')
  const native = document.querySelector('meta')
  controller.apply({ enabled: true })
  native.name = 'description'
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(native.content, '#123456')
  native.name = 'theme-color'
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(native.content, '#080a0c')
  native.remove()
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(native.content, '#123456')
  controller.sync('light')
  assert.equal(document.querySelectorAll('meta[name="theme-color"]').length, 1)
  controller.dispose()
  assert.equal(document.querySelectorAll('meta').length, 0)
})
