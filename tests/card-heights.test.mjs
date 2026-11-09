import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'
import { CARD_HEIGHT_DEFAULTS, CARD_HEIGHT_SETTINGS, applyCardHeights, cardHeightMarkup, mountCardHeights, normalizeCardHeight } from '../src/client/card-heights.js'
import { DEFAULT_PREFERENCES, applyVisualPreset, loadPreferences, normalizePreferences, resetPreferenceGroup, updatePreferenceValue } from '../src/client/preferences.js'
import { createThemeController as createController } from '../src/client/theme-controller.js'
import { createThemeController as createControllerV2 } from '../src/client/theme-controller-v2.js'
import { mergeThemePreferences, validateThemePackage } from '../src/client/theme-transfer.js'

const selectHeights = preferences => Object.fromEntries(Object.keys(CARD_HEIGHT_DEFAULTS).map(key => [key, preferences[key]]))

test('missing card heights use equal-height automatic defaults without migrating stored preferences', () => {
  const legacy = { version: 12, enabled: true, workspaceSpineColor: '#123456' }
  assert.deepEqual(selectHeights(normalizePreferences(legacy)), CARD_HEIGHT_DEFAULTS)
  assert.deepEqual(selectHeights(loadPreferences({ getItem: () => JSON.stringify(legacy), setItem() { assert.fail('must not rewrite older settings') } })), CARD_HEIGHT_DEFAULTS)
  assert.equal(normalizePreferences({ cardHeightMode: 'invalid' }).cardHeightMode, 'auto')
})

test('card heights share the compact-to-large range, round each value and reject invalid types', () => {
  assert.deepEqual(CARD_HEIGHT_SETTINGS.map(setting => setting.slice(3)), [[32, 48], [32, 48]])
  for (const [key, , , min, max] of CARD_HEIGHT_SETTINGS) {
    for (const value of [undefined, null, '', '35', true, {}, NaN, Infinity]) assert.equal(normalizeCardHeight(key, value), 36)
    for (const value of [-100, 0, min - 1, max + 1, 100]) assert.equal(normalizePreferences({ [key]: value })[key], Math.min(max, Math.max(min, value)))
    for (let value = min; value <= max; value += 1) {
      assert.equal(normalizeCardHeight(key, value), value)
      assert.equal(updatePreferenceValue(DEFAULT_PREFERENCES, key, value)[key], value)
    }
    assert.equal(normalizeCardHeight(key, min + 0.4), min)
    assert.equal(normalizeCardHeight(key, min + 0.5), min + 1)
    assert.equal(updatePreferenceValue(DEFAULT_PREFERENCES, key, min)[key], min)
  }
  assert.equal(normalizeCardHeight('unknown', 36), undefined)
})

test('height mode retains custom values; navigation reset is scoped and visual presets preserve sizing', () => {
  const preferences = normalizePreferences({ cardHeightMode: 'custom', workspaceCardHeight: 38, sessionCardHeight: 33, cornerColor: '#123456' })
  const automatic = updatePreferenceValue(preferences, 'cardHeightMode', 'auto')
  assert.equal(automatic.workspaceCardHeight, 38)
  assert.equal(automatic.sessionCardHeight, 33)
  assert.deepEqual(selectHeights(applyVisualPreset(preferences, 'quiet-reading')), selectHeights(preferences))
  assert.deepEqual(selectHeights(resetPreferenceGroup(preferences, 'navigation')), CARD_HEIGHT_DEFAULTS)
  assert.equal(resetPreferenceGroup(preferences, 'navigation').cornerColor, '#123456')
  assert.deepEqual(selectHeights(resetPreferenceGroup(preferences, 'conversation')), selectHeights(preferences))
})

test('theme transfers round-trip custom sizing, preserve old imports and reject malformed heights', () => {
  const preferences = normalizePreferences({ cardHeightMode: 'custom', workspaceCardHeight: 37, sessionCardHeight: 33 })
  const packaged = { format: 'prts-theme', version: 1, preferences }
  assert.equal(validateThemePackage(packaged), packaged)
  assert.deepEqual(mergeThemePreferences(DEFAULT_PREFERENCES, preferences), preferences)
  assert.deepEqual(selectHeights(mergeThemePreferences(preferences, { version: 12, glass: 'soft' })), selectHeights(preferences))
  for (const patch of [{ cardHeightMode: 'invalid' }, { workspaceCardHeight: 31 }, { sessionCardHeight: 49 }, { sessionCardHeight: 32.5 }, { workspaceCardHeight: '36' }]) {
    assert.throws(() => validateThemePackage({ ...packaged, preferences: { ...preferences, ...patch } }))
  }
})

test('identical previews do not invalidate the root and one changed height writes one style update', () => {
  const dom = new JSDOM('<html><body></body></html>')
  const root = dom.window.document.documentElement
  const preferences = { cardHeightMode: 'custom', workspaceCardHeight: 36, sessionCardHeight: 36 }
  applyCardHeights(root, preferences)
  const observer = new dom.window.MutationObserver(() => {})
  observer.observe(root, { attributes: true })
  applyCardHeights(root, preferences)
  assert.equal(observer.takeRecords().length, 0)
  applyCardHeights(root, { ...preferences, workspaceCardHeight: 37 })
  const records = observer.takeRecords()
  assert.equal(records.length, 1)
  assert.equal(records[0].attributeName, 'style')
  observer.disconnect()
  dom.window.close()
})

for (const [name, factory] of [['controller', createController], ['controller-v2', createControllerV2]]) {
  test(`${name} applies bounded custom sizing and clears overrides on automatic mode, disable and disposal`, () => {
    const dom = new JSDOM('<html><head></head><body></body></html>', { pretendToBeVisual: true })
    dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
    const controller = factory({ document: dom.window.document, window: dom.window, cssText: '', service: { getTheme: () => 'dark', setTheme() {} } })
    const root = dom.window.document.documentElement
    const preferences = normalizePreferences({ enabled: true, cardHeightMode: 'custom', workspaceCardHeight: 38, sessionCardHeight: 32 })
    controller.apply(preferences)
    assert.equal(root.dataset.prtsCardHeight, 'custom')
    assert.equal(root.style.getPropertyValue('--prts-workspace-custom-height'), '38px')
    assert.equal(root.style.getPropertyValue('--prts-session-custom-height'), '32px')
    controller.apply({ ...preferences, cardHeightMode: 'auto' })
    assert.equal(root.dataset.prtsCardHeight, 'auto')
    for (const [, , property] of CARD_HEIGHT_SETTINGS) assert.equal(root.style.getPropertyValue(property), '')
    controller.apply(preferences)
    controller.apply({ ...preferences, enabled: false })
    assert.equal(root.hasAttribute('data-prts-card-height'), false)
    for (const [, , property] of CARD_HEIGHT_SETTINGS) assert.equal(root.style.getPropertyValue(property), '')
    controller.apply(preferences)
    controller.dispose()
    assert.equal(root.hasAttribute('data-prts-card-height'), false)
    for (const [, , property] of CARD_HEIGHT_SETTINGS) assert.equal(root.style.getPropertyValue(property), '')
    dom.window.close()
  })
}

test('range drags preview only sizing, persist once on completion and clean up listeners', () => {
  const dom = new JSDOM(`<html><body><div id="panel">${cardHeightMarkup()}</div></body></html>`)
  const { document, Event } = dom.window
  const panel = document.querySelector('#panel')
  let preferences = normalizePreferences({ cardHeightMode: 'custom', enabled: true })
  const changes = [], previews = []
  const editor = mountCardHeights({ panel, onPreferenceChange(key, value) {
    changes.push([key, value])
    preferences = updatePreferenceValue(preferences, key, value)
    editor.update(preferences)
  }, onPreferencePreview(key, value) {
    previews.push([key, value])
    applyCardHeights(document.documentElement, { ...preferences, [key]: value })
  } })
  editor.update(preferences)
  assert.equal(panel.querySelector('[data-prts-card-height-auto]').hidden, true)
  const modes = panel.querySelector('[data-prts-card-height-modes]')
  assert.equal(modes.getAttribute('role'), 'group')
  assert.deepEqual([...modes.querySelectorAll('button')].map(button => button.getAttribute('aria-label')), ['自动适应', '手动调节'])
  for (const button of modes.querySelectorAll('button')) assert.ok(document.getElementById(button.getAttribute('aria-describedby')))
  assert.equal(panel.querySelectorAll('[data-prts-card-height-bounds]').length, 2)
  const input = panel.querySelector('[data-prts-card-height-key="workspaceCardHeight"]')
  const emit = type => input.dispatchEvent(new Event(type, { bubbles: true }))
  input.value = '37'; emit('input')
  input.value = '38'; emit('input')
  assert.equal(panel.querySelector('[data-prts-card-height-output="workspaceCardHeight"]').textContent, '38px')
  assert.equal(preferences.workspaceCardHeight, 36)
  assert.equal(changes.length, 0)
  assert.equal(previews.length, 2)
  assert.equal(document.documentElement.style.getPropertyValue('--prts-workspace-custom-height'), '38px')
  editor.update({ ...preferences, cornerColor: '#123456' })
  assert.equal(input.value, '38')
  emit('pointerup'); emit('change'); emit('focusout')
  assert.deepEqual(changes, [['workspaceCardHeight', 38]])
  input.value = '35'; emit('input')
  editor.commit()
  assert.deepEqual(changes.at(-1), ['workspaceCardHeight', 35])
  input.value = '34'; emit('input')
  editor.update({ ...preferences, cardHeightMode: 'auto' })
  editor.commit()
  assert.equal(changes.length, 2)
  assert.equal(panel.querySelector('[data-prts-card-height-controls]').hidden, true)
  assert.equal(panel.querySelector('[data-prts-card-height-auto]').hidden, false)
  editor.dispose()
  emit('input'); emit('change')
  assert.equal(changes.length, 2)
  dom.window.close()
})


test('expanded height limits retain existing sizes and round-trip the new compact and large endpoints', () => {
  for (const [workspaceCardHeight, sessionCardHeight] of [[34, 32], [38, 36], [32, 48], [48, 32]]) {
    const stored = { cardHeightMode: 'custom', workspaceCardHeight, sessionCardHeight }
    const loaded = loadPreferences({ getItem: () => JSON.stringify({ ...DEFAULT_PREFERENCES, ...stored }), setItem() { assert.fail('valid stored heights must not be rewritten') } })
    assert.deepEqual(selectHeights(loaded), stored)
    const packaged = { format: 'prts-theme', version: 1, preferences: loaded }
    assert.equal(validateThemePackage(packaged), packaged)
    assert.deepEqual(selectHeights(mergeThemePreferences(DEFAULT_PREFERENCES, packaged.preferences)), stored)
  }
})
