import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import test from 'node:test'

import { createFloatingGlassAdapter } from '../src/client/floating-glass-adapter.js'

function flush(window) {
  return new Promise(resolve => window.setTimeout(resolve, 0))
}

test('classifies body portals while leaving embedded application dialogs alone', async () => {
  const dom = new JSDOM([
    '<!doctype html><html><body>',
    '<main id="app"><div role="dialog" aria-modal="true" data-settings-page>设置</div></main>',
    '<div role="menu" class="_portal_runtime">',
    '<button role="menuitem">重命名</button>',
    '<button role="menuitem" class="_danger_runtime">删除</button>',
    '</div>',
    '<div role="presentation"><section role="dialog" aria-modal="true">',
    '<input class="_renameInput_runtime">',
    '<button class="_deleteAction_runtime">删除</button>',
    '</section></div>',
    '</body></html>',
  ].join(''), { pretendToBeVisual: true })
  const { document } = dom.window
  const adapter = createFloatingGlassAdapter({ document, window: dom.window })
  adapter.start()

  const menu = document.querySelector('body > [role="menu"]')
  const dialog = document.querySelector('body > [role="presentation"] [role="dialog"]')
  assert.equal(menu.dataset.prtsFloatingGlass, 'menu')
  assert.equal(menu.querySelectorAll('[data-prts-floating-item]').length, 2)
  assert.ok(menu.querySelector('._danger_runtime').hasAttribute('data-prts-floating-danger'))
  assert.equal(dialog.dataset.prtsFloatingGlass, 'dialog')
  assert.ok(dialog.querySelector('input').hasAttribute('data-prts-floating-input'))
  assert.ok(dialog.querySelector('._deleteAction_runtime').hasAttribute('data-prts-floating-danger'))
  assert.ok(dialog.parentElement.hasAttribute('data-prts-floating-scrim'))
  assert.equal(document.querySelector('[data-settings-page]').hasAttribute('data-prts-floating-glass'), false)

  const listbox = document.createElement('div')
  listbox.setAttribute('role', 'listbox')
  listbox.innerHTML = '<button role="option">模型</button>'
  document.body.appendChild(listbox)
  await flush(dom.window)
  assert.equal(listbox.dataset.prtsFloatingGlass, 'listbox')

  adapter.dispose()
  assert.equal(document.querySelector('[data-prts-floating-glass]'), null)
  assert.equal(document.querySelector('[data-prts-floating-item]'), null)
  assert.equal(document.querySelector('[data-prts-floating-scrim]'), null)
})

test('preserves explicit opt-outs and complete third-party materials', () => {
  const dom = new JSDOM([
    '<!doctype html><html><body>',
    '<div data-plugin="third-party" role="menu" ',
    'style="border-radius:18px;box-shadow:0 12px 30px #000;background-image:linear-gradient(#222,#111)">',
    '<button role="menuitem">自定义菜单</button></div>',
    '<div class="_portal_plain" data-plugin="plain-third-party" role="menu">',
    '<button role="menuitem">普通方框菜单</button></div>',
    '<div data-prts-preserve-popup-style role="dialog" aria-modal="true">明确保留</div>',
    '</body></html>',
  ].join(''), { pretendToBeVisual: true })
  const { document } = dom.window
  const adapter = createFloatingGlassAdapter({ document, window: dom.window })
  adapter.start()

  const custom = document.querySelector('[data-plugin="third-party"]')
  assert.equal(custom.hasAttribute('data-prts-floating-glass'), false)
  assert.equal(custom.dataset.prtsFloatingPreserved, 'custom')
  const plain = document.querySelector('[data-plugin="plain-third-party"]')
  assert.equal(plain.dataset.prtsFloatingGlass, 'menu')
  const optedOut = document.querySelector('[data-prts-preserve-popup-style]')
  assert.equal(optedOut.hasAttribute('data-prts-floating-glass'), false)

  adapter.dispose()
  assert.equal(custom.hasAttribute('data-prts-floating-preserved'), false)
})

test('releases removed portals and classifies the same portal again when reinserted', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true })
  const { document } = dom.window
  const adapter = createFloatingGlassAdapter({ document, window: dom.window })
  adapter.start()
  const portal = document.createElement('div')
  portal.setAttribute('role', 'menu')
  portal.innerHTML = '<button role="menuitem">操作</button>'
  document.body.append(portal)
  await flush(dom.window)
  assert.equal(portal.dataset.prtsFloatingGlass, 'menu')

  portal.remove()
  await flush(dom.window)
  assert.equal(portal.hasAttribute('data-prts-floating-glass'), false)
  assert.equal(portal.firstElementChild.hasAttribute('data-prts-floating-item'), false)

  document.body.append(portal)
  await flush(dom.window)
  assert.equal(portal.dataset.prtsFloatingGlass, 'menu')
  assert.equal(portal.firstElementChild.hasAttribute('data-prts-floating-item'), true)
  adapter.dispose()
})
