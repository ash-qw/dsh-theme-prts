import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import test from 'node:test'

import { createThemeController } from '../src/client/theme-controller.js'

const enabled = {
  version: 2,
  enabled: true,
  texture: 'full',
  glass: 'clear',
  particlePattern: 'orthogonal',
  motion: 'system',
  sessionFlow: false,
  conversationStyle: 'deck-chat',
}

function setup(initial = 'dark') {
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', { pretendToBeVisual: true })
  const calls = { get: 0, set: [], media: 0 }
  let current = initial
  dom.window.matchMedia = () => {
    calls.media += 1
    return { matches: false, addEventListener() {}, removeEventListener() {} }
  }
  const service = {
    getTheme() { calls.get += 1; return current },
    setTheme(id) { calls.set.push(id); current = id },
  }
  const controller = createThemeController({
    document: dom.window.document,
    window: dom.window,
    cssText: 'html[data-dsh-prts]{color:red}',
    service,
  })
  return { dom, calls, controller, service }
}

test('uses the Harness theme service as the sole light and dark authority', () => {
  const { dom, calls, controller } = setup({ preference: 'system', active: { id: 'dark', colorScheme: 'dark' } })
  controller.apply(enabled)
  const root = dom.window.document.documentElement
  assert.equal(root.dataset.prtsScheme, 'dark')
  assert.equal(calls.get, 1)
  assert.equal(calls.media, 0)

  controller.setTheme('light')
  assert.equal(root.dataset.prtsScheme, 'light')
  assert.deepEqual(calls.set, ['light'])
  controller.sync({ preference: 'system', active: { id: 'dark', colorScheme: 'dark' } })
  assert.equal(root.dataset.prtsScheme, 'dark')
})

test('applies appearance state and fully removes only owned state', () => {
  const { dom, controller } = setup('light')
  controller.apply(enabled)
  const root = dom.window.document.documentElement
  assert.equal(root.getAttribute('data-dsh-prts'), '')
  assert.equal(root.dataset.prtsScheme, 'light')
  assert.equal(root.dataset.prtsTexture, 'full')
  assert.equal(root.dataset.prtsGlass, 'clear')
  assert.equal(root.dataset.prtsParticlePattern, 'orthogonal')
  assert.equal(root.dataset.prtsSessionFlow, 'off')
  assert.equal(root.dataset.prtsConversationStyle, 'deck-chat')
  assert.equal(root.hasAttribute('data-prts-glass-highlight'), false)
  assert.equal(dom.window.document.querySelectorAll('style[data-plugin-css="dsh-theme-prts/prts.css"]').length, 1)

  controller.dispose()
  assert.equal(root.hasAttribute('data-dsh-prts'), false)
  assert.equal(root.hasAttribute('data-prts-scheme'), false)
  assert.equal(root.hasAttribute('data-prts-glass'), false)
  assert.equal(root.hasAttribute('data-prts-particle-pattern'), false)
  assert.equal(root.hasAttribute('data-prts-session-flow'), false)
  assert.equal(root.hasAttribute('data-prts-conversation-style'), false)
  assert.equal(dom.window.document.querySelector('[data-plugin="dsh-theme-prts"]'), null)
})

test('keeps settings styles mounted while the visual theme is disabled', () => {
  const { dom, controller } = setup('dark')
  controller.apply(enabled)
  controller.apply({ ...enabled, enabled: false })
  const root = dom.window.document.documentElement
  assert.equal(root.hasAttribute('data-dsh-prts'), false)
  assert.equal(root.hasAttribute('data-prts-scheme'), false)
  assert.equal(root.hasAttribute('data-dsh-prts-settings'), true)
  assert.ok(dom.window.document.querySelector('[data-plugin-css="dsh-theme-prts/prts.css"]'))
  controller.dispose()
})
