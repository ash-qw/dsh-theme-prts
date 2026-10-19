import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'
import { createComposerGlassSurface } from '../src/client/composer-glass-surface.js'

function fixture(t) {
  const dom = new JSDOM('<body><div data-composer-card></div></body>', { pretendToBeVisual: true })
  const { document } = dom.window
  const card = document.querySelector('[data-composer-card]')
  let width = 600
  Object.defineProperty(card, 'offsetWidth', { get: () => width })
  Object.defineProperty(card, 'offsetHeight', { get: () => 150 })
  let resized
  dom.window.ResizeObserver = class {
    constructor(callback) { resized = callback }
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  const calls = { mounts: 0, updates: [], unmounts: 0 }
  const surface = createComposerGlassSurface({
    document, window: dom.window,
    mount() {
      calls.mounts++
      const dispose = () => calls.unmounts++
      dispose.update = props => calls.updates.push(props)
      return dispose
    },
  })
  t.after(() => { surface.dispose(); dom.window.close() })
  return { document, card, calls, surface, resize(value) { width = value; resized() } }
}
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

test('glass mounts once and ignores menu churn without rebuilding the composer', async t => {
  const f = fixture(t)
  f.surface.start()
  f.surface.start()
  const menu = f.document.createElement('div')
  menu.setAttribute('role', 'menu')
  f.document.body.append(menu)
  await wait(30)
  menu.remove()
  await wait(30)
  assert.equal(f.calls.mounts, 1)
  assert.equal(f.calls.updates.length, 0)
})

test('resize bursts update the refraction shape only after dimensions settle', async t => {
  const f = fixture(t)
  f.surface.start()
  f.resize(620)
  await wait(30)
  f.resize(640)
  await wait(30)
  f.resize(680)
  await wait(30)
  assert.equal(f.calls.updates.length, 0)
  await wait(130)
  assert.equal(f.calls.updates.length, 1)
  assert.match(decodeURIComponent(f.calls.updates[0].shape), /width="712"/)
  assert.equal(f.calls.mounts, 1)
})

test('disabling glass cancels a pending resize and restores owned DOM', async t => {
  const f = fixture(t)
  f.surface.start()
  f.resize(680)
  await wait(30)
  f.surface.dispose()
  await wait(130)
  assert.equal(f.calls.updates.length, 0)
  assert.equal(f.calls.unmounts, 1)
  assert.equal(f.document.querySelector('[data-prts-composer-glass-surface]'), null)
  assert.equal(f.card.hasAttribute('data-prts-composer-glass-active'), false)
  assert.equal(f.document.documentElement.hasAttribute('data-prts-composer-enhanced'), false)
})

test('without a rendering mount the enhancement does not partially enable menus', t => {
  const dom = new JSDOM('<body></body>')
  t.after(() => dom.window.close())
  const adapter = createComposerGlassSurface({ document: dom.window.document, window: dom.window })
  adapter.start()
  assert.equal(dom.window.document.documentElement.hasAttribute('data-prts-composer-enhanced'), false)
  adapter.dispose()
})
