import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import test from 'node:test'

import { createComposerGlassAdapter } from '../src/client/composer-glass-adapter.js'

test('marks only composer model permission and inline menu surfaces', async t => {
  const dom = new JSDOM(`<!doctype html><body>
    <div data-composer-card>
      <span data-slot="conversation.input.permission"><button id="permission">权限</button><div role="menu"><button role="menuitem">允许</button></div></span>
      <div><button aria-haspopup="menu" aria-expanded="true" aria-controls="model-menu">模型</button><div id="model-menu" role="menu" aria-busy="false"></div></div>
      <span><button type="button" aria-label="命令" aria-haspopup="listbox" aria-expanded="true">命令</button><div role="menu"><button role="menuitem">命令</button></div></span>
      <button type="submit">发送</button>
    </div>
    <div role="menu" id="outside"></div>
  </body>`, { pretendToBeVisual: true })
  const adapter = createComposerGlassAdapter({ document: dom.window.document, window: dom.window })
  t.after(() => adapter.dispose())
  adapter.start()

  assert.equal(dom.window.document.querySelector('#permission').dataset.prtsGlassControl, 'permission')
  assert.equal(dom.window.document.querySelector('[aria-controls="model-menu"]').dataset.prtsGlassControl, 'model')
  assert.equal(dom.window.document.querySelector('#model-menu').dataset.prtsGlassMenu, 'model')
  assert.equal(dom.window.document.querySelector('#permission + [role="menu"]').dataset.prtsGlassMenu, 'permission')
  const action = dom.window.document.querySelector('button[aria-haspopup="listbox"]')
  assert.equal(action.dataset.prtsGlassControl, 'action')
  assert.equal(action.nextElementSibling.dataset.prtsGlassMenu, 'action')
  assert.equal(dom.window.document.querySelector('[type="submit"]').hasAttribute('data-prts-glass-control'), false)
  assert.equal(dom.window.document.querySelector('#outside').hasAttribute('data-prts-glass-menu'), false)
  assert.equal(dom.window.document.querySelector('[role="menuitem"]').hasAttribute('data-prts-glass-control'), false)
  assert.equal(dom.window.document.querySelectorAll('[data-prts-composer-signal]').length, 1)
  assert.equal(dom.window.document.querySelector('[data-prts-composer-signal]').getAttribute('aria-hidden'), 'true')
})

test('classifies a closed model trigger from its stable slot instead of text or a class hash', async t => {
  const dom = new JSDOM(`<!doctype html><body>
    <div data-composer-card>
      <span data-slot="conversation.input.model"><button class="Ns6z9q_trigger" aria-haspopup="menu" aria-expanded="false">
        <span hidden>Hidden model name</span><svg aria-hidden="true"><path></path></svg>
      </button></span>
      <button id="icon-action" aria-label="Tools" aria-haspopup="menu" aria-expanded="false">
        <svg aria-hidden="true"><path></path></svg>
      </button>
    </div>
  </body>`, { pretendToBeVisual: true })
  const adapter = createComposerGlassAdapter({ document: dom.window.document, window: dom.window })
  t.after(() => adapter.dispose())
  adapter.start()

  assert.equal(dom.window.document.querySelector('.Ns6z9q_trigger').dataset.prtsGlassControl, 'model')
  assert.equal(dom.window.document.querySelector('#icon-action').dataset.prtsGlassControl, 'action')
})

test('tracks menus added after startup and removes every owned marker', async () => {
  const dom = new JSDOM('<!doctype html><body><main data-prts-region="operation"><div data-composer-card><span data-slot="conversation.input.permission"><button>权限</button></span></div></main></body>', { pretendToBeVisual: true })
  const adapter = createComposerGlassAdapter({ document: dom.window.document, window: dom.window })
  adapter.start()
  const menu = dom.window.document.createElement('div')
  menu.setAttribute('role', 'menu')
  dom.window.document.querySelector('[data-slot="conversation.input.permission"]').appendChild(menu)
  await new Promise(resolve => dom.window.setTimeout(resolve, 24))
  assert.equal(menu.dataset.prtsGlassMenu, 'permission')
  assert.ok(dom.window.document.querySelector('[data-prts-composer-signal]'))
  adapter.dispose()
  assert.equal(dom.window.document.querySelector('[data-prts-glass-control]'), null)
  assert.equal(dom.window.document.querySelector('[data-prts-glass-menu]'), null)
  assert.equal(dom.window.document.querySelector('[data-prts-composer-signal]'), null)
})

test('releases the signal owned by a composer after that composer is replaced', async () => {
  const dom = new JSDOM('<!doctype html><body><main data-prts-region="operation"><div data-composer-card>旧输入框</div></main></body>', { pretendToBeVisual: true })
  const { document } = dom.window
  const adapter = createComposerGlassAdapter({ document, window: dom.window })
  adapter.start()
  const oldComposer = document.querySelector('[data-composer-card]')
  assert.ok(oldComposer.querySelector('[data-prts-composer-signal]'))

  const nextComposer = document.createElement('div')
  nextComposer.setAttribute('data-composer-card', '')
  oldComposer.replaceWith(nextComposer)
  await new Promise(resolve => dom.window.setTimeout(resolve, 24))

  assert.equal(oldComposer.querySelector('[data-prts-composer-signal]'), null)
  assert.ok(nextComposer.querySelector('[data-prts-composer-signal]'))
  adapter.dispose()
})

test('does not classify an unrelated textarea form as a fallback composer', async t => {
  const dom = new JSDOM(`<!doctype html><body>
    <main data-prts-region="operation">
      <form id="dsh-partner-identity-editor" class="dsh-partner-form is-identity">
        <textarea name="description"></textarea>
        <textarea name="instructions"></textarea>
        <button type="submit">保存身份</button>
      </form>
    </main>
  </body>`, { pretendToBeVisual: true })
  const adapter = createComposerGlassAdapter({ document: dom.window.document, window: dom.window })
  t.after(() => adapter.dispose())
  adapter.start()

  const form = dom.window.document.querySelector('#dsh-partner-identity-editor')
  assert.equal(form.hasAttribute('data-prts-composer-fallback'), false)
  assert.equal(form.querySelector('[data-prts-composer-signal]'), null)
})

test('does not infer a composer from legacy textarea forms even inside a composer seat', async t => {
  const dom = new JSDOM(`<!doctype html><body>
    <main data-prts-region="operation">
      <div data-composer-seat><form id="legacy-composer"><textarea></textarea></form></div>
      <section id="foreign-panel"></section>
    </main>
  </body>`, { pretendToBeVisual: true })
  const { document } = dom.window
  const adapter = createComposerGlassAdapter({ document, window: dom.window })
  t.after(() => adapter.dispose())
  adapter.start()

  const form = document.querySelector('#legacy-composer')
  assert.equal(form.hasAttribute('data-prts-composer-fallback'), false)
  assert.equal(form.querySelector('[data-prts-composer-signal]'), null)

  document.querySelector('#foreign-panel').append(form)
  await new Promise(resolve => dom.window.setTimeout(resolve, 24))

  assert.equal(form.hasAttribute('data-prts-composer-fallback'), false)
  assert.equal(form.querySelector('[data-prts-composer-signal]'), null)
})

test('marks command and parameter material shells without depending on CSS hashes', async t => {
  const dom = new JSDOM(`<!doctype html><body>
    <div data-composer-card>
      <button class="uV2eYG_add" aria-label="Commands" aria-haspopup="listbox" aria-expanded="true">+</button>
    </div>
    <div data-slot="conversation.input.overlay">
      <div data-trigger-menu><div role="listbox"><button role="option" aria-selected="true">命令</button></div></div>
      <div id="parameters" data-menu-material="translucent"><div role="listbox"><button role="option">参数</button></div></div>
    </div>
  </body>`, { pretendToBeVisual: true })
  const adapter = createComposerGlassAdapter({ document: dom.window.document, window: dom.window })
  t.after(() => adapter.dispose())
  adapter.start()

  assert.equal(dom.window.document.querySelector('.uV2eYG_add').dataset.prtsGlassControl, 'action')
  assert.equal(dom.window.document.querySelector('[data-trigger-menu]').dataset.prtsGlassMenu, 'action')
  assert.equal(dom.window.document.querySelector('#parameters').dataset.prtsGlassMenu, 'action')
  for (const listbox of dom.window.document.querySelectorAll('[role="listbox"]')) assert.equal(listbox.dataset.prtsGlassMenu, 'action')
})

test('marks the rc.2 agent preset trigger and its semantic portal without touching unrelated portals', async t => {
  const dom = new JSDOM(`<!doctype html><body>
    <div data-slot="conversation.hero.agentPreset">
      <button class="cubgiG_seat" aria-haspopup="menu" aria-expanded="true" aria-controls="preset-menu">Standard mode</button>
    </div>
    <div id="preset-menu" class="_list_19372_8 _portal_19372_43" role="menu">
      <button role="menuitem">Standard mode</button>
    </div>
    <div class="_list_19372_8 _portal_19372_43" role="menu" id="closed-workspace" hidden>
      <button role="menuitem">Workspace</button>
    </div>
  </body>`, { pretendToBeVisual: true })
  const adapter = createComposerGlassAdapter({ document: dom.window.document, window: dom.window })
  t.after(() => adapter.dispose())
  adapter.start()

  assert.equal(dom.window.document.querySelector('.cubgiG_seat').dataset.prtsGlassControl, 'preset')
  assert.equal(dom.window.document.querySelector('[role="menu"]:not([hidden])').dataset.prtsGlassMenu, 'preset')
  assert.equal(dom.window.document.querySelector('#closed-workspace').hasAttribute('data-prts-glass-menu'), false)
})

test('marks a newly opened composer portal before any animation frame', async t => {
  const dom = new JSDOM('<body><main data-slot="main.conversation"><div data-composer-card><span data-slot="conversation.input.model"><button aria-haspopup="menu" aria-controls="model">Model</button></span></div></main></body>', { pretendToBeVisual: true })
  const { document } = dom.window
  // Hold animation frames: popup material must not depend on their delivery.
  dom.window.requestAnimationFrame = () => 1
  const adapter = createComposerGlassAdapter({ document, window: dom.window })
  t.after(() => { adapter.dispose(); dom.window.close() })
  adapter.start()
  const popup = document.createElement('div')
  popup.id = 'model'
  popup.setAttribute('role', 'menu')
  document.body.append(popup)
  await Promise.resolve()
  assert.equal(popup.dataset.prtsGlassMenu, 'model')
  const unrelated = document.createElement('div')
  unrelated.setAttribute('role', 'menu')
  document.body.append(unrelated)
  await Promise.resolve()
  assert.equal(unrelated.hasAttribute('data-prts-glass-menu'), false)
})

test('rescanning a model picker leaves its internal scrolling menu unstyled', async t => {
  const dom = new JSDOM('<body><main data-slot="main.conversation"><div data-composer-card><span data-slot="conversation.input.model"><button aria-haspopup="menu" aria-controls="picker">Model</button></span></div></main><div id="picker" role="group" data-menu-material="translucent"><div id="models" role="menu"></div></div></body>', { pretendToBeVisual: true })
  const { document } = dom.window
  const adapter = createComposerGlassAdapter({ document, window: dom.window })
  t.after(() => { adapter.dispose(); dom.window.close() })
  adapter.start()
  assert.equal(document.getElementById('picker').dataset.prtsGlassMenu, 'model')
  assert.equal(document.getElementById('models').hasAttribute('data-prts-glass-menu'), false)
  const other = document.createElement('div')
  other.setAttribute('role', 'menu')
  document.body.append(other)
  await Promise.resolve()
  assert.equal(document.getElementById('models').hasAttribute('data-prts-glass-menu'), false)
})

test('editing text and unrelated class changes do not rescan composer controls', async testContext => {
  const dom = new JSDOM(`<body><main data-prts-region="operation"><div data-composer-card>
    <div contenteditable="true"><p id="draft">draft</p></div>
    <span data-slot="conversation.input.model"><button aria-haspopup="menu">Model</button></span>
  </div><div id="stream"></div></main></body>`, { pretendToBeVisual: true })
  const { document } = dom.window
  const adapter = createComposerGlassAdapter({ document, window: dom.window })
  testContext.after(() => { adapter.dispose(); dom.window.close() })
  adapter.start()
  const query = document.querySelectorAll.bind(document)
  let scans = 0
  document.querySelectorAll = selector => {
    if (selector === '[data-composer-card]') scans++
    return query(selector)
  }
  for (let iteration = 0; iteration < 8; iteration++) {
    document.querySelector('#draft').textContent = 'draft ' + iteration
    document.querySelector('#stream').textContent = 'response ' + iteration
    document.querySelector('[data-composer-card]').className = 'native_' + iteration
    document.querySelector('[aria-haspopup]').className = 'button_' + iteration
    await new Promise(resolve => dom.window.setTimeout(resolve, 24))
  }
  assert.equal(scans, 0)
  document.querySelector('[aria-haspopup]').setAttribute('aria-expanded', 'true')
  await Promise.resolve()
  assert.equal(scans, 1)
})

test('late permission slots with plain native buttons are classified and released', async testContext => {
  const dom = new JSDOM('<body><main data-prts-region="operation"><div data-composer-card></div></main></body>', { pretendToBeVisual: true })
  const { document } = dom.window
  const adapter = createComposerGlassAdapter({ document, window: dom.window })
  testContext.after(() => { adapter.dispose(); dom.window.close() })
  adapter.start()
  const slot = document.createElement('span')
  slot.dataset.slot = 'conversation.input.permission'
  slot.innerHTML = '<button class="arbitrary_build_hash">Permission</button>'
  document.querySelector('[data-composer-card]').append(slot)
  await new Promise(resolve => dom.window.setTimeout(resolve, 24))
  assert.equal(slot.querySelector('button').dataset.prtsGlassControl, 'permission')
  slot.remove()
  await new Promise(resolve => dom.window.setTimeout(resolve, 24))
  assert.equal(slot.querySelector('button').hasAttribute('data-prts-glass-control'), false)
})

test('model and action classification does not read layout text or use visible labels', testContext => {
  const dom = new JSDOM(`<body><div data-composer-card>
    <span data-slot="conversation.input.model"><button id="model" aria-haspopup="menu"></button></span>
    <button id="action" aria-haspopup="menu">Translated action</button>
  </div></body>`, { pretendToBeVisual: true })
  const { document } = dom.window
  for (const button of document.querySelectorAll('button')) {
    Object.defineProperty(button, 'innerText', { get() { throw new Error('layout text must not be read') } })
  }
  const adapter = createComposerGlassAdapter({ document, window: dom.window })
  testContext.after(() => { adapter.dispose(); dom.window.close() })
  adapter.start()
  assert.equal(document.querySelector('#model').dataset.prtsGlassControl, 'model')
  assert.equal(document.querySelector('#action').dataset.prtsGlassControl, 'action')
})

test('each composer keeps its own controlled popup instead of borrowing a global overlay', testContext => {
  const dom = new JSDOM(`<body>
    <div data-composer-card><span data-slot="conversation.input.model"><button id="first" aria-haspopup="menu" aria-controls="hint picker"></button></span></div>
    <div data-composer-card><span data-slot="conversation.input.permission"><button id="second">Permission</button></span></div>
    <div id="hint">Description</div><div id="picker" data-menu-material="translucent" role="group"><div id="models" role="menu"></div></div>
    <div data-slot="conversation.input.overlay"><div id="commands" data-trigger-menu><div role="listbox"></div></div></div>
  </body>`, { pretendToBeVisual: true })
  const { document } = dom.window
  const adapter = createComposerGlassAdapter({ document, window: dom.window })
  testContext.after(() => { adapter.dispose(); dom.window.close() })
  adapter.start()
  assert.equal(document.querySelector('#picker').dataset.prtsGlassMenu, 'model')
  assert.equal(document.querySelector('#models').hasAttribute('data-prts-glass-menu'), false)
  assert.equal(document.querySelector('#commands').dataset.prtsGlassMenu, 'action')
  assert.equal(document.querySelector('#hint').hasAttribute('data-prts-glass-menu'), false)
  assert.equal(document.querySelector('#second').dataset.prtsGlassControl, 'permission')
})

test('removing the native composer marker releases signals and control ownership', async testContext => {
  const dom = new JSDOM('<body><main data-prts-region="operation"><div data-composer-card><button aria-haspopup="listbox">+</button></div></main></body>', { pretendToBeVisual: true })
  const { document } = dom.window
  const adapter = createComposerGlassAdapter({ document, window: dom.window })
  testContext.after(() => { adapter.dispose(); dom.window.close() })
  adapter.start()
  document.querySelector('[data-composer-card]').removeAttribute('data-composer-card')
  await new Promise(resolve => dom.window.setTimeout(resolve, 24))
  assert.equal(document.querySelector('[data-prts-composer-signal]'), null)
  assert.equal(document.querySelector('[data-prts-glass-control]'), null)
})
