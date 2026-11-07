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

test('restarts classification of surviving portals and releases preserved classifications', () => {
  const dom = new JSDOM('<body><div role="menu"><button role="menuitem">操作</button></div><div role="dialog" aria-modal="true" data-prts-preserve-popup-style>自定义</div></body>')
  const { document } = dom.window
  const adapter = createFloatingGlassAdapter({ document, window: dom.window })
  const menu = document.querySelector('[role="menu"]')
  const dialog = document.querySelector('[role="dialog"]')
  for (let cycle = 0; cycle < 3; cycle++) {
    adapter.start()
    adapter.start()
    assert.equal(menu.dataset.prtsFloatingGlass, 'menu')
    assert.ok(menu.firstElementChild.hasAttribute('data-prts-floating-item'))
    if (cycle > 0) assert.equal(dialog.dataset.prtsFloatingGlass, 'dialog')
    adapter.dispose()
    adapter.dispose()
    assert.equal(document.querySelector('[data-prts-floating-glass], [data-prts-floating-item]'), null)
    dialog.removeAttribute('data-prts-preserve-popup-style')
  }
  dom.window.close()
})

test('classifies dynamic menu contents, submenus and changing danger states', async () => {
  const dom = new JSDOM('<body><div role="menu" data-menu-material="translucent"><button role="menuitem">操作</button></div></body>')
  const { document } = dom.window
  const adapter = createFloatingGlassAdapter({ document, window: dom.window })
  const menu = document.querySelector('[role="menu"]')
  adapter.start()
  const group = document.createElement('div')
  group.innerHTML = '<button role="menuitem" data-danger="true">删除</button><div role="menu" data-menu-material="translucent"><button role="menuitem">子菜单</button><input></div>'
  menu.append(group)
  await flush(dom.window)
  const item = group.firstElementChild
  const submenu = group.querySelector('[role="menu"]')
  assert.ok(item.hasAttribute('data-prts-floating-item'))
  assert.ok(item.hasAttribute('data-prts-floating-danger'))
  assert.equal(submenu.dataset.prtsFloatingGlass, 'menu')
  assert.ok(submenu.hasAttribute('data-prts-floating-nested'))
  assert.ok(submenu.querySelector('button').hasAttribute('data-prts-floating-item'))
  assert.ok(submenu.querySelector('input').hasAttribute('data-prts-floating-input'))
  item.removeAttribute('data-danger')
  await flush(dom.window)
  assert.equal(item.hasAttribute('data-prts-floating-danger'), false)
  item.className = 'host_danger_runtime'
  await flush(dom.window)
  assert.ok(item.hasAttribute('data-prts-floating-danger'))
  item.setAttribute('role', 'presentation')
  item.className = ''
  await flush(dom.window)
  assert.equal(item.hasAttribute('data-prts-floating-item'), false)
  assert.equal(item.hasAttribute('data-prts-floating-danger'), false)
  group.remove()
  await flush(dom.window)
  assert.equal(group.querySelector('[data-prts-floating-glass], [data-prts-floating-item], [data-prts-floating-input]'), null)
  menu.append(group)
  await flush(dom.window)
  assert.equal(submenu.dataset.prtsFloatingGlass, 'menu')
  adapter.dispose()
  dom.window.close()
})

test('observes initially empty portal containers but not embedded application subtrees', async () => {
  const dom = new JSDOM('<body><main><div role="dialog" aria-modal="true"></div></main><div data-floating-ui-portal></div></body>')
  const { document } = dom.window
  const adapter = createFloatingGlassAdapter({ document, window: dom.window })
  adapter.start()
  document.querySelector('[data-floating-ui-portal]').innerHTML = '<section role="menu"><button role="menuitem">操作</button></section>'
  document.querySelector('main').insertAdjacentHTML('beforeend', '<div role="menu"><button role="menuitem">内嵌</button></div>')
  await flush(dom.window)
  assert.equal(document.querySelector('[data-floating-ui-portal] [role="menu"]').dataset.prtsFloatingGlass, 'menu')
  assert.equal(document.querySelector('main [data-prts-floating-glass], main [data-prts-floating-item]'), null)
  adapter.dispose()
  dom.window.close()
})

test('does not add a second popup surface to content lists inside native material shells', async () => {
  const dom = new JSDOM('<body><div role="menu" data-menu-material="translucent"></div></body>')
  const { document } = dom.window
  const adapter = createFloatingGlassAdapter({ document, window: dom.window })
  adapter.start()
  const list = document.createElement('div')
  list.setAttribute('role', 'menu')
  list.innerHTML = '<button role="menuitem">模型</button>'
  document.body.firstElementChild.append(list)
  await flush(dom.window)
  assert.equal(list.hasAttribute('data-prts-floating-glass'), false)
  assert.ok(list.firstElementChild.hasAttribute('data-prts-floating-item'))
  adapter.dispose()
  dom.window.close()
})

test('leaves dynamically added third-party custom submenus and opt-out subtrees untouched', async () => {
  const dom = new JSDOM('<body><div role="menu" data-menu-material="translucent"></div></body>')
  const { document } = dom.window
  const adapter = createFloatingGlassAdapter({ document, window: dom.window })
  adapter.start()
  const menu = document.body.firstElementChild
  menu.innerHTML = '<div role="menu" data-plugin="third-party" style="border-radius:18px;box-shadow:0 4px 8px #000"><button role="menuitem">自定义</button></div><div data-prts-preserve-popup-style><div role="menu"><button role="menuitem">保留</button></div></div>'
  await flush(dom.window)
  const custom = menu.querySelector('[data-plugin]')
  assert.equal(custom.dataset.prtsFloatingPreserved, 'custom')
  custom.insertAdjacentHTML('beforeend', '<button role="menuitem">稍后新增</button>')
  await flush(dom.window)
  assert.equal(custom.querySelector('[data-prts-floating-item]'), null)
  assert.equal(menu.querySelector('[data-prts-preserve-popup-style] [data-prts-floating-glass], [data-prts-preserve-popup-style] [data-prts-floating-item]'), null)
  adapter.dispose()
  assert.equal(custom.hasAttribute('data-prts-floating-preserved'), false)
  dom.window.close()
})

test('classifies initially hidden popups when shown and dynamic dialog inputs', async () => {
  const dom = new JSDOM('<body><div role="menu" hidden><button role="menuitem">操作</button></div><div role="dialog" aria-modal="true" style="display:none"></div></body>')
  const { document } = dom.window
  const adapter = createFloatingGlassAdapter({ document, window: dom.window })
  adapter.start()
  const menu = document.querySelector('[role="menu"]')
  const dialog = document.querySelector('[role="dialog"]')
  assert.equal(document.querySelector('[data-prts-floating-glass]'), null)
  menu.hidden = false
  dialog.style.display = ''
  dialog.innerHTML = '<input><button class="host_deleteAction">删除</button>'
  await flush(dom.window)
  assert.equal(menu.dataset.prtsFloatingGlass, 'menu')
  assert.equal(dialog.dataset.prtsFloatingGlass, 'dialog')
  assert.ok(dialog.querySelector('input').hasAttribute('data-prts-floating-input'))
  assert.ok(dialog.querySelector('button').hasAttribute('data-prts-floating-danger'))
  adapter.dispose()
  dom.window.close()
})

test('disconnects content observers on dispose and can start again after later DOM changes', async () => {
  const dom = new JSDOM('<body><div role="menu"></div></body>')
  const { document } = dom.window
  const adapter = createFloatingGlassAdapter({ document, window: dom.window })
  const menu = document.querySelector('[role="menu"]')
  adapter.start()
  adapter.dispose()
  menu.innerHTML = '<button role="menuitem">稍后新增</button>'
  await flush(dom.window)
  assert.equal(menu.querySelector('[data-prts-floating-item]'), null)
  adapter.start()
  assert.ok(menu.firstElementChild.hasAttribute('data-prts-floating-item'))
  adapter.dispose()
  dom.window.close()
})

test('does not rescan popup ancestors for positioning changes or unrelated application mutations', async () => {
  const dom = new JSDOM('<body><main></main><div role="menu"><button role="menuitem">操作</button></div></body>')
  const { document } = dom.window
  const adapter = createFloatingGlassAdapter({ document, window: dom.window })
  const menu = document.querySelector('[role="menu"]')
  adapter.start()
  let scans = 0
  const querySelectorAll = menu.querySelectorAll.bind(menu)
  menu.querySelectorAll = selector => { scans++; return querySelectorAll(selector) }
  menu.style.transform = 'translateX(10px)'
  menu.firstElementChild.style.color = 'red'
  document.querySelector('main').innerHTML = '<div role="menu"><button role="menuitem">内嵌</button></div>'
  const item = document.createElement('button')
  item.setAttribute('role', 'menuitem')
  menu.append(item)
  await flush(dom.window)
  assert.ok(item.hasAttribute('data-prts-floating-item'))
  assert.equal(scans, 0)
  assert.equal(document.querySelector('main [data-prts-floating-glass]'), null)
  adapter.dispose()
  dom.window.close()
})

test('does not observe animated theme corner or click ripple popovers', async () => {
  const dom = new JSDOM('<body><div data-prts-body-target-frame popover="manual" aria-hidden="true"></div><div data-prts-body-target-ghost popover="manual" aria-hidden="true"></div><span data-prts-click-ripple popover="manual" aria-hidden="true"><span></span></span><canvas data-prts-ripple-interference popover="manual" aria-hidden="true"></canvas></body>')
  const observed = []
  const Observer = dom.window.MutationObserver
  dom.window.MutationObserver = class extends Observer {
    observe(target, options) {
      observed.push(target)
      super.observe(target, options)
    }
  }
  const adapter = createFloatingGlassAdapter({ document: dom.window.document, window: dom.window })
  adapter.start()
  const ripple = dom.window.document.createElement('span')
  ripple.setAttribute('data-prts-click-ripple', '')
  ripple.setAttribute('popover', 'manual')
  dom.window.document.body.append(ripple)
  await flush(dom.window)
  assert.deepEqual(observed, [dom.window.document.body])
  adapter.dispose()
  dom.window.close()
})
