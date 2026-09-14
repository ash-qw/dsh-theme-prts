import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import test from 'node:test'

import { createComposerGlassAdapter } from '../src/client/composer-glass-adapter.js'

test('marks only composer model permission and inline menu surfaces', async t => {
  const dom = new JSDOM(`<!doctype html><body>
    <div data-composer-card>
      <button class="Sh0Q9G_trigger">权限</button><div role="menu"><button role="menuitem">允许</button></div>
      <div><button aria-haspopup="menu" aria-expanded="true" aria-controls="model-menu">模型</button><div id="model-menu" role="menu" aria-busy="false"></div></div>
      <span><button type="button" aria-haspopup="menu" aria-expanded="true">命令</button><div role="menu"><button role="menuitem">命令</button></div></span>
      <button type="submit">发送</button>
    </div>
    <div role="menu" id="outside"></div>
  </body>`, { pretendToBeVisual: true })
  const adapter = createComposerGlassAdapter({ document: dom.window.document, window: dom.window })
  t.after(() => adapter.dispose())
  adapter.start()

  assert.equal(dom.window.document.querySelector('.Sh0Q9G_trigger').dataset.prtsGlassControl, 'permission')
  assert.equal(dom.window.document.querySelector('[aria-controls="model-menu"]').dataset.prtsGlassControl, 'model')
  assert.equal(dom.window.document.querySelector('#model-menu').dataset.prtsGlassMenu, 'model')
  assert.equal(dom.window.document.querySelector('.Sh0Q9G_trigger + [role="menu"]').dataset.prtsGlassMenu, 'permission')
  const action = dom.window.document.querySelector('button[aria-haspopup="menu"]:not([aria-controls])')
  assert.equal(action.dataset.prtsGlassControl, 'action')
  assert.equal(action.nextElementSibling.dataset.prtsGlassMenu, 'action')
  assert.equal(dom.window.document.querySelector('[type="submit"]').hasAttribute('data-prts-glass-control'), false)
  assert.equal(dom.window.document.querySelector('#outside').hasAttribute('data-prts-glass-menu'), false)
  assert.equal(dom.window.document.querySelectorAll('[data-prts-composer-signal]').length, 1)
  assert.equal(dom.window.document.querySelector('[data-prts-composer-signal]').getAttribute('aria-hidden'), 'true')
})

test('tracks menus added after startup and removes every owned marker', async () => {
  const dom = new JSDOM('<!doctype html><body><main data-prts-region="operation"><div data-composer-card><button class="Sh0Q9G_trigger">权限</button></div></main></body>', { pretendToBeVisual: true })
  const adapter = createComposerGlassAdapter({ document: dom.window.document, window: dom.window })
  adapter.start()
  const menu = dom.window.document.createElement('div')
  menu.setAttribute('role', 'menu')
  dom.window.document.querySelector('[data-composer-card]').appendChild(menu)
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

test('limits the legacy textarea fallback to a composer root and releases it when moved out', async t => {
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
  assert.equal(form.hasAttribute('data-prts-composer-fallback'), true)
  assert.ok(form.querySelector('[data-prts-composer-signal]'))

  document.querySelector('#foreign-panel').append(form)
  await new Promise(resolve => dom.window.setTimeout(resolve, 24))

  assert.equal(form.hasAttribute('data-prts-composer-fallback'), false)
  assert.equal(form.querySelector('[data-prts-composer-signal]'), null)
})

test('marks the 0.1.2-rc.1 trigger menu and nested parameter card as one glass stack', async t => {
  const dom = new JSDOM(`<!doctype html><body>
    <div data-composer-card>
      <button class="uV2eYG_add" aria-label="Commands" aria-haspopup="listbox" aria-expanded="true">+</button>
    </div>
    <div data-slot="conversation.input.overlay">
      <div data-trigger-menu><div role="listbox"><button role="option" aria-selected="true">命令</button></div></div>
      <div class="mufS8W_card"><div role="listbox"><button role="option">参数</button></div></div>
    </div>
  </body>`, { pretendToBeVisual: true })
  const adapter = createComposerGlassAdapter({ document: dom.window.document, window: dom.window })
  t.after(() => adapter.dispose())
  adapter.start()

  assert.equal(dom.window.document.querySelector('.uV2eYG_add').dataset.prtsGlassControl, 'action')
  assert.equal(dom.window.document.querySelector('[data-trigger-menu]').dataset.prtsGlassMenu, 'action')
  assert.equal(dom.window.document.querySelector('.mufS8W_card').dataset.prtsGlassMenu, 'action')
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
