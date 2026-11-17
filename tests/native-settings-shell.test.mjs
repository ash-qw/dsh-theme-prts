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

test('dossier decorates its frame and leaves native headings and controls intact', () => {
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

test('dossier keeps its sheets when the host replaces its toolbar and tolerates missing shell parts', () => {
  const { dom, document, shell } = fixture()
  const adapter = createNativeSettingsShellAdapter({ document })
  adapter.update(shell)
  const oldPage = shell.querySelector('[data-prts-settings-page]')
  const replacement = document.createElement('div')
  replacement.innerHTML = '<button><span data-slot="settings.close">Close</span></button>'
  shell.querySelector('[data-toolbar]').replaceWith(replacement)
  adapter.update(shell)
  assert.equal(oldPage.isConnected, true)
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


test('file jacket uses the original emblem image and tracks native page numbering', () => {
  const { dom, document, shell } = fixture()
  const emblemImage = 'data:image/png;base64,b3JpZ2luYWw='
  const adapter = createNativeSettingsShellAdapter({ document, emblemImage })
  const controls = shell.querySelector('[data-slot="settings.section"]').innerHTML
  adapter.update(shell)
  const frame = shell.querySelector('[data-prts-settings-jacket]')
  assert.equal(frame.getAttribute('aria-hidden'), 'true')
  assert.equal(frame.querySelectorAll('[id], title, button, input').length, 0)
  assert.equal(frame.querySelectorAll('svg').length, 0)
  const image = frame.querySelector('[data-prts-settings-emblem] img')
  assert.equal(image.src, emblemImage)
  assert.equal(image.alt, '')
  assert.equal(image.draggable, false)
  assert.equal(image.width, 95)
  assert.equal(image.height, 81)
  assert.equal(document.querySelector('[data-prts-rail-brand] svg').id, 'brand')
  assert.equal(frame.querySelector('[data-prts-settings-pagination]').textContent, '01 / 02')
  assert.equal(frame.querySelectorAll('[data-prts-settings-active]').length, 1)
  const buttons = shell.querySelectorAll('nav button')
  buttons[0].removeAttribute('aria-current')
  buttons[1].setAttribute('aria-current', 'true')
  adapter.update(shell)
  assert.equal(shell.querySelector('[data-prts-settings-jacket]'), frame)
  assert.equal(frame.querySelector('[data-prts-settings-pagination]').textContent, '02 / 02')
  assert.equal(frame.querySelector('[data-prts-settings-markers]').lastElementChild.hasAttribute('data-prts-settings-active'), true)
  const plugin = document.createElement('button')
  plugin.textContent = 'Plugin'
  shell.querySelector('nav > div').prepend(plugin)
  adapter.update(shell)
  assert.equal(frame.querySelector('[data-prts-settings-pagination]').textContent, '03 / 03')
  assert.equal(frame.querySelector('[data-prts-settings-markers]').children.length, 3)
  assert.equal(shell.querySelector('[data-slot="settings.section"]').innerHTML, controls)
  adapter.dispose()
  assert.equal(frame.isConnected, false)
  dom.window.close()
})

test('native navigation refreshes do not turn the same selected category', async () => {
  const { dom, document, shell } = fixture()
  const adapter = createFloatingGlassAdapter({ document, window: dom.window })
  adapter.start()
  const frame = shell.querySelector('[data-prts-settings-jacket]')
  const input = shell.querySelector('input')
  for (let cycle = 0; cycle < 3; cycle++) {
    const navigation = shell.querySelector('nav > div')
    navigation.replaceWith(navigation.cloneNode(true))
    await flush(dom.window)
    assert.equal(shell.hasAttribute('data-prts-settings-turn'), false)
    assert.equal(shell.querySelector('[data-prts-settings-jacket]'), frame)
    assert.equal(shell.querySelector('input'), input)
  }
  const buttons = shell.querySelectorAll('nav button')
  buttons[0].removeAttribute('aria-current')
  buttons[1].setAttribute('aria-current', 'true')
  await flush(dom.window)
  assert.equal(shell.getAttribute('data-prts-settings-turn'), 'a')
  const navigation = shell.querySelector('nav > div')
  navigation.replaceWith(navigation.cloneNode(true))
  await flush(dom.window)
  assert.equal(shell.hasAttribute('data-prts-settings-turn'), false)
  adapter.dispose()
  dom.window.close()
})

test('page drawing clears its trigger before later native content refreshes', async () => {
  const { dom, document, shell } = fixture()
  const adapter = createFloatingGlassAdapter({ document, window: dom.window })
  adapter.start()
  const buttons = shell.querySelectorAll('nav button')
  buttons[0].removeAttribute('aria-current')
  buttons[1].setAttribute('aria-current', 'true')
  await flush(dom.window)
  assert.equal(shell.getAttribute('data-prts-settings-turn'), 'a')
  await new Promise(resolve => dom.window.setTimeout(resolve, 350))
  assert.equal(shell.hasAttribute('data-prts-settings-turn'), false)
  const content = shell.querySelector('[data-slot="settings.section"]').parentElement
  const replacement = content.cloneNode(true)
  content.replaceWith(replacement)
  await flush(dom.window)
  assert.equal(shell.hasAttribute('data-prts-settings-turn'), false)
  assert.equal(shell.querySelectorAll('[data-prts-settings-jacket]').length, 1)
  adapter.dispose()
  dom.window.close()
})


test('completed page animation immediately releases its trigger', () => {
  const { dom, document, shell } = fixture()
  const adapter = createNativeSettingsShellAdapter({ document })
  adapter.update(shell)
  const buttons = shell.querySelectorAll('nav button')
  buttons[0].removeAttribute('aria-current')
  buttons[1].setAttribute('aria-current', 'true')
  adapter.update(shell)
  const event = new dom.window.Event('animationend', { bubbles: true })
  Object.defineProperty(event, 'animationName', { value: 'prts-settings-draw-a' })
  shell.querySelector('[data-prts-settings-depth="0"]').dispatchEvent(event)
  assert.equal(shell.hasAttribute('data-prts-settings-turn'), false)
  adapter.dispose()
  dom.window.close()
})

for (const playState of ['running', 'paused', 'finished', 'idle']) {
  test('page fallback respects the actual animation state: ' + playState, () => {
    const { dom, document, shell } = fixture()
    let fallback
    dom.window.setTimeout = callback => { fallback = callback; return 1 }
    dom.window.clearTimeout = () => {}
    shell.getAnimations = () => [{ animationName: 'prts-settings-draw-a', playState }]
    const adapter = createNativeSettingsShellAdapter({ document })
    adapter.update(shell)
    const buttons = shell.querySelectorAll('nav button')
    buttons[0].removeAttribute('aria-current')
    buttons[1].setAttribute('aria-current', 'true')
    adapter.update(shell)
    fallback()
    assert.equal(shell.hasAttribute('data-prts-settings-turn'), ['running', 'paused'].includes(playState))
    const event = new dom.window.Event('animationend', { bubbles: true })
    Object.defineProperty(event, 'animationName', { value: 'prts-settings-draw-a' })
    shell.querySelector('[data-prts-settings-depth="0"]').dispatchEvent(event)
    assert.equal(shell.hasAttribute('data-prts-settings-turn'), false)
    adapter.dispose()
    dom.window.close()
  })
}
