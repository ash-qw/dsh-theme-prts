import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import test from 'node:test'
import { createNativeSettingsShellAdapter } from '../src/client/native-settings-shell.js'
import { createFloatingGlassAdapter } from '../src/client/floating-glass-adapter.js'

function fixture() {
  const dom = new JSDOM(`<body><button data-prts-rail-brand><svg id="brand"><title>Rhodes Island</title><path id="ink" d="M0 0h1v1z"/></svg></button><div role="presentation"><div data-shortcut-modal="settings" role="dialog" aria-modal="true">
    <div><div data-slot="settings.header">设置</div></div>
    <nav><div><button aria-current="true">通用设置</button><button>模型</button></div></nav>
    <div data-toolbar><div data-slot="settings.action"><button>原生操作</button></div><button><span data-slot="settings.close">关闭</span></button></div>
    <div><div data-slot="settings.section"><input value="unchanged"></div></div>
  </div></div></body>`, { pretendToBeVisual: true })
  return { dom, document: dom.window.document, shell: dom.window.document.querySelector('[data-shortcut-modal]') }
}

function flush(window) { return new Promise(resolve => window.setTimeout(resolve, 0)) }

test('dossier owns only paper sheets and leaves native headings and controls intact', () => {
  const { dom, document, shell } = fixture()
  const original = shell.innerHTML
  const input = shell.querySelector('input')
  const adapter = createNativeSettingsShellAdapter({ document })
  adapter.update(shell)
  adapter.update(shell)
  assert.equal(shell.querySelectorAll('[data-prts-settings-page]').length, 2)
  assert.equal(shell.querySelector('[data-prts-settings-page]').getAttribute('aria-hidden'), 'true')
  assert.equal(shell.querySelector('[data-prts-settings-caption], [data-prts-settings-filetab], h2'), null)
  assert.equal(shell.querySelector('[data-prts-settings-watermark]'), null)
  assert.equal(document.querySelector('[data-prts-rail-brand] svg').id, 'brand')
  assert.equal(shell.querySelector('input'), input)
  assert.equal(input.value, 'unchanged')
  assert.equal(shell.querySelector('[data-slot="settings.header"]').textContent, '设置')
  adapter.dispose()
  assert.equal(shell.innerHTML, original)
  assert.equal(shell.hasAttribute('data-prts-settings-shell'), false)
  dom.window.close()
})

test('native category order and labels change without creating a duplicate heading', () => {
  const { dom, document, shell } = fixture()
  const adapter = createNativeSettingsShellAdapter({ document })
  adapter.update(shell)
  const buttons = shell.querySelectorAll('nav button')
  buttons[0].removeAttribute('aria-current')
  buttons[1].setAttribute('aria-current', 'page')
  buttons[1].textContent = 'A newly installed plugin'
  adapter.update(shell)
  assert.equal(shell.querySelector('[data-prts-settings-depth="0"]').getAttribute('data-prts-settings-page'), '2')
  assert.equal(buttons[1].textContent, 'A newly installed plugin')
  assert.equal(shell.querySelector('[data-prts-settings-caption], h2'), null)
  shell.querySelector('nav > div').prepend(document.createElement('button'))
  adapter.update(shell)
  assert.equal(shell.querySelector('[data-prts-settings-depth="0"]').getAttribute('data-prts-settings-page'), '3')
  assert.equal(shell.querySelectorAll('[data-prts-settings-page]').length, 3)
  buttons[1].removeAttribute('aria-current')
  adapter.update(shell)
  assert.equal(shell.querySelectorAll('[data-prts-settings-page]').length, 3)
  assert.equal(shell.querySelector('[data-prts-settings-caption], h2'), null)
  adapter.dispose()
  dom.window.close()
})

test('page draws only on category changes and releases its switching state', () => {
  const { dom, document, shell } = fixture()
  const adapter = createNativeSettingsShellAdapter({ document })
  adapter.update(shell)
  assert.equal(shell.hasAttribute('data-prts-settings-turn'), false)
  const buttons = shell.querySelectorAll('nav button')
  buttons[0].removeAttribute('aria-current')
  buttons[1].setAttribute('aria-current', 'true')
  adapter.update(shell)
  assert.equal(shell.getAttribute('data-prts-settings-turn'), 'a')
  buttons[1].textContent = 'Models'
  adapter.update(shell)
  adapter.update(shell)
  assert.equal(shell.getAttribute('data-prts-settings-turn'), 'a')
  buttons[1].removeAttribute('aria-current')
  adapter.update(shell)
  buttons[0].setAttribute('aria-current', 'page')
  adapter.update(shell)
  assert.equal(shell.getAttribute('data-prts-settings-turn'), 'b')
  adapter.dispose()
  assert.equal(shell.hasAttribute('data-prts-settings-turn'), false)
  dom.window.close()
})

test('dossier rebuilds when the host replaces its toolbar and tolerates missing shell parts', () => {
  const { dom, document, shell } = fixture()
  const adapter = createNativeSettingsShellAdapter({ document })
  adapter.update(shell)
  const oldPage = shell.querySelector('[data-prts-settings-page]')
  const replacement = document.createElement('div')
  replacement.innerHTML = '<button><span data-slot="settings.close">Close</span></button>'
  shell.querySelector('[data-toolbar]').replaceWith(replacement)
  adapter.update(shell)
  assert.equal(oldPage.isConnected, false)
  assert.equal(shell.querySelectorAll('[data-prts-settings-page]').length, 2)
  assert.equal(shell.querySelector('[data-prts-settings-caption], h2'), null)
  shell.querySelector('nav').remove()
  adapter.update(shell)
  assert.equal(shell.querySelector('[data-prts-settings-page]'), null)
  assert.equal(shell.hasAttribute('data-prts-settings-shell'), false)
  dom.window.close()
})

test('floating portal lifecycle tracks category changes without injecting titles', async () => {
  const { dom, document, shell } = fixture()
  const adapter = createFloatingGlassAdapter({ document, window: dom.window })
  adapter.start()
  const buttons = shell.querySelectorAll('nav button')
  buttons[0].removeAttribute('aria-current')
  buttons[1].setAttribute('aria-current', 'true')
  await flush(dom.window)
  assert.equal(shell.querySelector('[data-prts-settings-depth="0"]').getAttribute('data-prts-settings-page'), '2')
  buttons[1].firstChild.data = 'Models'
  await flush(dom.window)
  assert.equal(buttons[1].textContent, 'Models')
  assert.equal(shell.querySelector('[data-prts-settings-caption], h2'), null)
  const portal = shell.parentElement
  portal.remove()
  await flush(dom.window)
  assert.equal(shell.querySelector('[data-prts-settings-page]'), null)
  assert.equal(shell.hasAttribute('data-prts-settings-shell'), false)
  document.body.append(portal)
  await flush(dom.window)
  assert.equal(shell.querySelectorAll('[data-prts-settings-page]').length, 2)
  adapter.dispose()
  assert.equal(shell.querySelector('[data-prts-settings-page]'), null)
  adapter.start()
  assert.equal(shell.querySelectorAll('[data-prts-settings-page]').length, 2)
  adapter.dispose()
  assert.equal(shell.querySelector('input').value, 'unchanged')
  dom.window.close()
})

test('repurposing the native dialog removes its dossier shell', async () => {
  const { dom, document, shell } = fixture()
  const adapter = createFloatingGlassAdapter({ document, window: dom.window })
  adapter.start()
  shell.removeAttribute('data-shortcut-modal')
  await flush(dom.window)
  assert.equal(shell.hasAttribute('data-prts-settings-shell'), false)
  assert.equal(shell.querySelector('[data-prts-settings-page], [data-prts-settings-caption]'), null)
  adapter.dispose()
  dom.window.close()
})

test('each native category owns an ordered sheet and removed categories restore their styles', () => {
  const { dom, document, shell } = fixture()
  const navigation = shell.querySelector('nav > div')
  const buttons = [...navigation.children]
  buttons[1].style.setProperty('--prts-settings-page-z', '77', 'important')
  const originalStyle = buttons[1].getAttribute('style')
  const plugin = document.createElement('button')
  plugin.textContent = 'Plugin'
  navigation.append(plugin)
  const adapter = createNativeSettingsShellAdapter({ document })
  adapter.update(shell)
  const pages = () => [...shell.querySelectorAll('[data-prts-settings-page]')]
  const depths = () => Object.fromEntries(pages().map(page => [page.getAttribute('data-prts-settings-page'), page.getAttribute('data-prts-settings-depth')]))
  assert.equal(pages().length, 3)
  assert.deepEqual(depths(), { 1: '0', 2: '1', 3: '2' })
  const pluginPage = pages()[2]
  buttons[0].removeAttribute('aria-current')
  plugin.setAttribute('aria-current', 'true')
  adapter.update(shell)
  assert.deepEqual(depths(), { 1: '1', 2: '2', 3: '0' })
  assert.equal(pages()[2], pluginPage)
  navigation.prepend(plugin)
  adapter.update(shell)
  assert.deepEqual(depths(), { 1: '0', 2: '1', 3: '2' })
  assert.equal(pluginPage.getAttribute('data-prts-settings-page'), '1')
  buttons[1].remove()
  adapter.update(shell)
  assert.equal(pages().length, 2)
  assert.equal(buttons[1].getAttribute('style'), originalStyle)
  assert.equal(pluginPage.isConnected, true)
  adapter.dispose()
  assert.equal(plugin.hasAttribute('style'), false)
  assert.equal(buttons[0].hasAttribute('style'), false)
  assert.equal(shell.hasAttribute('style'), false)
  assert.equal(pages().length, 0)
  dom.window.close()
})

test('sheet spread stays bounded with many plugin categories', () => {
  const { dom, document, shell } = fixture()
  for (let index = 0; index < 40; index++) shell.querySelector('nav > div').append(document.createElement('button'))
  const adapter = createNativeSettingsShellAdapter({ document })
  adapter.update(shell)
  const pages = [...shell.querySelectorAll('[data-prts-settings-page]')]
  assert.equal(pages.length, 42)
  assert.equal(new Set(pages.map(page => page.getAttribute('data-prts-settings-depth'))).size, 42)
  assert.ok(pages.every(page => parseFloat(page.style.getPropertyValue('--prts-settings-page-offset')) <= 24))
  adapter.dispose()
  dom.window.close()
})


test('portal batches native navigation changes and ignores owned paper mutations', async () => {
  const { dom, document, shell } = fixture()
  const navigation = shell.querySelector('nav')
  const originalQuery = navigation.querySelectorAll.bind(navigation)
  let categoryScans = 0
  navigation.querySelectorAll = selector => {
    if (selector === ':scope > div > button') categoryScans++
    return originalQuery(selector)
  }
  const adapter = createFloatingGlassAdapter({ document, window: dom.window })
  adapter.start()
  await flush(dom.window)
  assert.equal(categoryScans, 1)
  categoryScans = 0
  const buttons = navigation.querySelectorAll('button')
  buttons[0].removeAttribute('aria-current')
  buttons[1].setAttribute('aria-current', 'true')
  const plugin = document.createElement('button')
  plugin.textContent = 'Plugin'
  navigation.firstElementChild.append(plugin)
  await flush(dom.window)
  await flush(dom.window)
  assert.equal(categoryScans, 1)
  assert.equal(shell.querySelectorAll('[data-prts-settings-page]').length, 3)
  assert.equal(shell.querySelector('[data-prts-settings-depth="0"]').getAttribute('data-prts-settings-page'), '2')
  categoryScans = 0
  buttons[0].firstChild.data = 'General settings'
  buttons[1].textContent = 'Models'
  shell.querySelector('[data-slot="settings.section"]').append(document.createElement('p'))
  await flush(dom.window)
  assert.equal(categoryScans, 0)
  adapter.dispose()
  dom.window.close()
})

test('replacing the native section container releases and restores its paper shell', async () => {
  const { dom, document, shell } = fixture()
  const adapter = createFloatingGlassAdapter({ document, window: dom.window })
  adapter.start()
  const section = shell.querySelector('[data-slot="settings.section"]')
  const replacement = document.createElement('div')
  section.replaceWith(replacement)
  await flush(dom.window)
  assert.equal(shell.hasAttribute('data-prts-settings-shell'), false)
  replacement.replaceWith(section)
  await flush(dom.window)
  assert.equal(shell.hasAttribute('data-prts-settings-shell'), true)
  assert.equal(shell.querySelectorAll('[data-prts-settings-page]').length, 2)
  adapter.dispose()
  dom.window.close()
})
