import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'
import { colorEditorMarkup, renderColorEditor } from '../src/client/color-editor.js'
import { CUSTOM_COLOR_MEMORY_KEYS, DEFAULT_PREFERENCES, loadPreferences, normalizePreferences, resetPreferenceGroup, updatePreferenceValue } from '../src/client/preferences.js'
import { SPINE_COLOR_KEYS, spineCustomColorKey } from '../src/client/spine-colors.js'
import { mergeThemePreferences, validateThemePackage } from '../src/client/theme-transfer.js'

const flowKeys = ['sessionFlowColorBack', 'sessionFlowColorCore', 'sessionFlowColorFront']
const reload = preferences => loadPreferences({ getItem: () => JSON.stringify(preferences) })

test('shared color editor renders the same swatch, HEX, RGB values and channel gradients', () => {
  const dom = new JSDOM('<div id="editor">' + colorEditorMarkup() + '</div>')
  const editor = dom.window.document.querySelector('#editor')
  renderColorEditor(editor, '#123abc')
  assert.equal(editor.querySelector('[data-prts-color-hex]').value, '#123ABC')
  assert.equal(editor.querySelector('[data-prts-color-sample]').style.background, 'rgb(18, 58, 188)')
  assert.deepEqual([...editor.querySelectorAll('[type="range"]')].map(input => input.value), ['18', '58', '188'])
  assert.deepEqual([...editor.querySelectorAll('output')].map(output => output.value), ['18', '58', '188'])
  editor.querySelector('[data-prts-color-hex]').setAttribute('aria-invalid', 'true')
  editor.querySelector('[data-prts-color-apply]').disabled = true
  renderColorEditor(editor, '#abcdef')
  assert.equal(editor.querySelector('[data-prts-color-hex]').hasAttribute('aria-invalid'), false)
  assert.equal(editor.querySelector('[data-prts-color-apply]').disabled, false)
  dom.window.close()
})

test('each spine slot remembers custom colors independently of presets, reloads and linked modes', () => {
  for (const key of SPINE_COLOR_KEYS) {
    const customKey = spineCustomColorKey(key)
    const custom = updatePreferenceValue(DEFAULT_PREFERENCES, customKey, '#123ABC')
    assert.equal(custom[key], '#123abc')
    assert.equal(custom[customKey], '#123abc')
    const preset = reload(updatePreferenceValue(custom, key, '#ccff66'))
    assert.equal(preset[key], '#ccff66')
    assert.equal(preset[customKey], '#123abc')
    const linked = updatePreferenceValue(preset, 'spineColorLink', key.endsWith('Light') ? 'light' : 'dark')
    const restored = updatePreferenceValue(linked, customKey, linked[customKey])
    assert.equal(restored[key], '#123abc')
    for (const other of SPINE_COLOR_KEYS) if (other !== key) assert.equal(restored[spineCustomColorKey(other)], DEFAULT_PREFERENCES[spineCustomColorKey(other)])
  }
})

test('legacy spine custom colors seed their own day and night memories without rewriting storage', () => {
  const stored = { version: 12, workspaceSpineColor: '#123abc', workspaceSpineColorLight: '#abcdef', sessionSpineColor: '#654321' }
  const preferences = loadPreferences({ getItem: () => JSON.stringify(stored), setItem() { assert.fail('loading must not write settings') } })
  assert.equal(preferences.workspaceSpineCustomColor, '#123abc')
  assert.equal(preferences.workspaceSpineCustomColorLight, '#abcdef')
  assert.equal(preferences.sessionSpineCustomColorLight, '#654321')
})

test('all three custom flow layers survive multiple presets, reload and switching back to custom', () => {
  let preferences = DEFAULT_PREFERENCES
  const colors = ['#123abc', '#456def', '#789abc']
  for (const [index, key] of flowKeys.entries()) preferences = updatePreferenceValue(preferences, key, colors[index])
  for (const palette of ['amber', 'rhodes', 'triad']) preferences = updatePreferenceValue(preferences, 'sessionFlowPalette', palette)
  preferences = reload(preferences)
  for (const [index, key] of flowKeys.entries()) assert.equal(preferences[key.replace('sessionFlowColor', 'sessionFlowCustomColor')], colors[index])
  const restored = updatePreferenceValue(preferences, 'sessionFlowPalette', 'custom')
  assert.deepEqual(flowKeys.map(key => restored[key]), colors)
  assert.deepEqual(flowKeys.map(key => updatePreferenceValue(restored, 'sessionFlow', false)[key]), colors)
})

test('custom memories travel with theme files, reject malformed values and migrate older imports', () => {
  let preferences = updatePreferenceValue(DEFAULT_PREFERENCES, 'workspaceSpineCustomColor', '#123abc')
  preferences = updatePreferenceValue(preferences, 'workspaceSpineColor', '#ccff66')
  preferences = updatePreferenceValue(preferences, 'sessionFlowColorFront', '#abcdef')
  preferences = updatePreferenceValue(preferences, 'sessionFlowPalette', 'amber')
  const packaged = { format: 'prts-theme', version: 1, preferences }
  assert.equal(validateThemePackage(packaged), packaged)
  assert.deepEqual(mergeThemePreferences(DEFAULT_PREFERENCES, preferences), preferences)
  for (const key of CUSTOM_COLOR_MEMORY_KEYS) assert.throws(() => validateThemePackage({ ...packaged, preferences: { ...preferences, [key]: 'red' } }))
  const legacy = mergeThemePreferences(preferences, { version: 12, workspaceSpineColor: '#456789' })
  assert.equal(legacy.workspaceSpineCustomColor, '#456789')
  assert.equal(mergeThemePreferences(preferences, { version: 12, glass: 'soft' }).workspaceSpineCustomColor, '#123abc')
})

test('only an explicit scoped reset clears its custom memories', () => {
  let preferences = updatePreferenceValue(DEFAULT_PREFERENCES, 'workspaceSpineCustomColorLight', '#123abc')
  preferences = updatePreferenceValue(preferences, 'sessionFlowColorFront', '#abcdef')
  assert.equal(resetPreferenceGroup(preferences, 'navigation').workspaceSpineCustomColorLight, DEFAULT_PREFERENCES.workspaceSpineCustomColorLight)
  assert.equal(resetPreferenceGroup(preferences, 'navigation').sessionFlowCustomColorFront, '#abcdef')
  assert.equal(resetPreferenceGroup(preferences, 'conversation').workspaceSpineCustomColorLight, '#123abc')
  assert.equal(resetPreferenceGroup(preferences, 'conversation').sessionFlowCustomColorFront, DEFAULT_PREFERENCES.sessionFlowCustomColorFront)
  assert.equal(updatePreferenceValue(preferences, 'spineColorsReset').workspaceSpineCustomColorLight, DEFAULT_PREFERENCES.workspaceSpineCustomColorLight)
  assert.equal(normalizePreferences(preferences).workspaceSpineCustomColorLight, '#123abc')
})
