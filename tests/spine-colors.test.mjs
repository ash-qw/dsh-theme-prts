import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'
import { DEFAULT_PREFERENCES, applyVisualPreset, loadPreferences, normalizePreferences, resetPreferenceGroup, updatePreferenceValue } from '../src/client/preferences.js'
import { applySpineColors, SPINE_COLOR_DEFAULTS, SPINE_COLOR_KEYS, SPINE_COLOR_PRESETS, SPINE_COLOR_SETTINGS, spineColorMarkup, renderSpineColors, spineColorValue } from '../src/client/spine-colors.js'
import { createThemeController as createController } from '../src/client/theme-controller.js'
import { createThemeController as createControllerV2 } from '../src/client/theme-controller-v2.js'
import { mergeThemePreferences, validateThemePackage } from '../src/client/theme-transfer.js'

test('spine colors normalize six-digit hex overrides for both independent palettes', () => {
  for (const key of SPINE_COLOR_KEYS) {
    assert.equal(normalizePreferences({})[key], 'auto')
    assert.equal(normalizePreferences({ [key]: '#ABC123' })[key], '#abc123')
    for (const invalid of [null, 0, '#fff', 'red', 'var(--prts-red)', '#123456; color: red']) {
      assert.equal(normalizePreferences({ [key]: invalid })[key], 'auto')
    }
    const changed = updatePreferenceValue(DEFAULT_PREFERENCES, key, '#ABC123')
    assert.equal(changed[key], '#abc123')
    assert.equal(updatePreferenceValue(changed, key, 'invalid')[key], '#abc123')
    assert.equal(updatePreferenceValue(changed, key, 'auto')[key], 'auto')
    assert.equal(applyVisualPreset(changed, 'quiet-reading')[key], '#abc123')
    assert.equal(resetPreferenceGroup(changed, 'navigation')[key], 'auto')
    assert.equal(resetPreferenceGroup(changed, 'conversation')[key], '#abc123')
    assert.deepEqual(loadPreferences({ getItem: () => JSON.stringify(changed) }), changed)
  }
  const legacy = normalizePreferences({ workspaceSpineColor: '#abcdef', sessionSpineColor: '#123456' })
  assert.equal(legacy.workspaceSpineColorLight, '#abcdef')
  assert.equal(legacy.sessionSpineColorLight, '#123456')
  assert.equal(normalizePreferences({ ...legacy, workspaceSpineColorLight: 'auto' }).workspaceSpineColorLight, 'auto')
})

test('sharing uses the selected palette without overwriting the other; one reset restores only spine settings', () => {
  const preferences = normalizePreferences({ enabled: true, glass: 'soft', cornerColor: '#123456', sessionSpineColor: '#123abc', sessionSpineColorLight: '#abc123' })
  const linked = updatePreferenceValue(preferences, 'spineColorLink', 'light')
  assert.equal(linked.spineColorLinked, true)
  assert.equal(linked.spineColorSource, 'light')
  const edited = updatePreferenceValue(linked, 'sessionSpineColorLight', '#ffffff')
  assert.equal(edited.sessionSpineColor, '#123abc')
  const unlinked = updatePreferenceValue(edited, 'spineColorLink', false)
  assert.equal(unlinked.spineColorLinked, false)
  assert.equal(unlinked.sessionSpineColorLight, '#ffffff')
  assert.equal(unlinked.sessionSpineColor, '#123abc')
  assert.deepEqual(updatePreferenceValue(edited, 'spineColorsReset'), { ...preferences, ...SPINE_COLOR_DEFAULTS })
})

test('spine color imports preserve older packages and round-trip palettes and sharing', () => {
  const preferences = normalizePreferences({ workspaceSpineColor: '#33ccff', sessionSpineColor: '#ccff66', currentSessionSpineColorLight: '#ffcc00', spineColorLinked: true, spineColorSource: 'light' })
  const packaged = { format: 'prts-theme', version: 1, preferences }
  assert.equal(validateThemePackage(packaged), packaged)
  assert.deepEqual(mergeThemePreferences(DEFAULT_PREFERENCES, preferences), preferences)
  assert.deepEqual(mergeThemePreferences(preferences, { version: 12, glass: 'soft' }), normalizePreferences({ ...preferences, glass: 'soft' }))
  for (const patch of [{ sessionSpineColor: 'red' }, { workspaceSpineColorLight: '#fff' }, { spineColorSource: 'invalid' }]) {
    assert.throws(() => validateThemePackage({ ...packaged, preferences: { ...preferences, ...patch } }))
  }
})

test('spine settings expose three presets, scheme-aware defaults and one shared reset', () => {
  assert.deepEqual(SPINE_COLOR_PRESETS.map(([, color]) => color), ['#33ccff', '#ccff66', '#ffcc00'])
  const dom = new JSDOM(`<html data-prts-scheme="light"><body><div id="panel">${spineColorMarkup()}</div></body></html>`)
  const panel = dom.window.document.querySelector('#panel')
  renderSpineColors(panel, DEFAULT_PREFERENCES)
  assert.equal(panel.querySelector('[data-prts-setting-key="sessionSpineColorLight"][type="color"]').value, '#65727a')
  assert.equal(panel.querySelectorAll('[data-prts-spine-swatch]').length, 9)
  assert.equal(panel.querySelectorAll('[data-prts-spine-reset]').length, 1)
  assert.equal(panel.textContent.includes('跟随主题'), false)
  for (const [key, , , fallback] of SPINE_COLOR_SETTINGS) assert.equal(spineColorValue(DEFAULT_PREFERENCES, key, 'dark'), fallback)
  renderSpineColors(panel, { ...DEFAULT_PREFERENCES, sessionSpineColor: '#5ccddb' }, 'dark')
  assert.equal(panel.querySelector('[data-prts-spine-custom-active] input').value, '#5ccddb')
  renderSpineColors(panel, { ...DEFAULT_PREFERENCES, spineColorLinked: true, spineColorSource: 'light' }, 'dark')
  assert.equal(panel.querySelector('[data-prts-spine-modes]').hidden, true)
  assert.equal(panel.querySelector('[data-prts-spine-sync]').getAttribute('aria-checked'), 'true')
  assert.equal(panel.querySelector('[data-prts-setting-key="sessionSpineColorLight"][type="color"]').value, '#65727a')
  const root = dom.window.document.documentElement
  applySpineColors(root, { ...DEFAULT_PREFERENCES, spineColorLinked: true, spineColorSource: 'dark' })
  assert.equal(root.style.getPropertyValue('--prts-session-spine-color-light'), '#5e6a70')
  applySpineColors(root, { ...DEFAULT_PREFERENCES, spineColorLinked: true, spineColorSource: 'light' })
  assert.equal(root.style.getPropertyValue('--prts-session-spine-color-dark'), '#65727a')
  applySpineColors(root)
  for (const [, , property] of SPINE_COLOR_SETTINGS) for (const mode of ['dark', 'light']) assert.equal(root.style.getPropertyValue(property + '-' + mode), '')
  dom.window.close()
})

for (const [name, factory] of [['controller', createController], ['controller-v2', createControllerV2]]) {
  test(`${name} applies day/night spine colors and clears them on disable and disposal`, () => {
    const dom = new JSDOM('<html><head></head><body></body></html>', { pretendToBeVisual: true })
    dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
    const controller = factory({ document: dom.window.document, window: dom.window, cssText: '', service: { getTheme: () => 'dark', setTheme() {} } })
    const preferences = normalizePreferences({ enabled: true, workspaceSpineColor: '#123456', sessionSpineColor: '#ccff66', currentSessionSpineColor: '#ffcc00', sessionSpineColorLight: '#abcdef' })
    const root = dom.window.document.documentElement
    controller.apply(preferences)
    for (const [key, , property] of SPINE_COLOR_SETTINGS) for (const mode of ['dark', 'light']) assert.equal(root.style.getPropertyValue(property + '-' + mode), spineColorValue(preferences, key, mode))
    controller.apply(updatePreferenceValue(preferences, 'spineColorsReset'))
    assert.equal(root.style.getPropertyValue('--prts-workspace-spine-color-dark'), '#33ccff')
    assert.equal(root.style.getPropertyValue('--prts-session-spine-color-light'), '#65727a')
    controller.apply({ ...preferences, enabled: false })
    for (const [, , property] of SPINE_COLOR_SETTINGS) for (const mode of ['dark', 'light']) assert.equal(root.style.getPropertyValue(property + '-' + mode), '')
    controller.apply({ ...preferences, spineColorLinked: true, spineColorSource: 'light' })
    assert.equal(root.style.getPropertyValue('--prts-session-spine-color-dark'), '#abcdef')
    controller.dispose()
    for (const [, , property] of SPINE_COLOR_SETTINGS) for (const mode of ['dark', 'light']) assert.equal(root.style.getPropertyValue(property + '-' + mode), '')
    dom.window.close()
  })
}
