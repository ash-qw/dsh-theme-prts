import assert from 'node:assert/strict'
import test from 'node:test'

import * as api from '../src/client/preferences.js'

test('normalizes unsupported values into the disabled version-twelve defaults', () => {
  assert.deepEqual(
    api.normalizePreferences({ enabled: 'yes', scheme: 'neon', dossier: 0 }),
    api.DEFAULT_PREFERENCES,
  )
  assert.equal(api.DEFAULT_PREFERENCES.version, 12)
  assert.equal(api.DEFAULT_PREFERENCES.railDefaultHidden, false)
  assert.equal(api.DEFAULT_PREFERENCES.sessionFlow, true)
  assert.equal(api.DEFAULT_PREFERENCES.sessionGlow, true)
  assert.equal(api.DEFAULT_PREFERENCES.sessionFlowPalette, 'triad')
  assert.equal(api.DEFAULT_PREFERENCES.sessionFlowColorBack, '#f7ddeb')
  assert.equal(api.DEFAULT_PREFERENCES.sessionFlowColorCore, '#65ddb0')
  assert.equal(api.DEFAULT_PREFERENCES.sessionFlowColorFront, '#6eb7f3')
  assert.equal(api.DEFAULT_PREFERENCES.sessionFlowSpeed, 1)
  assert.equal(Object.hasOwn(api.DEFAULT_PREFERENCES, 'glassEnabled'), false)
  assert.equal(Object.hasOwn(api.DEFAULT_PREFERENCES, 'glassHighlight'), false)
})

test('uses one four-state glass preference while migrating version-one controls', () => {
  assert.equal(api.DEFAULT_PREFERENCES.glass, 'standard')
  assert.equal(api.normalizePreferences({ version: 2, glass: 'off' }).glass, 'off')
  assert.equal(api.normalizePreferences({ version: 2, glass: 'soft' }).glass, 'soft')
  assert.equal(api.normalizePreferences({ version: 1, glass: 'liquid' }).glass, 'clear')
  assert.equal(api.normalizePreferences({ version: 1, glassEnabled: false, glass: 'clear' }).glass, 'off')
  assert.equal(api.normalizePreferences({ version: 1, glassEnabled: true, glass: 'clear' }).glass, 'clear')
  const migrated = api.normalizePreferences({ version: 1, glassHighlight: false })
  assert.equal(Object.hasOwn(migrated, 'glassEnabled'), false)
  assert.equal(Object.hasOwn(migrated, 'glassHighlight'), false)
})

test('keeps the conversation theme switch independent from visual presets', () => {
  assert.equal(api.DEFAULT_PREFERENCES.conversationStyle, 'native')
  assert.equal(api.normalizePreferences({ version: 8 }).conversationStyle, 'native')
  assert.equal(api.normalizePreferences({ version: 12, conversationStyle: 'unsupported' }).conversationStyle, 'native')

  const deckChat = api.updatePreferenceValue(api.DEFAULT_PREFERENCES, 'conversationStyle', 'deck-chat')
  assert.equal(deckChat.conversationStyle, 'deck-chat')
  assert.equal(deckChat.preset, 'standard-tactical')
  assert.equal(api.applyVisualPreset(deckChat, 'quiet-reading').conversationStyle, 'deck-chat')
  assert.equal(api.resetPreferenceGroup(deckChat, 'conversation').conversationStyle, 'native')
})

test('loads and migrates a complete version-one payload without losing independent choices', () => {
  const legacy = {
    version: 1,
    enabled: true,
    preset: 'custom',
    dossier: false,
    texture: 'full',
    glassEnabled: true,
    glass: 'clear',
    glassHighlight: false,
    motion: 'full',
    conversationParticleDensity: 'standard',
    heroParticleDensity: 'dense',
    particlePattern: 'organic',
  }
  const migrated = api.loadPreferences({ getItem: () => JSON.stringify(legacy) })
  assert.deepEqual(migrated, {
    version: 12,
    enabled: true,
    preset: 'custom',
    texture: 'full',
    glass: 'clear',
    motion: 'system',
    bootAnimation: true,
    conversationParticleDensity: 'standard',
    heroParticleDensity: 'dense',
    particleTraversalSpeed: 1,
    particlePattern: 'orthogonal',
    railDefaultHidden: false,
    sessionFlow: true,
    sessionGlow: true,
    sessionFlowPalette: 'triad',
    sessionFlowColorBack: '#f7ddeb',
    sessionFlowColorCore: '#65ddb0',
    sessionFlowColorFront: '#6eb7f3',
    sessionFlowSpeed: 1,
    conversationStyle: 'native',
  })
})

test('keeps the current-session flow switch independent from visual presets', () => {
  const disabled = api.updatePreferenceValue(api.DEFAULT_PREFERENCES, 'sessionFlow', false)
  assert.equal(disabled.sessionFlow, false)
  assert.equal(disabled.preset, 'standard-tactical')
  assert.equal(api.applyVisualPreset(disabled, 'quiet-reading').sessionFlow, false)
  assert.equal(api.normalizePreferences({ version: 12, sessionFlow: 'off' }).sessionFlow, true)
})

test('keeps the current-session glow switch independent from flow and visual presets', () => {
  const disabled = api.updatePreferenceValue(api.DEFAULT_PREFERENCES, 'sessionGlow', false)
  assert.equal(disabled.sessionGlow, false)
  assert.equal(disabled.sessionFlow, true)
  assert.equal(disabled.preset, 'standard-tactical')
  assert.equal(api.applyVisualPreset(disabled, 'quiet-reading').sessionGlow, false)
  assert.equal(api.normalizePreferences({ version: 12, sessionGlow: 'off' }).sessionGlow, true)
})

test('normalizes and resets the session-flow palette and speed independently', () => {
  const customized = api.normalizePreferences({ version: 12, sessionFlowPalette: 'amber', sessionFlowSpeed: 1.63 })
  assert.equal(customized.sessionFlowPalette, 'amber')
  assert.equal(customized.sessionFlowSpeed, 1.75)
  assert.equal(customized.sessionFlowColorCore, '#f0c800')
  assert.equal(api.normalizePreferences({ version: 12, sessionFlowPalette: 'rainbow' }).sessionFlowPalette, 'triad')
  assert.equal(api.normalizePreferences({ version: 12, sessionFlowSpeed: 0 }).sessionFlowSpeed, 0.25)
  assert.equal(api.normalizePreferences({ version: 12, sessionFlowSpeed: 9 }).sessionFlowSpeed, 2)
  const customColor = api.updatePreferenceValue(customized, 'sessionFlowColorCore', '#123AbC')
  assert.equal(customColor.sessionFlowPalette, 'custom')
  assert.equal(customColor.sessionFlowColorBack, '#ffe6a3')
  assert.equal(customColor.sessionFlowColorCore, '#123abc')
  assert.equal(customColor.sessionFlowColorFront, '#ee8f42')
  assert.equal(api.updatePreferenceValue(customColor, 'sessionFlowColorCore', 'bad').sessionFlowColorCore, '#123abc')
  const rhodes = api.updatePreferenceValue(customColor, 'sessionFlowPalette', 'rhodes')
  assert.deepEqual(
    [rhodes.sessionFlowColorBack, rhodes.sessionFlowColorCore, rhodes.sessionFlowColorFront],
    ['#b9edf4', '#5ccddb', '#5a9ee6'],
  )
  const reset = api.resetPreferenceGroup(customized, 'conversation')
  assert.equal(reset.sessionFlowPalette, 'triad')
  assert.deepEqual(
    [reset.sessionFlowColorBack, reset.sessionFlowColorCore, reset.sessionFlowColorFront],
    ['#f7ddeb', '#65ddb0', '#6eb7f3'],
  )
  assert.equal(reset.sessionFlowSpeed, 1)
})

test('falls back after malformed, unsupported, and unavailable storage', () => {
  assert.deepEqual(api.loadPreferences({ getItem: () => '{bad' }), api.DEFAULT_PREFERENCES)
  assert.deepEqual(api.loadPreferences({ getItem: () => JSON.stringify({ version: 99, enabled: true }) }), api.DEFAULT_PREFERENCES)
  assert.deepEqual(api.loadPreferences({ getItem: () => { throw new Error('blocked') } }), api.DEFAULT_PREFERENCES)
})

test('persists only the normalized version-twelve payload', () => {
  let written
  const storage = { setItem: (key, value) => { written = [key, value] } }
  const saved = api.savePreferences(storage, { version: 1, enabled: true, texture: 'off', glassEnabled: false })
  assert.equal(written[0], 'dsh.ui.prts.v1')
  assert.deepEqual(JSON.parse(written[1]), saved)
  assert.equal(saved.version, 12)
  assert.equal(saved.glass, 'off')
  assert.equal(Object.hasOwn(saved, 'glassEnabled'), false)
})

test('drops retired fields from legacy payloads', () => {
  const normalized = api.normalizePreferences({
    version: 1,
    texture: 'restrained',
    contourLight: '#ABCDEF',
    contourDark: 'white',
    contourOpacity: 0.719,
    glassHighlight: true,
    dossier: false,
  })
  assert.equal(normalized.texture, 'restrained')
  for (const key of ['dossier', 'contourLight', 'contourDark', 'contourOpacity', 'glassHighlight']) {
    assert.equal(Object.hasOwn(normalized, key), false)
  }
})

test('drops retired conversation scale preferences and keeps navigation reset scoped to the shell rail', () => {
  const normalized = api.normalizePreferences({
    version: 8,
    railDefaultHidden: true,
    conversationScaleMaxDistance: 184,
    conversationScaleFocusContrast: 100,
  })
  assert.equal(normalized.railDefaultHidden, true)
  assert.equal(Object.hasOwn(normalized, 'conversationScaleMaxDistance'), false)
  assert.equal(Object.hasOwn(normalized, 'conversationScaleFocusContrast'), false)
  const reset = api.resetPreferenceGroup(normalized, 'navigation')
  assert.equal(reset.railDefaultHidden, false)
})

test('normalizes, migrates, presets, and resets particle traversal speed independently', () => {
  assert.equal(api.normalizePreferences({ version: 7, particleTraversalSpeed: -1 }).particleTraversalSpeed, 0)
  assert.equal(api.normalizePreferences({ version: 7, particleTraversalSpeed: 0.62 }).particleTraversalSpeed, 0.5)
  assert.equal(api.normalizePreferences({ version: 7, particleTraversalSpeed: 1.88 }).particleTraversalSpeed, 2)
  assert.equal(api.normalizePreferences({ version: 7, particleTraversalSpeed: 99 }).particleTraversalSpeed, 2)
  assert.equal(api.normalizePreferences({ version: 7, particleTraversalSpeed: 'bad' }).particleTraversalSpeed, 1)
  assert.equal(api.loadPreferences({ getItem: () => JSON.stringify({ version: 6, enabled: true }) }).particleTraversalSpeed, 1)

  const edited = api.updatePreferenceValue(api.DEFAULT_PREFERENCES, 'particleTraversalSpeed', 0.25)
  assert.equal(edited.particleTraversalSpeed, 0.25)
  assert.equal(edited.preset, 'standard-tactical')
  const quiet = api.applyVisualPreset(edited, 'quiet-reading')
  assert.equal(quiet.particleTraversalSpeed, 0.25)
  assert.equal(quiet.preset, 'quiet-reading')
  const reset = api.resetPreferenceGroup(quiet, 'particles')
  assert.equal(reset.particleTraversalSpeed, 1)
  assert.equal(reset.conversationParticleDensity, api.DEFAULT_PREFERENCES.conversationParticleDensity)
  assert.equal(reset.heroParticleDensity, api.DEFAULT_PREFERENCES.heroParticleDensity)
})

test('recognizes only the explicit safe-mode query', () => {
  assert.equal(api.isSafeMode('?prts-safe=1'), true)
  assert.equal(api.isSafeMode('?prts-safe=0'), false)
  assert.equal(api.isSafeMode('?mode=prts-safe'), false)
})

test('applies presets without changing independent navigation preferences', () => {
  const original = { ...api.DEFAULT_PREFERENCES, railDefaultHidden: true }
  const quiet = api.applyVisualPreset(original, 'quiet-reading')
  assert.equal(quiet.preset, 'quiet-reading')
  assert.equal(quiet.glass, 'soft')
  assert.equal(quiet.motion, 'reduced')
  assert.equal(quiet.railDefaultHidden, true)
  const standard = api.applyVisualPreset(quiet, 'standard-tactical')
  assert.equal(standard.preset, 'standard-tactical')
  const visualEdit = api.updatePreferenceValue(standard, 'texture', 'off')
  assert.equal(visualEdit.preset, 'custom')
})

test('resets independent settings groups without changing unrelated preferences', () => {
  const current = {
    ...api.DEFAULT_PREFERENCES,
    enabled: true,
    preset: 'custom',
    texture: 'off',
    glass: 'clear',
    motion: 'reduced',
    bootAnimation: false,
  }
  const background = api.resetPreferenceGroup(current, 'background')
  assert.equal(background.texture, 'full')
  assert.equal(background.glass, 'clear')
  const material = api.resetPreferenceGroup(background, 'material')
  assert.equal(material.glass, 'standard')
  assert.equal(material.motion, 'reduced')
  const accessibility = api.resetPreferenceGroup(material, 'accessibility')
  assert.equal(accessibility.motion, 'system')
  assert.equal(accessibility.bootAnimation, true)
  assert.equal(accessibility.enabled, true)
})

test('migrates retired algorithms into one orthogonal density pair', () => {
  const migrated = api.normalizePreferences({
    version: 2,
    preset: 'custom',
    particlePattern: 'hex',
    particleDensities: {
      hex: { conversation: 'dense', hero: 'ultra' },
      orthogonal: { conversation: 'sparse', hero: 'light' },
    },
  })
  assert.equal(migrated.version, 12)
  assert.equal(migrated.particlePattern, 'orthogonal')
  assert.equal(migrated.conversationParticleDensity, 'dense')
  assert.equal(migrated.heroParticleDensity, 'ultra')
  assert.equal(Object.hasOwn(migrated, 'particleDensities'), false)
})

test('particle edits unlink presets while retired pattern edits are ignored', () => {
  let preferences = api.updatePreferenceValue(api.DEFAULT_PREFERENCES, 'heroParticleDensity', 'ultra')
  assert.equal(preferences.preset, 'custom')
  assert.equal(preferences.heroParticleDensity, 'ultra')
  preferences = api.updatePreferenceValue(preferences, 'conversationParticleDensity', 'dense')
  preferences = api.updatePreferenceValue(preferences, 'particlePattern', 'organic')
  assert.equal(preferences.particlePattern, 'orthogonal')
  assert.equal(preferences.conversationParticleDensity, 'dense')
  assert.equal(preferences.heroParticleDensity, 'ultra')
  const restored = api.applyVisualPreset(preferences, 'standard-tactical')
  assert.equal(restored.particlePattern, 'orthogonal')
  assert.equal(restored.conversationParticleDensity, 'sparse')
  assert.equal(restored.heroParticleDensity, 'light')
})

test('maps the three particle detail levels onto the compatible density fields', () => {
  const compact = api.updatePreferenceValue(api.DEFAULT_PREFERENCES, 'particleDetail', 'compact')
  assert.equal(compact.conversationParticleDensity, 'sparse')
  assert.equal(compact.heroParticleDensity, 'light')
  assert.equal(api.resolveParticleDetail(compact), 'compact')

  const standard = api.updatePreferenceValue(compact, 'particleDetail', 'standard')
  assert.equal(standard.conversationParticleDensity, 'light')
  assert.equal(standard.heroParticleDensity, 'standard')
  assert.equal(api.resolveParticleDetail(standard), 'standard')

  const precise = api.updatePreferenceValue(standard, 'particleDetail', 'precise')
  assert.equal(precise.conversationParticleDensity, 'dense')
  assert.equal(precise.heroParticleDensity, 'ultra')
  assert.equal(api.resolveParticleDetail(precise), 'precise')
})

test('derives the active preset from actual visual parameters', () => {
  const custom = api.updatePreferenceValue(api.DEFAULT_PREFERENCES, 'texture', 'off')
  assert.equal(custom.preset, 'custom')
  const restored = api.updatePreferenceValue(custom, 'texture', api.DEFAULT_PREFERENCES.texture)
  assert.equal(restored.preset, 'standard-tactical')
  const quiet = api.applyVisualPreset(restored, 'quiet-reading')
  assert.equal(api.normalizePreferences({ ...quiet, preset: 'custom' }).preset, 'quiet-reading')
})

test('reports whether normalized preferences reached persistent storage', () => {
  let written
  const success = api.persistPreferences({ setItem(key, value) { written = [key, value] } }, { ...api.DEFAULT_PREFERENCES, enabled: true })
  assert.equal(success.persisted, true)
  assert.equal(success.preferences.enabled, true)
  assert.equal(written[0], api.PRTS_STORAGE_KEY)

  const failure = api.persistPreferences({ setItem() { throw new Error('blocked') } }, { ...api.DEFAULT_PREFERENCES, glass: 'clear' })
  assert.equal(failure.persisted, false)
  assert.equal(failure.preferences.glass, 'clear')
})
